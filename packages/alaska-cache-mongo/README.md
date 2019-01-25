# alaska-cache-mongo
Alaska MongoDB cache driver

## configure

```javascript

export default {
  cache: {
    type: 'alaska-cache-mongo',
    // The connection URI string
    uri: 'mongodb://localhost/mydb',
    // The cache collection
    collection: 'caches',
    // Default maximum age in milliseconds, 0 for forever
    maxAge: 3600 * 1000,
    //more http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/connection-settings/
    connectTimeoutMS: 10000
  }
}

```

## Contribute
[Maichong Software](http://maichong.io)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
