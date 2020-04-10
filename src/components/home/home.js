import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';

class Home extends Component {
  constructor(props) {
    super(props);
    // this.state = { firstName: '', surname: '', username: '', password: '' };
    // this.state = { questions: [{ value: '', answer: ''}], value: '', answer: ''};
    this.state = { 
      questions: [],
      quizName:'',
       quizzes: [],
       quizCreated: false, 
       roundNumber:0, 
       quizToPersist:
        {
          name: '',
          rounds: [
          //   {
          //     index: 0,
          //     name: '',
          //     questions: []
          // }
        ]
        }
      
      };
    sessionUtils.checkLoggedIn();
    sessionUtils.checkUserType();

    this.getAllQuizzes = this.getAllQuizzes.bind(this);
  }

  showButtonPreviousRound(){
    if(this.state.roundNumber>1){
      return(
      <div className="form_container_text">
      Back to <a href="/#/login"><span className="form_container_text_link"> Previous Round </span></a>
      </div>
      )
    }
  }
 

  showRounds(){
    return this.state.quizToPersist.rounds.map(round =>
      <div>
        <h2 key={round.index} item={round}>{round.name}</h2>
        <ul>
          {round.questions.map(question => 
            <h3 key={question.index}> {question.value}: {question.answer}</h3>
          )}
        </ul>
      </div>
    )
  }

  
  buildQuiz(){
 
    
    if(this.state.quizCreated){
    return(

      
              
              <div className="form_container">
                {/* <div className="form_container_headerText"> New Question </div>  */}
                {/* <div className="form_container_subtext"> */}
              
                <div className="show_quiz_name">You have chosen the quiz name: {this.state.quizName}</div> 
              

                {this.showRounds()}

                <br></br>
                  Round number {this.state.roundNumber+1}
                    <form onSubmit={this.createRound}>
                      
                      {this.createQuestions()}

                      <button type="submit" color="primary" className="login_button" onClick={this.addClick.bind(this)}>
                        Add question
                            <span>
                          <img
                            style={{ marginLeft: '5px' }}
                            alt="description"
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                          />
                        </span>
                      </button>

                      {/* {this.showButtonSubmitRound()} */}
                      <button type="submit" value="submit" color="primary" className="login_button" >
                        Submit Round {this.state.roundNumber+1}
                            <span>
                          <img
                            style={{ marginLeft: '5px' }}
                            alt="description"
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                          />
                        </span>
                      </button>

                      <button type="button" color="primary" className="login_button" onClick={this.submitQuiz}>
                        Submit Quiz
                          <span>
                                <img
                                  style={{ marginLeft: '5px' }}
                                  alt="description"
                                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                                />
                              </span>
                      </button>

                      {/* <button type="submit" value="submit" color="primary" className="login_button" onClick=xxxx >
                        Submit Quiz
                            <span>
                          <img
                            style={{ marginLeft: '5px' }}
                            alt="description"
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                          />
                        </span>
                      </button> */}

                      
                    
                    {this.showButtonPreviousRound()}

                    </form>
                        
                   
                  
                
              </div>
    );
    }else{
      return(

       
              <div className="form_container">
                  {/* <div className="form_container_headerText"> New Question </div>  */}
                  {/* <div className="form_container_subtext"> */}
                 New Quiz
              
                <form >
                    <input
                      className="quizName"
                      type="input"
                      name="quizName"
                      placeholder="Quiz Name"
                      autoComplete="Quiz Name"
                      value={this.state.quizName}
                      onChange={this.handleChange}
                      required
                    ></input>
                  
                  
                      <button type="button" color="primary" className="login_button" onClick={this.createQuiz}>
                      Create  Quiz
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
              
         
         
     
      );
    }
    
  }

  createQuiz = event => {
    //this.setState(prevState => ({ quizCreated: !prevState.quizCreated})); 
    this.setState(prevState => ({ quizCreated: !prevState.quizCreated})); 
    console.log("created Quiz: " + this.state.quizCreated);
  }

