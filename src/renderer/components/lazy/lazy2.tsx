import * as React from "react";
const {remote} = require('electron');
class Lazy2 extends React.PureComponent{
   componentDidMount(): void {
     remote.getCurrentWindow().setTitle(`new lazy title`)
   }

  render(){
        return <div>Lazy L2 loaded {new Date().toISOString()}</div>
    }
}
export default Lazy2;
