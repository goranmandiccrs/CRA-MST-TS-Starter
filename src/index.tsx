import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import Loader from './components/Loader';
import './assets/styles/index.scss';
import { rootInstance, Provider } from './internal';

window.addEventListener(
  'dragover',
  function (e) {
    e.preventDefault();
  },
  false
);
window.addEventListener(
  'drop',
  function (e) {
    e.preventDefault();
  },
  false
);

if (document.getElementById('root')) {
  ReactDOM.render(
    <React.StrictMode>
      <Suspense fallback={<Loader />}>
        <Provider value={rootInstance}>
          <App />
        </Provider>
      </Suspense>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorkerRegistration.unregister();
