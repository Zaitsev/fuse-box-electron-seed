import {Component, FunctionComponent} from 'react';
import {Layout}                       from 'react-grid-layout';

interface HookLayout extends Layout {
  collapsed?: JSX.Element | string | Component;
}

export type HookComponent = FunctionComponent<HookWidgetProps>;
export type HookCollapsedComponent = FunctionComponent;

export interface HookWidgetProps {
  width: number,
  height: number
}

export type HookWidget = [HookLayout, HookComponent, HookCollapsedComponent]

export type HookWidgetsArray = HookWidget[]
export type HookTags = string | string[];
export type HookAction = (options?: any) => void
export type HookFilter<T extends any> = (value: T, options?: any) => T

export interface THooks {
  actions: { [tag: string]: { priority: number, callback: HookAction }[] },
  filters: { [tag: string]: { priority: number, callback: HookFilter<any> }[] },
  add_action: (tag: string, callback: HookAction, priority?: number) => void,
  remove_action: (tag: string, callback: HookAction) => void,
  do_action: (tag: string, options?: any) => void,

  add_filter: <T>(tag: HookTags, callback: HookFilter<T>, priority?: number) => void,
  remove_filter: <T>(tag: string, callback: HookFilter<T>) => void,
  apply_filters: <T>(tag: string, value: T, options?: any) => T
}

export {Hooks}                        from "./hooks";
