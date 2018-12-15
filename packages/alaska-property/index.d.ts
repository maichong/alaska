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
