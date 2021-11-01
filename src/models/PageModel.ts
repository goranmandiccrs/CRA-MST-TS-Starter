import { destroy, detach, Instance, types } from 'mobx-state-tree';
import { ComponentModel, ComponentModelType } from '../internal';

const comps = [ComponentModel];

export const PageModel = types
  .model('PageModel', {
    id: types.identifier,
    components: types.optional(types.map(types.union(...comps)), {}),
  })
  .views((self) => {
    return {
      get componentsArray() {
        return Array.from(self.components.values());
      },
    };
  })
  .actions((self) => {
    return {
      clearData() {
        self.componentsArray.forEach((component) => {
          detach(component);
        });
        self.components.clear();
      },
      addComponent(component: ComponentModelType) {
        self.components.put(component);
        return self.components.get(component.id);
      },
      removeComponent(id: string) {
        const component = self.components.get(id);
        self.components.delete(id);
        destroy(component);
      },
      clearValidators() {
        self.componentsArray.forEach((component) => {
          component.setCurrentMessage('');
        });
      },
      runValidators(): boolean {
        let result = true;
        self.componentsArray.forEach((component) => {
          component.runValidators();
          if (result && component.currentMessage) {
            result = false;
          }
        });
        return result;
      },
    };
  });
export type PageType = Instance<typeof PageModel>;
