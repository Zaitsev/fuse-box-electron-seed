const path=require('path');
const fs=require('fs');
const { spawn } = require("child_process");

const {
  FuseBox,
  SassPlugin,
  CSSPlugin,
  WebIndexPlugin,
  Sparky,
  QuantumPlugin,
  CSSResourcePlugin,
  CSSModulesPlugin,
  EnvPlugin,
  TerserPlugin,
  SourceMapPlainJsPlugin,
} = require("fuse-box");
const  homeDir= path.join(__dirname);
function buildRenderer(OUTPUT_DIR,production=false,DEV_PORT=4444){
  console.log('Build rendered-------------------------');
  const globalStyles =
    [
      /node_modules.*(\.css|scss)$/,
      SassPlugin(),
      CSSResourcePlugin({
        dist: `${OUTPUT_DIR}/renderer/vendor/assets`,
        resolve: f => `vendor/assets/${f}`,
        inline: false,
      }),
      CSSPlugin({
        group: 'bundle-static.css',
        outFile: `${OUTPUT_DIR}/renderer/vendor.css`,
      }),
    ]
  ;

  const fuse = FuseBox.init({
    homeDir,
    output: "dist/renderer/$name.js",
    hash: false,
    target: "electron@esnext",
    ignoreModules: ["electron", "events","debug"],
    cache: !production,
    // useJsNext: true,
    natives: {
      process: true,
      Buffer: false,
      http: false,
      stream: false,
    },
    sourceMaps: { project: true, vendor: true },
    plugins: [

      EnvPlugin({ NODE_ENV: production ? "production" : "development", DEBUG: '*' }),
      SourceMapPlainJsPlugin(),
      globalStyles,
      [SassPlugin(), CSSModulesPlugin(), CSSPlugin()],
      // Babel7Plugin({
      //   config: {
      //     sourceMaps: true,
      //     presets: [
      //       ["@babel/react",{
      //         // pragma:'dom',
      //         development:true,
      //         useBuiltIns:false,
      //       }]
      //     ],
      //   },
      // }),
      WebIndexPlugin({
        title: "FuseBox electron demo",
        template: path.join(homeDir,"renderer/index.html"),
        path: "."
      }),
      production && QuantumPlugin({
        bakeApiIntoBundle: 'vendor',
        target: 'electron',
        treeshake: true,
        sourceMaps: { vendor: false },
        replaceProcessEnv:true,
        removeExportsInterop: false,
        replaceTypeOf: false,
        uglify: false,
      }),
      // production && TerserPlugin({
      //   sourceMap: true, compress: true, mangle: {
      //     toplevel: true,
      //   },
      // }),

    ]
  });
  if (!production) {
    // Configure development server
    fuse.dev({ port: DEV_PORT++, httpServer: false });
  }
  fuse.bundle("vendor")
    .instructions('~ renderer/index.tsx + fuse-box-css');
  const app = fuse.bundle("renderer")
    .instructions('!> [renderer/index.tsx]');


  if (!production) {
    app.hmr().watch()
  }

  return fuse.run()
}
function buildMain(OUTPUT_DIR,plugins=[],production=false,upgradetools=false){
  const fuse = FuseBox.init({
    homeDir,
    ignoreModules: ["electron", ],

    output: "dist/main/$name.js",
    target: "server",
    cache: !production,
    sourceMaps: { project: true, vendor: true },
    natives: {
      process: true,
    },
    plugins: [
      EnvPlugin({
        NODE_ENV: production ? "production" : "development",
        UPGRADE_EXTENSIONS: upgradetools,
      }),
      production && QuantumPlugin({
        // api: core => {
        //   core.solveComputed("default/shared/hooks/main.js");
        // },
        bakeApiIntoBundle: 'main',
        sourceMaps: { vendor: false },
        target: 'server',
        replaceProcessEnv:true,
        treeshake: true,
        removeExportsInterop: false,
        uglify: false
      })
    ]
  });
  console.log("=======================");
  console.log(` > main/main.ts  `+plugins.join(' + '));
  console.log("=======================");

  const app = fuse.bundle("main")
    .instructions(` > main/main.ts   `);
  createMainPluginList(OUTPUT_DIR,plugins);
  let cb=null;
  if (!production) {
    app.watch();

    return fuse.run().then(() => {
      // launch electron the app
      const child = spawn('npm', ['run', 'start:electron:watch'], { shell: true, stdio: 'inherit' });
      if (child.stdout !== null) {
        child.stdout.on('data', function (data) {
          console.log(data.toString());
          //Here is where the output goes
        });
      }
      if (child.stderr !== null) {
        child.stderr.on('data', function (data) {
          console.error(data.toString());
          //Here is where the error output goes
        });
      }
    });
  }
  return fuse.run();
  // return fuse.run()
}
function createMainPluginList(OUTPUT_DIR,plugins=[]){
  console.log("-------------------------------",plugins);
 const json = JSON.stringify(plugins);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'main/main-plugins.json'), json, 'utf8');
}
module.exports={buildRenderer,buildMain};
