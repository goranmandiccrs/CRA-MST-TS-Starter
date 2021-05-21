import { types } from "mobx-state-tree";

export const LoginModel = types
  .model("LoginModel", {
    isLoggedIn: false,
  })
  .actions((self) => {
    return {
      setIsLoggedIn(isLoggedIn) {
        self.isLoggedIn = isLoggedIn;
      },
    };
  });
