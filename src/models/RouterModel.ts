import {
  applySnapshot,
  flow,
  getRoot,
  getSnapshot,
  IAnyModelType,
  Instance,
  SnapshotIn,
  types,
} from 'mobx-state-tree';
import { keys, reaction } from 'mobx';
import { createBrowserHistory } from 'history';
import {
  ViewModel,
  IQueryParams,
  RootType,
  ViewType,
  PageRoutes,
  Query,
} from '../internal';

import { route } from '../utils/PathMatch';

type RouteDictionary = {
  [key: string]: (params: any) => Promise<any>;
};
type RouteFuncType = (params: any) => Promise<any>;

export const RouterModel: IAnyModelType = types
  .model('RouterModel', {
    views: types.optional(types.map(ViewModel), PageRoutes),
    currentView: types.maybe(types.reference(ViewModel)),
    nextView: types.maybeNull(types.reference(ViewModel)),
    params: types.frozen(),
    queryParams: types.frozen(),
    props: types.frozen(),
    history: types.frozen(),
    isLoading: false,
    shouldReplace: false,
    oldView: types.maybe(types.reference(ViewModel)),
    goingBack: false,
    isStarted: false,
  })
  .views((self) => {
    return {
      get viewsArray(): ViewType[] {
        return Array.from(self.views.values());
      },
    };
  })
  .actions((self) => {
    return {
      start() {
        self.isStarted = true;
      },
      setHistory(history: any) {
        self.history = history;
      },
      rollback(selfSnapshot: SnapshotIn<typeof ViewModel>, isAuth: boolean) {
        if (self.currentView) {
          applySnapshot(self, selfSnapshot);
        } else {
          if (isAuth) {
            this.redirectToHome();
          } else {
            this.redirectToLogin();
          }
          self.isLoading = false;
        }
        if (
          self.history.location.pathname !== (self as RouterType).currentUrl
        ) {
          console.log('pushing 2');
          self.history.push((self as RouterType).currentUrl, {});
          self.history.replace({
            pathName: (self as RouterType).currentUrl,
            search: ' ',
          });
        }
      },
      redirectToLogin() {
        this.navigate(PageRoutes.SignIn.id, {}, {}, true);
      },
      redirectToHome() {
        this.navigate(PageRoutes.Home.id, {}, {}, true);
      },

      setIsLoading(isLoading: boolean) {
        self.isLoading = isLoading;
      },
      inferView(newView: string | ViewType): ViewType {
        const root: RootType = getRoot(self);
        if (typeof newView === 'string') {
          return root.router.views.get(newView);
        } else {
          return newView;
        }
      },
      setView(view: ViewType) {
        self.currentView = view;
        self.nextView = null;
        self.isLoading = false;
      },
      setGoingBack(goingBack: boolean) {
        self.goingBack = goingBack;
      },
      navigate: flow(
        function* (
          this: RouterType,
          newView: ViewType | string,
          params: any = {},
          queryParams: { [k: string]: string } = {},
          shouldReplace?: boolean
        ) {
          if (!newView) {
            return;
          }
          if (shouldReplace) {
            self.history.replace(this.currentUrl, {});
          }
          const view = this.inferView(newView);
          let isAuth: boolean;
          try {
            isAuth = yield this.asyncCheckAuthentication();
          } catch (e) {
            isAuth = false;
          }
          self.nextView = view;

          // save a snapshot to rollback to if something goes wrong
          const selfSnapshot = getSnapshot(self);

          // before exit old view
          self.oldView = self.currentView;
          const oldParams = self.params;

          if (self.oldView && self.oldView.beforeExit) {
            yield self.oldView.beforeExit(oldParams, queryParams);
          }

          // block out page for loading
          this.setIsLoading(true);

          if (
            !view.queryParamsArray
              .filter((q: Query) => q.required)
              .every((q: Query) => {
                // eslint-disable-next-line no-prototype-builtins
                return queryParams?.hasOwnProperty(q.name);
              })
          ) {
            return this.rollback(selfSnapshot, isAuth);
          }
          // update current url
          self.queryParams = queryParams || {};
          self.params = params || {};
          if (view.isAuthenticationRequired) {
            if (isAuth) {
              try {
                yield view.beforeEnter(params, self.queryParams);
              } catch (e: any) {
                return this.rollback(selfSnapshot, isAuth);
              }
            } else {
              return this.redirectToLogin();
            }
          } else {
            if (!isAuth) {
              try {
                yield view.beforeEnter(params, self.queryParams);
              } catch (e) {
                return this.rollback(selfSnapshot, isAuth);
              }
            } else {
              return this.redirectToHome();
            }
          }

          // free up page to render
          self.props = self.props || {};
          this.setIsLoading(false);

          this.setView(view, self.oldView, params);
          // on exit old view
          if (self.oldView && self.oldView.onExit && self.oldView !== view) {
            yield self.oldView?.onExit(oldParams, self.queryParams);
          }
          // on enter new view
          if (view.onEnter) {
            yield view.onEnter(self.params, self.queryParams);
          }
        }.bind(self)
      ),
    };
  })
  .views((self) => ({
    get currentUrl() {
      return self.currentView
        ? self.currentView.formatUrl(self.params, self.queryParams)
        : '';
    },
    get routes() {
      const routes: {
        [key: string]: RouteFuncType;
      } = {};
      const keyList = keys(self.views);
      keyList.forEach((k) => {
        const view = self.views.get(k.toString());
        if (view?.path) {
          routes[view.path] = (params: any) => {
            const urlSearchParams = new URLSearchParams(window.location.search);
            const queryParams = Object.fromEntries(urlSearchParams.entries());
            return self.navigate(view, params, queryParams);
          };
        }
      });
      return routes;
    },
  }))
  .actions((self) => {
    return {
      setShouldReplace(shouldReplace: boolean) {
        self.shouldReplace = shouldReplace;
      },
      asyncCheckAuthentication: flow(function* (): Generator<any, any, any> {
        yield true;
      }),
      findView(path: string): ViewType | undefined {
        return self.viewsArray.find((view: ViewType) => {
          return view.path === path;
        });
      },
      formatUrl: (
        path: string,
        params: any,
        queryParams: IQueryParams = {}
      ) => {
        if (!params && !queryParams) return path;

        let url = path;

        for (const k in params) {
          url = url.replace(`:${k}`, params[k]);
        }
        const length = Object.keys(queryParams).length;
        Object.keys(queryParams).forEach((q, index) => {
          url += `${!index ? '?' : ''}${
            index > 0 && index < length ? '&' : ''
          }${q}=${queryParams[q]}`;
          // url = url.replace(`:${q}`, queryParams[q]);
        });

        return url;
      },
    };
  });

