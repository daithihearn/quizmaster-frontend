const axios = require('axios');

exports.getQuiz = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz?id=${id}`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting quiz: ', error));
    return result;
  }
};

exports.getAllQuizzes = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz/all`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting all quizzes: ', error));
    return result;
  }
};

exports.putQuiz = (quiz) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin`, quiz, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when uploading quiz: ', error));
    return result;
  }
};

exports.deleteQuiz = (id) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz?id=${id}`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when getting quiz: ', error));
    return result;
  }
};