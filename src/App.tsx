import React from "react";
import "./App.css";
import PropTypes from "prop-types";
import { useMst } from "./models/RootModel";
import { observer } from "mobx-react";
import { StateRouter } from "./utils/StateRouter";

const App = () => {
  const {
    router
  } = useMst();
  return (
    <StateRouter router={router} />
  );
};

App.propTypes = {
  state: PropTypes.object
};

export default observer(App);
