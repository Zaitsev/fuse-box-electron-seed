const explorer = require("source-map-explorer");
// @ts-ignore
import path from "path";

type Sjson = {
  totalBytes: number,
  unmappedBytes: number,
  files: { [index: string]: number }
}

class BundleStats {
  private listFileName: string                                                                     = 'stats-list.json';
  private the_map: Map<string, { name: string, id: string, parent: string | null, size?: number }> = new Map();
  private produced: Map<string, Map<string, { path: string, size: number }>>                       = new Map();

  public restCollection() {
    this.the_map  = new Map();
    this.produced = new Map();
    return this;
  }

  private pushPath(root: string, fullName: string, size: number) {
    // console.log(fullName);
    let parents: string[] = (fullName.startsWith('/') ? fullName.slice(-1) : fullName).split('/');
    let parent            = root;
    parent                = parents.slice(0, -1).reduce((id, name) => {
      parent = id;
      id += '/' + name;
      this.the_map.set(id, {parent, id, name});
      return id;
    }, parent);
    this.the_map.set(fullName, {name: parents.slice(-1)[0], parent, id: root + '/' + fullName, size});

  }

  run(bundleName: string) {
    const {files}: Sjson = explorer(path.join(__dirname, "../../dist", bundleName));
    this.the_map         = new Map([[bundleName, {id: bundleName, parent: null, name: bundleName}]]);
    for (let file in files) {
      const fullname = file.startsWith('/') ? file.slice(1) : file
      this.pushPath(bundleName, fullname, files[file]);
    }
    console.log(this.the_map);
  }
}

console.log("init");
const s = new BundleStats();
s.restCollection().run("renderer/renderer.js");
