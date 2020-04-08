const axios = require('axios');

exports.search = (category, year) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader
      }
    };
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/oscar/search/${category}/${year}`, config)
      .then(response => response)
      .catch(error => console.error('Error occurred when searching: ', error));
    return result;
  }
};