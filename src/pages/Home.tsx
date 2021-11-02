import * as React from 'react';
import { useMst, PageRoutes } from '../internal';
import i18n from '../i18n';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const {
    router: { navigate },
  } = useMst();
  const { t } = useTranslation(['basic']);
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  return (
    <div>
      <button
        onClick={() => {
          navigate(PageRoutes.NotFound.id);
        }}
      >
        404
      </button>
      <div>
        <button onClick={() => changeLanguage('sr')}>sr</button>
        <button onClick={() => changeLanguage('en')}>en</button>
      </div>
      <div>{t('basic:button')}</div>
    </div>
  );
};
