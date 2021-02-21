import React, { Component } from 'react';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import Leaderboard from '../Leaderboard';
import SlowPlayers from '../SlowPlayers';
import PlayImage from '../../assets/icons/play.png';
import { Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, Container, Table, Progress } from 'reactstrap';
import ReactPlayer from 'react-player'
import Snackbar from "@material-ui/core/Snackbar";
import DefaultHeader from '../Header';
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';
import errorUtils from '../../utils/ErrorUtils';

import auth0Client from '../../Auth';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

class Game extends Component {

  constructor(props) {
    super(props);

    if (!props.location.state || !props.location.state.game) {
      this.updateState(errorUtils.parseError("No Game provided"));
      return;
    }

    let profile = auth0Client.getProfile();

    this.state = { profile: profile, game: props.location.state.game, waiting: true, answers: [],
      question: null, answer: "", leaderboard: null,
      roundSummary: null, snackOpen: false,
      snackMessage: "", snackType: "",
      answeredCurrentQuestion: []
    };

    this.goHome = this.goHome.bind(this);
    this.updateState = this.updateState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.processSubmit = this.processSubmit.bind(this);
    this.parseGameContent = this.parseGameContent.bind(this);
  }

  async componentDidMount() {
    // Get the players first
    let players = await gameService.getPlayersForGame(this.state.game.id);
    players = players.data;

    // Refresh the game
    let game = await gameService.get(this.state.game.id);
    game = game.data;

    // Answers 
    let answers = await answerService.getAllAnswers(this.state.game.id);
    answers = answers.data;

    this.updateState({players: players, game: game, answers: answers });

    this.parseGameContent(game);
    this.setAnsweredCurrentQuestion();
  }

