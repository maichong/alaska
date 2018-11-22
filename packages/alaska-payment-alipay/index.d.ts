import { PaymentPlugin } from 'alaska-payment';

export interface AlipayConfig {
  partner: string;
  seller_id: string;
  rsa_private_key: string;
  rsa_public_key: string;
  notify_url: string;
  return_url: string;
  sign?: string;
}

export default class AlipayPlugin extends PaymentPlugin {
  verify(data: AlipayConfig): boolean;
}
