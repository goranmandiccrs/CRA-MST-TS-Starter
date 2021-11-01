import React from 'react';

import { ViewType } from '../internal';
import { NotFound } from '../pages/NotFound';
import { Home } from '../pages/Home';

type HookType = (
  view: ViewType,
  params: any,
  queryParams: Queries
) => Promise<boolean | void>;

interface IHooksInterface {
  beforeEnter?: HookType;
  onEnter?: HookType;
  beforeExit?: HookType;
  onExit?: HookType;
  queryParams?: Queries;
}

export type Query = {
  name: string;
  required: boolean;
};

export type Queries = {
  [key: string]: Query | boolean | string;
};

interface IPageRoute {
  component: React.ComponentElement<any, any>;
  name: string;
  path: string;
  isAuthenticationRequired: boolean;
  hooks?: IHooksInterface;
  id: string;
  queryParams?: Queries;
  functionality?: string;
  extension?: any;
}

interface IPageRoutes {
  [key: string]: IPageRoute;
}

export const PageRoutes: IPageRoutes = {
  NotFound: {
    component: <NotFound />,
    name: 'Not Found',
    path: '/404',
    id: 'NotFound',
    isAuthenticationRequired: false,
  },
  Home: {
    component: <Home />,
    name: 'Home',
    path: '/',
    id: 'Home',
    isAuthenticationRequired: false,
  },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
