import React, { Component } from 'react';
import quizService from '../../services/QuizService';
import gameService from '../../services/GameService';
import profileService from '../../services/ProfileService';
import DefaultHeader from '../Header';
import RemoveImage from '../../assets/icons/remove.png';
import AddIcon from '../../assets/icons/add.svg';

import { Modal, ModalBody, ModalHeader, ModalFooter, Button, ButtonGroup, Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText, Card, CardBody, CardGroup, CardHeader, Table } from 'reactstrap';
import Snackbar from "@material-ui/core/Snackbar";
import MySnackbarContentWrapper from '../MySnackbarContentWrapper/MySnackbarContentWrapper.js';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import errorUtils from '../../utils/ErrorUtils';

import auth0Client from '../../Auth';


class Home extends Component {
  constructor(props) {
    super(props);
   
    this.state = { 
      myActiveGames: [],
      loadingMyActiveGames: true,
      activeGames: [],
      loadingActiveGames: true,
      quizzes: [],
      loadingQuizzes: true,
      players:[],
      selectedPlayers: [],
      quizSelected: null,
      game:{},
      dropDownOpen: false,
      snackOpen: false,
      snackMessage: "",
      snackType: "",
      modalStartGame:false,
      modalDeleteGame:false,
      modalDeleteGameIdx: 0,
      modalDeleteGameObject: {},
      isAdmin: auth0Client.isAdmin(),
      isPlayer: auth0Client.isPlayer()
    };

    this.updateState = this.updateState.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getAllQuizzes = this.getAllQuizzes.bind(this);
    this.showDeleteGameModal = this.showDeleteGameModal.bind (this);
    this.myColor= this.myColor.bind(this);
  }

  async componentDidMount() {
    let profile = auth0Client.getProfile();

    let stateUpdate = {profile: profile};
    
    // Player Stuff
    if (this.state.isPlayer) {
      await profileService.updateProfile({ name: profile.name, email: profile.email, picture: profile.picture });
      this.getMyActiveGames();
    }
    
    // ADMIN Stuff
    if (this.state.isAdmin) {
      this.getAllQuizzes();
      this.getActiveGames();
      this.getAllPlayers();
    }

    this.updateState(stateUpdate);
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
    this.setState({ modalDeleteGame: true , modalDeleteGameIdx: idx, modalDeleteGameObject: game});
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

    this.updateState({loadingQuizzes: true});

    quizService.getAllQuizzes().then(response => {
      thisObj.updateState({ quizzes: response.data, loadingQuizzes: false });
    }).catch(error => {
      let state = thisObj.state;
      Object.assign(state, errorUtils.parseError(error));
      Object.assign(state, {loadingQuizzes: false});
      thisObj.setState(state);
    });
  };

  getActiveGames()  {
    let thisObj = this;

    this.updateState({loadingActiveGames: true});

    gameService.getActive().then(response => {
      thisObj.updateState({ activeGames: response.data, loadingActiveGames: false });
    }).catch(error => {
      let state = thisObj.state;
      Object.assign(state, errorUtils.parseError(error));
      Object.assign(state, {loadingActiveGames: false});
      thisObj.setState(state);
    });
  };

  getAllPlayers()  {
    let thisObj = this;

    gameService.getAllPlayers().then(response => {
      thisObj.updateState({ players: response.data });
    })
      .catch(error => thisObj.updateState(errorUtils.parseError(error)));
  };

