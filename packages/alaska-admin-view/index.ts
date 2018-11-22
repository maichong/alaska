import store from './redux/index';
import App from './views/App';
import api from './utils/api';
import query from './utils/query';
import { } from 'alaska-admin-view';

//@ts-ignore
window.query = query;

export { store, App, api, query };
