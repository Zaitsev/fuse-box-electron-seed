import * as React                                from "react";
import {lazy, Suspense}                          from "react";
import {render}                                  from "react-dom";
import {HashRouter, Route, Switch}               from "react-router-dom";
import {connect, Provider}                       from "react-redux";
import {AppStore, testActionCreators, the_store} from "./store";
import {AppMainPage}                             from "./components/App";
// const {dialog} = require('electron').remote;
import "./appStyles";

const {remote} = require('electron');
 const LazyComponent=lazy(()=>import("./components/lazy"));
 const GLExperiment=lazy(()=>import("./components/D3GL"));
 let fs_version = "Packaged app";

// if (process.env.NODE_ENV==='development') {
//
//   const myPackage  = fs.readFileSync(path.join(appDir, 'package.json')).toString();
//   fs_version = JSON.parse(myPackage).devDependencies['fuse-box'];
// }
class App extends React.Component {

  render() {


    return <Provider store={the_store}>
      <>
        <Suspense fallback={"loading"} >
        <HashRouter>
          <Switch>
            <Route path={"/D3GL"}><GLExperiment/></Route>
            <Route path={"/lazy"}><LazyComponent/></Route>
            <Route path={"/"}><PageConnected/></Route>
          </Switch>
        </HashRouter>
        </Suspense>
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
