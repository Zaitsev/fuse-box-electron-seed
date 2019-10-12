import {THooks} from "~/shared/hooks";
const debug = require('~/shared/log').debug('main:plugin');
debug.enabled=true;
export function init(Hooks:THooks){
    debug("Im init",__dirname)
}
