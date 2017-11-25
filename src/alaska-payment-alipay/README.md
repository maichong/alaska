# alaska-payment-alipay

Alipay plugin for alaska.

## Usage

```js

// config/alaska-payment.js

export defualt {
  plugins: ['alaska-payment-alipay'],
  alipay: {
    partner: '2088000000000000',
    seller_id: '2088000000000000',
    rsa_private_key: 'config/rsa_private_key.pem',
    alipay_public_key: 'config/alipay_public_key.pem',
    notify_url: 'http://your.host/payment/api/notify/alipay',
    return_url: 'http://your.host/payed'
  }
};

```

## Contribute
[Maichong Software](http://maichong.it)

[Liang Xingchen](https://github.com/liangxingchen)

## License

This project is licensed under the terms of the MIT license
