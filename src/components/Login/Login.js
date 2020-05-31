import axios from 'axios';
import React, { Component } from 'react';
import { Alert } from 'reactstrap';
import stateUtils from '../../utils/StateUtils';
import sessionUtils from '../../utils/SessionUtils';
import { Button, ButtonGroup} from 'reactstrap';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    let authHeader = sessionStorage.getItem('JWT-TOKEN');
    if (authHeader) {
      window.location.href = '/#/home';
      return;
    }
  }

  handleChange = event => {
    let key = event.target.getAttribute('name');
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  };

  handleSubmit = event => {
    event.preventDefault();

    let data = stateUtils.getDataFromState(this.state);
    let thisObj = this;

    thisObj.setState({ _usernameError: '' });

    axios
      .post(`${process.env.REACT_APP_API_URL}/login`, data)
      .then(function (response) {
        sessionStorage.setItem('JWT-TOKEN', response.headers.authorization);
        thisObj.redirectToHomePage();
      }).catch(function (error) {
        thisObj.setState(Object.assign(thisObj.state, { _error: thisObj.parseError(error) }));
      });
  };

  redirectToHomePage() {

    // const { history } = this.props;

    sessionUtils.checkUserType().then(function(response) {
      let authority = response.data[0].authority;
      if (authority === "PLAYER") {
        window.location.href = '/#/game';
      } else if (authority === "ADMIN") {
        window.location.href = '/#/home';
      } else {
        window.location.href = '/#/login';
      }
    })
    .catch(function(error) {
      window.location.href = '/#/login';
    });
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
    if (!this.state._message) {
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
            <div className="Logo" />
            <div className="login_background_issuerImage" />
            <div className="form_wrap">
              <div className="form_container">
                <div className="form_container_headerText"> Login </div>
                <div className="form_container_subtext">
                  Quiz Master
                </div>
                <form onSubmit={this.handleSubmit}>
                  <Alert className="login_error" isOpen={this.showError()}>
                    {this.readErrorMessage()}
                  </Alert>
                  <input
                    className="username"
                    type="input"
                    name="username"
                    placeholder="Username"
                    autoComplete="Username"
                    value={this.state.username}
                    onChange={this.handleChange}
                    required
                  />

                  <div className="login_error_email">{this.state._usernameError}</div>

                  <input
                    className="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={this.state.password}
                    onChange={this.handleChange}
                    required
                  />
                  <ButtonGroup>
                  <Button
                   type="submit" color="primary" >
                    Login
                    </Button>
                    </ButtonGroup>
                  
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
