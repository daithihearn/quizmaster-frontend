import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import ImageSelectPreview from 'react-image-select-pv';



class Createquiz extends Component {


  constructor(props) {
    super(props);
    this.state = { 
      questions: [ { value: '', imageUri:'',answer: '' , index: 0 }],
      quizName:'',
       canSubmitRound:false,
       canSubmitQuiz:false,
       isQuizCreated: false, 
       isQuizSubmited:false,
       roundNumber:0, 
      
       quizToPersist:
        {
          name: '',
          rounds: [
         
        ]
        }
      
      };
    sessionUtils.checkLoggedIn();
    sessionUtils.checkUserType();
  
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
 
  showLinkHome(){
    // if(this.state.isQuizSubmited){
      return(
      <div className="form_container_text">
      Back to 
     
      <a href="/#/home"><span className="form_container_text_link"> Home</span></a>
      </div>
      )
    //}
  }

  showRounds(){
    console.log("image : " + JSON.stringify(this.state.quizToPersist.rounds));
    return this.state.quizToPersist.rounds.map(round =>
      <div>
        <h3 key={round.index} item={round}>{round.name}</h3>
        <ul>
          {round.questions.map(question => 
            <div>
             
            <img src={question.imageUri} height="42" width="42"/>
            <p key={question.index}> {question.value}: {question.answer}</p>
            </div>
          )}
        </ul>
      </div>
    )
  }


 
  
  buildQuiz(){
 
    if(this.state.isQuizCreated){
    return(

      
              
              <div className="form_container">
               {this.state.isQuizSubmited  ?
                <div className="show_quiz_name"><br></br>Congratulations. Your quiz <b>{this.state.quizName}</b> has been created !
                <br></br></div> 
              :
                <div className="show_quiz_name">You have chosen the quiz name: {this.state.quizName}
              
                </div> 
                
               }
                {this.showRounds()}

                {!this.state.isQuizSubmited ?
                  <div>
                  Round number {this.state.roundNumber+1}
                    <form onSubmit={this.createRound}>
                      
                      {this.createQuestions()}

                      <br></br>

                    {/* {this.state.canSubmitRound ? */}
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
                      {/* : null} */}
                      
                      {this.state.canSubmitQuiz ? 
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
                      : null}

                    {this.showButtonPreviousRound()}

                    </form>
                    </div> 
                    : null} 
                   
                  
                
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
    this.setState(prevState => ({ isQuizCreated: !prevState.isQuizCreated})); 
    console.log("created Quiz: " + this.state.isQuizCreated);
  }

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
        <ImageSelectPreview 
                    max={1}
                    imageTypes="png|jpg|gif"
                    onChange={this.handleImageSelect.bind(this,i)}/>
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

  handleImageSelect(i, data) {
    console.log("image : " + JSON.stringify(data));
    let questions = [...this.state.questions];
    questions[i].imageUri = data[0].content;
    console.log("image : " + JSON.stringify(questions[i].imageUri));
    questions[i].index=i;
    //console.log(JSON.stringify("Image stored in state: " + questions[i].imageUri));
    this.setState({ questions });

  }

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
    
    if (this.state.questions.length >1){
      this.setState ({canSubmitRound: true});
   }else{
     this.setState ({canSubmitRound: false});
   }
    this.setState(prevState => ({ questions: [...prevState.questions, { value: '', imageUri:'', answer: '' , index: 0 }] }))

  }

  removeClick(i) { 
    let questions = [...this.state.questions];
    questions.splice(i, 1);
    this.setState({ questions });

    // not working 
    if (questions.length >1){   
      this.setState ({canSubmitRound: true});
   }else{
     this.setState ({canSubmitRound: false});
   }
  }


  createRound = event => {
    
    this.state.quizToPersist.name=this.state.quizName;
    let numberForName = this.state.roundNumber+1;
    
    console.log("Round Number: " + this.roundNumber)

    console.log(`Previous round: ${JSON.stringify(this.state.quizToPersist)}`);

    this.state.quizToPersist.rounds= [...this.state.quizToPersist.rounds,
      {
          index: this.state.roundNumber,
          name: ' Round ' + numberForName,
          questions:this.state.questions
          
      }
      
    ]
    
   
    console.log(`Quiz completed round: ${JSON.stringify(this.state.quizToPersist)}`);

    this.state.roundNumber=  this.state.roundNumber+1;
    this.state.questions=[];
    this.addClick();

    if(this.state.roundNumber>0){
      this.setState ({canSubmitQuiz: true});
    }
    event.preventDefault();
  }

  submitQuiz = event => {

    console.log(`Quiz submitted********: ${JSON.stringify(this.state.quizToPersist)}`);

    quizService.putQuiz(this.state.quizToPersist).then(response =>
      console.log(response)
    ).catch(error =>
      console.log(error)
    );
    this.setState ({isQuizSubmited: true});

    event.preventDefault();
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
        
     {/* New Quiz */}
      {
            <div className="form_wrap">
              {this.buildQuiz()}
              <br></br>
              {this.showLinkHome()}
             
              </div>
      }
      
      {/* App div */}
      </div>      

      
    
    
   
    );
  }
}

export default Createquiz;
