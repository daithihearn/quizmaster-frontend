const axios = require('axios');

exports.get = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/game?id=${id}`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting game: ', error));
    return result;
  }
};

exports.getAll = () => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/all`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting all quizzes: ', error));
    return result;
  }
};

exports.put = (createGame) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game`, createGame, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when putting game: ', error));
    return result;
  }
};

exports.delete = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/game?id=${id}`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when deleting quiz: ', error));
    return result;
  }
};

exports.publishQuestion = (pointer) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/publishQuestion`, pointer, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when publishing question: ', error));
    return result;
  }
};

exports.getCurrentContent = () => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/game/currentContent`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting current content: ', error));
    return result;
  }
};