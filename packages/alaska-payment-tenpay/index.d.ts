import { PaymentPlugin } from 'alaska-payment';
import Payment from 'alaska-payment/models/Payment';
import { ObjectMap } from '@samoyed/types';

export interface PaymentTenpay extends Payment {
  tenpay_transaction_id: string;
  openid: string;
  tradeType: string;
}

export interface TenpayConfig {
  appid: string;
  mch_id: string;
  partnerKey: string;
  pfx?: string;
  notify_url?: string;
  refund_url?: string;
  trade_type?: string;
  spbill_create_ip?: string;
}

export default class TenpayPlugin extends PaymentPlugin {
  verify(data: ObjectMap<any>): boolean;
}
