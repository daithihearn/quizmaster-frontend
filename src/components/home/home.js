import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, Alert, Table } from 'reactstrap';

class Home extends Component {
  constructor(props) {
    super(props);
   
    this.state = { 
      activeGames: [],
      quizzes: [],
      emails:[],
      currentEmail: '',
      quizSelected: null,
      game:{},
      dropDownOpen: false
    };
    
    sessionUtils.checkLoggedIn();

    this.getAllQuizzes();
    this.getActiveGames();

    this.addPlayer = this.addPlayer.bind(this);
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

  getActiveGames()  {
    let thisObj = this;

    gameService.getActive().then(response => {
      thisObj.setState(Object.assign(thisObj.state, { activeGames: response.data }));
    })
      .catch(error => thisObj.parseError(error));
  };

  startGameWithEmails() {

    let thisObj = this;
    let gameEmails = {
      playerEmails: this.state.emails,
      quizId: this.state.quizSelected.id,
      name: this.state.quizSelected.name
    }

    gameService.put(gameEmails).then(response => {
      thisObj.redirectToGame(response.data);
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

  onQuizSelect(event) {

    let quiz = { name: event.target.name, id:event.target.value };
    if (quiz.name === "None") {
      this.setState(Object.assign(this.state, {quizSelected: null}));
    } else {
      this.setState(Object.assign(this.state, {quizSelected: quiz}));
    }
  };

  submitQuiz(event) {

    let thisObj = this;

    quizService.putQuiz(this.state.quizToPersist).then(response =>
      console.log(response)
    ).catch(error => thisObj.parseError(error));

    event.preventDefault();

  };

  addPlayer(event) {
    event.preventDefault();
    let updatedEmails = this.state.emails;
    updatedEmails.push(this.state.currentEmail);

    this.setState(Object.assign(this.state,{email: updatedEmails, currentEmail: ''}));
  }

  removePlayer(idx) {
    let emails = [...this.state.emails];
    emails.splice(idx, 1);
    this.setState({ emails });
  }

  redirectToGame(game) {
    this.props.history.push({
      pathname: '/scoring',
      state: { game: game }
    });
  }

  redirectToCreateQuiz() {
    this.props.history.push({
      pathname: '/createQuiz'
    });
  }

  deleteGame(game, idx) {
    let thisObj = this;
    let activeGames = [...this.state.activeGames];
    activeGames.splice(idx, 1);

    gameService.delete(game.id)
      .then(response => thisObj.setState(Object.assign(thisObj.state, { activeGames: activeGames })))
      .catch(error => thisObj.parseError(error));
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  }

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
    this.setState(Object.assign(this.state, {_error: errorMessage}));
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
              

            {this.state.activeGames.length > 0 ?  
              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h1">Active Games</CardHeader>
                <CardBody>
                  <Table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Delete</th>
                        <th>Open</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.activeGames.map((game, idx) => 
                        <tr>
                          <td align="left">{game.name}</td>
                          <td><Button type="button" color="danger" onClick={this.deleteGame.bind(this, game, idx)}>Delete</Button></td>
                          <td><Button type="button" color="link" onClick={this.redirectToGame.bind(this, game)}>Open</Button></td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
              </CardGroup>
            : null}


            <CardGroup>
              <Card className="p-6">
                <CardHeader tag="h1">Available Quizzes</CardHeader>
                <CardBody>
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
                </CardBody>
              
                


                {!!this.state.quizSelected ?  
                  <div>
                    <CardBody>
                      <h3>Enter email addresses and start a game</h3>
                    </CardBody>
                    <CardBody>
                      <Form onSubmit={this.addPlayer}>
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
                          <ButtonGroup>
                            <Button type="submit" color="secondary">
                              Add Player
                            </Button>
                    
                            <Button color="primary" type="button" onClick={this.startGameWithEmails.bind(this)}>
                                Start Game 
                            </Button>
                          </ButtonGroup>
                      </Form>
                    </CardBody>
                  </div>
                
                  :
                    
                  <div>
                    <CardBody>
                      <h3>OR</h3>
                    </CardBody>
                    <CardBody>

                      <Button color="primary" onClick={this.redirectToCreateQuiz.bind(this)}>
                        Create Quiz 
                      </Button>

                    </CardBody>
                  </div>

                }

                {this.state.emails.length > 0 ?
                  <div>
                  <CardBody>
                    <h2>Players added</h2>
                  </CardBody>
                  <CardBody>
                    <Table>
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.emails.map((email, idx) =>
                        <tr>
                          <td align="left">{email}</td>
                          <td><Button type="button" color="link" onClick={this.removePlayer.bind(this, idx)}>Remove</Button></td>
                        </tr>
                      )}
                      </tbody>
                    </Table>
                  </CardBody>
                  </div>
                : null}
            
            </Card>
          </CardGroup>
         
        </div>
       </div> 
    </div>
   
    );
  }
}

export default Home;
