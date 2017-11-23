# alaska-field-image-aliyun
Alaska aliyun image field

```javascript
//alaska config

export default {

  'alaska-field-image-aliyun': {
    allowed: ['png','jpg','bmp'],
    multi: false,
    //empty or ends with /
    pathFormat: 'YYYY/MM/DD/',
    //empty or ends with /
    prefix: 'http://maichong.it/',
    //cdn image thumb url suffix, string or false
    thumbSuffix: '@2o_200w_1l_90Q.jpg',
    oss: {
      // https://github.com/ali-sdk/ali-oss#ossoptions
      accessKeyId: 'accessKeyId',
      secretAccessKey: 'secretAccessKey',
      endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
      bucket: 'your bucket',
    }
  }

}
```

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
