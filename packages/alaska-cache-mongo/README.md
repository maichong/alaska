# [alaska-cache-mongo](https://github.com/maichong/alaska-cache-mongo)
Alaska MongoDB cache driver

## configure

```javascript

cache: {
  type: 'alaska-cache-mongo',
  // The connection URI string
  url: 'mongodb://localhost/mydb',
  // The cache collection
  collection: 'caches',
  // Default maximum age in milliseconds, 0 for forever
  maxAge: 3600 * 1000,
  //more http://mongodb.github.io/node-mongodb-native/2.1/api/MongoClient.html#.connect
  uri_decode_auth: false,
  db: null,
  server: null,
  replSet: null,
  mongos: null,
}

```

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
