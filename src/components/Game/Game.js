import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import DataTable, { createTheme } from 'react-data-table-component';
import { Button, Form, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';

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

  render() {
   
    //new login
    return (
      <div className="app">
        <div className="form_wrap">
          <div className="form_container">

            {!!this.state.waiting ? 

              <h3>Please wait for the next question...</h3>

            : null}

            {!!this.state.question ? 


              <Form onSubmit={this.handleSubmit}>
                <FormGroup>{this.state.question.question}</FormGroup>
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
                  <Button  type="submit" color="primary">
                    Submit
                  </Button>
                  
                  {!!this.state.question.imageUri ?
                  <FormGroup>
                    <img src={this.state.question.imageUri}/>
                  </FormGroup>
                  : null}

              </Form>
              

            
            : null
            }

          {!!this.state.leaderboard ? 

            <DataTable
                title="Leaderboard"
                columns={this.columns}
                data={this.state.leaderboard}
                theme="solarized"
            />

          : null
          }

          {!!this.state.roundSummary ? 
              <div>

                <Container>
                  <Row>
                    <h2>{this.state.roundSummary.name}</h2>
                  </Row>
                  <Row>
                      {this.state.roundSummary.questions.map(question => 

                        <Container>
                          <Row>
                            <Col>Question</Col><Col>{question.question}</Col>
                          </Row>
                          <Row> 
                            <Col>Answer</Col><Col>{question.answer}</Col>
                          </Row>
                          {question.imageUri ?
                          <Row>
                            <img src={question.imageUri} height="64" width="64" />
                          </Row>:null}
                        </Container>

                      )}
                    </Row>
                  </Container>
            </div>
          : null
          }
        
          </div>
        </div>

      <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/game', '/user/game']}
                onMessage={ this.handleWebsocketMessage.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>
    </div>
    );
  }
}

export default Game;
