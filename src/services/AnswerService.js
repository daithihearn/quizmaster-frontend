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

exports.getAnswers = (gameId, roundId, playerId) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    let queryString = `?gameId=${gameId}`;
    if (roundId !== null && roundId !== undefined) {
      queryString = queryString + `&roundId=${roundId}`;
    }
    if (playerId !== null && playerId !== undefined) {
      queryString = queryString + `&playerId=${playerId}`;
    }
    
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer${queryString}`, config)
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

exports.getLeaderboard = (gameId, roundId) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    let queryString = `?gameId=${gameId}`;
    if (roundId !== null && roundId !== undefined) {
      queryString = queryString + `&roundId=${roundId}`;
    }
    const result = axios
      .get(`${process.env.REACT_APP_API_URL}/api/v1/answer/leaderboard${queryString}`, config)
    return result;
  }
};

exports.publishLeaderboard = (gameId, roundId) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    let queryString = `?gameId=${gameId}`;
    if (roundId !== null && roundId !== undefined) {
      queryString = queryString + `&roundId=${roundId}`;
    }
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer/publishLeaderboard${queryString}`, null, config)
    return result;
  }
};



exports.publishAnswersForRound = (gameId, roundId) => {
  let authHeader = sessionStorage.getItem('JWT-TOKEN');

  if (authHeader) {
    let config = {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json"
      }
    };
    const result = axios
      .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer/publishAnswersForRound?gameId=${gameId}&roundId=${roundId}`, null, config)
    return result;
  }
};