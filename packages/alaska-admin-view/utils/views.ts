import { Views } from '..';

const views: Views = {
  wrappers: {},
  components: {},
  routes: [],
  widgets: [],
  listTools: [],
  editorTools: [],
};

export default views;

export function setViews(data: Partial<Views>) {
  Object.assign(views, data);
}
