import api from 'akita';

api.setOptions({
  // @ts-ignore
  apiRoot: window.PREFIX,
  init: {
    credentials: 'include'
  }
});

export default api;
