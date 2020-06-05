import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import DefaultHeader from '../../containers/Header';
import routes from '../../routes';
import sessionUtils from '../../utils/SessionUtils';

class DefaultLayout extends Component {
  constructor(props) {
    super(props);

    sessionUtils.checkLoggedIn();
  }
  render() {
    return (
      <div>
        <div className="content_employee">
          <span className="app" style={{ overflowX: 'hidden' }}>
            <div className="app_body">
              <main className="main">
                <DefaultHeader />
                {this.props.search === true ? (
                  <div />
                ) : (
                  <Switch>
                    {routes.map((route, idx) => {
                      return route.component ? (
                        <Route
                          key={idx}
                          path={route.path}
                          exact={route.exact}
                          name={route.name}
                          render={props => <route.component {...props} />}
                        />
                      ) : null;
                    })}
                    <Redirect from="/" to="/home" />
                  </Switch>
                )}
              </main>
            </div>
          </span>
        </div>
      </div>
    );
  }
}
export default DefaultLayout;