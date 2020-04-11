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
      .then(response => response)
      .catch(error => console.error('Error occurred when uploading answer: ', error));
    return result;
  }
};