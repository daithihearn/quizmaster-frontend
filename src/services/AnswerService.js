import auth0Client from '../Auth';

const axios = require('axios');

class AnswerService {

  submitAnswer = (answer) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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

  getAllAnswers = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/answer/all?gameId=${gameId}`, config)
      return result;
    }
  };


  submitCorrection = (answer) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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

  getAnswers = (gameId, roundId, playerId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      let queryString = `?gameId=${escape(gameId)}`;
      if (roundId !== null && roundId !== undefined) {
        queryString = queryString + `&roundId=${escape(roundId)}`;
      }
      if (playerId !== null && playerId !== undefined) {
        queryString = queryString + `&playerId=${escape(playerId)}`;
      }

      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/answer${queryString}`, config)
      return result;
    }
  };

  getUnscoredAnswers = (id) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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

  getLeaderboard = (gameId, roundId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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

  publishLeaderboard = (gameId, roundId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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



  publishAnswersForRound = (gameId, roundId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

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
}

const answerService = new AnswerService();

export default answerService;