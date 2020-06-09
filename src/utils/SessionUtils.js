import auth0Client from '../Auth';
const axios = require('axios');

class SessionUtils {
  constructor() {
  }

  checkLoggedIn = () => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    // Check if JWT exists
    if (!authHeader) {
      window.location.href = '/#/login';
      return;
    }

    // Check if session is valid
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/session/isLoggedIn`, config)
      .then(function (response) {
        //console.log(`Is user logged in?  ${response.data}`);
      })
      .catch(function (error) {
        window.location.href = '/#/login';
      });
  };

  logout = () => {
    sessionStorage.clear();
    window.location.href = '/#/login';
  };

  checkUserType = () => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    // Check if JWT exists
    if (!authHeader) {
      window.location.href = '/#/login';
      return;
    }

    // Check if session is valid
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    return axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/session/type`, config);
  };

  logout = () => {
    sessionStorage.clear();
    window.location.href = '/#/login';
  };

}

const sessionUtils = new SessionUtils();

export default sessionUtils;