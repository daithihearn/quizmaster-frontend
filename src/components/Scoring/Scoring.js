import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import SockJsClient from 'react-stomp';

class Scoring extends Component {
  constructor(props) {
    super(props);
 
    //TODO. Game ID clears when refresh
    console.log(`State game ID ${JSON.stringify(this.props.location.gameId)}`);
    console.log(`Quiz ID ${JSON.stringify(this.props.location.quizId)}`);
    let gameId = this.props.location.gameId;
    let quizId = this.props.location.quizId;
    
    this.state = { gameId: gameId, quizId: quizId, answers: [] };
    
    sessionUtils.checkLoggedIn();
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleWebsocketMessage = this.handleWebsocketMessage.bind(this);
    this.loadAllUnscoredAnswers();
  }

 
  loadGame() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.gameId).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { answers: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  loadAllUnscoredAnswers() {

    let thisObj = this;

    answerService.getUnscoredAnswers(this.state.gameId).then(response => {
      thisObj.setState(Object.assign(thisObj.state, { answers: response.data }));
    }).catch(error => thisObj.parseError(error));
  }

  handleWebsocketMessage(answer) {

    let newState = this.state;
    newState.answers.push(answer);

    this.setState(Object.assign(this.state, newState));
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

  handleSubmit = event => {
    let thisObj = this;
    let index = event.target.elements.index.value;
    event.preventDefault();
    console.log(`Submitting correction`);

    let answers = this.state.answers;
    let answer = answers[index];
    answer.score = this.state.score;

    answerService.submitCorrection(answer).then(response => {
      answers.splice(index, 1);
      thisObj.setState(Object.assign(thisObj.state, {score: null, answers: answers}));
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
        <div className="login_background">
          <div className="login_background_cloumn">
            <div className="ISSUER_Logo" />
           
            Game Id: {this.state.gameId}
            
            {this.state.answers.map((answer, idx) => (
              <div className="form_container">
                <div className="form_wrap">

  
            <form onSubmit={this.handleSubmit}>

              <div>Round: {this.state.answers[idx].roundIndex}</div>
              <div>Question: {this.state.answers[idx].questionIndex}</div>
              <div>Answer: {this.state.answers[idx].answer}</div>

            <input
              className="index"
              type="input"
              name="index"
              value={idx}
              hidden
              required
              />
            
            <input
                className="score"
                type="input"
                name="score"
                placeholder="score"
                autoComplete="score"
                onChange={this.handleChange}
                required
              />
              <button  type="submit" color="primary" className="login_button">
                Submit
                  <span>
                  <img
                    style={{ marginLeft: '5px' }}
                    alt="description"
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                  />
                </span>
              </button> 
            </form>
            </div>
            </div>
            ))}

            
              

              <SockJsClient url={ process.env.REACT_APP_API_URL + '/websocket?tokenId=' + sessionStorage.getItem("JWT-TOKEN")} topics={['/scoring', '/user/scoring']}
                onMessage={ this.handleWebsocketMessage.bind(this) }
                ref={ (client) => { this.clientRef = client }}/>

          
        </div>
      </div>
    </div>
    );
  }
}

export default Scoring;
