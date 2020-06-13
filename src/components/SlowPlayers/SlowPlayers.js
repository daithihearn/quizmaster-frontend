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

class SlowPlayers extends Component {
  render() {

    const {players: players, answered: answered, title: title, ...rest} = this.props;

    const slowPlayers = players.filter(a => {
      return answered.filter(b => {
        return a.id === b;
      }).length === 0;
    });

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
                        </tr>
                      </thead>
                      <tbody>

                        {[].concat(slowPlayers).sort(compare).map((player, idx) => (
                          <tr key={"slowplayers_" + idx}>
                            <td>
                              <img alt="Image Preview" src={player.picture} className="avatar" />
                            </td>
                            <td align="left">
                              {player.name}
                            </td>
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

SlowPlayers.propTypes = propTypes;
SlowPlayers.defaultProps = defaultProps;

export default SlowPlayers;