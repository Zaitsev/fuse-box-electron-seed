import * as React   from "react";
import ProcessVersions = NodeJS.ProcessVersions;

type Props = {
  counter: number
  incrementCounter: (value: number) => void;
};

interface ElectronProcessVersions extends ProcessVersions {
  chrome: string;
  electron: string;
}

export class AppMainPage extends React.PureComponent<Props> {
  private versions: { node: string; chrome: string; electron: string }={node:'-',chrome:'-',electron:'-'};
  private myPackage: string = "should be readed with  by remote";

  constructor(props: Props) {
    super(props);
    const {node, chrome, electron} = process.versions as ElectronProcessVersions;
    this.versions                  = {node, chrome, electron};
    // const appDir                   = remote.app.getAppPath();

    // this.myPackage = fs.readFileSync(appDir + '/package.json').toString();
  }

  emitAction = (value: number) => this.props.incrementCounter && this.props.incrementCounter(value);

  render() {
    return (<>
      <h1>Welcome to FuseBox + Electron + Sass + React + Redux + Typescript</h1>
      <h5>Electron version: {this.versions.electron}</h5>
      <h5>Node version: {this.versions.node}</h5>
      <h5>Chrome version: {this.versions.chrome}</h5>
      <h3>Redux counter value is &laquo;{this.props.counter}&raquo;</h3>
      <button onClick={() => this.emitAction(1)}>Increment redux counter</button>
      <button onClick={() => this.emitAction(-1)}>Decrement redux counter</button>
      <hr/>
      <pre>{this.myPackage}</pre>
    </>);
  }

}
