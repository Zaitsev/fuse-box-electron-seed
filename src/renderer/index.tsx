import * as React                                from "react";
import {render}                                  from "react-dom";
import {HashRouter, MemoryRouter, Route, Switch} from "react-router-dom";
import {connect, Provider}                       from "react-redux";
import {AppStore, testActionCreators, the_store} from "~/renderer/store";
import {AppMainPage}                             from "~/renderer/components/App";
// const {dialog} = require('electron').remote;
import "./appStyles";

class App extends React.Component {
  render() {
    // const myPackage = fs.readFileSync(appDir + '/package.json').toString();

    return <Provider store={the_store}>
      <>
        <h1>HMR 4.0.0-next.4</h1>

        <HashRouter>
          <Switch>
            <Route path={"/"}><PageConnected/></Route>
          </Switch>

        </HashRouter>
      </>
    </Provider>;
  }
}

const PageConnected = connect(
  ({counter}: AppStore) => ({counter}),
  dispatch => ({
    incrementCounter: (value: number) => dispatch(testActionCreators.incrementCounter.create({value}))
  })
)(AppMainPage);

render(<App/>, document.getElementById("app"));
