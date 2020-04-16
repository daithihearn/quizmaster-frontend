import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import DataTable, { createTheme } from 'react-data-table-component';
import { Button, ButtonGroup, Form, FormGroup, Label, Input, Container, Row, Col, Card, CardBody, CardGroup, CardTitle, Alert, Table } from 'reactstrap';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = { waiting: true, question: null, answer: "", leaderboard: null, roundSummary: null };
    sessionUtils.checkLoggedIn();

    createTheme('solarized', {
      text: {
        primary: '#000000',
        secondary: '#333333',
      },
      background: {
        default: '#ffffff',
      },
      context: {
        background: '#ffffff',
        text: '#ffffff',
      },
      divider: {
        default: '#073642',
      },
      action: {
        button: 'rgba(0,0,0,.54)',
        hover: 'rgba(0,0,0,.08)',
        disabled: 'rgba(0,0,0,.12)',
      },
    });

    this.getCurrentContent();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
  }

  columns = [
    {
      name: 'Player',
      selector: 'playerId',
      sortable: true,
    },
    {
      name: 'Score',
      selector: 'score',
      sortable: true,
      right: true,
    },
  ];

  getCurrentContent() {
    let thisObj = this;
    gameService.getCurrentContent().then(response => {

      thisObj.parseScreenContent(response.data)
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

    switch (content.type) {
      case("QUESTION"):
        this.setState(Object.assign(this.state,{waiting: false, question: content.content, answer: "", leaderboard: null, roundSummary: null}));
        break;
      case("LEADERBOARD"): 
        this.setState(Object.assign(this.state,{waiting: false, question: null, answer: "", leaderboard: content.content, roundSummary: null}));
        break;
      case("ROUND_SUMMARY"):
        this.setState(Object.assign(this.state,{waiting: false, question: null, answer: "", leaderboard: null , roundSummary: content.content}));
        break;
      case("GAME_SUMMARY"):
      default:
        this.setState({ waiting: true, question: null, answer: "", leaderboard: null })
    }
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

  handleSubmit = event => {
    let thisObj = this;
    event.preventDefault();
    console.log(`Submitting answer ${this.state.answer}`);
    
    let answer = {
      gameId: this.state.question.gameId,
      roundId: this.state.question.roundId,
      questionId: this.state.question.questionId,
      answer: this.state.answer
    }
    
    answerService.submitAnswer(answer).then(response => {
      thisObj.setState({ waiting: true, question: null, answer: "", leaderboard: null });
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
   
    //new login
    return (
      <div className="app">
        <div className="form_wrap">

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

            {!!this.state.waiting ? 

              <h3>Please wait for the next question...</h3>

            : null}

            {!!this.state.question ? 

              <CardGroup>
                <Card className="p-6">
                    <CardBody>
                      <CardTitle>{this.state.question.question}</CardTitle>
                    </CardBody>
                    <CardBody>
                      <Form onSubmit={this.handleSubmit}>
                        <FormGroup>
                          <Input
                              className="answer"
                              type="input"
                              name="answer"
                              placeholder="answer"
                              autoComplete="answer"
                              value={this.state.answer}
                              onChange={this.handleChange}
                              required
                            />
                          </FormGroup>
                          <ButtonGroup>
                            <Button  type="submit" color="primary">
                              Submit
                            </Button>
                          </ButtonGroup>
                          
                          {!!this.state.question.imageUri ?
                          <FormGroup>
                            <img src={this.state.question.imageUri}/>
                          </FormGroup>
                          : null}

                      </Form>
                    </CardBody>
                </Card>
              </CardGroup>
            
            : null
            }

          {!!this.state.leaderboard ? 

            <CardGroup>
              <Card className="p-6">
                <CardBody>
                  <DataTable
                      title="Leaderboard"
                      columns={this.columns}
                      data={this.state.leaderboard}
                      theme="solarized"
                  />
                </CardBody>
              </Card>
            </CardGroup>

          : null
          }

          {!!this.state.roundSummary ? 
              <CardGroup>
                <Card className="p-6">
                  <CardBody>
                    <CardTitle>{this.state.roundSummary.name} - Summary</CardTitle>
                  </CardBody>
                  <CardBody>

                      <Table>
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th>Answer</th>
                            <th>Image</th>
                          </tr>
                        </thead>
                        <tbody>

                          {this.state.roundSummary.questions.map(question => 

                            <tr>
                              <td>
                                {question.question}
                              </td>
                              <td> 
                                {question.answer}
                              </td>
                              <td>
                                {question.imageUri ?<img src={question.imageUri} height="64" width="64" />:null}
                              </td>
                            </tr>

                          )}
                        </tbody>
                      </Table>

                    </CardBody>
                  </Card>
              </CardGroup>
          : null
          }

      <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/game', '/user/game']}
                onMessage={ this.handleWebsocketMessage.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>
      </div>
    </div>
    );
  }
}

export default Game;
