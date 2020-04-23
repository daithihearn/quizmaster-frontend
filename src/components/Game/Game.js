import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import DataTable, { createTheme } from 'react-data-table-component';
import { Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, Alert, Table } from 'reactstrap';
import Viewer from 'react-viewer';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = { waiting: true, question: null, answer: "", leaderboard: null, roundSummary: null, visible: false };
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

    this.hideImage = this.hideImage.bind(this);
    this.showImage = this.showImage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
  }



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

  hideImage() {
    this.setState(Object.assign(this.state, {visible: false}));
  }

  showImage() {
    this.setState(Object.assign(this.state, {visible: true}));
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

            {!!this.state.waiting ? 

              <h1>Please wait for the next question...</h1>

            : null}

            {!!this.state.question ? 

              <CardGroup>
                <Card className="p-6">
                    <CardHeader tag="h1">Question</CardHeader>
                    <CardBody>
                      <h2>{this.state.question.question}</h2>
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
                            <Button type="submit" color="primary">
                              Submit
                            </Button>
                          </ButtonGroup>
                          
                         

                          {!!this.state.question.imageUri ?
                          <FormGroup>
                            <br></br>
                            <Viewer
                              visible={this.state.visible}
                              onClose={() => { this.hideImage() } }
                              images={[{src: this.state.question.imageUri}]}
                              />
                             <img src={this.state.question.imageUri} class="diplay_image_size" /> {/*onClick={this.showImage}/> */}
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
                {!!this.state.leaderboard.roundId ? 
                  <CardHeader tag="h1">Round Leaderboard</CardHeader>
                :
                  <CardHeader tag="h1">Full Leaderboard</CardHeader>
                }
                <CardBody>
                  <DataTable
                    defaultSortField="score"
                    defaultSortAsc={false}
                    columns={[
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
                    ]}
                      data={this.state.leaderboard.scores}
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
                  <CardHeader tag="h1">{this.state.roundSummary.name} - Summary</CardHeader>
                  <CardBody>

                      <Table>
                        <thead>
                          <tr>
                            <th>Question</th>
                            <th></th>
                            <th>Answer</th>
                          </tr>
                        </thead>
                        <tbody>

                          {this.state.roundSummary.questions.map(question => 

                            <tr>
                              <td align="left">
                                {question.question}
                              </td>
                              <td>
                                {question.imageUri ?<img src={question.imageUri} class="thumbnail_size" />:null}
                              </td>
                              <td> 
                                {question.answer}
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
  </div>
    );
  }
}

export default Game;
