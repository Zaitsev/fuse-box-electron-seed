import * as React from "react";
import ProcessVersions = NodeJS.ProcessVersions;
import styles     from "./style.scss";
import * as fs    from "fs";

const {remote} = require('electron');
const {dialog} = remote;
// const myPackage = fs.readFileSync(appDir + '/package.json').toString();
type Props = {
  counter: number
  incrementCounter: (value: number) => void;
};

interface ElectronProcessVersions extends ProcessVersions {
  chrome: string;
  electron: string;
}

export class AppMainPage extends React.PureComponent<Props> {
  private versions: { node: string; chrome: string; electron: string } = {node: '-', chrome: '-', electron: '-'};
  private myPackage: string                                            = "should be readed with  by remote";

  constructor(props: Props) {
    super(props);
    const {node, chrome, electron} = process.versions as ElectronProcessVersions;
    this.versions                  = {node, chrome, electron};

    // const appDir = remote.app.getAppPath();

    // this.myPackage = fs.readFileSync(appDir + '/package.json').toString();
  }

  emitAction = (value: number) => this.props.incrementCounter && this.props.incrementCounter(value);

  openDialog = () => dialog.showMessageBox({type: "info", title: "Message Box", message:"Native message dialog"});

  render() {
    console.log("Source maps should be supported in production");
    return (<div className={styles.Module}>
      <h1>Welcome to FuseBoxs + Electron + Sass + React + Redux + Typescript</h1>
      <h3>Electron version: {this.versions.electron}</h3>
      <h3>Node version: {this.versions.node}</h3>
      <h3>Chrome version: {this.versions.chrome}</h3>
      <h3>Redux counter value is &laquo;{this.props.counter}&raquo;</h3>
      <button onClick={() => this.emitAction(1)}>Increment redux counter</button>
      <button onClick={() => this.emitAction(-1)}>Decrement redux counter</button>
      <hr/>
      <button onClick={this.openDialog}>Open dialog</button>
      <hr/>

      <pre>{this.myPackage}</pre>
    </div>);
  }

}
