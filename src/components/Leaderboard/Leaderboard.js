import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader, CardGroup, Table } from 'reactstrap';

const compare = (a, b) => {
    let comparison = 0;
    if (b.score > a.score) {
        comparison = 1;
    } else if (b.score < a.score) {
        comparison = -1;
    }
    return comparison;
}

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Leaderboard extends Component {
  render() {

    const {scores: scores, players: players, title: title, ...rest} = this.props;

    return (
      <React.Fragment>
        <CardGroup>
                <Card className="p-6">
                  <CardHeader tag="h2">{title}</CardHeader>
                  <CardBody>

                  <Table bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Avatar</th>
                          <th>Player</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>

                        {[].concat(scores).sort(compare).map((entry, idx) => (
                          <tr key={"leaderboard_" + idx}>
                            <td>
                              <img alt="Image Preview" src={players.find(p => p.id === entry.playerId).picture} className="avatar" />
                            </td>
                            <td align="left">
                              {players.find(p => p.id === entry.playerId).name}
                            </td>
                            <td>{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                 </CardBody>
                
              </Card>
            </CardGroup>
      </React.Fragment>
    );
  }
}

Leaderboard.propTypes = propTypes;
Leaderboard.defaultProps = defaultProps;

export default Leaderboard;