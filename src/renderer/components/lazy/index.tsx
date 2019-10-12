import * as React      from "react";
import {Route, Switch} from "react-router-dom";
import {lazy}          from "react";
const LazyComponent2 = lazy(()=>import("./lazy2"))
class LazyComponent extends React.Component{
    render(){
        return <h1>Lazy L0 loaded {(new Date()).toISOString()}
            <Switch>
                <Route path={"/"}>
                    <LazyComponent2/>
                </Route>
            </Switch>
        </h1>
    }
}
export default LazyComponent;
