import * as mongodb from 'mongodb';
import { RecordId, Model } from 'alaska-model';
import { PropData } from 'alaska-property/types';
import { Image } from 'alaska-field-image';
import Goods from 'alaska-goods/models/Goods';

export default class Sku extends Model {
  static label = 'SKU';
  static icon = 'cubes';
  static defaultColumns = 'pic goods desc price discount volume inventory';
  static defaultSort = '-sort';
  static noupdate = true;
  static noremove = true;
  static nocreate = true;
  static titleField = 'desc';
  static searchFields = 'desc';
  static filterFields = 'goods shop price?range inventory?range volume?range @search';

  static fields = {
    pic: {
      label: 'Main Picture',
      type: 'image',
      required: true
    },
    goods: {
      label: 'Goods',
      type: 'relationship',
      ref: 'alaska-goods.Goods',
      index: true
    },
    shop: {
      label: 'Shop',
      type: 'relationship',
      ref: 'alaska-shop.Shop',
      optional: 'alaska-shop',
      hidden: true
    },
    key: {
      // pid1:vid1;pid2:vid2
      label: 'KEY',
      type: String,
      hidden: true,
      index: true
    },
    desc: {
      // 颜色:白色;尺码:XL
      label: 'Description',
      type: String
    },
    price: {
      label: 'Price',
      type: 'money'
    },
    discount: {
      label: 'Discount',
      type: 'money'
    },
    inventory: {
      label: 'Inventory',
      type: Number,
      default: 0
    },
    volume: {
      label: 'Volume',
      type: Number,
      default: 0,
      protected: true
    },
    props: {
      label: 'Goods Properties',
      type: Object,
      hidden: true
    },
    createdAt: {
      label: 'Created At',
      type: Date
    }
  };

  key: string;
  pic: Image;
  goods: RecordId;
  shop: RecordId;
  desc: string;
  price: number;
  discount: number;
  inventory: number;
  volume: number;
  props: PropData[];
  createdAt: Date;

  /**
   * 增加SKU库存，并自动更新对应的商品，成功后将返回新的sku数据记录，否则返回null
   * @param id sku id
   * @param quantity 增加数量
   */
  static async incInventory(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Sku | null> {
    // 更新 SKU 表
    let newSku = await Sku.findOneAndUpdate(
      { _id: id },
      { $inc: { inventory: quantity } },
      { new: true }
    ).session(dbSession);
    if (!newSku) return null;
    // 更新Goods.skus
    let goods = await Goods.findOneAndUpdate(
      { _id: newSku.goods, 'skus._id': newSku._id },
      { $set: { 'skus.$.inventory': newSku.inventory } },
      { new: true }
    ).session(dbSession);
    if (goods) {
      // 更新Goods.inventory
      await Goods.findOneAndUpdate(
        { _id: newSku.goods },
        { $inc: { inventory: quantity } }
      ).session(dbSession);
    }
    return newSku;
  }

  /**
   * 增加SKU销量，并自动更新对应的商品，成功后将返回新的sku数据记录，否则返回null
   * @param id sku id
   * @param quantity 增加数量
   */
  static async incVolume(id: RecordId, quantity: number, dbSession?: mongodb.ClientSession): Promise<Sku | null> {
    // 更新 SKU 表
    let newSku = await Sku.findOneAndUpdate(
      { _id: id },
      { $inc: { volume: quantity } },
      { new: true }
    ).session(dbSession);
    if (!newSku) return null;
    // 更新Goods.skus
    let goods = await Goods.findOneAndUpdate(
      { _id: newSku.goods, 'skus._id': newSku._id },
      { $set: { 'skus.$.volume': newSku.volume } },
      { new: true }
    ).session(dbSession);
    if (goods) {
      // 更新Goods.volume
      await Goods.findOneAndUpdate(
        { _id: newSku.goods },
        { $inc: { volume: quantity } }
      ).session(dbSession);
    }
    return newSku;
  }

  preSave() {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
  }
}
