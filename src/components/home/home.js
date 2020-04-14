import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Form, FormGroup, Label, Input, Container, Row, Col } from 'reactstrap';

class Home extends Component {
  constructor(props) {
    super(props);
   
    this.state = { 
      
       quizzes: [],
       emails:[],
       currentEmail: '',
       quizSelected: null,
       isGameCreated:false,
       game:{},
       dropDownOpen: false
      
    };
    
    sessionUtils.checkLoggedIn();

    this.getAllQuizzes();

    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onQuizSelect = this.onQuizSelect.bind(this);
    this.getAllQuizzes = this.getAllQuizzes.bind(this);
    this.startGameWithEmails = this.startGameWithEmails.bind(this);
  }

  toggle() {
    this.setState(Object.assign(this.state, { dropDownOpen: !this.state.dropDownOpen }));
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

    gameService.put(gameEmails).then(response => {

      thisObj.setState(Object.assign(thisObj.state, { game: response.data, isGameCreated:true, emails: [], currentEmail: '' }));
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

  onQuizSelect = event => {

    let quiz = { name: event.target.name, id:event.target.value };
    if (quiz.name === "None") {
      this.setState(Object.assign(this.state, {quizSelected: null}));
    } else {
      this.setState(Object.assign(this.state, {quizSelected: quiz}));
    }
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

  addPlayer() {
    let updatedEmails = this.state.emails;
    updatedEmails.push(this.state.currentEmail);

    this.setState(Object.assign(this.state,{email: updatedEmails, currentEmail: ''}));
  }

  removePlayer(idx) {
    console.log("Index" + idx)
    let emails = [...this.state.emails];
    emails.splice(idx, 1);
    this.setState({ emails });
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
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

    return (
      <div className="app">
        <div className="form_wrap">
          <div className="form_container">

            { !this.state.isGameCreated ?
                <Container>
                  <Row>
                    <Dropdown isOpen={this.state.dropDownOpen} toggle={this.toggle}>
                      <DropdownToggle caret>
                          {!!this.state.quizSelected?this.state.quizSelected.name:"Please select a quiz"}
                        </DropdownToggle>
                      <DropdownMenu>
                      <DropdownItem onClick={this.onQuizSelect} value="None" name="None">
                          None
                      </DropdownItem>
                      {this.state.quizzes.map((rowdata, i) => 
                        <DropdownItem onClick={this.onQuizSelect} value={rowdata.id} name={rowdata.name}>
                          {rowdata.name}
                        </DropdownItem>
                      )}
                      </DropdownMenu>
                    </Dropdown>
                  </Row>
                </Container>
              : null} 
              
                


            {!!this.state.quizSelected  && !this.state.isGameCreated ?  
              <Container>
                <Row> 
                <span>Enter email adresses and start a game</span>
                </Row>
              </Container>
            
              : [
                
                  (!this.state.isGameCreated ? 
                    <Container> 
                      <Row><span>
                        OR
                      </span>
                      </Row>
                      <Row>
                        <Form action="/#/createquiz"> 
                          <Button color="primary" href="/#/createquiz">
                            Create a brand new Quiz 
                          </Button>
                        </Form> 
                      </Row>
                    </Container>
                    : null
                  )
              ]
            }
                
            {!!this.state.quizSelected && !this.state.isGameCreated  ?  
                
                  <Form onSubmit={this.startGameWithEmails}>
                      <FormGroup>
                        <Input
                            className="currentEmail"
                            id="currentEmail"
                            type="input"
                            name="currentEmail"
                            placeholder="Email"
                            autoComplete="Email"
                            onChange={this.handleChange}
                            value={this.state.currentEmail}
                          />
                      </FormGroup>

                      <Button type="button" color="secondary" onClick={this.addPlayer.bind(this)}>
                        Add Player
                      </Button>
              
                      <Button color="primary" type="submit">
                          Start Game 
                      </Button>
                  </Form>
                  
                : null
                }

                <Container>
                  {this.state.emails.map((email, idx) =>
                    <Row><Col>{email}</Col><Col><Button type="button" color="link" onClick={this.removePlayer.bind(this, idx)}>Remove</Button></Col></Row>
                  )}
                </Container>


                {!!this.state.quizSelected && this.state.isGameCreated && !!this.state.game.players ?  
                  <Container>
                    <Row>
                    <h2>Game Id generated: { this.state.game.id } </h2>
                    </Row>
                    <Row>
                      Number of Player for this game: { this.state.game.players.length }
                    </Row>
                    <Row> 
                      <Link to={{
                        pathname: '/scoring',
                        gameId: this.state.game.id,
                        quizId: this.state.quizSelected.id

                      }}> Start Game </Link>
                    </Row>
                </Container>
              : null}
            </div>
          </div>
        </div>
   
    );
  }
}

export default Home;
