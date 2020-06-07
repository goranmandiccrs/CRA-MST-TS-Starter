import { types, flow, getRoot } from "mobx-state-tree";

const View = types
  .model("View", {
    component: types.frozen(),
    name: types.identifier,
    path: "",
    isAuthenticationRequired: true,
    hooks: types.optional(types.frozen(), {})
  })
  .views(self => ({
    get root() {
      return getRoot(self);
    },
    get router() {
      return this.root.router;
    }
  }))
  .actions(self => ({
    formatUrl: (params, queryParams = {}) => {
      if (!params) return self.path;

      let url = self.path;

      for (let k in params) {
        url = url.replace(`:${k}`, params[k]);
      }
      Object.keys(queryParams).forEach((q, index) => {
        url += `${!index ? "?" : ""}${q}=${queryParams[q]}`;
        // url = url.replace(`:${q}`, queryParams[q]);
      });

      return url;
    },
    beforeEnter: flow(function*(params, queryParams) {
      if (self.hooks.beforeEnter) {
        yield Promise.resolve(
          self.hooks.beforeEnter(self, params, queryParams)
        );
      }
    }),
    onEnter: flow(function*(params, queryParams) {
      if (self.hooks.onEnter) {
        yield Promise.resolve(self.hooks.onEnter(self, params, queryParams));
      }
    }),
    beforeExit: flow(function*(params, queryParams) {
      if (self.hooks.beforeExit) {
        yield Promise.resolve(self.hooks.beforeExit(self, params, queryParams));
      }
    }),
    onExit: flow(function*(params, queryParams) {
      if (self.hooks.onExit) {
        yield Promise.resolve(self.hooks.onExit(self, params, queryParams));
      }
    })
  }));

export default View;
