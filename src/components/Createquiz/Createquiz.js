import React, { Component } from 'react';
import quizService from '../../services/QuizService';
// import ImageSelectPreview from 'react-image-select-pv';
import { Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, InputGroup, InputGroupAddon, InputGroupText, Table } from 'reactstrap';
import uuid from 'uuid-random';
import RemoveImage from '../../assets/icons/remove.png';
import Snackbar from "@material-ui/core/Snackbar";
import DefaultHeader from '../Header';
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import errorUtils from '../../utils/ErrorUtils';

class Createquiz extends Component {

  constructor(props) {
    super(props);
    let rawState = localStorage.getItem("createQuizState");
    
    if (rawState !== undefined && rawState !== null && rawState !== '') {
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
        newImage: {file: null, imagePreviewUrl:''},
        newAudio: {file: null},
        newVideo: {file: null},
        snackOpen: false, snackMessage: "", snackType: ""
      }
      localStorage.setItem("createQuizState", JSON.stringify(this.state));
    }
    
    this.clearState = this.clearState.bind(this);
    this.updateState = this.updateState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeCheckbox = this.handleChangeCheckbox.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.addRound = this.addRound.bind(this);
    this.clearQuiz = this.clearQuiz.bind(this);
    this.goHome = this.goHome.bind(this);
  }

  handleClose() {
    this.updateState({ snackOpen: false });
  }

  clearState() {
    this.setState({});
    localStorage.removeItem("createQuizState");
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

  handleChangeFile(event) {
    if (event.target.files.length > 1) {
      return this.updateState(errorUtils.parseError({message: "Can only select one file"}));
    }
    let file = event.target.files[0];

    // Wiping current media
    this.updateState({
      newImage: {file: null, imagePreviewUrl:''},
      newAudio: {file: null},
      newVideo: {file: null}
    });

    if (file.type.includes("image/")) {
      this.uploadImage(this, file);
    } else if (file.type.includes("audio/")) {
      this.uploadAudio(this, file);
    } else if (file.type.includes("video/")) {
      this.uploadVideo(this, file);
    } else {
      return this.updateState(errorUtils.parseError({message: "Invalid file type"}));
    }
  }

  uploadImage(thisObj, file) {
    let reader = new FileReader();

    reader.onloadend = () => {

      quizService.uploadImage(reader.result).then(response => {
        thisObj.updateState({ 
          newImage: {
            file: file,
            imagePreviewUrl: response.data
          }, 
          blocking: false});
      }
      ).catch(error => { 
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {blocking: false});
        thisObj.setState(state);
      });

      thisObj.updateState({ blocking: true });
    }

    reader.readAsDataURL(file);
  }

  uploadAudio(thisObj, file) {
    
    let reader = new FileReader();

    reader.onloadend = () => {

      quizService.uploadAudio(reader.result).then(response => {
        thisObj.updateState({ newAudio: {
          file: file,
          uri: response.data
        },
        blocking: false});
      }
      ).catch(error => { 
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {blocking: false});
        thisObj.setState(state);
      });

      thisObj.updateState({ blocking: true});
    }

    reader.readAsDataURL(file);
  }

  uploadVideo(thisObj, file) {
    let reader = new FileReader();

    reader.onloadend = () => {

      quizService.uploadVideo(reader.result).then(response => {
        thisObj.updateState({ newVideo: {
          file: file,
          uri: response.data
        },
        blocking: false});
      }
      ).catch(error => { 
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {blocking: false});
        thisObj.setState(state);
      });

      thisObj.updateState({ blocking: true});
    }

    reader.readAsDataURL(file);
  }

  clearQuiz() {
    this.clearState();
    this.props.history.push({
      pathname: '/createQuiz'
    });
  }

  goHome() {
    this.props.history.push({
      pathname: '/'
    });
  }

  addQuestion = event => {
    event.preventDefault();
    let updatedQuestions = this.state.questions;
    updatedQuestions.push({ question: this.state.newQuestion, 
      answer: this.state.newAnswer, 
      imageUri: this.state.newImage.imagePreviewUrl,
      audioUri: this.state.newAudio.uri,
      videoUri: this.state.newVideo.uri,
      forceManualCorrection: this.state.newForceManualCorrection,
      points: this.state.newPoints,
      id: uuid() });

    this.updateState({questions: updatedQuestions, newQuestion: '', newAnswer: '', newImage: {}, newAudio: {}, newVideo: {}, newPoints: 1, newForceManualCorrection: false, 
        snackOpen: true, snackMessage: "Question Added", snackType: "success" });
    event.currentTarget.reset();
  }

  removeQuestion(idx) {
    let questions = [...this.state.questions];
    questions.splice(idx, 1);
    this.updateState({ questions: questions, snackOpen: true, snackMessage: "Question Removed", snackType: "warning" });
  }

  addRound = event => {
    let updatedRounds = this.state.rounds;
    updatedRounds.push({ questions: this.state.questions, name: this.state.newRoundName, id: uuid() });

    this.updateState({rounds: updatedRounds, questions: [], newQuestion: '', newAnswer: '', newImage: {}, newAudio: {}, newVideo: {}, newPoints: 1, newForceManualCorrection: false, newRoundName: '', 
        snackOpen: true, snackMessage: "Round Added", snackType: "success"});
  }

  removeRound(idx) {
    let rounds = [...this.state.rounds];
    rounds.splice(idx, 1);
    this.updateState({ rounds: rounds, snackOpen: true, snackMessage: "Round Removed", snackType: "warning" });
  }

  submitQuiz = event => {
    event.preventDefault();
    let thisObj = this;
    
    let quiz = { name: this.state.quizName, rounds: this.state.rounds };

    quizService.putQuiz(quiz).then(response => {
      thisObj.clearState();
      thisObj.goHome();
    }
    ).catch(error => thisObj.updateState(errorUtils.parseError(error)));
  };
  
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

          <CardGroup>
            <Card className="p-6">
            

            {!!this.state.isQuizCreated ?
          
              <div>
                <CardHeader tag="h1">Quiz: {this.state.quizName}</CardHeader>
                  <CardBody>
                    <BlockUi tag="div" blocking={this.state.blocking}>
                      <Form onSubmit={this.addQuestion}>
                          <FormGroup>
                            <InputGroup>
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Round</InputGroupText>
                              </InputGroupAddon>
                                <Input
                                    className="newRoundName"
                                    type="input"
                                    name="newRoundName"
                                    placeholder="Round Name"
                                    autoComplete="off"
                                    value={this.state.newRoundName}
                                    onChange={this.handleChange}
                                    required
                                  />
                            </InputGroup>
                          </FormGroup>

                          <FormGroup>
                            <InputGroup>
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Question</InputGroupText>
                              </InputGroupAddon>
                              
                                <Input
                                  className="newQuestion"
                                  type="input"
                                  name="newQuestion"
                                  placeholder="Question"
                                  autoComplete="off"
                                  value={this.state.newQuestion}
                                  onChange={this.handleChange}
                                  required
                                />
                              
                            </InputGroup>
                          </FormGroup>

                          {/* Load Media  */}
                          <FormGroup>
                            <InputGroup>

                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Media file</InputGroupText>
                              </InputGroupAddon>
                              <InputGroupAddon addonType="append">
                                <Input 
                                  type="file" 
                                  name="newImage" 
                                  onChange={this.handleChangeFile} 
                                  multiple={false} />
                              </InputGroupAddon>
                                <br></br>
                                {!!this.state.newImage && !!this.state.newImage.imagePreviewUrl ? <img alt="Image Preview" src={this.state.newImage.imagePreviewUrl} class="thumbnail_size"/> : null }
                            </InputGroup>
                          </FormGroup>
                          {/* Finish load media */}
                          
                          <FormGroup>
                            <InputGroup>
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Answer</InputGroupText>
                              </InputGroupAddon>
                              
                                <Input
                                  className="newAnswer"
                                  type="input"
                                  name="newAnswer"
                                  placeholder="Answer"
                                  autoComplete="off"
                                  value={this.state.newAnswer}
                                  onChange={this.handleChange}
                                  required
                                />
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                          <InputGroup>
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>Points</InputGroupText>
                              </InputGroupAddon>
                                <Input
                                  className="newPoints"
                                  type="input"
                                  pattern="[0-9]*"
                                  name="newPoints"
                                  placeholder="Points"
                                  autoComplete="off"
                                  value={this.state.newPoints}
                                  onChange={this.handleChange}
                                  required
                                />
                              <InputGroupAddon addonType="append">
                                <InputGroupText>Force a manual correction</InputGroupText>
                              </InputGroupAddon>
                              <InputGroupAddon addonType="append">
                                <InputGroupText>
                                  <Input addon
                                      className="newForceManualCorrection"
                                      type="checkbox"
                                      name="newForceManualCorrection"
                                      value={this.state.newForceManualCorrection}
                                      onChange={this.handleChangeCheckbox}
                                    />
                              </InputGroupText>
                            </InputGroupAddon>
                            </InputGroup>
                          </FormGroup>
                          <FormGroup>
                            <ButtonGroup>
                              <Button type="submit" color="primary">
                                Add question
                              </Button>
                            </ButtonGroup> 
                          </FormGroup>

                        </Form>
                        </BlockUi>
                      </CardBody>
                      <CardBody>
                        <h2>Questions</h2>
                      </CardBody>
                      <CardBody>

                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Question</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.questions.map((question, idx) => 
                              <tr key={`question_${idx}`}>
                                <td align="left">{question.question}</td>
                                <td><Button type="button" color="link" onClick={this.removeQuestion.bind(this, idx)}>
                                  <img alt="Remove" src={RemoveImage} width="20px" height="20px"/>
                                  </Button></td>
                                
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

                          {this.state.questions.length > 0 ? 
                            <Button type="button" color="primary" onClick={this.addRound}>
                              Submit Round
                            </Button>
                          : null}

                          {this.state.rounds.length > 0 ? 
                            <Button type="button" color="primary" onClick={this.submitQuiz}>
                              Submit Quiz
                            </Button>
                          : null}
                      </ButtonGroup>
                     </CardBody>
                  

                    {!!this.state.rounds || this.state.rounds.length === 0 ?
                      <div>
                      <CardBody>
                        <h2>Rounds</h2>
                      </CardBody>
                      <CardBody>
                        <Table bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Round</th>
                              <th>Remove</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.state.rounds.map((round, idx) =>
                              <tr key={`round_${idx}`}>
                                <td align="left">{round.name}</td>
                                <td><Button type="button" color="link" onClick={this.removeRound.bind(this, idx)}> 
                                    <img alt="Remove" src={RemoveImage} width="20px" height="20px"/></Button></td>
                                
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
                        autoComplete="off"
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

export default Createquiz;
