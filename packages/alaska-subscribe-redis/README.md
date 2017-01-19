# alaska-subscribe-redis
Alaska redis subscribe/publish driver

## configure

```javascript

subscribe: {
  type: 'alaska-subscribe-redis',
  channel: 'myChannel',
  idle: 5, // idle drivers count
  // The connection URI string
  url: 'redis://localhost/0',
  //more https://github.com/NodeRedis/node_redis#options-is-an-object-with-the-following-possible-properties
}

```

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
