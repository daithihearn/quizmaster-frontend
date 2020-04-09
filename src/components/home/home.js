import axios from 'axios';
import React, { Component } from 'react';
import sessionUtils from '../../utils/SessionUtils';
import quizService from '../../services/QuizService';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { quizzes: [] };
    sessionUtils.checkLoggedIn();

    this.getAllQuizzes = this.getAllQuizzes.bind(this);
  }

  handleChange = event => {
    let key = event.target.getAttribute('name');
    let updateObj = { [key]: event.target.value };
    this.setState(Object.assign(this.state, updateObj));
  };

  getAllQuizzes = event => {
    event.preventDefault();
    
    let thisObj = this;
    
    quizService.getAllQuizzes().then(response => {
      thisObj.setState(Object.assign(thisObj.state, { quizzes: response.data}));
    })
    .catch(error => console.error('Error occurred when searching: ', error));
  };

  render() {
    return (
      <div>
        <div className="tile_wrap">
          <div className="card-product_Stats">
          <div className="form_wrap">
              <div className="form_container2">
                <div className="form_container_subtext">
                  Quizes
                </div>
                <form onSubmit={this.getAllQuizzes}>
                  <button type="submit" color="primary" className="login_button">
                    Get All Quizzes
                    <span>
                      <img
                        style={{ marginLeft: '5px' }}
                        alt="description"
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjBweCIgeT0iMHB4Igp3aWR0aD0iMTUiIGhlaWdodD0iMTUiCnZpZXdCb3g9IjAgMCAxNzIgMTcyIgpzdHlsZT0iIGZpbGw6IzAwMDAwMDsiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIGZvbnQtZmFtaWx5PSJub25lIiBmb250LXdlaWdodD0ibm9uZSIgZm9udC1zaXplPSJub25lIiB0ZXh0LWFuY2hvcj0ibm9uZSIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0wLDE3MnYtMTcyaDE3MnYxNzJ6IiBmaWxsPSJub25lIj48L3BhdGg+PGcgZmlsbD0iIzg2YmMyNSI+PHBhdGggZD0iTTY4LjgsMTU0LjhoLTExLjQ2NjY3Yy0yLjIxMzA3LDAgLTQuMjMxMiwtMS4yNzg1MyAtNS4xODI5MywtMy4yNzk0N2MtMC45NTE3MywtMi4wMDA5MyAtMC42NTkzMywtNC4zNjg4IDAuNzQ1MzMsLTYuMDg4OGw0OC42MzAxMywtNTkuNDMxNzNsLTQ4LjYzMDEzLC01OS40Mzc0N2MtMS40MDQ2NywtMS43MTQyNyAtMS42OTEzMywtNC4wODIxMyAtMC43NDUzMywtNi4wODg4YzAuOTQ2LC0yLjAwNjY3IDIuOTY5ODcsLTMuMjczNzMgNS4xODI5MywtMy4yNzM3M2gxMS40NjY2N2MxLjcyLDAgMy4zNDgyNywwLjc3NCA0LjQzNzYsMi4xMDQxM2w1MS42LDYzLjA2NjY3YzEuNzI1NzMsMi4xMTU2IDEuNzI1NzMsNS4xNDg1MyAwLDcuMjY0MTNsLTUxLjYsNjMuMDY2NjdjLTEuMDg5MzMsMS4zMjQ0IC0yLjcxNzYsMi4wOTg0IC00LjQzNzYsMi4wOTg0eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+"
                      />
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="tile_wrap">
          <div className="card-product_Stats">
          <div className="rwd-table">
                <table>
                  <tbody className="TableBody">
                    {/* <tr style={{ backgroundColor: '#f8f8f8', color: 'black', cursor: 'pointer' }}>
                      <th>Category</th>
                      <th>Entity</th>
                      <th>Winner</th>
                      <th>Year</th>
                    </tr> */}

                    {this.state.quizzes.map((rowdata, i) => {
                      return (<tr style={{ cursor: 'pointer' }}>
                        <td data-th="Name"> {rowdata.name} </td>
                      </tr>)
                    })}
                  </tbody>
                </table>
              </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
