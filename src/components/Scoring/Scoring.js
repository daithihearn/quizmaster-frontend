import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import nextId from "react-id-generator";
import { Modal, ModalBody, ModalHeader, Button, Form, FormGroup, Input, Row, ButtonGroup, Card, CardBody, CardHeader, CardGroup, UncontrolledCollapse, Table, Progress } from 'reactstrap';
import Snackbar from "@material-ui/core/Snackbar";
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';

class Scoring extends Component {
  constructor(props) {
    super(props);

    sessionUtils.checkLoggedIn();

    this.handleChange = this.handleChange.bind(this);
    this.updateState = this.updateState.bind(this);
    this.replaceState = this.replaceState.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handleUpdateAnswer = this.handleUpdateAnswer.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);

    let rawState = sessionStorage.getItem("scoringState");

    if (!!props.location.state && !!props.location.state.game) {
      this.state = { modal: false, game: props.location.state.game, answers: [], selectedPlayersAnswers: [], snackOpen: false, snackMessage: "", snackType: "", answeredCurrentQuestion: []};
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

  handleClose() {
    this.updateState({ snackOpen: false });
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
  }

  loadAllUnscoredAnswers() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.game.id).then(response => {
      thisObj.updateState( { answers: response.data });
    }).catch(error => thisObj.parseError(error));
  }

  openEditScoreModal(playerId) {
    let thisObj = this;

    answerService.getAnswers(this.state.game.id, null, playerId).then(response => {
      thisObj.updateState( { selectedPlayersAnswers: response.data, modal: true });
    }).catch(error => thisObj.parseError(error));
  }

  handleWebsocketMessage(payload) {

    let publishContent = JSON.parse(payload.payload);
    this.parseScreenContent(publishContent);

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
                    <CardHeader tag="h1">{this.state.quiz.name}</CardHeader>
                    
                    {this.state.quiz.rounds.map((round, idx) => (
                      <div>
                        <CardBody>
                            <h2>Round: {round.name}</h2> <Button color="link" id={"toggler_" + idx}>Show/Hide</Button>
                        </CardBody>
                        
                        <UncontrolledCollapse toggler={"#toggler_" + idx}>
                          
                          <CardBody>
                            <Table>
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

            { !!this.state.leaderboard ? 
              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h1">Leaderboard</CardHeader>
                  <CardBody>

                  <Table>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>

                        {this.state.leaderboard.scores.map((entry) => (
                          <tr>
                            <td align="left">
                              <Button type="button" color="link" onClick={this.openEditScoreModal.bind(this, entry.playerId)}>{entry.playerId}</Button>
                              </td>
                            <td>{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>


                  </CardBody>
                  <CardBody>
                    <ButtonGroup vertical>
                      <Button type="button" color="primary" onClick={this.updateLeaderboard}>
                        Update Leaderboard
                      </Button>
                    </ButtonGroup>
                  </CardBody>
              </Card>
            </CardGroup>
            : null }

            {!!this.state.answeredCurrentQuestion && !!this.state.game ?
                      
              <Progress striped={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) < 1} color={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) < 1 ?"info":"success"} value={(this.state.answeredCurrentQuestion.length / this.state.game.players.length) * 100}>Current Question Progress</Progress>
                      
            : null}
            
            <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h1">Answers for Correction</CardHeader>

                  {!!this.state.answers && this.state.answers.length > 0 ?
                    

                      <CardGroup>
                      
                      <Table>
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
                                  <Form onSubmit={this.handleCorrectAnswer} id={"correction_form_" + nextId() }>
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

              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h1">Actions</CardHeader>
                  <CardBody>
                    <ButtonGroup vertical>
                      <Button type="button" color="primary" onClick={this.publishLeaderboard.bind(this)}>
                        Publish Full Leaderboard
                      </Button>
        
                    </ButtonGroup>
                  </CardBody>

                  {!!this.state.quiz ?
                    <CardBody>
                      <Table>
                      <thead>
                        <tr>
                          <th>Round</th>
                          <th>Leaderboard</th>
                          <th>Answers</th>
                        </tr>
                      </thead>
                      <tbody>
                          {this.state.quiz.rounds.map((round) => 
                            <tr>
                              <td align="left">Round: {round.name}</td>
                              <td><Button type="button" color="secondary" onClick={this.publishLeaderboardForRound.bind(this, round)}>
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
            <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/#/home"><span className="form_container_text_link">Home</span></a>
                </CardBody>
                </Card>
              </CardGroup>  
            

              {!!this.state.modal ?
              <Modal isOpen={this.state.modal}>
                <ModalHeader><Button type="button" color="link" onClick={this.closeModal.bind(this)}>Close</Button></ModalHeader>
                <ModalBody>
                  <Row className="justify-content-center">
                    <Table>
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
