import React, { Component, useState } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
// import ImageSelectPreview from 'react-image-select-pv';
import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Form, FormGroup, Label, Input, Container, Row, Col, Media } from 'reactstrap';
import classnames from 'classnames';
import nextId from "react-id-generator";

class Createquiz extends Component {


  constructor(props) {
    super(props);
    this.state = { 
      questions: [],
      rounds: [],
      quizName:'',
      isQuizCreated: false, 
      isQuizSubmited:false,
      activeTab: '1',
      newImage: {}
    };

    this.toggle = this.toggle.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.addRound = this.addRound.bind(this);
    sessionUtils.checkLoggedIn();
    sessionUtils.checkUserType();
  
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState(Object.assign(this.state, { activeTab: tab }));
    }
  }

  createQuiz = event => {
    event.preventDefault();
    this.setState(prevState => ({ isQuizCreated: !prevState.isQuizCreated})); 
  } 
    
  checkLoginStatus() {
    let authHeader = sessionStorage.getItem('JWT-TOKEN');
    if (authHeader) {
      window.location.href = '/#/home';
      return;
    }
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

  handleChangeImage(event) {
    let file = event.target.files[0]
    
    let reader = new FileReader()

    reader.onloadend = () => {
      this.setState(Object.assign(this.state, {newImage: {
        file: file,
        imagePreviewUrl: reader.result
      }}));
    }

    reader.readAsDataURL(file);
  }

  addQuestion = event => {
    event.preventDefault();
    let updatedQuestions = this.state.questions;
    updatedQuestions.push({ question: this.state.newQuestion, answer: this.state.newAnswer, imageUri: this.state.newImage.imagePreviewUrl, id: nextId() });

    this.setState(Object.assign(this.state, {questions: updatedQuestions, newQuestion: '', newAnswer: '', newImage: {}}));
    event.currentTarget.reset();
  }

  removeQuestion(idx) {
    let questions = [...this.state.questions];
    questions.splice(idx, 1);
    this.setState(Object.assign(this.state, { questions: questions }));
  }

  addRound = event => {
    let updatedRounds = this.state.rounds;
    updatedRounds.push({ questions: this.state.questions, name: this.state.newRoundName, id: nextId() });

    this.setState(Object.assign(this.state, {rounds: updatedRounds, questions: [], newQuestion: '', newAnswer: '', newImage: {}, newRoundName: ''}));
  }

  removeRound(idx) {
    let rounds = [...this.state.rounds];
    rounds.splice(idx, 1);
    this.setState(Object.assign(this.state, { rounds: rounds }));
  }

  submitQuiz = event => {
    event.preventDefault();
    let thisObj = this;
    
    let quiz = { name: this.state.quizName, rounds: this.state.rounds };
    
    quizService.putQuiz(quiz).then(response =>
      thisObj.setState ({isQuizSubmited: true})
    ).catch(error => thisObj.parseError(error));
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
                            <Form onSubmit={this.addQuestion}>

                                  <FormGroup>
                                    <Input
                                        className="newRoundName"
                                        type="input"
                                        name="newRoundName"
                                        placeholder="Round Name"
                                        autoComplete="Round Name"
                                        value={this.state.newRoundName}
                                        onChange={this.handleChange}
                                        required
                                      />
                                    
                                
                                    <Input
                                      className="newQuestion"
                                      type="input"
                                      name="newQuestion"
                                      placeholder="Question"
                                      autoComplete="Question"
                                      value={this.state.newQuestion}
                                      onChange={this.handleChange}
                                      required
                                    />
                                  </FormGroup>
                                  <FormGroup>
                                  {/* <ImageSelectPreview 
                                              max={1}
                                              name="newImage"
                                              imageTypes="png|jpg|gif"
                                              onChange={this.handleChangeImage}/> */}

                                      <Input type="file" name="newImage" onChange={this.handleChangeImage} />
                                      {!!this.state.newImage.imagePreviewUrl ? <img src={this.state.newImage.imagePreviewUrl}  height="64" width="64"/> : null }

                                  </FormGroup>
                                  <FormGroup>
                                    <Input
                                      className="newAnswer"
                                      type="input"
                                      name="newAnswer"
                                      placeholder="Answer"
                                      autoComplete="Answer"
                                      value={this.state.newAnswer}
                                      onChange={this.handleChange}
                                      required
                                    />
                                  </FormGroup>
                                
                                  <Button type="submit" color="link">
                                    Add question
                                  </Button>
                                                
                              

                              <Button type="button" color="secondary" onClick={this.addRound}>
                                Submit Round
                              </Button>

                              
                              {this.state.rounds.length > 0 ? 
                              <Button type="button" color="primary" onClick={this.submitQuiz}>
                                Submit Quiz
                              </Button>

                              : null}


                            </Form>
                          </Row>
                          <Row>
                          
                            {this.state.questions.map((question, idx) =>
                              <Container><Row><Col>{question.question}</Col><Col><Button type="button" color="link" onClick={this.removeQuestion.bind(this, idx)}>Remove</Button></Col></Row></Container>
                            )}
                          </Row>
                        </Container>
                        : null} 
                  
                  </TabPane>
                  <TabPane tabId="2">
                    

                    {!!this.state.rounds || this.state.rounds.length == 0 ?
                      <Row>
                      {this.state.rounds.map((round, idx) =>
                        <Container>
                          <Row>
                            <h2>{round.name}</h2>
                          </Row>
                          <Row>
                              {round.questions.map(question => 

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
                            <Row><Button type="button" color="link" onClick={this.removeRound.bind(this, idx)}>Remove</Button></Row>
                          </Container>
                      )}
                      </Row>
                      : "No rounds have been added yet"}


                    
                  </TabPane>
                </TabContent>
                </Row>
              </Container>
            
            :
              
              
              <div>
                  <h2>New Quiz</h2>
                <Form onSubmit={this.createQuiz}>
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
                    <Button type="submit" color="primary">
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
