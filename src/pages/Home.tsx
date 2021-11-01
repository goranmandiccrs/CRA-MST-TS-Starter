import * as React from 'react';
import { useMst, PageRoutes } from '../internal';

export const Home = (): JSX.Element => {
  const {
    router: { navigate },
  } = useMst();
  return (
    <div
      onClick={() => {
        navigate(PageRoutes.NotFound.id);
      }}
    >
      <button>404</button>
    </div>
  );
};
