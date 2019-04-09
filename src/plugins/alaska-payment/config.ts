import * as Path from 'path';

export default {
  plugins: {
    'alaska-payment-alipay': {
      channels: {
        app: {
          channel: 'app',
          app_id: '',
          currency: 'balance',
          private_key: 'assets/alipay_private_key.pem',
          alipay_public_key: 'assets/alipay_public_key.pem',
          notify_url: 'http://your.deamon/payment/notify/alipay',
          biz_content: {
            timeout_express: '30m'
          }
        }
      }
    },
  }
};
