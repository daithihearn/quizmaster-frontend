import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import DataTable, { createTheme } from 'react-data-table-component';
import PlayImage from '../../assets/icons/play.png';
import { Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, Container, Table, Progress } from 'reactstrap';
import ReactPlayer from 'react-player'
import Snackbar from "@material-ui/core/Snackbar";
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';
import NoSleep from 'nosleep.js';

const noSleep = new NoSleep();

class Game extends Component {  

  constructor(props) {
    super(props);
    this.state = { waiting: true, answers: [], 
      question: null, answer: "", leaderboard: null, 
      roundSummary: null, snackOpen: false,
      snackMessage: "", snackType: "",
      answeredCurrentQuestion: []};
    
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
    this.getAnswers();
    this.getPlayers();

    this.updateState = this.updateState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
  }


  componentDidUpdate(nextState){
    if(this.state.answer === ""){
     this.scropToTop();
    }
  }


  handleClose() {
    this.updateState({ snackOpen: false });
  }

  updateState(stateDelta) {
    this.setState(prevState => (stateDelta));
  }

  getCurrentContent() {
    let thisObj = this;
    gameService.getCurrentContent().then(response => {

      thisObj.parseScreenContent(response.data)
    }).catch(error => thisObj.parseError(error));
  }

  getAnswers() {
    let thisObj = this;
    answerService.getAllAnswers().then(response => {
      thisObj.updateState({answers: response.data})
    }).catch(error => thisObj.parseError(error));
  }

  getPlayers() {
    let thisObj = this;
    gameService.getPlayers().then(response => {
      thisObj.updateState({players: response.data})
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
        if (!this.state.answers.filter(answer => answer.questionId === content.content.questionId).length > 0) {
          this.updateState({waiting: false, question: content.content, answer: "", leaderboard: null, roundSummary: null, answeredCurrentQuestion: []});
        }
        break;
      case("LEADERBOARD"): 
        this.updateState({waiting: false, question: null, answer: "", leaderboard: content.content, roundSummary: null, answeredCurrentQuestion: []});
        break;
      case("ROUND_SUMMARY"):
        this.updateState({waiting: false, question: null, answer: "", leaderboard: null , roundSummary: content.content, answeredCurrentQuestion: []});
        break;
      case("ANSWERED"):
        let newState = this.state;
        newState.answeredCurrentQuestion.push(content.content);
        this.setState(newState);
        break;
      case("GAME_SUMMARY"):
      default:
        this.parseError({message: "Unsupported content type"})
    }
   
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.updateState(updateObj);
  }

  scropToTop(){
    window.scrollTo(0, 0);
  }

  handleSubmit = event => {
    if (this.state.submitDisabled) {
      return;
    }
    noSleep.enable();
    this.updateState({submitDisabled: true});

    let thisObj = this;
    event.preventDefault();
    
    let answer = {
      gameId: this.state.question.gameId,
      roundId: this.state.question.roundId,
      questionId: this.state.question.questionId,
      answer: this.state.answer
    }
    
   

    answerService.submitAnswer(answer).then(response => {
      let answeredQuestions = thisObj.state.answers.push(answer);
      thisObj.setState({ submitDisabled: false, waiting: true, answeredQuestion: answeredQuestions, 
        question: null, answer: "", leaderboard: null,  snackOpen: true, snackMessage: "Answer submitted successfully", snackType: "success" });
        this.scropToTop();
    }).catch(error => {
      thisObj.parseError(error);
      thisObj.updateState({submitDisabled: false});
    });
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

          {!!this.state.players && !!this.state.answeredCurrentQuestion ?
                      
            <Progress striped={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1} 
            color={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1 ?"info":"success"} 
            value={(this.state.answeredCurrentQuestion.length / this.state.players.length) * 100}>
              Current Question Progress
            </Progress>
                              
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
                              autoComplete="off"
                              value={this.state.answer}
                              onChange={this.handleChange}
                              autoFocus
                              required
                              
                            />
                          </FormGroup>
                          <ButtonGroup>
                            <Button type="submit" color="primary">
                              Submit
                            </Button>
                          </ButtonGroup>

                      </Form>
                    </CardBody>
                    <CardBody>
                        {!!this.state.question.imageUri ?
                          <Container>
                              <img alt="Question Image" src={this.state.question.imageUri} class="diplay_image_size" />
                          </Container>
                          : null}

                          {!!this.state.question.audioUri ?
                          <Container>
                            <ReactPlayer className="diplay_image_size" width="100%" url={this.state.question.audioUri} playing light controls playIcon={<img alt="Play" src={PlayImage} class="diplay_image_size" />} />
                          </Container>
                          : null}

                          {!!this.state.question.videoUri ?
                          <Container>
                            <ReactPlayer className="diplay_image_size" width="100%" url={this.state.question.videoUri} playing light controls playIcon={<img alt="Play" src={PlayImage} class="diplay_image_size" />} />
                          </Container>
                          : null}
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

                      <Table bordered hover responsive>
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
                                {question.imageUri ?<img alt="Image Preview" src={question.imageUri} class="thumbnail_size" />:null}
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
    </div>
  </div>
    );
  }
}

export default Game;
