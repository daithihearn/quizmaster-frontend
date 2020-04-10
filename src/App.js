// Styles
// CoreUI Icons Set
import '@coreui/icons/css/coreui-icons.min.css';
// Import Flag Icons Set
import 'flag-icon-css/css/flag-icon.min.css';
// Import Font Awesome Icons Set
import 'font-awesome/css/font-awesome.min.css';
import React, { Component } from 'react';
// Containers
// import { DefaultLayout } from './containers';
//Import loadable
import Loadable from 'react-loadable';
import { HashRouter, Route, Switch } from 'react-router-dom';
// Import Simple Line Icons Set
import 'simple-line-icons/css/simple-line-icons.css';
import LoadingIcon from '../src/assets/img/brand/loading.gif';
import './App.css';
// Import Main styles for this application
import './scss/style.css';

function Loading() {
  return <img src={LoadingIcon} className="loading" alt="description" />;
}

const Login = Loadable({
  loader: () => import('./containers/Login'),
  loading: Loading
});

const Signup = Loadable({
  loader: () => import('./containers/Signup'),
  loading: Loading
});

const DefaultLayout = Loadable({
  loader: () => import('./containers/DefaultLayout/DefaultLayout'),
  loading: Loading
});

// import { renderRoutes } from 'react-router-config';

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/login" name="Login Page" component={Login} />
          <Route exact path="/signup" name="Signup" component={Signup} />
          <Route path="/" name="Home" component={DefaultLayout} />
          <Route path="/" name="Game" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
