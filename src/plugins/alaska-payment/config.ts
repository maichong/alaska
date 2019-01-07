import * as Path from 'path';

export default {
  plugins: {
    'alaska-payment-alipay': {}
  },
  alipay: {
    partner: '2088000000000000',
    seller_id: '2088000000000000',
    rsa_private_key: Path.join(__dirname, 'private_key.pem'),
    rsa_public_key: Path.join(__dirname, 'public_key.pem'),
    notify_url: 'http://your.host/payment/api/notify/alipay',
    return_url: 'http://your.host/payed'
  }
};
