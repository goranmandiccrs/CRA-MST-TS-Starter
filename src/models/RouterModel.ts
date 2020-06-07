import {
  types,
  flow,
  getRoot,
  getSnapshot,
  applySnapshot,
} from "mobx-state-tree";
import { keys } from "mobx";
import View from "./ViewModel";
import route from "path-match";
import { reaction } from "mobx";
import { createBrowserHistory } from "history";
import { RootType } from "./RootModel";
import PageRoutes from "../utils/PageRoutes";

export const RouterModel = types
  .model("RouterModel", {
    views: types.map(View),
    currentView: types.maybeNull(types.reference(View)),
    nextView: types.maybeNull(types.reference(View)),
    params: types.frozen(),
    queryParams: types.frozen(),
    props: types.frozen(),
    isLoading: false,
  })
  .views((self) => {
    return {
      get root() {
        return getRoot(self);
      },
      get viewsArray() {
        return Array.from(self.views.values());
      },
    };
  })
  .actions((self) => {
    const _spinWait = (resolve) => setTimeout(resolve, 100);
    let _runningSetView = null;
    let _queuedSetView = null;
    return {
      setLoading(isLoading) {
        self.isLoading = isLoading;
      },
      setView: flow(
        function*(view, params, queryParams) {
          const thisSetView = {
            key: view.formatUrl(params, queryParams),
            view: view,
            params: params,
            queryParams,
          };

          /*if (_runningSetView) {
            // if setView is already running or queued on this route, ignore
            if (
              _runningSetView.key === thisSetView.key ||
              (_queuedSetView && _queuedSetView.key === thisSetView.key)
            ) {
              return;
            }

            _queuedSetView = thisSetView;

            // spin this thread until it is no longer queued
            while (_queuedSetView) {
              yield new Promise(_spinWait);
            }

            // check that this is still the setView to process
            if (_runningSetView.key !== thisSetView.key) {
              return;
            }
          }*/
          self.nextView = view.name;
          _runningSetView = thisSetView;

          // save a snapshot to rollback to if something goes wrong
          const rootSnapshot = getSnapshot(self.root);

          const rollback = () => {
            applySnapshot(self.root, rootSnapshot);

            if (_queuedSetView) {
              _runningSetView = _queuedSetView;
              self.currentView = _runningSetView.view;
              self.params = _runningSetView.params;
              _queuedSetView = null;
            } else {
              self.isLoading = false;
            }
          };
          const redirectToLogin = () => {
            self.currentView = self.views.get(PageRoutes.Login.name);
            self.isLoading = false;
            _runningSetView = null;
          };
          const redirectToHome = () => {
            self.currentView = self.views.get(PageRoutes.Home.name);
            self.isLoading = false;
            _runningSetView = null;
          };
          // before exit old view
          const oldView = self.currentView;
          const oldParams = self.params;

          if (oldView && oldView.beforeExit) {
            if ((yield oldView.beforeExit(oldParams, queryParams)) === false) {
              return rollback();
            }
          }

          // check if route has been changed
          if (_queuedSetView) return rollback();

          // block out page for loading
          this.setLoading(true);

          // update current url
          self.queryParams =
            queryParams ||
            (!self.currentView &&
              Object.fromEntries(
                new URLSearchParams(window.location.search).entries(),
              ));
          self.currentView = view;
          self.params = params || {};

          if (view.isAuthenticationRequired) {
            if (this.checkAuthentication()) {
              if (view.beforeEnter) {
                if (
                  (yield view.beforeEnter(params, self.queryParams)) === false
                ) {
                  return rollback();
                }
              }
            } else {
              return redirectToLogin();
            }
          } else {
            if (!this.checkAuthentication()) {
              if (view.beforeEnter) {
                if (
                  (yield view.beforeEnter(params, self.queryParams)) === false
                ) {
                  return rollback();
                }
              }
            } else {
              return redirectToHome();
            }
          }

          // check if route has been changed
          if (_queuedSetView) return rollback();

          // on exit old view
          if (oldView && oldView.onExit) {
            yield self.currentView.onExit(oldParams, self.queryParams);
          }

          // check if route has been changed
          if (_queuedSetView) return;

          // free up page to render
          self.props = self.props || {};
          this.setLoading(false);

          // on enter new view
          if (view.onEnter) {
            yield view.onEnter(params, self.queryParams);
          }

          // check if route has been changed
          if (_queuedSetView) return;

          _runningSetView = null;
          self.nextView = null;
        }.bind(self),
      ),
    };
  })
  .views((self) => ({
    get currentUrl() {
      return self.currentView
        ? self.currentView.formatUrl(self.params, self.queryParams)
        : "";
    },
    get routes() {
      let routes = {};
      let keyList = keys(self.views);
      keyList.forEach((k: string) => {
        const view = self.views.get(k);
        routes[view.path] = (params) => self.setView(view, params);
      });
      return routes;
    },
  }))
  .actions((self) => {
    let _history = null;

    return {
      setHistory(history) {
        _history = history;
      },
      goBack() {
        _history.goBack();
      },
      goForward() {
        _history.goForward();
      },
      setProps(props) {
        self.props = props;
      },
      checkAuthentication() {
        //TODO: implement async check for auth
        return true;
      },
    };
  });

const createRouter = (routes) => {
  const matchers = Object.keys(routes).map((path) => [
    route()(path),
    routes[path],
  ]);
  return (path) => {
    return matchers.some(([matcher, f]) => {
      const result = matcher(path);
      if (result === false) return false;
      f(result);
      return true;
    });
  };
};

export const startRouter = (routerStore) => {
  const history = createBrowserHistory();
  routerStore.setHistory(history);

  const routes = createRouter(routerStore.routes);

  // call router.setView when url has been changed by back button
  history.listen((location, action) => {
    switch (action) {
      case "POP":
        routes(location.pathname);
        break;
      default:
        break;
    }
  });

  // update browser url based on router.currentUrl
  reaction(
    () => routerStore.currentUrl,
    (url) => {
      if (history.location.pathname !== url) {
        history.push(url);
      }
    },
  );

  // route to current url
  routes(history.location.pathname);
};
export default RouterModel;
