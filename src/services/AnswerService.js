const axios = require('axios');

exports.submitAnswer = (answer) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .post(`${process.env.REACT_APP_API_URL}/api/v1/answer`, answer, config)
    return result;
  }
};

exports.submitCorrection = (answer) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer`, answer, config)
    return result;
  }
};

exports.getUnscoredAnswers = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer/unscored?id=${id}`, config)
    return result;
  }
};

exports.getLeaderboard = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/answer/leaderboard?id=${id}`, config)
    return result;
  }
};

exports.publishLeaderboard = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer/publishLeaderboard?id=${id}`, null, config)
    return result;
  }
};