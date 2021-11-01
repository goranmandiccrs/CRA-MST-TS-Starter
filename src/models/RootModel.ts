import {
  getSnapshot,
  IAnyModelType,
  ModelInstanceType,
  types,
} from 'mobx-state-tree';
import { toJS } from 'mobx';

import { RouterModel, PageModel, PageType } from '../internal';

export const RootModel: IAnyModelType = types
  .model({
    isDev: false,
    pages: types.optional(types.map(types.union(PageModel)), {}),
    router: RouterModel,
  })
  .views((self) => {
    return {
      get currentPageJSON(): PageType {
        return (
          self.pages.get(self.router?.currentView.id) as ModelInstanceType<
            any,
            any
          >
        ).toJSON();
      },
      get currentPage(): PageType {
        return self.pages.get(
          self.router?.currentView?.id
        ) as ModelInstanceType<any, any>;
      },
      get pagesArray(): PageType[] {
        return Array.from(self.pages.values());
      },
    };
  })
  .actions((self) => {
    return {
      afterCreate() {
        self.isDev = process.env.NODE_ENV === 'development';
        if (self.isDev) {
          Object.defineProperty(window, 'toJS', {
            get() {
              return toJS;
            },
          });
          Object.defineProperty(window, 'getSnapshot', {
            get() {
              return getSnapshot;
            },
          });
          Object.defineProperty(window, 'rootInstance', {
            get() {
              return self;
            },
          });
          Object.defineProperty(window, 'comps', {
            get() {
              return self.currentPage.components.toJSON();
            },
          });
          Object.defineProperty(window, 'values', {
            get() {
              return Object.values(self.currentPage.components.toJSON()).map(
                (comp: any) => comp.value
              );
            },
          });
          Object.defineProperty(window, 'page', {
            get() {
              return self.currentPageJSON;
            },
          });
        }
      },
      addPage(page: PageType) {
        self.pages.put(page);
      },
    };
  });
