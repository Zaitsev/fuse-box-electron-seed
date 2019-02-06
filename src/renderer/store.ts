import {AnyAction, createStore} from "redux";

interface Meta {
  scope?: string,
}

export class LocalActionCreator<T, P> implements AnyAction {
  readonly type: T;
  readonly payload!: P;
  readonly meta: Meta;

  constructor(type: T) {
    this.type = type;
    this.meta = {scope: 'local'}
  }

  // create = (payload: P) => ({ type: this.type, meta: this.meta, payload });
  create = (payload: P, meta?: Meta) => ({type: this.type, meta: {...this.meta, ...meta}, payload})
}

export type AppStore = typeof initial_state;


export const testActionCreators = {
  incrementCounter: new LocalActionCreator<'testReduxAction', { value: number }>('testReduxAction'),

};
export type TestActionsCreators = typeof testActionCreators[keyof typeof testActionCreators]

const initial_state    = {counter: 0};
const reducer          = (state = initial_state, action: TestActionsCreators): AppStore => {
  if (action.type === testActionCreators.incrementCounter.type) {
    return {...state, counter: state.counter + action.payload.value}
  }
  return state;
};
export const the_store = createStore(reducer);
