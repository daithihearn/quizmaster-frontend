import auth0Client from '../Auth';

const axios = require('axios');

class GameService {

  get = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/game?gameId=${gameId}`, config)
      return result;
    }
  };

  getAll = () => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/all`, config)
      return result;
    }
  };

  getMyActiveGames = () => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/game/active`, config)
      return result;
    }
  }

  getActive = () => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/active`, config)
      return result;
    }
  }

  getAllPlayers = () => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/players/all`, config)
      return result;
    }
  };

  getPlayersForGame = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/game/players?gameId=${gameId}`, config)
      return result;
    }
  };

  put = (createGame) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game`, createGame, config)
      return result;
    }
  };

  addPlayer = (gameId, playerEmail) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/addPlayer?gameId=${gameId}&playerEmail=${playerEmail}`, null, config)
      return result;
    }
  };

  removePlayer = (gameId, playerId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/removePlayer?gameId=${gameId}&playerId=${playerId}`, config)
      return result;
    }
  };

  finish = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/finish?gameId=${gameId}`, null, config)
      return result;
    }
  };

  cancel = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/cancel?gameId=${gameId}`, null, config)
      return result;
    }
  };


  delete = (gameId) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/game?gameId=${gameId}`, config)
      return result;
    }
  };

  publishQuestion = (pointer) => {
    let authHeader = `Bearer ${auth0Client.getAccessToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/publishQuestion`, pointer, config)
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
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/publishLeaderboard${queryString}`, null, config)
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
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/game/publishAnswersForRound?gameId=${gameId}&roundId=${roundId}`, null, config)
      return result;
    }
  };

}

const gamesService = new GameService();

export default gamesService;