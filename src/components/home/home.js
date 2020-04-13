import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';


class Home extends Component {
  constructor(props) {
    super(props);
   
    this.state = { 
      
       quizzes: [],
       emails:[''],
       quizSelected:{},
       isGameCreated:false,
       isQuizSelected:false,
       game:{}
      
      };
    
    sessionUtils.checkLoggedIn();

    this.getAllQuizzes();

    this.onClickHandler = this.onClickHandler.bind (this);
    //this.getAllQuizzes = this.getAllQuizzes.bind(this);
    this.startGameWithEmails = this.startGameWithEmails.bind(this);
  }
 
  getAllQuizzes()  {
    let thisObj = this;

    quizService.getAllQuizzes().then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quizzes: response.data }));
    })
      .catch(error => thisObj.parseError(error));
  };

  startGameWithEmails = event => {
    event.preventDefault();

    let thisObj = this;
    let gameEmails= 
    {
      playerEmails: this.state.emails,
      quizId: this.state.quizSelected.id
    }

   
    this.setState(Object.assign(this.state, { isGameCreated:true}));
    gameService.put(gameEmails).then(response => {

      thisObj.setState(Object.assign(thisObj.state, { game: response.data }));
      console.log(`Game created with id: ${JSON.stringify(response.data)}`);
     })
       .catch(error => thisObj.parseError(error));
       
  };
 
  checkLoginStatus() {
    let authHeader = sessionStorage.getItem('JWT-TOKEN');
    if (authHeader) {
      window.location.href = '/#/home';
      return;
    }
  }

 




  onClickHandler = event => {

    let key = event.target.id; 
    let name = event.target.innerText;
    let quiz = {name:'', id:''}
    quiz.name=name;
    quiz.id=key;
    console.log("Clicked: " + key + " - " +  name);
    this.setState(Object.assign(this.state, {quizSelected: quiz, isQuizSelected:true}));
    console.log(`Quiz select4ed********: ${JSON.stringify(this.state.quizSelected)}`);
  };

 

  submitQuiz = event => {

    console.log(`Quiz submitted********: ${JSON.stringify(this.state.quizToPersist)}`);

    quizService.putQuiz(this.state.quizToPersist).then(response =>
      console.log(response)
    ).catch(error =>
      console.log(error)
    );

    event.preventDefault();

  };

  getGameInfo(){
    let gameId= this.state.game.id;
    //const membersToRender = this.state.game.players.filter(players => players.display);
    //const numPlayers = membersToRender.length;
    const players= this.state.game.players;
    if(!!players){
      const numPlayers=players.length;
      console.log(`Players  ${JSON.stringify(numPlayers)}`);
      return(
         
          <p>     Game Id generated: {gameId}
              
          <br></br>
            Number of Player for this game: {numPlayers}
          </p>
         
    
        );
    }
 

  }

  getEmailAdresses() {

    return this.state.emails.map((v, i) =>
    
        <div key={i}>
            
            <input
              className="email"
              type="input"
              name="email"
              placeholder="Email"
              autoComplete="Email"
              value={v || ''}
              onChange={this.handleChange.bind(this, i)}
              required
            />
            {/* <input type="text" value={v.value||''} onChange={this.handleChangeValue.bind(this, i)} /> */}
          
            <button type="button" color="primary" className="login_button" onClick={this.removeClick.bind(this, i)}>
              Remove Player
                        <span>
                <img
                  style={{ marginLeft: '5px' }}
                  alt="description"
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                />
              </span>
            </button>
            {/* {v.value}, {v.answer} */}

            <button type="btuoo" color="primary" className="login_button" onClick={this.addClick.bind(this)}>
                            Add Another Player
                                <span>
                              <img
                                style={{ marginLeft: '5px' }}
                                alt="description"
                                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                              />
                            </span>
              </button>
              
          </div>
     
    )
  }

  addClick() {
    
    this.setState(prevState => ({ emails: [...prevState.emails, ""] }))
  
  
  }

  removeClick(i) {
    let emails = [...this.state.emails];
    emails.splice(i, 1);
    this.setState({ emails });
  
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

  handleChange(i, event) {

    let emails = [...this.state.emails];
    console.log(`emails   BEGIN: ${JSON.stringify(emails)}`);
    
    //let email = { [key]: event.target.value };
     emails[i]=event.target.value;
    console.log (" what " + emails[i].concat(event.target.value));
    console.log(`emails: ${JSON.stringify(emails)}`);
    
    this.setState({ emails });
  };

  


  render() {

    //new login
    return (
      <div className="app">
        
        {/* Choose previous quiz */}
        <div className="login_background">
          <div className="login_background_cloumn">
            <div className="ISSUER_Logo" />
            {/* <div className="login_background_issuerImage" /> */}
            <div className="tile_wrap">
              <div className="card-product_Stats">
                <div className="form_wrap">
                  <div className="form_container2">
                    

                  
                {this.state.isGameCreated ? ''
                  :
                   <div>
                    <div className="form_container_subtext">
                      Select a previous Quiz
                    </div>
                    <div className="dropdown-menu-quizzes"  >
                      {this.state.quizzes.map((rowdata, i) => {
                        return (
                           <option  className="dropdown-item" key={i} id={rowdata.id} onClick={this.onClickHandler}> 
                           {rowdata.name} 
                           </option>
                           
                        )
                      })
                      }
                    </div>  
                  </div>
                  }
                 
                   


                    {this.state.isQuizSelected  && !this.state.isGameCreated ?  
                    <div>
                        <h3>
                        Selected quiz : {this.state.quizSelected.name}  
                        </h3> 
                    
                         <p>      Enter email adresses and start a game
                      </p>
                      </div>
                    
                      : [
                        
                          (!this.state.isGameCreated ? 
                            <div> 
                                    <p>
                                      <br></br>
                                      OR
                                    </p>
                                        {/* <button href="/#/createquiz"><span className="form_container_text_link"> Create a brand new Quiz </span></button>   */}
                                      <form action="/#/createquiz"> 
                                        <button color="primary" className="login_button"  href="/#/createquiz">
                                          Create a brand new Quiz 
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
                            : null
                          )
                      ]
                    }
                    {this.state.isQuizSelected && !this.state.isGameCreated  ?  
                    <form  onSubmit={this.startGameWithEmails}>
                       {this.getEmailAdresses()}
                    <button type="submit" color="primary" className="login_button" >
                                Start Game 
                                  <span>
                                  <img
                                    style={{ marginLeft: '5px' }}
                                    alt="description"
                                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                                  />
                                </span>
                              </button>
                      </form>
                     
                   : <br></br>
                    }

                    {this.state.isGameCreated ?  
                    <div>
                      {this.getGameInfo()}
                    </div>
                       : ''                 
                    } 
            
                </div>
                  </div>
                  </div>
                 

             </div>
            </div>
          </div>
          
          
                      
      
      

       {/* New Quiz
      <div className="login_background">
        <div className="login_background_cloumn">
         <div className="ISSUER_Logo" />
            <div className="form_wrap">
              {this.buildQuiz()}
              </div>
              </div>
            </div>
       */}
      
      {/* App div */}
      </div>      

      
    
    
   
    );
  }
}

export default Home;
