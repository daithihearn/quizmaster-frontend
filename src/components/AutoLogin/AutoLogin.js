import axios from 'axios';
import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import queryString from 'query-string'

class AutoLogin extends Component {
  constructor(props) {
    super(props);
    const values = queryString.parse(this.props.location.search);
    this.attemptLogin(values);
  }

  attemptLogin(details) {
    let thisObj = this;

    axios
      .post(`${process.env.REACT_APP_API_URL}/login`, details)
      .then(function (response) {
        sessionStorage.setItem('JWT-TOKEN', response.headers.authorization);
        thisObj.redirectToHomePage();
      }).catch(function (error) {
        console.log(error);
        thisObj.setState(Object.assign(thisObj.state, { _error: thisObj.parseError(error) }));
      });
  }

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
      console.log(error);
      window.location.href = '/#/login';
    });
  }


  render() {
    //new login
    return (
      <div className="app">
        Attempting login....
      </div>
    );
  }
}

export default AutoLogin;
