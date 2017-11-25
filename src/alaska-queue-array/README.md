# [alaska-queue-array](https://github.com/maichong/alaska-queue-array)
Alaska array queue driver

## Configure

```javascript

queue: {
  type: 'alaska-queue-array',
  key: 'myQueue',
  idle: 5, // idle drivers count
}

```

## Warning

This driver just for development environment.

You should use [alaska-queue-redis](https://github.com/maichong/alaska-queue-redis) or other driver instead, in production environment.

Because :

1. The queued data can not shared with multi node process.

2. The queued data will lost when node exited or crashed.

3. This driver may cause memory leak.

4. The `pop(timeout)` function is not timely.

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
