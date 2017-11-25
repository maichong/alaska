# [alaska-queue-redis](https://github.com/maichong/alaska-queue-redis)
Alaska redis queue driver

## configure

```javascript

queue: {
  type: 'alaska-queue-redis',
  key: 'myQueue',
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
