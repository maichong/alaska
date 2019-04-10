import { Service, Plugin, ObjectMap } from 'alaska';
import * as FSD from 'fsd';
import * as fs from 'fs';
import User from 'alaska-user/models/User';
import Image from './models/Image';
import Create from './sleds/Create';
import { Context } from 'alaska-http';
import { RecordId } from 'alaska-model';

export class ImageService extends Service {
  drivers: ObjectMap<ImageDriverConfig>;
  models: {
    Image: typeof Image;
  };
  sleds: {
    Create: typeof Create;
  };

  getImage(id: RecordId): Promise<Image | null>;
}

declare const imageService: ImageService;

export default imageService;

export interface ImageDriverConfig {
  /**
   * 图片存储路径格式，支持 moment.js 和占位符 {ID} {EXT} {NAME}
   * eg. /{ID[0,2]}/{ID}.{EXT}
   * 默认为 /YYYY/MM/DD/{ID}.{EXT}
   */
  pathFormat?: string;
  /**
   * 缩略图后缀，支持 {EXT} 占位符
   * eg. _thumb.{EXT}
   */
  thumbSuffix?: string;
  /**
   * 允许的图片后缀名，默认 jpg,png,webp,gif,svg
   */
  allowed?: string[];
  /**
   * 图片最大大小，默认 5M 5242880
   */
  maxSize?: number;
  /**
   * fsd adapter name, eg. fsd-oss
   */
  adapter: string;
  /**
   * fsd adapter config
   */
  adapterOptions: any;
  /**
   * fsd函数，无需配置，自动初始化
   */
  fsd?: FSD.fsd;
}

export interface CreateParams {
  /**
   * 存储驱动，默认default
   */
  driver?: string;
  /**
   * 后台管理员用户，alaska-admin后台上传时存在
   */
  admin?: User;
  /**
   * 图片用户ID
   */
  user?: RecordId;
  /**
   * 文件名，如不存在，则尝试从文件路径中获取
   */
  name?: string;
  /**
   * 文件Buffer数据
   * data/file/ctx 三者选其一
   */
  data?: Buffer;
  /**
   * 文件路径或读取流
   * data/file/ctx 三者选其一
   */
  file?: fs.ReadStream | string;
  /**
   * HTTP Context
   * 如果data/file参数都不存在，则首先尝试读取 ctx.files，其次尝试读取 ctx.request.body 中的base64数据
   * data/file/ctx 三者选其一
   */
  ctx?: Context;
  /**
   * 仅供 alaska-admin 后台创建用
   */
  body?: {
    driver?: string;
  };
}
