import { Service } from 'alaska';
import { RecordId } from 'alaska-model';
import Property from './models/Property';
import PropertyValue from './models/PropertyValue';
import { PropData } from './types';

declare module 'alaska-goods/models/Goods' {
  export interface GoodsFields {
    props: PropData[];
    propValues: RecordId[];
  }
}

export class PropertyService extends Service {
  models: {
    Property: typeof Property;
    PropertyValue: typeof PropertyValue;
  };
  sleds: {
  }
}

declare const propertyService: PropertyService;

export default propertyService;
