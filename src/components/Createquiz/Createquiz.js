import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
// import ImageSelectPreview from 'react-image-select-pv';
import { Button, ButtonGroup, Form, FormGroup, Label, Input, Card, CardBody, CardGroup, CardHeader, Alert, Table } from 'reactstrap';
import nextId from "react-id-generator";
import RemoveImage from '../../assets/icons/remove.png';

class Createquiz extends Component {

  constructor(props) {
    super(props);
    let rawState = localStorage.getItem("createQuizState");
    if (!!rawState) {
      this.state = JSON.parse(rawState);
    } else {
      this.state = { 
        questions: [],
        rounds: [],
        newForceManualCorrection: false,
        newPoints: 1,
        quizName:'',
        newRoundName:'',
        isQuizCreated: false,
        newImage: {}
      }
      localStorage.setItem("createQuizState", JSON.stringify(this.state));
    }
    
    this.replaceState = this.replaceState.bind(this);
    this.updateState = this.updateState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this);
    this.handleChangeImage = this.handleChangeImage.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.addRound = this.addRound.bind(this);
    this.clearQuiz = this.clearQuiz.bind(this);
    sessionUtils.checkLoggedIn();
    sessionUtils.checkUserType();
  }

  replaceState(newState) {
    this.setState(newState);
    localStorage.setItem("createQuizState", JSON.stringify(newState));
  }
  updateState(stateDelta) {
    this.setState(prevState => (stateDelta));
    localStorage.setItem("createQuizState", JSON.stringify(this.state));
  }

  createQuiz = event => {
    event.preventDefault();
    let newValue = !this.state.isQuizCreated;
    this.updateState({ isQuizCreated: newValue}); 
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.updateState(updateObj);
  }

  handleChangeCheckbox(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.checked };
    
    this.updateState(updateObj);
  }

  handleChangeImage(event) {
    let file = event.target.files[0]
    
    let reader = new FileReader();

    reader.onloadend = () => {
      this.updateState({ newImage: {
        file: file,
        imagePreviewUrl: reader.result
      }});
    }

    reader.readAsDataURL(file);
  }

  clearQuiz() {
    this.replaceState({ 
      questions: [],
      rounds: [],
      newForceManualCorrection: false,
      newPoints: 1,
      quizName:'',
      newRoundName:'',
      isQuizCreated: false,
      newImage: {}
    });
    window.location.reload();
  }

  addQuestion = event => {
    event.preventDefault();
    let updatedQuestions = this.state.questions;
    updatedQuestions.push({ question: this.state.newQuestion, 
      answer: this.state.newAnswer, 
      imageUri: this.state.newImage.imagePreviewUrl, 
      forceManualCorrection: this.state.newForceManualCorrection,
      points: this.state.newPoints,
      id: nextId() });

      this.updateState({questions: updatedQuestions, newQuestion: '', newAnswer: '', newImage: {}, newPoints: 1, newForceManualCorrection: false });
    event.currentTarget.reset();
  }

  removeQuestion(idx) {
    let questions = [...this.state.questions];
    questions.splice(idx, 1);
    this.updateState({ questions: questions });
  }

  addRound = event => {
    let updatedRounds = this.state.rounds;
    updatedRounds.push({ questions: this.state.questions, name: this.state.newRoundName, id: nextId() });

    this.updateState({rounds: updatedRounds, questions: [], newQuestion: '', newAnswer: '', newImage: {}, newPoints: 1, newForceManualCorrection: false, newRoundName: ''});
  }

  removeRound(idx) {
    let rounds = [...this.state.rounds];
    rounds.splice(idx, 1);
    this.updateState({ rounds: rounds });
  }

  submitQuiz = event => {
    event.preventDefault();
    let thisObj = this;
    
    let quiz = { name: this.state.quizName, rounds: this.state.rounds };

    quizService.putQuiz(quiz).then(response => {
      thisObj.replaceState({});
      thisObj.props.history.push({
        pathname: '/home'
      });
    }
    ).catch(error => thisObj.parseError(error));
  };

  parseError(error) {
    let errorMessage = 'Undefined error';
    if (
      typeof error.response !== 'undefined' &&
      typeof error.response.data !== 'undefined' &&
      typeof error.response.data.message !== 'undefined' &&
      error.response.data.message !== ''
    ) {
      errorMessage = error.response.data.message;
    } else if (
      typeof error.response !== 'undefined' &&
      typeof error.response.statusText !== 'undefined' &&
      error.response.statusText !== ''
    ) {
      errorMessage = error.response.statusText;
    }
    if (typeof error.message !== 'undefined') {
      errorMessage = error.message;
    }
    this.updateState({_error: errorMessage});
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
    if (!this.state._message) {
      return false;
    }
    return true;
  }

  readResponseMessage() {
    if (!this.state._message) {
      return '';
    }
    let message = this.state._message;
    delete this.state._message;
    return message;
  }
  
  render() {

    return (
      
        <div className="app">
         <div className="game_wrap">
          <div className="game_container">


          <CardGroup>
                <Card>
                <CardBody>
                Back to  <a href="/#/home"><span className="form_container_text_link">Home</span></a>
                </CardBody>
                </Card>
          </CardGroup>


          { this.showError() || this.showResponse() ?
              <CardGroup>
                <Card className="p-6">
                  <CardBody>
                    <Alert className="mt-3" color="danger" isOpen={this.showError()}>
                      {this.readErrorMessage()}
                    </Alert>
                    <Alert className="mt-3" color="primary" isOpen={this.showResponse()}>
                      {this.readErrorMessage()}
                    </Alert>
                  </CardBody>
                </Card>
              </CardGroup>
            : null}

          <CardGroup>
            <Card className="p-6">
            

            {!!this.state.isQuizCreated ?
          
              <div>
                <CardHeader tag="h1">Quiz: {this.state.quizName}</CardHeader>
                  <CardBody>
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
                          </FormGroup>
                          <FormGroup>
                        
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
                              <Input type="file" name="newImage" onChange={this.handleChangeImage} />
                              {!!this.state.newImage.imagePreviewUrl ? <img src={this.state.newImage.imagePreviewUrl} class="thumbnail_size"/> : null }

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
                          <FormGroup>
                          
                            <Input
                              className="newPoints"
                              type="input"
                              pattern="[0-9]*"
                              name="newPoints"
                              placeholder="Points"
                              autoComplete="Points"
                              value={this.state.newPoints}
                              onChange={this.handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup check>
                            <Label check>
                              <Input
                                className="newForceManualCorrection"
                                type="checkbox"
                                name="newForceManualCorrection"
                                value={this.state.newForceManualCorrection}
                                onChange={this.handleChangeCheckbox}
                              />
                              Force a manual correction?
                            </Label>
                          </FormGroup>
                          <FormGroup>
                            <ButtonGroup>
                              <Button type="submit" color="primary">
                                Add question
                              </Button>
                            </ButtonGroup> 
                          </FormGroup>

                        </Form>
                      </CardBody>
                      <CardBody>
                        <h2>Questions</h2>
                      </CardBody>
                      <CardBody>

                        <Table>
                          <thead>
                            <tr>
                              <th>Question</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.questions.map((question, idx) => 
                              <tr>
                                <td align="left">{question.question}</td>
                                <td><a type="button" color="danger" onClick={this.removeQuestion.bind(this, idx)}>
                                  <img src={RemoveImage} width="20px" height="20px"/>
                                  </a></td>
                                
                              </tr>
                            )}
                          </tbody>
                        </Table>
                    </CardBody>

                     
                     <CardBody>
                      <ButtonGroup>
                          <Button type="button" color="danger" onClick={this.clearQuiz}>
                            Clear Quiz
                          </Button>
                          <Button type="button" color="primary" onClick={this.addRound}>
                            Submit Round
                          </Button>

                          {this.state.rounds.length > 0 ? 
                          <Button type="button" color="primary" onClick={this.submitQuiz}>
                            Submit Quiz
                          </Button>

                          : null}
                      </ButtonGroup>
                     </CardBody>
                  

                    {!!this.state.rounds || this.state.rounds.length == 0 ?
                      <div>
                      <CardBody>
                        <h2>Rounds</h2>
                      </CardBody>
                      <CardBody>
                        <Table>
                          <thead>
                            <tr>
                              <th>Round</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.rounds.map((round, idx) =>
                              <tr>
                                <td align="left">{round.name}</td>
                                <td><a type="button" color="danger" onClick={this.removeRound.bind(this, idx)}> <img src={RemoveImage} width="20px" height="20px"/></a></td>
                                
                              </tr>
                          )}
                        </tbody>
                        </Table>
                      </CardBody>
                      </div>
                      : "No rounds have been added yet"}
          

              </div>
            
            :
              
              
              <div>
                <CardHeader tag="h1">New Quiz</CardHeader>
                <CardBody>
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
                    <ButtonGroup>
                      <Button type="submit" color="primary">
                      Create Quiz
                      </Button>
                    </ButtonGroup>
                  </Form>
                </CardBody>
              </div>
            
            }

        </Card>
      </CardGroup>
     
        

        </div>
      </div>
      </div>
   
    );
  }
}

export default Createquiz;
