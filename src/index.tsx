import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { toJS } from "mobx";
import { Provider, MobxProvider, rootInstance, mobxStore } from "./models/RootModel";
import { applySnapshot, getSnapshot } from "mobx-state-tree";

window["toJS"] = toJS;
window["rootInstance"] = rootInstance;
window["mobxStore"] = mobxStore;
window["getSnapshot"] = getSnapshot;
window["applySnapshot"] = applySnapshot;

ReactDOM.render(
  <MobxProvider value={mobxStore}>
    <Provider value={rootInstance}>
      <App />
    </Provider>
  </MobxProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
