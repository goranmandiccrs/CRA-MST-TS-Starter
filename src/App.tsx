import React, { ReactElement } from 'react';
import './App.css';
import StateRouter from './utils/StateRouter';

function App(): ReactElement {
  return (
    <div className="App">
      <StateRouter />
    </div>
  );
}

export default App;
