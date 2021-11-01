import React, { Fragment } from 'react';
import { observer } from 'mobx-react';
import { useMst } from '../internal';
import Loader from '../components/Loader';

export const StateRouter = observer(() => {
  const { router } = useMst();

  return (
    <Fragment>
      {router.isLoading && <Loader />}
      {router.currentView && router.currentView.component
        ? React.cloneElement(router.currentView.component, router.props)
        : 'currentView not loaded yet or component is missing'}
    </Fragment>
  );
});

export default StateRouter;
