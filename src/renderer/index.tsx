import React                                     from "react"
import {render}                                  from "react-dom";
import {HashRouter, Route, Switch}               from "react-router-dom";
import {connect, Provider}                       from "react-redux";
import {AppStore, testActionCreators, the_store} from "~/renderer/store";
import {AppMainPage}                             from "~/renderer/componentes/App";
const {dialog} = require('electron').remote;



class App extends React.Component {
  render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    // const myPackage = fs.readFileSync(appDir + '/package.json').toString();

    return <Provider store={the_store}>
      <>
        <h1>HMR 2</h1>

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
