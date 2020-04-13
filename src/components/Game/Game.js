import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import answerService from '../../services/AnswerService';
import gameService from '../../services/GameService';
import SockJsClient from 'react-stomp';
import DataTable, { createTheme } from 'react-data-table-component';

class Game extends Component {
  constructor(props) {
    super(props);
    this.state = { waiting: true, question: null, answer: "", leaderboard: null };
    sessionUtils.checkLoggedIn();

    createTheme('solarized', {
      text: {
        primary: '#268bd2',
        secondary: '#2aa198',
      },
      background: {
        default: '#002b36',
      },
      context: {
        background: '#cb4b16',
        text: '#FFFFFF',
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
        this.setState(Object.assign(this.state,{waiting: false, question: content.content, answer: "", leaderboard: null}));
        break;
      case("LEADERBOARD"): 
        this.setState(Object.assign(this.state,{waiting: false, question: null, answer: "", leaderboard: content.content}));
        break;
      case("ROUND_SUMMARY"):
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
      roundIndex: this.state.question.roundIndex,
      questionIndex: this.state.question.questionIndex,
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
        <div className="login_background">
          <div className="login_background_cloumn">
            <div className="ISSUER_Logo" />

            {!!this.state.waiting ? 
              <div className="form_wrap">
                <div className="form_container">
                  <div>Please wait for the next question...</div>
                </div>
              </div>
            : null}

            {!!this.state.question ? 

            <div className="form_wrap">
              <div className="form_container">
              <form onSubmit={this.handleSubmit}>
              
              {this.state.question.question}
              <input
                  className="answer"
                  type="input"
                  name="answer"
                  placeholder="answer"
                  autoComplete="answer"
                  value={this.state.answer}
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
              <img src={this.state.question.imageUri}/>
            </div>
            </div>
            
            : null
            }

          {!!this.state.leaderboard ? 
            <div className="form_wrap">
              <div className="form_container">
            <DataTable
                title="Leaderboard"
                columns={this.columns}
                data={this.state.leaderboard}
                theme="solarized"
            />

              </div>
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
