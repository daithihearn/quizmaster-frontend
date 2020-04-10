import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';

class Home extends Component {
  constructor(props) {
    super(props);
   // this.state = { firstName: '', surname: '', username: '', password: '' };
   // this.state = { questions: [{ value: '', answer: ''}], value: '', answer: ''};
   this.state = { questions: [], quizzes: []};
   sessionUtils.checkLoggedIn();
   sessionUtils.checkUserType();

   this.getAllQuizzes = this.getAllQuizzes.bind(this);
  }

  getAllQuizzes = event => {
    event.preventDefault();
    
    let thisObj = this;
    
    quizService.getAllQuizzes().then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quizzes: response.data}));
    })
    .catch(error => console.error('Error occurred when searching: ', error));
  };

  createUI(){
    return this.state.questions.map((v, i) => 
        <div key={i}>

              <input
                  className="question"
                  type="input"
                  name="question"
                  placeholder="Question"
                  autoComplete="Question"
                  value={v.value||''}
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
                  value={v.answer||''} 
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

  handleChangeValue (i,event){
    let questions = [...this.state.questions];
    console.log("value: "+ event.target.value);
    questions[i].value=event.target.value;
    this.setState({ questions });
    
   // console.log(questions[0]);
  };
 
  handleChangeAnswer (i,event){
    
    //let key = event.target.getAttribute('name');
     //let updateObj = { [key]: event.target.value };
     //this.setState(Object.assign(this.state, updateObj));

    let questions = [...this.state.questions];
    console.log("answer: "+ event.target.value);
   // questions[i].value=event.target.value;
    questions[i].answer=event.target.value;

    this.setState({ questions });
   
  };

  addClick(){
    this.setState(prevState => ({ questions: [...prevState.questions, {value: '' , answer: ''} ]}))
  }

  removeClick(i){
    let questions = [...this.state.questions];
    questions.splice(i,1);
    this.setState({ questions });
 }


  handleSubmit = event => {
    console.log(`ROUND submitted: ${JSON.stringify(this.state.questions)}`);
 
    const quiz = { 
      name:'first quiz test', 
      rounds: [
        {
          name: "My First Round",
          questions: this.state.questions
        }
      ]
    }

    // this.setState(prevState => ({
    //   quiz: {
    //     ...prevState.quiz,   
    //     name:'Quiz test',        // copy all other key-value pairs of food object
    //     questions: {                     // specific object of food object
    //       ...prevState.questions          // update value of specific key
    //     }
    //   }
    // }))

    console.log(`Quiz submitted: ${JSON.stringify(quiz)}`);

    quizService.putQuiz(quiz).then(response =>
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
        <div className="login_background">
          <div className="login_background_cloumn">
            <div className="ISSUER_Logo" />
            {/* <div className="login_background_issuerImage" /> */}
            <div className="form_wrap">
              <div className="form_container">
                {/* <div className="form_container_headerText"> New Question </div>  */}
                {/* <div className="form_container_subtext"> */}
                 New Round
                </div>
              {/* <form onSubmit={this.handleSubmit}>
                


                <input
                  className="question"
                  type="input"
                  name="question"
                  placeholder="Question"
                  autoComplete="Question"
                  value={this.state.firstName}
                  onChange={this.handleChange}
                  required
                />

                <div className="login_error_email">{this.state._firstNameError}</div>

                <input
                  className="answer"
                  type="input"
                  name="answer"
                  placeholder="Answer"
                  autoComplete="Answer"
                  value={this.state.surname}
                  onChange={this.handleChange}
                  required
                />

                <div className="login_error_email">{this.state._surnameError}</div>


                <button type="submit" color="primary" className="login_button">
                  Submit Round
                    <span>
                    <img
                      style={{ marginLeft: '5px' }}
                      alt="description"
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                    />
                  </span>
                </button>
              </form> */}


              <form onSubmit={this.handleSubmit}>
                {this.createUI()}  
                <button  type="submit" color="primary" className="login_button" onClick={this.addClick.bind(this)}>
                  Add question
                    <span>
                    <img
                      style={{ marginLeft: '5px' }}
                      alt="description"
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                    />
                  </span>
                </button> 
                <button  type="submit" value="submit" color="primary" className="login_button" >
                  Submit Round
                    <span>
                    <img
                      style={{ marginLeft: '5px' }}
                      alt="description"
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                    />
                  </span>
                </button> 

                {/* <input type='button' value='add more' onClick={this.addClick.bind(this)}/>
                <input type="submit" value="Submit" /> */}
              </form>


              <div className="form_container_text">
                Back to <a href="/#/login"><span className="form_container_text_link"> Previous Round </span></a>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>



        <div className="tile_wrap">
          <div className="card-product_Stats">
          <div className="form_wrap">
              <div className="form_container2">
                <div className="form_container_subtext">
                  Quizes
                </div>
                <form onSubmit={this.getAllQuizzes}>
                  <button type="submit" color="primary" className="login_button">
                    Get All Quizzes
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
          </div>
        </div>

        <div className="tile_wrap">
          <div className="card-product_Stats">
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
    );
  }
}

export default Home;