const createRouter = (routes: RouteDictionary, routerStore: RouterType) => {
  const matchers = Object.keys(routes).map((path: string) => {
    return [route()(path), routes[path]];
  });
  return (path: string) => {
    const res = matchers.some(([matcher, f]) => {
      const result = matcher(path.split('?')[0]);
      if (result === false) return false;
      f(result);
      return true;
    });
    if (!res) {
      routerStore.setView(PageRoutes.NotFound.id);
      routerStore.history.replace(PageRoutes.NotFound.path, {});
    }
  };
};

export const startRouter = (routerStore: RouterType): void => {
  const routes = createRouter(routerStore.routes, routerStore);
  routerStore.setHistory(createBrowserHistory());

  // call router.navigate when url has been changed by back button
  routerStore.history.listen(
    ({
      location,
      action,
    }: {
      location: { pathname: string; search: string };
      action: string;
    }) => {
      switch (action) {
        case 'POP':
          {
            routerStore.setGoingBack(true);
            routes(`${location.pathname}${location.search}`);
          }
          break;
        default:
          break;
      }
    }
  );

  reaction(
    () => routerStore.nextView,
    (nextView) => {
      const newUrl = routerStore.formatUrl(
        routerStore.history.location.pathname,
        routerStore.params,
        routerStore.queryParams
      );
      if (
        nextView === null &&
        (newUrl !== `${window.location.pathname}${window.location.search}` ||
          routerStore.oldView?.id !== routerStore.currentView?.id)
      ) {
        if (!routerStore.goingBack) {
          if (!routerStore.isStarted) {
            routerStore.start();
            routerStore.history.replace({
              pathName: routerStore.currentUrl,
              search: ' ',
            });
          } else {
            console.log('pushing ');
            routerStore.history.push(routerStore.currentUrl, {});
          }
        } else {
          routerStore.setGoingBack(false);
        }
        if (
          !Object.keys(routerStore.queryParams).length &&
          !Object.keys(routerStore.params).length
        ) {
          routerStore.history.replace({
            pathName: routerStore.currentUrl,
            search: ' ',
          });
        }
      }
      routerStore.length = Math.max(window.history.length, routerStore.length);
    }
  );
  reaction(
    () => routerStore.currentView,
    (currentView) => {
      document.title = currentView?.name;
    }
  );

  // route to current url
  routes(routerStore.history.location.pathname);
};

export type RouterType = Instance<typeof RouterModel>;
