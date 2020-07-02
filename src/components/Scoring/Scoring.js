import React, { Component } from 'react';
import answerService from '../../services/AnswerService';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import Leaderboard from '../Leaderboard';
import SlowPlayers from '../SlowPlayers';
import RemoveImage from '../../assets/icons/remove.png';

import SockJsClient from 'react-stomp';
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, Form, FormGroup, Input, Row, ButtonGroup, Card, CardBody, CardHeader, CardGroup, UncontrolledCollapse, Table, Progress } from 'reactstrap';
import Snackbar from "@material-ui/core/Snackbar";
import DefaultHeader from '../Header';
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';
import errorUtils from '../../utils/ErrorUtils';

import auth0Client from '../../Auth';

class Scoring extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.replaceState = this.replaceState.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handleUpdateAnswer = this.handleUpdateAnswer.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);
    this.goHome = this.goHome.bind(this);
    
    let rawState = sessionStorage.getItem("scoringState");

    if (!!props.location.state && !!props.location.state.game) {
      this.state = { 
        modal: false, 
        game: props.location.state.game,
        players: [],
        answers: [],
        playerEmail: '',
        selectedPlayersAnswers: [],
        snackOpen: false,
        snackMessage: "",
        snackType: "",
        showModalDeletePlayer: false,
        answeredCurrentQuestion: []};
      
    } else if (rawState !== undefined && rawState !== null && rawState !== '') {
      this.state = JSON.parse(rawState);
    } else {
      this.state = null;
      sessionStorage.removeItem("scoringState");
    }
  }

  async componentDidMount() {
    // Get the players first
    let players = await gameService.getPlayersForGame(this.state.game.id);
    players = players.data;

    // Refresh the game
    let game = await gameService.get(this.state.game.id);
    game = game.data;
 
    let answeredCurrentQuestion = [];
    // Who has answered the current question?
    if (!!game.currentContent && game.currentContent.type === "QUESTION") {
      answeredCurrentQuestion = await answerService.getWhoHasAnswered(game.id, game.currentContent.content.roundId, game.currentContent.content.questionId);
      answeredCurrentQuestion = answeredCurrentQuestion.data;
    }

    this.updateState({players: players, game: game, answeredCurrentQuestion: answeredCurrentQuestion});

    
    // Load the rest
    this.loadQuiz();
    this.loadAllUnscoredAnswers();
    this.updateLeaderboard();
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
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  removePlayer() {
    let thisObj = this;
    this.setState({ showModalDeletePlayer: false});
    gameService.removePlayer(this.state.game.id, this.state.modalDeletePlayer.id).then(response => {
      thisObj.updateGame();
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  addPlayer(event) {
    event.preventDefault();
    let thisObj = this;
    gameService.addPlayer(this.state.game.id, this.state.playerEmail).then(response => {
      thisObj.updateState({playerEmail: ''});
      thisObj.updateGame();
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  goHome() {
    this.props.history.push({
      pathname: '/'
    });
  }

  closeModal() {
    this.updateState({ modal: false, selectedPlayersAnswers: [] });
  }

  loadQuiz() {
    let thisObj = this;
    
    quizService.getQuiz(this.state.game.quizId).then(response => {
      thisObj.updateState({ quiz: response.data });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  updateLeaderboard() {
    let thisObj = this;
    
    answerService.getLeaderboard(this.state.game.id).then(response => {
      thisObj.updateState( { leaderboard: response.data });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));

  }

  loadAllUnscoredAnswers() {
    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.game.id).then(response => {
      thisObj.updateState( { answers: response.data });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  openEditScoreModal(playerId) {
    let thisObj = this;

    answerService.getAnswers(this.state.game.id, null, playerId).then(response => {
      thisObj.updateState( { selectedPlayersAnswers: response.data, modal: true });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }
  
  parseUnscoredQuestionsContent(payload) {
    if (!payload) {
      return
    }

    let content = JSON.parse(payload.payload);
    let newState = this.state; 

    newState.answers = content;

    this.replaceState(newState);
        
  }

  parseAnsweredContent(payload) {
    if (!payload) {
      return
    }

    let content = JSON.parse(payload.payload);

    let newState = this.state;
    newState.answeredCurrentQuestion = content;
    this.setState(newState);
    this.updateLeaderboard();
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
      thisObj.updateLeaderboard();
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
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
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
    event.currentTarget.reset();
  }

  handlePublishQuestion(roundId, questionId) {
    let thisObj = this;

    let payload = {gameId: this.state.game.id, roundId: roundId, questionId: questionId};
    this.setState ({roundId: roundId});

    gameService.publishQuestion(payload).then(response => {
      let game = thisObj.state.game;
      game.publishedQuestions.push(questionId);
      thisObj.updateState({ snackOpen: true, game: game, snackMessage: "Question published", snackType: "success", answeredCurrentQuestion: [] });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  publishLeaderboard(event) {
    let thisObj = this;
    event.preventDefault();

    this.updateLeaderboard();

    gameService.publishLeaderboard(this.state.game.id).then(response => {
      thisObj.updateState({ snackOpen: true, snackMessage: "Full leaderboard published", snackType: "success" });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  publishLeaderboardForRound(round) {
    let thisObj = this;

    this.updateLeaderboard();

    gameService.publishLeaderboard(this.state.game.id, round.id)
      .then(response => {
        thisObj.updateState({ snackOpen: true, snackMessage: "Round leaderboard published", snackType: "success" });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  publishAnswersForRound(round) {
    let thisObj = this;

    gameService.publishAnswersForRound(this.state.game.id, round.id)
      .then(response => {
        thisObj.updateState({ snackOpen: true, snackMessage: "Answers published", snackType: "success" });
    }).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  }

  render() {
   
    return (
      <div>
        <div className="content_employee">
          <span className="app" style={{ overflowX: 'hidden' }}>
            <div className="app_body">
              <main className="main">
                <DefaultHeader />





        <div className="app">
         <div className="game_wrap">
          <div className="game_container">

              <CardGroup>
                <Card>
                <CardBody>
                Back to  <Button type="button" color="link" onClick={this.goHome}><span className="form_container_text_link">Home</span></Button>
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
                      <div key={`rounds_${idx}`}>
                        <CardBody>
                        <Button color="link" id={"toggler_" + idx}><h4>Round: {round.name} </h4></Button>
                           </CardBody>
                        
                        <UncontrolledCollapse toggler={"#toggler_" + idx}>
                          
                          <CardBody>
                            <Table responsive>
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
                                  <tr className={(this.state.game.publishedQuestions.includes(question.id))? 'completedRow': ''} key={question.id}>
                                      <td align="left">{question.question}</td>
                                      <td>
                                      {!!question.imageUri ?
                                        <img alt="Image preview" src={question.imageUri} className="thumbnail_size"/>
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

            




            {!!this.state.answeredCurrentQuestion && !!this.state.players ?
                      
              <Progress striped={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1} 
              color={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1 ?"info":"success"} 
              value={(this.state.answeredCurrentQuestion.length / this.state.players.length) * 100}>
                Current Question Progress
              </Progress>
                      
            : null}
            
            <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Answers for Correction</CardHeader>

                  {!!this.state.answers && this.state.answers.length > 0 ?
                    

                      <CardGroup>
                      
                      <Table bordered hover responsive>
                        <thead>
                          <tr>
                            <th></th>
                            <th>Player</th>
                            <th>Question</th>
                            <th>Correct Answer</th>
                            <th>Provided Answer</th>
                            <th>Max Points</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>

                        {this.state.answers.map((answer, idx) => (
                            <tr>
                                <td><img alt="Player" src={this.state.players.find(player => player.id === answer.answer.playerId).picture} className="avatar"/></td>
                                <td>{this.state.players.find(player => player.id === answer.answer.playerId).name}</td>
                                <td align="left">{answer.question.question}</td>
                                
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
                                          type="number"
                                          step="1"
                                          min={0}
                                          max={100}
                                          name="score"
                                          placeholder="Score"
                                          autoComplete="off"
                                          disabled={idx > 0}
                                          required
                                        />
                                    </FormGroup>
                                    { idx === 0 ?
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

              {!!this.state && !!this.state.players && !!this.state.answeredCurrentQuestion && this.state.answeredCurrentQuestion.length > 0 && this.state.players.length !== this.state.answeredCurrentQuestion.length ?
                  <SlowPlayers players={this.state.players} answered={this.state.answeredCurrentQuestion} title="Slow Feckers!!"/>
                : null}
                
              { !!this.state.players && !!this.state.leaderboard && !!this.state.leaderboard.scores.length >0 ? 
                <Leaderboard scores={this.state.leaderboard.scores} players={this.state.players} title="Full Leaderboard"/>
            : null }


              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Actions</CardHeader>
                  <CardBody>
                    <ButtonGroup horizontal="true">
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
                      <Table bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Round</th>
                          <th>Leaderboard</th>
                          <th>Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                          {this.state.quiz.rounds.map((round, idx) => 
                            <tr key={`rounds_${idx}`} className={(this.state.roundId === round.id)? 'highlightRow': ''}>
                                <td align="left">Round: {round.name}</td>
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
                    <Table bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Avatar</th>
                          <th>Player</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>

                        {[].concat(this.state.players).map((player, idx) => (
                          <tr key={`players_${idx}`}>
                            <td>
                              {player.picture ?<img alt="Image Preview" src={player.picture} className="avatar" />:null}
                            </td>
                            <td align="left">
                              <Button type="button" color="link" onClick={this.openEditScoreModal.bind(this, player.id)}> {player.name}</Button>
                            </td>
                            <td>
                              <Button className="remove_link" color="link" onClick={this.showDeletePlayerModal.bind(this, player)} >
                                <img alt="Remove" src={RemoveImage} width="20px" height="20px"/>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>


                  </CardBody>
              </Card>
            </CardGroup>



            <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/"><span className="form_container_text_link">Home</span></a>
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
                                      autoComplete="off"
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
              
              <SockJsClient url={ `${process.env.REACT_APP_API_URL}/websocket?gameId=${this.state.game.id}&tokenId=${auth0Client.getAccessToken()}`} topics={['/user/answered']}
                onMessage={ this.parseAnsweredContent.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>

              <SockJsClient url={ `${process.env.REACT_APP_API_URL}/websocket?gameId=${this.state.game.id}&tokenId=${auth0Client.getAccessToken()}`} topics={['/user/unscored']}
                onMessage={ this.parseUnscoredQuestionsContent.bind(this) }
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



</main>
</div>
</span>
</div>
</div>
    );
  }
}

export default Scoring;
