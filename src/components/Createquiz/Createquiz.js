import React, { Component, useState } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import ImageSelectPreview from 'react-image-select-pv';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form, FormGroup, Label, Input, Container, Row, Col, Media } from 'reactstrap';
import classnames from 'classnames';

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
        },
       activeTab: '1' 
      };

    this.toggle = this.toggle.bind(this);
    sessionUtils.checkLoggedIn();
    sessionUtils.checkUserType();
  
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState(Object.assign(this.state, { activeTab: tab }));
    }
  }

  createQuiz = event => {
    this.setState(prevState => ({ isQuizCreated: !prevState.isQuizCreated})); 
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
    questions[i].value = event.target.value;
    
    this.setState({ questions });
  };

  handleChangeAnswer(i, event) {

    let questions = [...this.state.questions];
    questions[i].answer = event.target.value;
    questions[i].index=i;
    
    this.setState({ questions });

  };

  handleImageSelect(i, data) {
    let questions = [...this.state.questions];
    questions[i].imageUri = data[0].content;
    questions[i].index=i;
    this.setState({ questions });

  }

  handleChange = event => {
    let key = event.target.getAttribute('name');
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

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

    this.state.quizToPersist.rounds= [...this.state.quizToPersist.rounds,
      {
          index: this.state.roundNumber,
          name: ' Round ' + numberForName,
          questions:this.state.questions
          
      }
      
    ]

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
        <div className="form_wrap">
          <div className="form_container">

      <Container>
          <Row>
            








            {!!this.state.isQuizCreated ?
          
              <Container>
                <Row>
                  {this.state.isQuizSubmited  ?
                      <h1>
                      Created Quiz: {this.state.quizName}
                      </h1>
                      
                    :
                    <h1>
                    Quiz: {this.state.quizName}
                    </h1>
                  }
                </Row>
                <Row>
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === '1' })}
                      onClick={() => { this.toggle('1'); }}
                    >
                      Create
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === '2' })}
                      onClick={() => { this.toggle('2'); }}
                    >
                      View
                    </NavLink>
                  </NavItem>
                </Nav>
                </Row>
                <Row>
                <TabContent activeTab={this.state.activeTab}>
                  <TabPane tabId="1">
                  
                  {!this.state.isQuizSubmited ?
                      <Container>
                        <Row>
                          <h2>Round number {this.state.roundNumber+1}</h2>
                        </Row>
                        <Row>
                            <Form onSubmit={this.createRound}>

                              {this.state.questions.map((v, i) =>
                                <div key={i}>
                                  
                                  <FormGroup>
                                
                                    <Input
                                      className="question"
                                      type="input"
                                      name="question"
                                      placeholder="Question"
                                      autoComplete="Question"
                                      value={v.value || ''}
                                      onChange={this.handleChangeValue.bind(this, i)}
                                      required
                                    />
                                  </FormGroup>
                                  <FormGroup>
                                  <ImageSelectPreview 
                                              max={1}
                                              imageTypes="png|jpg|gif"
                                              onChange={this.handleImageSelect.bind(this,i)}/>
                                  </FormGroup>
                                  <FormGroup>
                                    <Input
                                      className="answer"
                                      type="input"
                                      name="answer"
                                      placeholder="Answer"
                                      autoComplete="Answer"
                                      value={v.answer || ''}
                                      onChange={this.handleChangeAnswer.bind(this, i)}
                                      required
                                    />
                                  </FormGroup>

                                  <Button type="submit" color="link" onClick={this.removeClick.bind(this, i)}>
                                    Remove question
                                  </Button>
                                
                                  <Button type="submit" color="link" onClick={this.addClick.bind(this)}>
                                    Add question
                                  </Button>   
                                                
                                </div>

                              )}

                              <Button type="submit" color="secondary">
                                Submit Round {this.state.roundNumber+1}
                              </Button>

                              
                              {this.state.canSubmitQuiz ? 
                              <Button type="button" color="primary" onClick={this.submitQuiz}>
                                Submit Quiz
                              </Button>

                              : null}


                              {this.state.roundNumber > 0 ?
                                    
                                  <Button type="button" color="link"><a href="/#/login">Back to Previous Round</a></Button>

                              : null}


                            </Form>
                          </Row>
                        </Container>
                        : null} 
                  
                  </TabPane>
                  <TabPane tabId="2">
                    <Row>


                    {this.state.quizToPersist.rounds.map(round =>
                        <Container>
                          <Row>
                            <h2>{round.name}</h2>
                          </Row>
                          <Row>
                              {round.questions.map(question => 

                                <Media>
                                  {question.imageUri ?
                                  <Media left href="#">
                                    <Media object src={question.imageUri} height="64" width="64" alt="Generic placeholder image" />
                                  </Media>:null}
                                  <Media body>
                                    <Media heading>
                                      Question {question.index + 1}: {question.value}
                                    </Media>
                                    <Media body> 
                                    Answer: {question.answer}
                                    </Media>
                                  </Media>
                                </Media>

                              )}
                            </Row>
                        </Container>
                      )}


                    </Row>
                  </TabPane>
                </TabContent>
                </Row>
              </Container>
            
            :
              
              
              <div>
                  <h2>New Quiz</h2>
                <Form>
                  <FormGroup>
                    <Input
                      className="quizName"
                      type="input"
                      name="quizName"
                      placeholder="Quiz Name"
                      autoComplete="Quiz Name"
                      value={this.state.quizName}
                      onChange={this.handleChange}
                      required
                    />
                    </FormGroup>  
                    <Button type="button" color="primary" onClick={this.createQuiz}>
                    Create Quiz
                    </Button>
                  </Form>
              </div>
            
            }










          </Row>
          <Row>
            Back to <a href="/#/home"><span className="form_container_text_link"> Home</span></a>
          </Row>
      </Container>

        
          </div>
        </div>
      </div>
   
    );
  }
}

export default Createquiz;
