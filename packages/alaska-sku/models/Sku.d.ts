import { RecordId, Model } from 'alaska-model';
import { PropData } from 'alaska-property';
import { Image } from 'alaska-field-image';

declare class Sku extends Model {
  /**
   * 增加SKU库存，并自动更新对应的商品，成功后将返回新的sku数据记录，否则返回null
   * @param id sku id
   * @param quantity 增加数量
   */
  static incInventory(id: RecordId, quantity: number): Promise<Sku | null>;

  /**
   * 增加SKU销量，并自动更新对应的商品，成功后将返回新的sku数据记录，否则返回null
   * @param id sku id
   * @param quantity 增加数量
   */
  static incVolume(id: RecordId, quantity: number): Promise<Sku | null>;
}
interface Sku extends SkuFields { }

export interface SkuFields {

  key: string;
  pic: Image;
  goods: RecordId;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  props: PropData[];
  createdAt: Date;
}

export default Sku;
