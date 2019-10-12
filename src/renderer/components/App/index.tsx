import * as React    from 'react';
import styles        from './style.scss';
import {ipcRenderer} from 'electron';
import {GLtest}      from '../gltest';
import ProcessVersions = NodeJS.ProcessVersions;

const {remote} = require('electron');
const {dialog} = remote;

const debug = require('~/shared/log').debug(__filename);
debug('debug works in Renderer and prints to main');
debug('and prints objects',{a:'1'});
debug('and prints numbers',555);
// import Logger from "debug";
// const debug_local = Logger.debug(__filename);
//  debug_local.enabled = true;
//  debug_local("debug works in chromium console too");

// const myPackage = fs.readFileSync(appDir + '/package.json').toString();
interface Props {
  counter: number
  incrementCounter: (value: number) => void;
}

interface ElectronProcessVersions extends ProcessVersions {
  chrome: string;
  electron: string;
}

function checkCS(){
  // Canvas setup
  const canvas = document.createElement(('canvas'));

  // Create WebGL2ComputeRenderingContext
  const context = canvas.getContext('webgl2-compute');
  if (!context) {
    console.log( 'webgl2-compute error');
    return false;
  }
  return true;
}

export class AppMainPage extends React.PureComponent<Props> {
  private versions: { node: string; chrome: string; electron: string } = {node: '-', chrome: '-', electron: '-'};
  private myPackage: string                                            = 'should be readed with  by remote';

  constructor(props: Props) {
    super(props);
    const {node, chrome, electron} = process.versions as ElectronProcessVersions;
    this.versions                  = {node, chrome, electron};

    const appDir = remote.app.getAppPath();

    this.myPackage = `fs.readFileSync(appDir + '/package.json').toString()`;
  }
  createWindow =()=>{
    ipcRenderer.send('create_new_window',{});
  }
  createWindowGL =()=>{
    ipcRenderer.send('GL_create_new_window_GL',{});
  }
  emitAction = (value: number) => this.props.incrementCounter && this.props.incrementCounter(value);

  openDialog = () => dialog.showMessageBox({type: 'info', title: 'Message Box', message:'Native message dialog'});

  render() {
    console.log('rendering app');
    const appDir     = remote.app.getAppPath();
    console.log('Source maps should be supported in production');
    return (<div className={styles.Module}>
      <h1>Fuse+electron  ws HMR</h1>
      <h2>App path{appDir}</h2>
      <h3>{Date()}</h3>
      <h1>Welcome to FuseBox + Electron + Sass + React + Redux + Typescript</h1>
      <h3 className={styles.hThree}>Electron version:  {this.versions.electron}</h3>
      <h3 className={styles.hThree3}>Node version: {this.versions.node}</h3>
      <h3>Chrome version: {this.versions.chrome}</h3>
      <h3>Redux counter value is {this.props.counter}</h3>
      <button onClick={() => this.emitAction(1)}>Increment redux counter</button>
      <button onClick={() => this.emitAction(-1)}>Decrement redux counter</button>
      <hr/>
      <h3>{checkCS() ? "webgl2-compute OK" : "webgl2-compute ERROR"}</h3>
      <GLtest />
      <hr />
      <button onClick={this.openDialog}>Open dialog</button>
      <hr/>
      <button onClick={this.createWindow}>Open window</button>
      <button onClick={this.createWindowGL}>GL experiment</button>
      <hr/>

      <pre>{this.myPackage}</pre>
    </div>);
  }

}
