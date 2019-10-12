import {AnyAction, applyMiddleware, compose, createStore, Middleware} from "redux";
const actionCreators = {};
// If Redux DevTools Extension is installed use it, otherwise use Redux compose
/* eslint-disable no-underscore-dangle */
export const composeEnhancers: typeof compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                                                   // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
                                                   actionCreators,
                                                 }) as any)
  : compose;

interface Meta {
  scope?: string;
}
declare const window: Window & {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?(a: any): void,
};

export class LocalActionCreator<T, P> implements AnyAction {
  readonly type: T;
  readonly payload!: P;
  readonly meta: Meta;

  constructor(type: T) {
    this.type = type;
    this.meta = {scope: 'local'};
  }

  // create = (payload: P) => ({ type: this.type, meta: this.meta, payload });
  create = (payload: P, meta?: Meta) => ({type: this.type, meta: {...this.meta, ...meta}, payload});
}

export type AppStore = typeof initial_state;

export const testActionCreators = {
  incrementCounter: new LocalActionCreator<'testReduxAction', { value: number }>('testReduxAction'),

};
export type TestActionsCreators = typeof testActionCreators[keyof typeof testActionCreators];

const initial_state    = {counter: 0};
const reducer          = (state = initial_state, action: TestActionsCreators): AppStore => {
  if (action.type === testActionCreators.incrementCounter.type) {
    return {...state, counter: state.counter + action.payload.value};
  }
  return state;
};
//add middleware here,empty is required for Redux de tools
const middleware:Middleware[] =[];
const enhancer = composeEnhancers(applyMiddleware(...middleware));
export const the_store = createStore(reducer,initial_state,enhancer);
