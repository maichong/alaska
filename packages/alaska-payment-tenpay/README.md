# alaska-payment-tenpay

Tenpay plugin for alaska.

## Usage

```js

// config/alaska-payment.js
import path from 'path';

export default {
  plugins: ['alaska-payment-tenpay'],
  tenpay: {
    appid: '公众号ID',
    mch_id: '微信商户号',
    partnerKey: '微信支付安全密钥',
    pfx: path.join(__dirname, '证书文件路径'),
    notify_url: '支付回调网址',
    refund_url: '退款回调网址'
    trade_type: '支付类型'
    spbill_create_ip: 'IP地址'
  }
};

```

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
