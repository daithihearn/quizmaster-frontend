import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import RemoveImage from '../../assets/icons/remove.png';
import AddIcon from '../../assets/icons/add.svg';

import SockJsClient from 'react-stomp';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Form, FormGroup, Input, Row, ButtonGroup, Card, CardBody, CardHeader, CardGroup, UncontrolledCollapse, Table, Progress } from 'reactstrap';
import Snackbar from "@material-ui/core/Snackbar";
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';

class Scoring extends Component {
  constructor(props) {
    super(props);

    sessionUtils.checkLoggedIn();

    this.handleChange = this.handleChange.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.replaceState = this.replaceState.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handleUpdateAnswer = this.handleUpdateAnswer.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    
    let rawState = sessionStorage.getItem("scoringState");

    if (!!props.location.state && !!props.location.state.game) {
      this.state = { 
        modal: false, 
        game: props.location.state.game, 
        answers: [], 
        playerEmail: '', 
        selectedPlayersAnswers: [], 
        snackOpen: false, 
        snackMessage: "", 
        snackType: "", 
        showModalDeletePlayer: false,
        answeredCurrentQuestion: []};
      this.loadQuiz();
      this.loadAllUnscoredAnswers();
      this.updateLeaderboard();
    } else if (rawState !== undefined && rawState !== null && rawState !== '') {
      this.state = JSON.parse(rawState);
    } else {
      this.state = null;
      sessionStorage.removeItem("scoringState");
    }
  }

  updateState(stateDelta) {
    this.setState(prevState => (stateDelta));
    sessionStorage.setItem("scoringState", JSON.stringify(this.state));
  }

  replaceState(newState) {
    this.setState(newState);
    sessionStorage.setItem("scoringState", JSON.stringify(this.state));
  }

  handleCloseDeletePlayerModal(id) {
    this.setState({ showModalDeletePlayer: false});
  }

  showDeletePlayerModal(player) {
    this.setState({ showModalDeletePlayer: true , modalDeletePlayer: player});
      
  }

  handleClose() {
    this.updateState({ snackOpen: false });
  }

  updateGame() {
    let thisObj = this;
    gameService.get(this.state.game.id).then(response => {
      thisObj.updateState({game: response.data});
    }).catch(error => thisObj.parseError(error));
  }

  removePlayer() {
    let thisObj = this;
    this.setState({ showModalDeletePlayer: false});
    gameService.removePlayer(this.state.game.id, this.state.modalDeletePlayer.id).then(response => {
      thisObj.updateGame();
    }).catch(error => thisObj.parseError(error));
  }

  addPlayer(event) {
    event.preventDefault();
    let thisObj = this;
    gameService.addPlayer(this.state.game.id, this.state.playerEmail).then(response => {
      thisObj.updateState({playerEmail: ''});
      thisObj.updateGame();
    }).catch(error => thisObj.parseError(error));
  }


  redirectToHome() {
    this.props.history.push({
      pathname: '/home'
    });
  }

  closeModal() {
    this.updateState({ modal: false, selectedPlayersAnswers: [] });
  }

  loadQuiz() {
    let thisObj = this;
    
    quizService.getQuiz(this.state.game.quizId).then(response => {
      thisObj.updateState({ quiz: response.data });
    }).catch(error => thisObj.parseError(error));
  }

  updateLeaderboard() {
    let thisObj = this;
    
    answerService.getLeaderboard(this.state.game.id).then(response => {
      thisObj.updateState( { leaderboard: response.data });
    }).catch(error => thisObj.parseError(error));
    console.log("leader board object:  " + JSON.stringify (this.state.leaderboard))

  }

