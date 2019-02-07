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
  JSONPlugin
} = require("fuse-box");

const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

let production = false;
OUTPUT_DIR = 'dist';
let DEV_PORT = 5444;
Sparky.task("build:renderer", () => {

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
    homeDir: "src",
    output: "dist/renderer/$name.js",
    hash: production,
    target: "electron",
    ignoreModules: ["electron"],
    cache: !production,
    // useJsNext: true,
    natives: {
      process: true,
      Buffer: false,
      http: false,
      stream: false,
    },
    sourceMaps: { project: true, vendor: false },
    plugins: [

      EnvPlugin({ NODE_ENV: production ? "production" : "development" }),
      globalStyles,
      [SassPlugin(), CSSModulesPlugin(), CSSPlugin()],
      // globalStyles,
      WebIndexPlugin({
        title: "FuseBox electron demo",
        template: "src/renderer/index.html",
        path: "."
      }),
      production && QuantumPlugin({
        bakeApiIntoBundle: 'vendor',
        target: 'electron',
        treeshake: true,
        removeExportsInterop: false,
        // replaceTypeOf       : false,
        // terser: {sourceMap :true}
      }),
      // TerserPlugin({
      //   sourceMap: true, compress: false, mangle: {
      //     toplevel: true,
      //   },
      // }),

    ]
  });

  if (!production) {
    // Configure development server
    // fuse.dev({ port: DEV_PORT++, httpServer: false });
    fuse.dev({ root: false }, server => {
      const dist = path.join(__dirname, "dist");
      const app = server.httpServer.app;
      app.use("/renderer/", express.static(path.join(dist, 'renderer')));
      app.get("*", function (req, res) {
        res.sendFile(path.join(dist, "renderer/index.html"));
      });
    })
  }
  const vendor = fuse.bundle("vendor")
    .instructions('~ renderer/index.tsx + fuse-box-css');
  const app = fuse.bundle("renderer")
    .instructions('!> [renderer/index.tsx ]');
  // const app = fuse.bundle("renderer")
  //   .instructions('> renderer/index.tsx + fuse-box-css');

  if (!production) {
    app.hmr().watch()
  }

  return fuse.run()
});

Sparky.task("build:main", () => {
  const fuse = FuseBox.init({
    homeDir: "src",
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
        uglify: false
      })
    ]
  });

  const app = fuse.bundle("main")
    .instructions('> [main/main.ts]');

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

  return fuse.run()
});


// main task
Sparky.task("default", ["clean:dist", "clean:cache", "build:renderer", "build:main"], () => {
});

// wipe it all
Sparky.task("clean", ["clean:dist", "clean:cache"]);
Sparky.task("clean:dist", () => Sparky.src("dist/*").clean("dist/"));
// wipe it all from .fusebox - cache dir
Sparky.task("clean:cache", () => Sparky.src(".fusebox/*").clean(".fusebox/"));

// prod build
Sparky.task("set-production-env", () => production = true);
Sparky.task("dist", ["clean:dist", "clean:cache", "set-production-env", "build:main", "build:renderer"], () => {
});