  getAllQuizzes = event => {
    event.preventDefault();

    let thisObj = this;

    quizService.getAllQuizzes().then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quizzes: response.data }));
    })
      .catch(error => console.error('Error occurred when searching: ', error));
  };

  createQuestions() {
    return this.state.questions.map((v, i) =>
      <div key={i}>
        
        <input
          className="question"
          type="input"
          name="question"
          placeholder="Question"
          autoComplete="Question"
          value={v.value || ''}
          onChange={this.handleChangeValue.bind(this, i)}
          required
        />
        {/* <input type="text" value={v.value||''} onChange={this.handleChangeValue.bind(this, i)} /> */}
        <div><br></br></div>

        <input
          className="answer"
          type="input"
          name="answer"
          placeholder="Answer"
          autoComplete="Answer"
          value={v.answer || ''}
          onChange={this.handleChangeAnswer.bind(this, i)}
          required
        />
        <div><br></br></div>
        {/* <input type="text" value={v.answer||''} onChange={this.handleChangeAnswer.bind(this, i)} /> */}

        {/* <input type='button' value='remove' onClick={this.removeClick.bind(this, i)}/> */}

        <button type="submit" color="primary" className="login_button" onClick={this.removeClick.bind(this, i)}>
          Remove question
                    <span>
            <img
              style={{ marginLeft: '5px' }}
              alt="description"
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
            />
          </span>
        </button>
        {/* {v.value}, {v.answer} */}

      </div>
    )
  }
  checkLoginStatus() {
    let authHeader = sessionStorage.getItem('JWT-TOKEN');
    if (authHeader) {
      window.location.href = '/#/home';
      return;
    }
  }

  handleChangeValue(i, event) {
    let questions = [...this.state.questions];
    console.log("value: " + event.target.value);
    questions[i].value = event.target.value;
    
    this.setState({ questions });

    // console.log(questions[0]);
  };

  handleChangeAnswer(i, event) {

    //let key = event.target.getAttribute('name');
    //let updateObj = { [key]: event.target.value };
    //this.setState(Object.assign(this.state, updateObj));

    let questions = [...this.state.questions];
    console.log("answer: " + event.target.value);
    // questions[i].value=event.target.value;
    questions[i].answer = event.target.value;
    questions[i].index=i;
    
    this.setState({ questions });

  };

  handleChange = event => {
    let key = event.target.getAttribute('name');
    console.log("Key: " + key);
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

  //   addName = event => {
  //   // let key = event.target.getAttribute('name');
  //   // console.log("Key: " + key);
  //   // let updateObj = { [key]: event.target.value };
  //   // console.log("object: " + updateObj);
  //   // this.setState(Object.assign(this.state.quizToPersist.name, updateObj));

  //   let key = event.target.getAttribute('name');
  //   console.log("Key: " + key);
  //   let updateObj = { [key]: event.target.value };
  //   //let quizToPersist = {...this.state.quizToPersist};
  //   //quizToPersist.name= key;
  //   this.setState(Object.assign(this.state, updateObj));

  //   // this.setState(prevState => {
  //   //   let quizToPersist = Object.assign({}, prevState.quizToPersist);  // creating copy of state variable quizToPersist
  //   //   quizToPersist.name = 'someothername';                     // update the name property, assign a new value                 
  //   //   return { quizToPersist };                                 // return new object jasper object
  //   // })
  // }

  addClick() {
    
    this.setState(prevState => ({ questions: [...prevState.questions, { value: '', answer: '' , index: 0 }] }))
  
  }

  removeClick(i) {
    let questions = [...this.state.questions];
    questions.splice(i, 1);
    this.setState({ questions });
  
  }


  createRound = event => {
    
    this.state.quizToPersist.name=this.state.quizName;
  
    
    console.log("Round Number: " + this.roundNumber)

    console.log(`Previous round: ${JSON.stringify(this.state.quizToPersist)}`);

    this.state.quizToPersist.rounds= [...this.state.quizToPersist.rounds,
      {
          index: this.state.roundNumber,
          name: ' Round ' + this.state.roundNumber+1,
          questions:this.state.questions
          
      }
      
    ]
    
   
    console.log(`Quiz completed round: ${JSON.stringify(this.state.quizToPersist)}`);

    this.state.roundNumber=  this.state.roundNumber+1;
    this.state.questions=[];
    this.addClick();
    
    event.preventDefault();
  }

  submitQuiz = event => {

    console.log(`Quiz submitted********: ${JSON.stringify(this.state.quizToPersist)}`);

    quizService.putQuiz(this.state.quizToPersist).then(response =>
      console.log(response)
    ).catch(error =>
      console.log(error)
    );

    event.preventDefault();

    // let data = stateUtils.getDataFromState(this.state);
    // let thisObj = this;

    //thisObj.setState({ _usernameError: '' });


    // axios
    //   .post(`${process.env.REACT_APP_API_URL}/signup`, data)
    //   .then(function (response) {
    //     window.location.href = '/#/login';
    //   }).catch(function (error) {
    //     console.log(error);
    //     thisObj.setState(Object.assign(thisObj.state, { _error: thisObj.parseError(error) }));
    //   });
  };

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
        
        {/* Choose previous quiz */}
        <div className="login_background">
          <div className="login_background_cloumn">
            <div className="ISSUER_Logo" />
            {/* <div className="login_background_issuerImage" /> */}
            <div className="tile_wrap">
              <div className="card-product_Stats">
                <div className="form_wrap">
                  <div className="form_container2">
                    
                    <div className="form_container_subtext">
                      Use a previous Quiz
                    </div>
                    <form onSubmit={this.getAllQuizzes}>
                      <button type="submit" color="primary" className="login_button">
                        Get Previous Quizzes
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
                 {/* Show quizes */}

      
                <div className="rwd-table">
                  <table>
                    <tbody className="TableBody">
                      {/* <tr style={{ backgroundColor: '#f8f8f8', color: 'black', cursor: 'pointer' }}>
                      <th>Category</th>
                      <th>Entity</th>
                      <th>Winner</th>
                      <th>Year</th>
                    </tr> */}

                      {this.state.quizzes.map((rowdata, i) => {
                        return (<tr style={{ cursor: 'pointer' }}>
                          <td data-th="Name"> {rowdata.name} </td>
                        </tr>)
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      
      
      

       {/* New Quiz */}
      <div className="login_background">
        <div className="login_background_cloumn">
         <div className="ISSUER_Logo" />
            <div className="form_wrap">
              {this.buildQuiz()}
              </div>
              </div>
            </div>
      
      
      {/* App div */}
      </div>      

      
    
    
   
    );
  }
}

export default Home;
