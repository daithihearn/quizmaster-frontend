import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import nextId from "react-id-generator";
import { Modal, ModalBody, ModalHeader, Button, Form, FormGroup, Input, Row, ButtonGroup, Card, CardBody, CardHeader, CardGroup, CardTitle, Alert, Table } from 'reactstrap';

class Scoring extends Component {
  constructor(props) {
    super(props);

    let game = {};
    if (!props.location.state) {
      game = JSON.parse(sessionStorage.getItem("game"));
    } else {
      game = props.location.state.game;
    }
    sessionStorage.setItem("game", JSON.stringify(game));
    
    this.state = { modal: false, game: game, answers: [], selectedPlayersAnswers: []};
    
    sessionUtils.checkLoggedIn();
    
    this.handleChange = this.handleChange.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handleUpdateAnswer = this.handleUpdateAnswer.bind(this);
    this.updateLeaderboard = this.updateLeaderboard.bind(this);

    this.loadQuiz();
    this.loadAllUnscoredAnswers();
    this.updateLeaderboard();
  }

  redirectToHome() {
    this.props.history.push({
      pathname: '/home'
    });
  }

  closeModal() {
    let thisObj = this;
    this.setState(Object.assign(thisObj.state, { modal: false, selectedPlayersAnswers: [] }));
  }

  loadQuiz() {
    let thisObj = this;
    
    quizService.getQuiz(this.state.game.quizId).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quiz: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  updateLeaderboard() {
    let thisObj = this;
    
    answerService.getLeaderboard(this.state.game.id).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { leaderboard: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  loadAllUnscoredAnswers() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.game.id).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { answers: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  openEditScoreModal(playerId) {
    let thisObj = this;

    console.log(`PlayerID: ${playerId}`);

    answerService.getAnswers(this.state.game.id, null, playerId).then(response => {
      console.log(JSON.stringify(response.data));
      thisObj.setState(Object.assign(thisObj.state, { selectedPlayersAnswers: response.data, modal: true }));
    }).catch(error => thisObj.parseError(error));
  }

  handleWebsocketMessage(payload) {

    let newState = this.state;
    let answer = JSON.parse(payload.payload);

    console.log(payload.payload);
    newState.answers.push(answer);

    this.setState(newState);
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
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
    console.log(`Submitting correction`);

    let answers = this.state.answers;
    let answer = answers[index].answer;
    answer.score = event.target.elements.score.value;

    answerService.submitCorrection(answer).then(response => {
      answers.splice(index, 1);
      thisObj.setState(Object.assign(thisObj.state, {score: null, answers: answers}));
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
      // thisObj.setState(Object.assign(thisObj.state, {_message: "Score updated."}));
    }).catch(error => thisObj.parseError(error));
    event.currentTarget.reset();
  }

  handlePublishQuestion(roundId, questionId) {
    let thisObj = this;
    console.log(`Publishing question`);

    let payload = {gameId: this.state.game.id, roundId: roundId, questionId: questionId};

    gameService.publishQuestion(payload).then(response => {
      // TODO: Do something
    }).catch(error => thisObj.parseError(error));
  }

  publishLeaderboard(event) {
    let thisObj = this;
    event.preventDefault();
    console.log(`Publishing Leaderboard`)

    answerService.publishLeaderboard(this.state.game.id).then(response => {
      // TODO: Do something
    }).catch(error => thisObj.parseError(error));
  }

  publishAnswersForRound(round) {
    let thisObj = this;

    answerService.publishAnswersForRound(this.state.game.id, round.id)
      .then(response => {
        // TODO: Do something
    }).catch(error => thisObj.parseError(error));
  }

  parseError(error) {
    let errorMessage = 'Undefined error';
    if (
      typeof error.response !== 'undefined' &&
      typeof error.response.data !== 'undefined' &&
      typeof error.response.data.message !== 'undefined' &&
      error.response.data.message !== ''
    ) {
      errorMessage = error.response.data.message;
    } else if (
      typeof error.response !== 'undefined' &&
      typeof error.response.statusText !== 'undefined' &&
      error.response.statusText !== ''
    ) {
      errorMessage = error.response.statusText;
    }
    if (typeof error.message !== 'undefined') {
      errorMessage = error.message;
    }
    this.setState(Object.assign(this.state, {_error: errorMessage}));
  }

  showError() {
    if (!this.state._error) {
      return false;
    }
    return true;
  }

  readErrorMessage() {
    if (!this.state._error) {
      return '';
    }
    let error = this.state._error;
    delete this.state._error;
    return error;
  }

  showResponse() {
    if (!this.state._message) {
      return false;
    }
    return true;
  }

  readResponseMessage() {
    if (!this.state._message) {
      return '';
    }
    let message = this.state._message;
    delete this.state._message;
    return message;
  }

  render() {
   
    return (
        <div className="app">
         <div className="game_wrap">
          <div className="game_container">

            { this.showError() || this.showResponse() ?
              <CardGroup>
                <Card className="p-6">
                  <CardBody>
                    <Alert className="mt-3" color="danger" isOpen={this.showError()}>
                      {this.readErrorMessage()}
                    </Alert>
                    <Alert className="mt-3" color="primary" isOpen={this.showResponse()}>
                      {this.readErrorMessage()}
                    </Alert>
                  </CardBody>
                </Card>
              </CardGroup>
            : null}


              <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/#/home"><span className="form_container_text_link">Home</span></a>
                </CardBody>
                </Card>
              </CardGroup>
              <CardGroup>
                <Card className="p-6">

                {!!this.state.quiz ?
                  <div>
                    <CardHeader tag="h1">{this.state.quiz.name}</CardHeader>
                    
                      {this.state.quiz.rounds.map((round) => (
                        <div>
                        <CardBody>
                          <h2>Round: {round.name}</h2>
                        </CardBody>
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
                      </div>
                    ))}
                    
                  </div>
                : <Row>No quiz selected</Row>}
                
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

                        {this.state.leaderboard.map((entry) => (
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

            <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h1">Answers for Correction</CardHeader>

                  {this.state.answers.length > 0 ?
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
                        Publish Leaderboard
                      </Button>
        
                    </ButtonGroup>
                  </CardBody>

                  {!!this.state.quiz ?
                    <CardBody>
                      <Table>
                      <thead>
                        <tr>
                          <th>Round</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                          {this.state.quiz.rounds.map((round) => 
                            <tr>
                              <td align="left">Round: {round.name}</td>
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
            
          </div>
        </div>

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

              
        <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/scoring', '/user/scoring']}
          onMessage={ this.handleWebsocketMessage.bind(this) }
          ref={ (client) => { this.clientRef = client }}/>

       </div>
    );
  }
}

export default Scoring;
