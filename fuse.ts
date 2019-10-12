import {fusebox, pluginSass, sparky} from "fuse-box";

class Context {
  isProduction;
  runServer;

  getMainConfig() {
    return fusebox({
                     output         : "dist/main/$name-$hash",
                     target         : "electron",
                     homeDir        : "src/main",
                     entry          : "main.ts",
                     useSingleBundle: true,
                     dependencies   : {ignoreAllExternal: true},
                     logging        : {level: "succinct"},
                     cache          : {
                       enabled: true,
                       root   : ".cache/main"
                     }
                   });
  }

  launch(handler) {
    handler.onComplete(output => {
      output.electron.handleMainProcess();
    });
  }

  getRendererConfig() {
    return fusebox({
                     output      : "dist/renderer/$name-$hash",
                     target      : "electron",
                     // homeDir     : "src/renderer",
                     entry       : "src/renderer/index.tsx",
                     link: {
                       useDefault: true,
                       resourcePublicRoot: './resources'
                     },
                     resources: {
                       // resourceFolder: 'dist/renderer/resources/',
                       resourcePublicRoot: './resources',
                     },
                     // dependencies: {include: ["tslib"]},
                     logging     : {level: "succinct"},
                     plugins: [
                       pluginSass('*.scss', {
                         asModule: { scopeBehaviour: 'local' },
                       })
                     ],
                     webIndex    : {
                       publicPath: "./",
                       template  : "src/renderer/index.html"
                     },
                     cache       : {
                       enabled: true,
                       FTL:false,
                       root   : ".cache/renderere"
                     },
                     devServer   : {
                       httpServer: false,
                       hmrServer : {port: 7878}
                     }
                   });
  }
}

const {task, rm} = sparky<Context>(Context);
task('clean', async ctx=>{
  await rm("./dist");
  await rm("./.cache");
  await rm("./.fusebox");
})

task("default", async ctx => {


  const rendererConfig = ctx.getRendererConfig();
  await rendererConfig.runDev();

  const electronMain = ctx.getMainConfig();
  await electronMain.runDev(handler => ctx.launch(handler));
});

task("dist", async ctx => {
  await rm("./dist");

  const rendererConfig = ctx.getRendererConfig();
  await rendererConfig.runProd({uglify: false});

  const electronMain = ctx.getMainConfig();
  await electronMain.runProd({
                               uglify  : true,
                               manifest: true,
                               handler : handler => ctx.launch(handler)
                             });
});
