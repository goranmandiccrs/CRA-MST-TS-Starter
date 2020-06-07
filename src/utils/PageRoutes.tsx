import React from "react";
import { getParent, getRoot } from "mobx-state-tree";
import { Login } from "../pages/Login";
import {Home} from "../pages/Home";

window["getRoot"] = getRoot;
window["getParent"] = getParent;

export const PageRoutes = {
  Login: {
    component: <Login />,
    name: "Login",
    path: "/login",
    isAuthenticationRequired: false,
  },
  Home: {
    component: <Home />,
    name: "Home",
    path: "/",
    isAuthenticationRequired: false,
  }
};
export default PageRoutes;
