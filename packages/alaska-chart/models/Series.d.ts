import * as echarts from 'echarts';
import { Model } from 'alaska-model';
import { SeriesOptions } from '..';

declare class Series extends Model { }
interface Series extends SeriesFields { }

export interface SeriesFields extends SeriesOptions {
}

export default Series;
