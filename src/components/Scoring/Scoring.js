import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form, FormGroup, Label, Input, Container, Row, Col, Media } from 'reactstrap';
import classnames from 'classnames';

class Scoring extends Component {
  constructor(props) {
    super(props);
    
    this.state = { game: props.location.state.game, answers: [], activeTab: '1' };
    
    sessionUtils.checkLoggedIn();
    
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleCorrectAnswer = this.handleCorrectAnswer.bind(this);
    this.handlePublishQuestion = this.handlePublishQuestion.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.loadAllUnscoredAnswers();
    this.loadQuiz();
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState(Object.assign(this.state, { activeTab: tab }));
    }
  }

  getGameId(gameId) {
    if (!gameId) {
      return sessionStorage.getItem("gameId");
    }
    sessionStorage.setItem("gameId", gameId);
    return gameId;
  }

  getQuizId(quizId) {
    if (!quizId) {
      return sessionStorage.getItem("quizId");
    }
    sessionStorage.setItem("quizId", quizId);
    return quizId;
  }

  loadQuiz() {
    let thisObj = this;
    
    quizService.getQuiz(this.state.game.quizId).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quiz: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  loadAllUnscoredAnswers() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.game.id).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { answers: response.data }));
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

  handleCorrectAnswer = event => {
    let thisObj = this;
    let index = event.target.elements.index.value;
    event.preventDefault();
    console.log(`Submitting correction`);

    let answers = this.state.answers;
    let answer = answers[index].answer;
    answer.score = this.state.score;

    answerService.submitCorrection(answer).then(response => {
      answers.splice(index, 1);
      thisObj.setState(Object.assign(thisObj.state, {score: null, answers: answers}));
    }).catch(error => thisObj.parseError(error));
  }

  handlePublishQuestion = event => {
    let thisObj = this;
    let roundId = event.target.elements.roundId.value;
    let questionId = event.target.elements.questionId.value;
    event.preventDefault();
    console.log(`Publishing question`);

    let payload = {gameId: this.state.game.id, roundId: roundId, questionId: questionId};

    console.log(JSON.stringify(payload));

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
    if (
      typeof error.response !== 'undefined' &&
      typeof error.response.data !== 'undefined' &&
      typeof error.response.data.message !== 'undefined' &&
      error.response.data.message !== ''
    ) {
      return error.response.data.message;
    } else if (
      typeof error.response !== 'undefined' &&
      typeof error.response.statusText !== 'undefined' &&
      error.response.statusText !== ''
    ) {
      return error.response.statusText;
    }
    if (typeof error.message !== 'undefined') {
      return error.message;
    }
    return 'Undefined error';
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
    if (!this.state._txHash) {
      return false;
    }
    return true;
  }

  render() {
   
    //new login
    return (
      <div className="app">
        <div className="form_wrap">
          <div className="form_container">
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggle('1'); }}
                >
                  Questions
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggle('2'); }}
                >
                  Answers ({!!this.state.answers ? this.state.answers.length : 0})
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '3' })}
                  onClick={() => { this.toggle('3'); }}
                >
                  Actions
                </NavLink>
              </NavItem>
            </Nav>


            <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">

                {!!this.state.quiz ?
                  <Container>
                    <Row><h2>{this.state.quiz.name}</h2></Row>
                    <Row>
                        {this.state.quiz.rounds.map((round) => (
                          <Container>
                          <Row>
                            <h3>Round: {round.name}</h3>
                          </Row>
                          
                            {round.questions.map((question) => (
                              <Row>
                              
                                <Form onSubmit={this.handlePublishQuestion}>
                                  <FormGroup>Question: {question.question}</FormGroup>
                                  <FormGroup>Answer: {question.answer}</FormGroup>
                                  
                                  {!!question.imageUri ?
                                  <FormGroup><img src={question.imageUri} height="42" width="42"/></FormGroup>
                                  : null}
                                    
                                  <Input
                                    className="roundId"
                                    type="input"
                                    name="roundId"
                                    value={round.id}
                                    hidden
                                    required />
                                  <Input
                                    className="questionId"
                                    type="input"
                                    name="questionId"
                                    value={question.id}
                                    hidden
                                    required />

                                  <Button color="primary" type="submit">
                                    Publish
                                  </Button> 

                                </Form>
                              </Row>
                            ))}
                          </Container>
                        ))}
                    </Row>
                  </Container>
                : <Row>No quiz selected</Row>}
                
              </TabPane>

              <TabPane tabId="2">
                  <Container>
                    {this.state.answers.map((answer, idx) => (
                    <Row>

                      <Container>
                        <Row><Col>Question</Col><Col>{answer.question.question}</Col></Row>
                        <Row><Col>Correct Answer</Col><Col>{answer.question.answer}</Col></Row>
                        <Row><Col>Answer Provided</Col><Col>{answer.answer.answer}</Col></Row>
                      </Container>
                      <Form onSubmit={this.handleCorrectAnswer}>

                        <Input
                          className="index"
                          type="input"
                          name="index"
                          value={idx}
                          hidden
                          required
                          />
                      
                        <FormGroup>
                          <Input
                              className="score"
                              type="input"
                              name="score"
                              placeholder="Score"
                              autoComplete="Score"
                              value={answer.question.score}
                              onChange={this.handleChange}
                              required
                            />
                        </FormGroup>
                        <Button color="primary" type="submit">
                          Submit
                        </Button> 
                      </Form>
                    </Row>
                  ))}
                </Container>
              </TabPane>

              <TabPane tabId="3">
                <Container>
                <Row><Col></Col><Col><Button type="button" color="primary" onClick={this.publishLeaderboard.bind(this)}>
                      Publish Leaderboard
                </Button></Col></Row>

                {!!this.state.quiz ?
                <div>
                {this.state.quiz.rounds.map((round) => 
                  <Row><Col>Round: {round.name}</Col><Col><Button type="button" color="primary" onClick={this.publishAnswersForRound.bind(this, round)}>
                        Publish Answers 
                  </Button></Col></Row>
                )}
                </div>
                : null}
                </Container>
              </TabPane>
            </TabContent>
          </div>
        </div>
              
        <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/scoring', '/user/scoring']}
          onMessage={ this.handleWebsocketMessage.bind(this) }
          ref={ (client) => { this.clientRef = client }}/>

    </div>
    );
  }
}

export default Scoring;