  setAnsweredCurrentQuestion() {
    let thisObj = this;
    // Who has answered the current question?
    if (!!this.state.game.currentContent && this.state.game.currentContent.type === "QUESTION") {
      answerService.getWhoHasAnswered(this.state.game.id, this.state.game.currentContent.content.roundId, this.state.game.currentContent.content.questionId).then(response => {

        thisObj.updateState({ answeredCurrentQuestion: response.data });
      
      }).catch(
        error => {
          let state = thisObj.state;
          Object.assign(state, errorUtils.parseError(error));
          thisObj.setState(state);
        }
      )
    }
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


  handleGameContentMessage(payload) {
    if (!payload) {
      return
    }

    this.parseGameContent(JSON.parse(payload.payload));
  }

  parseGameContent(content) {

    if(!content || !content.currentContent) {
      return
    }

    let currentContent = content.currentContent;

    switch (currentContent.type) {
      case("QUESTION"):
        if (!this.state.answers.filter(answer => answer.questionId === currentContent.content.questionId).length > 0) {
          this.updateState({ waiting: false, game: content, question: currentContent.content, answer: "", leaderboard: null, roundSummary: null });
        }
        break;
      case("LEADERBOARD_FULL"): 
        this.updateState({waiting: false, game: content, question: null, answer: "", leaderboard: currentContent.content, leaderBoardTitle: "Full Leaderboard", roundSummary: null, answeredCurrentQuestion: []});
        break;
      case("LEADERBOARD_ROUND"): 
        this.updateState({waiting: false, game: content, question: null, answer: "", leaderboard: currentContent.content, leaderBoardTitle: "Round Leaderboard", roundSummary: null, answeredCurrentQuestion: []});
        break;
      case("ROUND_SUMMARY"):
        this.updateState({waiting: false, game: content, question: null, answer: "", leaderboard: null , roundSummary: currentContent.content, answeredCurrentQuestion: []});
        break;
      default:
        this.updateState(errorUtils.parseError("Unsupported content type"));
    }
   
  }

  parseAnsweredContent(payload) {
    if (!payload) {
      return
    }

    let content = JSON.parse(payload.payload);

    let newState = this.state;
    newState.answeredCurrentQuestion = content;
    this.setState(newState);
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
    this.updateState({submitDisabled: true});

    event.preventDefault();
    
    let answer = {
      gameId: this.state.question.gameId,
      roundId: this.state.question.roundId,
      questionId: this.state.question.questionId,
      answer: this.state.answer,
      multipleChoice: false
    }
    
    this.processSubmit(answer);
  }

  handleMultipleChoiceSubmit(answerValue) {
    if (this.state.submitDisabled) {
      return;
    }
    this.updateState({submitDisabled: true});
    
    let answer = {
      gameId: this.state.question.gameId,
      roundId: this.state.question.roundId,
      questionId: this.state.question.questionId,
      answer: answerValue,
      multipleChoice: true
    }
    
    this.processSubmit(answer);
  }

  processSubmit(answer) {

    let thisObj = this;
    answerService.submitAnswer(answer).then(response => {
      let answeredQuestions = thisObj.state.answers.push(answer);
      thisObj.setState({ submitDisabled: false, waiting: true, answeredQuestion: answeredQuestions, 
        question: null, answer: "", leaderboard: null,  snackOpen: true, snackMessage: "Answer submitted successfully", snackType: "success" });
        this.scropToTop();
    }).catch(error => {

      let state = thisObj.state;
      Object.assign(state, errorUtils.parseError(error));
      Object.assign(state, {submitDisabled: false});
      thisObj.setState(state);
    });
  }

  goHome() {
    this.props.history.push({
      pathname: '/'
    });
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

          {!!this.state && !!this.state.players && !!this.state.answeredCurrentQuestion ?
                      
            <Progress striped={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1} 
            color={(this.state.answeredCurrentQuestion.length / this.state.players.length) < 1 ?"info":"success"} 
            value={(this.state.answeredCurrentQuestion.length / this.state.players.length) * 100}>
              Current Question Progress
            </Progress>
                              
          : null}

            {!!this.state.waiting ? 
              <div>

                {!!this.state && !!this.state.players && !!this.state.answeredCurrentQuestion && this.state.answeredCurrentQuestion.length > 0 && this.state.players.length !== this.state.answeredCurrentQuestion.length ?
                  <SlowPlayers players={this.state.players} answered={this.state.answeredCurrentQuestion} title="Slow Feckers!!"/>
                : <h1>Please wait for the next question...</h1>}
              </div>
            : null}

            {!!this.state.question ? 

              <CardGroup>
                <Card className="p-6">
                    <CardHeader tag="h1">{this.state.question.roundName}</CardHeader>
                    <CardBody>
                      <h2>{this.state.question.question}</h2>
                    </CardBody>
                    <CardBody>

                      {!!this.state.question.options && this.state.question.options.length > 0 ? 
                        <div>
                        
                          {this.state.question.options.map((option, idx) => (
                            
                              <Button color="secondary" size="lg" block onClick={this.handleMultipleChoiceSubmit.bind(this, option)}>
                                {alphabet[idx]}. {option}
                              </Button>
                            
                          ))}
                          
                        
                        </div>
                      :

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
                      }
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

          {!!this.state.players && !!this.state.leaderboard ? 


            <Leaderboard scores={this.state.leaderboard.scores} players={this.state.players} title={this.state.leaderBoardTitle}/>

          : null }

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

      <SockJsClient url={ `${process.env.REACT_APP_API_URL}/websocket?gameId=${this.state.game.id}&tokenId=${auth0Client.getAccessToken()}`} topics={['/game', '/user/game']}
                onMessage={ this.handleGameContentMessage.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>

      <SockJsClient url={ `${process.env.REACT_APP_API_URL}/websocket?gameId=${this.state.game.id}&tokenId=${auth0Client.getAccessToken()}`} topics={['/user/answered']}
                onMessage={ this.parseAnsweredContent.bind(this) }
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


</main>
</div>
</span>
</div>
</div>
    );
  }
}

export default Game;
