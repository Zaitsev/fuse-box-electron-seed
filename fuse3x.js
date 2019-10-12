const { buildRenderer, buildMain } = require('./src/fuse-task');
const { Sparky, } = require("fuse-box");


let production = false;
let upgradetools = false;
const OUTPUT_DIR = 'dist';
let DEV_PORT = 5444;
Sparky.task("build:renderer", () => {
  console.log('---------- building -----------')
  return buildRenderer(OUTPUT_DIR, production, DEV_PORT)
});

Sparky.task("build:main", () => {
  return buildMain(OUTPUT_DIR, [],production, upgradetools);
});


// main task
Sparky.task("default",
   ["clean:dist", "clean:cache", "build:renderer", "build:main"],
  () => {
  console.log('-------------------- default ---------------')
});
Sparky.task("upgrade:tools", ["set-upgrade-tools-env", "default"], () => {
});
// wipe it all
Sparky.task("clean", ["clean:dist", "clean:cache"]);
Sparky.task("clean:dist", () => Sparky.src("dist/*").clean("dist/"));
// wipe it all from .fusebox - cache dir
Sparky.task("clean:cache", () => Sparky.src(".fusebox/*").clean(".fusebox/"));

// prod build
Sparky.task("set-production-env", () => production = true);
Sparky.task("set-upgrade-tools-env", () => upgradetools = true);
Sparky.task("dist", ["clean:dist", "clean:cache", "set-production-env", "build:main", "build:renderer"], () => {
});
