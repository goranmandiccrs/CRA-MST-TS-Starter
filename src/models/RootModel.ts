import { Instance, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { observable } from "mobx";
import { RouterModel, startRouter } from "./RouterModel";
import PageRoutes from "../utils/PageRoutes";
import { LoginModel } from "./LoginModel";

export const RootModel = types
  .model("Root", {
    router: RouterModel,
    login: LoginModel,
  })
  .actions((self) => {
    return {
      resetApi() {
        // @ts-ignore
        self.api.init(baseUrl);
      },
    };
  });

export const mobxStore = observable({
  name: "mobx",
});

export type MobxStoreInstance = typeof mobxStore;
export type RootInstance = Instance<typeof RootModel>;
const RootStoreContext = createContext<null | RootInstance>(null);
const MobxStoreContext = createContext<null | MobxStoreInstance>(null);
export const MobxProvider = MobxStoreContext.Provider;
export const Provider = RootStoreContext.Provider;
export function useMst() {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider");
  }
  return store as RootInstance;
}
export function useMobx() {
  const store = useContext(MobxStoreContext);
  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider");
  }
  return store as MobxStoreInstance;
}

export const rootInstance = RootModel.create({
  router: {
    views: PageRoutes,
  },
  login: {
    isLoggedIn: false,
  },
});
startRouter(rootInstance.router);
export interface RootType extends Instance<typeof rootInstance> {}
