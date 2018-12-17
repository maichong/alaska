import { Service } from 'alaska';
import Property from './models/Property';
import PropertyValue from './models/PropertyValue';

declare class PropertyService extends Service {
  models: {
    Property: typeof Property;
    PropertyValue: typeof PropertyValue;
  };
  sleds: {
  }
}

declare const propertyService: PropertyService;

export default propertyService;

/**
 * 数据库中props字段存储的数据类型
 * 比如 goods.props = PropData[]
 */
export interface PropData {
  id: string;
  title: string;
  sku: boolean;
  filter: boolean;
  values: PropValueData[];
}

export interface PropValueData {
  id?: string;
  title: string;
}