  getMyActiveGames()  {
    let thisObj = this;

    this.updateState({loadingMyActiveGames: true});

    gameService.getMyActiveGames().then(response => {
      thisObj.updateState({ myActiveGames: response.data, loadingMyActiveGames: false });
    }).catch(error => {
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {loadingMyActiveGames: false});
        thisObj.setState(state);
      });
  };

  startGame() {
    if(this.state.selectedPlayers.length < 1) {
      this.updateState( {snackOpen: true, snackMessage: `You must select at least one player` , snackType: "error"} );
      return;
    }
    if (this.state.startGameDisabled) {
      return;
    }
    this.updateState({startGameDisabled: true});

    let thisObj = this;
    let payload = {
      players: this.state.selectedPlayers.map(player => player.id),
      quizId: this.state.quizSelected.id,
      name: this.state.quizSelected.name
    }
    
    gameService.put(payload).then(response => {
      thisObj.updateState({startGameDisabled: false});
      thisObj.openGameAdminConsole(response.data);
    }).catch(error => {
      let state = thisObj.state;
      Object.assign(state, errorUtils.parseError(error));
      Object.assign(state, {startGameDisabled: false});
      thisObj.setState(state);
    });
  };

  onQuizSelect(name, id) {

    let quiz = { name: name, id:id };
    if (quiz.name === "None" || (!!this.state.quizSelected && quiz.name===this.state.quizSelected.name)) {
      this.updateState({quizSelected: null});
    } else {
      this.updateState({quizSelected: quiz});
    }
     
  };

  myColor(name, isFont){
    
    if(!!this.state.quizSelected){
      if(this.state.quizSelected.name === name){
        if (!isFont){
        return  'LightSteelBlue';  
        // 'AliceBlue'; //'#43a047'; //'darkseagreen'; //'rgba(0,0,0,.18)';
        } else {
          return 'white';
        }
      }
    } 
    return '';
  }

  addPlayer(player, idx) {
    let players = this.state.players;
    let selectedPlayers = this.state.selectedPlayers;
    
    players.splice(idx, 1);
    selectedPlayers.push(player);

    this.updateState( {players: players, selectedPlayers: selectedPlayers, snackOpen: true, snackMessage: `Added player ${player.name}` , snackType: "success"} );
  }

  removePlayer(player, idx) {
    let players = this.state.players;
    let selectedPlayers = this.state.selectedPlayers;
    
    selectedPlayers.splice(idx, 1);
    players.push(player);

    this.updateState( {players: players, selectedPlayers: selectedPlayers, snackOpen: true, snackMessage: `Removed player ${player.name}` , snackType: "warning" });
  }

  openGameAdminConsole(game) {
    this.props.history.push({
      pathname: '/scoring',
      state: { game: game }
    });
  }

  playGame(game) {
    this.props.history.push({
      pathname: '/game',
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
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {finishGameDisabled: false});
        thisObj.setState(state);
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

    gameService.delete(this.state.modalDeleteGameObject.id)
      .then(response => { 
        thisObj.updateState({ deleteGameDisabled: false, activeGames: activeGames, snackOpen: true, snackMessage: "Game Deleted", snackType: "warning"  });
        thisObj.getActiveGames();
        thisObj.getMyActiveGames();
      })
      .catch(error => {
        let state = thisObj.state;
        Object.assign(state, errorUtils.parseError(error));
        Object.assign(state, {deleteGameDisabled: false});
        thisObj.setState(state);
      });
    this.handleCloseDeleteGameModal();
  }

  handleChange(event) {
    let key = event.target.getAttribute("name");
    let updateObj = { [key]: event.target.value };
    this.updateState(updateObj);
  }
  
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

          { !this.state.isPlayer && !this.state.isAdmin ? 
            <CardGroup>
              <Card className="p-6">
                <CardHeader tag="h2">You are successfully logged in but don't yet have any access permissions. Please contact your quizmaster to get access.</CardHeader>
              </Card>
            </CardGroup>
            :
            <div>
              {/* PLAYER - Section - START */}
              { this.state.isPlayer ?

                <div>
                
                        { !!this.state.myActiveGames && this.state.myActiveGames.length > 0 ?
                          <BlockUi tag="div" blocking={this.state.loadingMyActiveGames}>
                          <CardGroup>
                            <Card className="p-6">
                              <CardHeader tag="h2">My Games</CardHeader>
                            <CardBody>
                              <Table bordered hover responsive>
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Open</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {this.state.myActiveGames.map((game, idx) => 
                                    <tr key={`myactivegames_${idx}`}>
                                      <td align="left">{game.name}</td>
                                      <td><Button type="button" color="link" onClick={this.playGame.bind(this, game)}>Open</Button></td>
                                    </tr>
                                    
                                  )}
                                </tbody>
                              </Table>
                            
                            </CardBody>
                          </Card>
                          </CardGroup>
                        </BlockUi>
                          
                          : 
                          <div>
                            { !this.state.isAdmin ?
                          <CardGroup>
                            <Card className="p-6">
                              <CardHeader tag="h2">There are no games available currently. Please wait for your quizmaster to start a game.</CardHeader>
                            </Card>
                          </CardGroup>
                            : null }
                          </div>
                        }
                      </div>
                  
              : null }
              {/* PLAYER - Section - END */}


              {/* ADMIN - Section - START */}
              { this.state.isAdmin ?
                <div>

                {this.state.activeGames.length > 0 ?
                  <BlockUi tag="div" blocking={this.state.loadingActiveGames}>
                  <CardGroup>
                    <Card className="p-6">
                      <CardHeader tag="h2">Active Games</CardHeader>
                    <CardBody>
                      <Table bordered hover responsive>
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
                            { !! this.state.modalDeleteGameObject ?
                              <b>&nbsp;{this.state.modalDeleteGameObject.name}&nbsp;</b>  : null }
                            
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
                            <tr key={`activegames_${idx}`}>
                              <td align="left">{game.name}</td>
                              <td><Button type="button" color="link" onClick={this.finishGame.bind(this, game, idx)}>Finish</Button></td>
                              <td><Button type="button" color="link" onClick={this.showDeleteGameModal.bind(this, game, idx)}>
                                <img alt="Remove" src={RemoveImage} width="20px" height="20px"/></Button>                  
                                </td>
                              <td><Button type="button" color="link" onClick={this.openGameAdminConsole.bind(this, game)}>Open</Button></td>
                            </tr>
                            
                          )}
                        </tbody>
                      </Table>
                    
                    </CardBody>
                  </Card>
                  </CardGroup>
                  </BlockUi>
                : null}

                <BlockUi tag="div" blocking={this.state.loadingQuizzes}>
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
                            <tr key={`quizlist_${idx}`}>
                              <td style={{background: this.myColor(quiz.name, false), color: this.myColor(quiz.name, true)}} align="left" onClick={this.onQuizSelect.bind(this, quiz.name, quiz.id)}>{quiz.name}</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </CardBody>
                  
                    


                    {!!this.state.quizSelected ?  
                      <div>
                        <CardBody>
                  
                      
                          
                              <FormGroup>
                              <h4 colSpan="2">You have selected: <b>{this.state.quizSelected.name}</b></h4>


                              <Table size="sm"  bordered hover responsive>
                                <thead>
                                  <tr>
                                    <th>Avatar</th>
                                    <th>Player</th>
                                    <th>Add</th>
                                  </tr>
                                </thead>
                                <tbody>

                                  {[].concat(this.state.players).map((player, idx) => (
                                    <tr key={`players_${idx}`}>
                                      <td>
                                        <img alt="Image Preview" src={player.picture} className="avatar" />
                                      </td>
                                      <td>
                                        {player.name}
                                      </td>
                                      <td>
                                          <Button type="button" onClick={this.addPlayer.bind(this, player, idx)} color="link"><img alt="Add" src={AddIcon} width="20px" height="20px"/></Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                                
                              </FormGroup>
                        </CardBody>

                        <CardBody>
                          <Table size="sm"  bordered hover responsive>
                                <thead>
                                  <tr>
                                    <th>Avatar</th>
                                    <th>Player</th>
                                    <th>Remove</th>
                                  </tr>
                                </thead>
                                <tbody>

                                  {[].concat(this.state.selectedPlayers).map((selectedPlayer, idx) => (
                                    <tr key={`selectedPlayers_${idx}`}>
                                      <td>
                                        <img alt="Image Preview" src={selectedPlayer.picture} className="avatar" />
                                      </td>
                                      <td>
                                        {selectedPlayer.name}
                                      </td>
                                      <td>
                                        <Button type="button" onClick={this.removePlayer.bind(this, selectedPlayer, idx)} color="link"><img alt="Remove" src={RemoveImage} width="20px" height="20px"/></Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
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

                      
                      { !!this.state.quizSelected && this.state.selectedPlayers.length > 0 ?
                        <CardBody>
                        
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
                                      <Button color="primary" onClick={this.startGame.bind(this)}>
                                        Yes
                                      </Button>
                                    </ModalFooter>
                                  </Modal>
                                </ButtonGroup>
                              
                              
                      </CardBody>
                      : null }
                
                </Card>
              </CardGroup>
              </BlockUi>
              </div>
            : null }

            {/* ADMIN - Section - END */}
          </div>
        }

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

export default Home;
