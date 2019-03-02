
/**
 * 数据库中props字段存储的数据类型
 * 比如 goods.props = PropData[]
 */
export interface PropData {
  id: string;
  title: string;
  sku?: boolean;
  filter?: boolean;
  values: PropValueData[];
}

export interface PropValueData {
  id?: string;
  title: string;
}

declare module 'alaska-goods/types' {
  export interface Goods {
    props: PropData[];
  }
}
