const Path = require('path');

exports.components = {
  OrderPreview: Path.join(__dirname, '/previews/OrderPreview.tsx'),
};

exports.wrappers = {
  Copyright: [Path.join(__dirname, '/wrappers/CopyrightWrapper.tsx')],
};

exports.widgets = [
  Path.join(__dirname, '/widgets/ButtonWidget.tsx'),
  Path.join(__dirname, '/widgets/DropdownWidget.tsx'),
];

exports.listTools = [
  Path.join(__dirname, '/tools/TestTools.tsx'),
];

exports.editorTools = [
  Path.join(__dirname, '/tools/EditorTools.tsx'),
];

exports.routes = [
  {
    component: `${__dirname}/TestPage.tsx`,
    path: '/test',
  },
];
