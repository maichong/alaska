import * as React from 'react';
import { Router } from 'alaska-http';

export default function (router: Router) {
  router.get('/', async (ctx) => {
    ctx.body = <h1>Home page</h1>;
  });
  router.get('/about', async (ctx) => {
    ctx.body = 'alaska 14';
  });
}
