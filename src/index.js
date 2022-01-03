import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import App from './App';
import Setting from './setting';
import Crash from './crash';
import reportWebVitals from './reportWebVitals';
import { HashRouter as Router, Switch, Route } from 'react-router-dom'; // 只能用hash路由
import fileHelper from './utils/fileHelper';

fileHelper.mkAppDirSync('aim');
fileHelper.mkAppDirSync('note');
fileHelper.mkAppDirSync('todo');

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/">
        <App />
      </Route>
      <Route path="/setting">
        <Setting />
      </Route>
      <Route path="/crash">
        <Crash />
      </Route>
    </Switch>
  </Router>,
  document.getElementById('root')
);

//ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
