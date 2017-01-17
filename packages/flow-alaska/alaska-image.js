declare module 'alaska-image' {
  declare class ImageService extends Alaska$Service {
  }
  declare var exports: ImageService;
}
declare module 'alaska-image/models/Image' {
  declare class Image extends Alaska$Model {
    pic:Object;
    user:Object;
    createdAt:Date;
  }
  declare var exports: Class<Image>;
}

declare module 'alaska-image/sleds/Upload' {
  declare class Upload extends Alaska$Sled {

  }
  declare var exports: Class<Upload>;
}