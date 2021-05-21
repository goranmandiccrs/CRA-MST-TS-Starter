import React from "react";
import { getParent, getRoot } from "mobx-state-tree";
import { Login } from "../pages/Login";
import { Home } from "../pages/Home";
import { OtherPage } from "../pages/OtherPage";

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
    isAuthenticationRequired: true,
  },
  OtherPage: {
    component: <OtherPage />,
    name: "OtherPage",
    path: "/other",
    isAuthenticationRequired: true,
  },
};
export default PageRoutes;
