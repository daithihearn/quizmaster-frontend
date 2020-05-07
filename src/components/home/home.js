import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import RemoveImage from '../../assets/icons/remove.png';
import AddIcon from '../../assets/icons/add.svg';

import { Modal, ModalBody, ModalHeader, ModalFooter, Button, ButtonGroup, Form, FormGroup, Input, Card, CardBody, CardGroup, CardHeader, Table } from 'reactstrap';
import Snackbar from "@material-ui/core/Snackbar";
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';

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
      dropDownOpen: false,
      snackOpen: false,
      snackMessage: "",
      snackType: "",
      modalStartGame:false,
      modalDeleteGame:false,
      modalDeleteGameIdx: 0,
      modalDelteGameObject: {}
    };
    
    sessionUtils.checkLoggedIn();

    this.getAllQuizzes();
    this.getActiveGames();

    this.updateState = this.updateState.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getAllQuizzes = this.getAllQuizzes.bind(this);
    this.showDeleteGameModal = this.showDeleteGameModal.bind (this);
    this.myColor= this.myColor.bind(this);
  }

  handleCloseStartGameModal() {
    this.setState({ modalStartGame: false });
  }
  showStartGameModal() {
    this.setState({ modalStartGame: true });
  }

  handleCloseDeleteGameModal() {
    this.setState({ modalDeleteGame: false });
  }
  showDeleteGameModal(game, idx) {
    this.setState({ modalDeleteGame: true , modalDeleteGameIdx: idx, modalDelteGameObject: game});
   // console.log(JSON.stringify(this.state.modalDeleteGameIdx));
   
  }

  handleClose() {
    this.updateState({ snackOpen: false });
  }

  updateState(stateDelta) {
    this.setState(prevState => (stateDelta));
  }

  toggle() {
    this.updateState( { dropDownOpen: !this.state.dropDownOpen } );
  }
 
  getAllQuizzes()  {
    let thisObj = this;

    quizService.getAllQuizzes().then(response => {
      thisObj.updateState({ quizzes: response.data });
    })
      .catch(error => thisObj.parseError(error));
  };

  getActiveGames()  {
    let thisObj = this;

    gameService.getActive().then(response => {
      thisObj.updateState({ activeGames: response.data });
    })
      .catch(error => thisObj.parseError(error));
  };

  startGameWithEmails() {
    if (this.state.startGameDisabled) {
      return;
    }
    this.updateState({startGameDisabled: true});

    let thisObj = this;
    let gameEmails = {
      playerEmails: this.state.emails,
      quizId: this.state.quizSelected.id,
      name: this.state.quizSelected.name
    }
    
    gameService.put(gameEmails).then(response => {
      thisObj.updateState({startGameDisabled: false});
      thisObj.redirectToGame(response.data);
    }).catch(error => {
      thisObj.parseError(error);
      thisObj.updateState({startGameDisabled: false}); 
    });
  };

 
  checkLoginStatus() {
    let authHeader = sessionStorage.getItem('JWT-TOKEN');
    if (authHeader) {
      window.location.href = '/#/home';
      return;
    }
  }

  onQuizSelect(name, id) {

    let quiz = { name: name, id:id };
    if (quiz.name === "None" || (!!this.state.quizSelected && quiz.name===this.state.quizSelected.name)) {
      this.updateState({quizSelected: null});
    } else {
      this.updateState({quizSelected: quiz});
    }
     
  };

  myColor(name, isFont){
    
   // console.log("quiz selected: " + name);
    if(!!this.state.quizSelected){
      if(this.state.quizSelected.name == name){
       // console.log("mark quiz");
        if (!isFont){
        return  'LightSteelBlue';  
        // 'AliceBlue'; //'#43a047'; //'darkseagreen'; //'rgba(0,0,0,.18)';
        }else{
          return 'white';
        }
      }
    } 
    return '';
  }


  addPlayer(event) {
    event.preventDefault();
    let updatedEmails = this.state.emails;
    updatedEmails.push(this.state.currentEmail);

    this.updateState( {email: updatedEmails, currentEmail: '', snackOpen: true, snackMessage: "Player Added", snackType: "success" });
  }

  removePlayer(idx) {
    let emails = [...this.state.emails];
    emails.splice(idx, 1);
    this.setState({ emails, snackOpen: true, snackMessage: "Player Removed", snackType: "warning"  });
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

  finishGame(game, idx) {
    if (this.state.finishGameDisabled) {
      return;
    }
    this.updateState({finishGameDisabled: true});
    let thisObj = this;
    let activeGames = [...this.state.activeGames];
    activeGames.splice(idx, 1);

    gameService.finish(game.id)
      .then(response => thisObj.updateState({ finishGameDisabled: false, activeGames: activeGames, snackOpen: true, snackMessage: "Game Finished", snackType: "success"  }))
      .catch(error => { 
        thisObj.parseError(error); 
        thisObj.updateState({ finishGameDisabled: false });  
      });
    this.handleCloseDeleteGameModal();
  }

  deleteGame() {
    if (this.state.deleteGameDisabled) {
      return;
    }
    this.updateState({deleteGameDisabled: true});
    let thisObj = this;
    let activeGames = [...this.state.activeGames];
    activeGames.splice(this.state.modalDeleteGameIdx, 1);

    gameService.delete(this.state.modalDelteGameObject.id)
      .then(response => thisObj.updateState({ deleteGameDisabled: false, activeGames: activeGames, snackOpen: true, snackMessage: "Game Deleted", snackType: "warning"  }))
      .catch(error => {
        thisObj.parseError(error); 
        thisObj.updateState({ deleteGameDisabled: false });  
      });
    this.handleCloseDeleteGameModal();
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.updateState(updateObj);
  }

  parseError(error) {
    let errorMessage = 'Undefined error';
    if (
      error.response !== undefined &&
      error.response.data !== undefined &&
      error.response.data.message !== undefined &&
      error.response.data.message !== ''
    ) {
      errorMessage = error.response.data.message;
    } else if (
      error.response !== undefined &&
      error.response.statusText !== undefined &&
      error.response.statusText !== ''
    ) {
      errorMessage = error.response.statusText;
    } else if (error.message !== undefined) {
      errorMessage = error.message;
    }
    this.updateState({ snackOpen: true, snackMessage: errorMessage, snackType: "error" });
  }
  
  render() {

    return (
      <div className="app">
         <div className="game_wrap">
          <div className="game_container">

            {this.state.activeGames.length > 0 ?  
              <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">Active Games</CardHeader>
                <CardBody>
                  <Table  size="sm" bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Finish</th>
                        <th>Delete</th>
                        <th>Open</th>
                      </tr>
                    </thead>
                    <tbody>

                      <Modal isOpen={this.state.modalDeleteGame}>
                        <ModalHeader closeButton>
                          You are about to Delete a game
                        </ModalHeader>
                        
                        <ModalBody>Are you sure you want to delete 
                        { !! this.state.modalDelteGameObject ?
                          <b>&nbsp;{this.state.modalDelteGameObject.name}&nbsp;</b>  : null }
                        
                          game? It is an active game</ModalBody> 
                          
                        <ModalFooter>
                        <Button color="secondary" onClick={this.handleCloseDeleteGameModal.bind(this)}>
                            No
                          </Button>
                            <Button color="primary" onClick={this.deleteGame.bind(this)}>
                          Yes
                            </Button>
                        </ModalFooter>
                      </Modal>
                      {this.state.activeGames.map((game, idx) => 
                        <tr>
                          <td align="left">{game.name}</td>
                          <td><Button type="button" color="link" onClick={this.finishGame.bind(this, game, idx)}>Finish</Button></td>
                          <td><a type="button" color="danger" onClick={this.showDeleteGameModal.bind(this, game, idx)}>
                            <img src={RemoveImage} width="20px" height="20px"/></a>                  
                            </td>
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
                <CardHeader tag="h2">Available Quizzes</CardHeader>
                <CardBody>
                  <Table  bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Quiz Names</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.quizzes.map((quiz, idx) => 
                        <tr>
                          <td  style={{background: this.myColor(quiz.name, false), color: this.myColor(quiz.name, true)}} align="left" onClick={this.onQuizSelect.bind(this, quiz.name, quiz.id)}>{quiz.name}</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </CardBody>
              
                


                {!!this.state.quizSelected ?  
                  <div>
                    <CardBody>
               
                   
                      <Form onSubmit={this.addPlayer}>
                          <FormGroup>
                          <h4 colSpan="2">You have selected: <b>{this.state.quizSelected.name}</b><br></br>Enter email addresses and start a game</h4>
                        
                          <Table size="sm" >
                            <tbody>
                              <tr><td>
                                <Input
                                className="currentEmail"
                                id="currentEmail"
                                type="input"
                                name="currentEmail"
                                placeholder="Email"
                                autoComplete="off"
                                onChange={this.handleChange}
                                value={this.state.currentEmail}
                                required
                              /></td>
                            <td>
                              <Button type="submit" color="link"><img src={AddIcon} width="20px" height="20px"/></Button>
                            {/* <button type="submit" color="danger"><img src={AddIcon} width="20px" height="20px"/></button> */}
                            </td>
                            </tr>
                            </tbody>
                          </Table>
                          </FormGroup>
                        
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
                  {/* <CardBody>
                    <h2>Players added</h2>
                  </CardBody> */}
                  <CardBody>
                    <Table size="sm"  bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Players Added</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.emails.map((email, idx) =>
                        <tr>
                          <td align="left">{email}</td>
                          <td><a class="remove_link" color="link" onClick={this.removePlayer.bind(this, idx)} > 
                          <img src={RemoveImage} width="20px" height="20px"/></a></td>
                        </tr>
                      )}
                      </tbody>
                    </Table>
                    {!!this.state.emails && this.state.emails.length >0?
                            <ButtonGroup>
                              <Button color="primary" type="button" onClick={this.showStartGameModal.bind(this)}>
                                Start Game 
                              </Button> 
                              <Modal isOpen={this.state.modalStartGame}>
                                <ModalHeader closeButton>
                                  You are about to start a game
                                </ModalHeader>
                                <ModalBody>Are you sure you want to start the game?</ModalBody>
                                <ModalFooter>
                                <Button color="secondary" onClick={this.handleCloseStartGameModal.bind(this)}>
                                    No
                                  </Button>
                                   <Button color="primary" onClick={this.startGameWithEmails.bind(this)}>
                                    Yes
                                   </Button>
                                </ModalFooter>
                              </Modal>
                            </ButtonGroup>
                            : null
                          }
                  </CardBody>
                  </div>
                : null}
            
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
   
    );
  }
}

export default Home;
