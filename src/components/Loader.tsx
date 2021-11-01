import React, { FC } from 'react';

import styles from './Loader.module.scss';

export enum LoaderSizeType {
  Large = 'Large',
  Medium = 'Medium',
  Small = 'Small',
}

interface InterfaceLoader {
  className?: string;
  size?: LoaderSizeType;
}

const Loader: FC<InterfaceLoader> = ({ className, size }: InterfaceLoader) => {
  return (
    <div
      className={`${styles.Loader} ${className ? className : ''} ${
        size ? size : ''
      }`}
      id={'marketplace_loader'}
    >
      <div className={styles.Box}>
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  );
};

export default Loader;