  loadAllUnscoredAnswers() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.game.id).then(response => {
      thisObj.updateState( { answers: response.data });
    }).catch(error => thisObj.parseError(error));
  }

  openEditScoreModal(playerId) {
    let thisObj = this;

    console.log("player id: " + playerId);

    answerService.getAnswers(this.state.game.id, null, playerId).then(response => {
      thisObj.updateState( { selectedPlayersAnswers: response.data, modal: true });
    }).catch(error => thisObj.parseError(error));
  }

  handleWebsocketMessage(payload) {

    let publishContent = JSON.parse(payload.payload);
    this.parseScreenContent(publishContent);

  }

  markColorRound(roundIdRow, isFont){
    
    //console.log("round selected: " + this.state.roundId);
    //console.log("round row: " + roundIdRow);
    if(!!this.state.roundId){
      if(this.state.roundId == roundIdRow){
       // console.log("mark round");
        if (!isFont){
        return 'LightSteelBlue'; //'rgba(0,0,0,.18)';  
        // 'AliceBlue'; //'# 43a047'; //'darkseagreen'; //'rgba(0,0,0,.18)';
        }else{
          return 'white';
        }
      }
    } 
    return '';
  }
  
  parseScreenContent(content) {
    if (!content) {
      return
    }

    let newState = this.state; 

    switch (content.type) {
      
      case("QUESTION_AND_ANSWER"):
    
        if (content.gameId !== this.state.game.id) {
          return;
        }
    
        newState.answers.push(content.content);
        newState.answeredCurrentQuestion.push(content.content.answer.playerId);
    
        this.replaceState(newState);
        break;
      case("AUTO_ANSWERED"): 
           
        newState.answeredCurrentQuestion.push(content.content);
        this.replaceState(newState);
        break;
      default:
        this.parseError({message: "Unsupported content type"})
    }
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.updateState(updateObj);
  }

  handleUpdateScoreChange(index, event) {
    
    let newValue = event.target.value;

    this.setState(state => {
      const list = state.selectedPlayersAnswers.map((item, j) => {
        if (j === index) {
          return item.answer.score = newValue;
        } else {
          return item;
        }
      });
      return {
        list
      };
    });
  }

  handleCorrectAnswer(event) {
    let thisObj = this;
    let index = event.target.elements.index.value;
    event.preventDefault();

    let answers = this.state.answers;
    let answer = answers[index].answer;
    answer.score = event.target.elements.score.value;

    answerService.submitCorrection(answer).then(response => {
      answers.splice(index, 1);
      thisObj.updateState({score: null, answers: answers});
    }).catch(error => thisObj.parseError(error));
    event.currentTarget.reset();
  }

  handleUpdateAnswer(event) {
    let thisObj = this;
    let index = event.target.elements.index.value;
    event.preventDefault();

    let answers = this.state.selectedPlayersAnswers;
    let answer = answers[index].answer;
    answer.score = event.target.elements.score.value;

    answerService.submitCorrection(answer).then(response => {
      thisObj.updateState({ snackOpen: true, snackMessage: "Score updated", snackType: "success"});
    }).catch(error => thisObj.parseError(error));
    event.currentTarget.reset();
  }

  handlePublishQuestion(roundId, questionId) {
    let thisObj = this;

    let payload = {gameId: this.state.game.id, roundId: roundId, questionId: questionId};
    this.setState ({roundId: roundId});

    gameService.publishQuestion(payload).then(response => {
      thisObj.updateState({ snackOpen: true, snackMessage: "Question published", snackType: "success", answeredCurrentQuestion: [] });
    }).catch(error => thisObj.parseError(error));
  }

  publishLeaderboard(event) {
    let thisObj = this;
    event.preventDefault();

    answerService.publishLeaderboard(this.state.game.id).then(response => {
      thisObj.updateState({ snackOpen: true, snackMessage: "Full leaderboard published", snackType: "success" });
    }).catch(error => thisObj.parseError(error));
  }

  publishLeaderboardForRound(round) {
    let thisObj = this;

    answerService.publishLeaderboard(this.state.game.id, round.id)
      .then(response => {
        thisObj.updateState({ snackOpen: true, snackMessage: "Round leaderboard published", snackType: "success" });
    }).catch(error => thisObj.parseError(error));
  }

  publishAnswersForRound(round) {
    let thisObj = this;

    answerService.publishAnswersForRound(this.state.game.id, round.id)
      .then(response => {
        thisObj.updateState({ snackOpen: true, snackMessage: "Answers published", snackType: "success" });
    }).catch(error => thisObj.parseError(error));
  }

  parseError(error) {
    let errorMessage = 'Undefined error';
    if (
      error.response !== undefined &&
      error.response.data !== undefined &&
      error.response.data.message !== undefined &&
      error.response.data.message !== ''
    ) {
      errorMessage = error.response.data.message;
    } else if (
      error.response !== undefined &&
      error.response.statusText !== undefined &&
      error.response.statusText !== ''
    ) {
      errorMessage = error.response.statusText;
    } else if (error.message !== undefined) {
      errorMessage = error.message;
    }
    this.updateState({ snackOpen: true, snackMessage: errorMessage, snackType: "error" });
  }

  render() {
   
    return (
        <div className="app">
         <div className="game_wrap">
          <div className="game_container">

              <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/#/home"><span className="form_container_text_link">Home</span></a>
                </CardBody>
                </Card>
              </CardGroup>

              {!!this.state && !!this.state.quiz ?
                <div>
              <CardGroup>
                <Card className="p-6">

                
                  <div>
                    <CardHeader tag="h2">{this.state.quiz.name}</CardHeader>
                    
                    {this.state.quiz.rounds.map((round, idx) => (
                      <div>
                        <CardBody>
                        <Button color="link" id={"toggler_" + idx}><h4>Round: {round.name} </h4></Button>
                           </CardBody>
                        
                        <UncontrolledCollapse toggler={"#toggler_" + idx}>
                          
                          <CardBody>
                            <Table size="sm"  bordered hover responsive>
                              <thead>
                                <tr>
                                  <th>Question</th>
                                  <th></th>
                                  <th>Answer</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                            
                                {round.questions.map((question) => (
                                  <tr>
                                      <td align="left">{question.question}</td>
                                      <td>
                                      {!!question.imageUri ?
                                        <img src={question.imageUri} class="thumbnail_size"/>
                                      : null}
                                      </td>
                                      <td>{question.answer}</td>
                                      <td>
                                        <Button color="link" type="button" onClick={this.handlePublishQuestion.bind(this, round.id, question.id)}>
                                          Publish
                                        </Button> 
                                      </td>
                                  </tr>
                                ))}
                                </tbody>
                            </Table>
                          </CardBody>

                        </UncontrolledCollapse>
                      </div>
                    ))}
                    
                  </div>
                
                </Card>
              </CardGroup>

            




            {!!this.state.answeredCurrentQuestion && !!this.state.game ?
                      
              <Progress striped={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) < 1} color={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) < 1 ?"info":"success"} value={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) * 100}>Current Question Progress</Progress>
                      
            : null}
            
            <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Answers for Correction</CardHeader>

                  {!!this.state.answers && this.state.answers.length > 0 ?
                    

                      <CardGroup>
                      
                      <Table  size="sm" bordered hover responsive="xl"
                      >
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th>Player</th>
                            <th>Correct Answer</th>
                            <th>Provided Answer</th>
                            <th>Max Points</th>
                            <th>Score</th>
                           
                          </tr>
                        </thead>
                        <tbody>

                        {this.state.answers.map((answer, idx) => (
                            <tr>
                              
                                <td align="left">{answer.question.question}</td>
                                <td>{answer.answer.playerId}</td>
                                <td>{answer.question.answer}</td>
                                <td>{answer.answer.answer}</td>
                                <td>{answer.question.points}</td>
                                <td>
                                  <Form onSubmit={this.handleCorrectAnswer}>
                                    <FormGroup>
                                      <Input
                                        className="index"
                                        type="input"
                                        name="index"
                                        value={idx}
                                        hidden
                                        required
                                        />
                                      <Input
                                          className="score"
                                          type="input"
                                          name="score"
                                          pattern="[0-9]*"
                                          placeholder="Score"
                                          autoComplete="Score"
                                          disabled={idx > 0}
                                          required
                                        />
                                    </FormGroup>
                                    { idx == 0 ?
                                    <Button color="primary" type="submit">
                                      Submit
                                    </Button> 
                                    : null }
                                  </Form>
                              </td>
                             

                            
                          </tr>
                      
                    ))}
                        </tbody>
                      </Table>
                    </CardGroup>
                : <CardGroup><CardBody> No answers available for correction at this time..</CardBody></CardGroup>}

                </Card>
              </CardGroup>


              { !!this.state.leaderboard && !!this.state.leaderboard.scores.length >0 ? 
              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Leaderboard</CardHeader>
                  <CardBody>

                  <Table bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>

                        {[].concat(this.state.leaderboard.scores).sort((a, b) => a.score < b.score).map((entry) => (
                          <tr>
                            <td align="left">
                              {/* <Button type="button" color="link" onClick={this.openEditScoreModal.bind(this, entry.playerId)}> */}
                                {entry.playerId}
                                {/* </Button> */}
                              </td>
                            <td>{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </CardBody>
                
              </Card>
            </CardGroup>
            : null }


              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Actions</CardHeader>
                  <CardBody>
                    <ButtonGroup horizontal>
                    <Button type="button" color="primary" onClick={this.updateLeaderboard}>
                        Update Leaderboard
                      </Button>
                      <Button type="button" color="warning" onClick={this.publishLeaderboard.bind(this)}>
                        Publish Full Leaderboard
                      </Button>
        
                    </ButtonGroup>
                  </CardBody>

                  {!!this.state.quiz ?
                    <CardBody>
                      <Table    bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Round</th>
                          <th>Leaderboard</th>
                          <th>Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                          {this.state.quiz.rounds.map((round) => 
                            <tr  style={{background: this.markColorRound(round.id, false), color: this.markColorRound( round.id,true)}}>
                             
                              <td   align="left">Round: {round.name}</td>
                              <td><Button type="button" color="warning" onClick={this.publishLeaderboardForRound.bind(this, round)}>
                                  Publish Round Leaderboard
                              </Button></td>
                              <td><Button type="button" color="danger" onClick={this.publishAnswersForRound.bind(this, round)}>
                                  Publish Answers
                            </Button></td>
                            </tr>
                          )}

                        </tbody>
                      </Table>
                    </CardBody>
                  : null}

              </Card>
            </CardGroup>


            {/* Players section */}
            <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Players</CardHeader>
                  <CardBody>
                  <Modal isOpen={this.state.showModalDeletePlayer}>
                                <ModalHeader closeButton>
                                  You are about to delete a player
                                </ModalHeader>
                         
                          <ModalBody>Are you sure you want to delete &nbsp; 
                             {!! this.state.modalDeletePlayer ?  
                               this.state.modalDeletePlayer.displayName : '' }</ModalBody> 
                           
                                <ModalFooter>
                                <Button color="secondary" onClick={this.handleCloseDeletePlayerModal.bind(this)}>
                                    No
                                  </Button>
                                   <Button color="primary" onClick={this.removePlayer.bind(this)}>
                                  Yes
                                   </Button>
                                </ModalFooter>
                              </Modal>
                  <Table size="sm"  bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>

                        {[].concat(this.state.game.players).map((entry) => (
                          <tr>
                            <td align="left">
                              <Button type="button" color="link" onClick={this.openEditScoreModal.bind(this, entry.displayName)}> {entry.displayName}</Button>
                            </td>
                            {/* <td><Button type="button" color="link" onClick={this.removePlayer.bind(this, entry.id)}>Remove</Button></td> */}
                            <td><a class="remove_link" color="link" onClick={this.showDeletePlayerModal.bind(this, entry)} > 
                            <img src={RemoveImage} width="20px" height="20px"/></a></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>


                  </CardBody>
                  <CardBody>
                    {/* <Form onSubmit={this.addPlayer}>
                      <FormGroup>
                        <Input
                          className="playerEmail"
                          type="input"
                          name="playerEmail"
                          value={this.state.playerEmail}
                          onChange={this.handleChange}
                          required
                          />
                      </FormGroup>
                        <ButtonGroup vertical>
                          <Button type="submit">
                            Add Player
                          </Button>
                        </ButtonGroup>
                    </Form>  */}
                     <Form onSubmit={this.addPlayer}>
                          <FormGroup>
                        
                          <Table size="sm" >
                            <tbody>
                              <tr><td>
                                <Input
                                className="playerEmail"
                                type="input"
                                name="playerEmail"
                                onChange={this.handleChange}
                                value={this.state.playerEmail}
                                required
                              /></td>
                            <td>
                            <a type="button" color="danger" onClick={this.addPlayer}><img src={AddIcon} width="20px" height="20px"/></a>
                            </td>
                            </tr>
                            </tbody>
                          </Table>
                          </FormGroup>
                        
                      </Form>
                  </CardBody>
              </Card>
            </CardGroup>



            <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/#/home"><span className="form_container_text_link">Home</span></a>
                </CardBody>
                </Card>
              </CardGroup>  
            

              {!!this.state.modal ?
              <Modal isOpen={this.state.modal}   
              className="modal-dialog2"
              >
                <ModalHeader><Button type="button" color="link" onClick={this.closeModal.bind(this)}>Close</Button></ModalHeader>
                <ModalBody>
                  <Row className="justify-content-center">
                    <Table size="sm"  bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Question</th>
                          <th>Correct Answer</th>
                          <th>Provided Answer</th>
                          <th>Max Points</th>
                          <th>Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.selectedPlayersAnswers.map((wrapper, idx) => 
                          <tr>
                            <td align="left">{wrapper.question.question}</td>
                            <td>{wrapper.question.answer}</td>
                            <td>{wrapper.answer.answer}</td>
                            <td>{wrapper.question.points}</td>
                            <td>
                              <Form onSubmit={this.handleUpdateAnswer}>
                                <FormGroup>
                                  <Input
                                    className="index"
                                    type="input"
                                    name="index"
                                    value={idx}
                                    hidden
                                    required
                                    />
                                  <Input
                                      className="score"
                                      type="input"
                                      name="score"
                                      pattern="[0-9]*"
                                      placeholder="Score"
                                      autoComplete="Score"
                                      onChange={this.handleUpdateScoreChange.bind(this, idx)}
                                      value={this.state.selectedPlayersAnswers[idx].answer.score}
                                      required
                                    />
                                </FormGroup>
                              
                                <Button color="primary" type="submit">
                                  Submit
                                </Button> 
                              </Form>
                          </td>

                              
                            </tr>
                        )}
                        </tbody>
                    </Table>
                  </Row>
                </ModalBody>
              </Modal>
              : null }
                    
              <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/scoring', '/user/scoring']}
                onMessage={ this.handleWebsocketMessage.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>


              <Snackbar
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right"
                }}
                open={ this.state.snackOpen }
                autoHideDuration={6000}
                onClose={this.handleClose.bind(this)}
              >
                <MySnackbarContentWrapper
                  onClose={this.handleClose.bind(this)}
                  variant={ this.state.snackType }
                  message={ this.state.snackMessage }
                />
              </Snackbar>


              </div>
              : <CardGroup>
                  <Card>
                    <CardBody>No game selected</CardBody>
                  </Card>
                </CardGroup>
              }
            
          </div>
        </div>
       </div>
    );
  }
}

export default Scoring;
