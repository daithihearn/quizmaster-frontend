import auth0Client from '../Auth';

const axios = require('axios');

class QuizService {

  getQuiz = (id) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz?id=${id}`, config)
      return result;
    }
  };

  getAllQuizzes = () => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json"
        }
      };
      const result = axios
        .get(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz/all`, config)
      return result;
    }
  };

  putQuiz = (quiz) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .put(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz`, quiz, config)
      return result;
    }
  };

  deleteQuiz = (id) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .delete(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz?id=${id}`, config)
      return result;
    }
  };

  uploadImage = (media) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .post(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz/uploadImage`, { data: media }, config)
      return result;
    }
  };

  uploadAudio = (media) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .post(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz/uploadAudio`, { data: media }, config)
      return result;
    }
  };

  uploadVideo = (media) => {
    let authHeader = `Bearer ${auth0Client.getIdToken()}`;

    if (authHeader) {
      let config = {
        headers: {
          Authorization: authHeader
        }
      };
      const result = axios
        .post(`${process.env.REACT_APP_API_URL}/api/v1/admin/quiz/uploadVideo`, { data: media }, config)
      return result;
    }
  };
}

const quizService = new QuizService();

export default quizService;