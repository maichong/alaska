import fetch from 'node-fetch';
import akita from 'akita';

akita.setOptions({ fetch, apiRoot: window.PREFIX || '.' });

export default akita;
