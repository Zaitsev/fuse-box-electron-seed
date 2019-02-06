const {
  FuseBox,
  SassPlugin,
  CSSPlugin,
  WebIndexPlugin,
  Sparky,
  QuantumPlugin,
  EnvPlugin,
  CopyPlugin,
  JSONPlugin,
  CSSModulesPlugin,
  CSSResourcePlugin
} = require("fuse-box");
const OUTPUT_DIR = 'dist'; //!!!! chack package.json if changed !!!!
// const express = require("express");
// const path = require("path");
const { spawn } = require("child_process");
let DEV_PORT = 5444;
let production = false;
const optsRenderer = (prod) => ({
  homeDir: "src",
  // alias: {'@':`./${OUTPUT_DIR}`},
  output: `${OUTPUT_DIR}/renderer/$name.js`,
  hash: false,
  target: "electron",
  tsConfig: './tsconfig.json',
  sourceMaps: !prod,
  cache: !prod,
  debug: false,
  log: false,
  allowSyntheticDefaultImports: true,
  // shim: {
  //     electron: { exports: "global.require('electron')" },
  // },

});
Sparky.task("build:renderer", () => {
  const opts = optsRenderer(production);
  const fuse = FuseBox.init({
    ...opts,
    // debug:true,
    log: true,
    // ignoreModules: ["electron", "electron-store", "electron-in-page-search", "pdfmake"],
    // ignoreModules: ["events", "electron", "electron-store", "electron-in-page-search", "pdfmake", 'ssh2', 'moment-timezone', "fast-csv"],

    plugins: [
      EnvPlugin({ NODE_ENV: production ? "production" : "development" }),
      [SassPlugin(), CSSPlugin()],
      // JSONPlugin(),
      // CopyPlugin({ files: [".png", '.ttf', '.svg'] }),
      WebIndexPlugin({
        title: "FuseBox electron demo",
        template: "src/renderer/index.html",
        path: ".",
        bundles: ['vendor', 'renderer'],
        target: 'index.html',
      }),

      production && QuantumPlugin({
        // api: BundleStatsQuantumHook,
        bakeApiIntoBundle: 'vendor',
        target: opts.target,
        treeshake: true,
        removeExportsInterop: false,
        // ensureES5 : true,
        replaceTypeOf: false,
        // uglify : { es6: true,ecma :7, mangle:true, compress:true }
      }),


    ]
  });

  // console.log({...fuse});
  // return ;
  // const globalStyles = [
  //   [
  //     /node_modules.*(\.css|scss)$/,
  //     SassPlugin(),
  //     CSSResourcePlugin({
  //       dist: `${OUTPUT_DIR}/renderer/vendor/assets`,
  //       resolve: f => `vendor/assets/${f}`,
  //       inline: false,
  //     }),
  //     CSSPlugin({
  //       group: 'bundle-static.css',
  //       outFile: `${OUTPUT_DIR}/renderer/vendor.css`,
  //     }),
  //   ],
  // ];
  // const appStyes = [
  //   [
  //     SassPlugin(),
  //     CSSPlugin({
  //       group: 'app-static.css',
  //       outFile: `${OUTPUT_DIR}/renderer/app.css`,
  //     }),
  //   ],
  // ];
  // fuse.bundle("vendor")
  //   .instructions('~ renderer/index.tsx  + fuse-box-css');

  // fuse.bundle("app_static")
  //   .cache(false)
  //   .plugin(...appStyes)
  //   .instructions('!renderer/appStyles.ts');
  // fuse
  //   .bundle('vendor_style')
  //   .cache(false)
  //   .plugin(...globalStyles)
  //   .instructions('!renderer/vendorStyles.ts');

  // const appPlugins = [
  //   [
  //     SassPlugin(),
  //     CSSModulesPlugin(),
  //     CSSPlugin(),
  //   ],
  //
  // ];
  const app = fuse.bundle("renderer")
    // .splitConfig({})
    //   .plugin(...appPlugins)
      .instructions('>[renderer/index.tsx] + fuse-box-css')
  ;


  if (!production) {
    // Configure development server
    fuse.dev({ port: DEV_PORT++, httpServer: false });
    app
      .hmr()
      .watch()
  }

  return fuse.run()
});

Sparky.task("build:main", () => {
  const fuse = FuseBox.init({
    homeDir: "src/main",
    output: "dist/main/$name.js",
    target: "server",
    cache: !production,
    plugins: [
      EnvPlugin({ NODE_ENV: production ? "production" : "development" }),
      production && QuantumPlugin({
        bakeApiIntoBundle: 'main',
        target: 'server',
        treeshake: true,
        removeExportsInterop: false,
        uglify: true
      })
    ]
  });

  const app = fuse.bundle("main")
    .instructions('> [main.ts]');

  if (!production) {
    app.watch();

    return fuse.run().then(() => {
      // launch electron the app
      const child = spawn('yarn', ['run', 'start:electron:watch'], { shell: true, stdio: 'inherit' });
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

  return fuse.run()
});


// main task
Sparky.task("default", ["clean:dist", "clean:cache", "build:renderer", "build:main"], () => {
});

// wipe it all
Sparky.task("clean:dist", () => Sparky.src("dist/*").clean("dist/"));
// wipe it all from .fusebox - cache dir
Sparky.task("clean:cache", () => Sparky.src(".fusebox/*").clean(".fusebox/"));

// prod build
Sparky.task("set-production-env", () => production = true);
Sparky.task("dist", ["clean:dist", "clean:cache", "set-production-env", "build:main", "build:renderer"], () => {
});
