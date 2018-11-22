export = pathType;

declare namespace pathType {
  function file(path: string): Promise<boolean>;
  function dir(path: string): Promise<boolean>;
  function symlink(path: string): Promise<boolean>;
  /**
   * 判断路径是否是一个文件
   * @param path string
   */
  function fileSync(path: string): boolean;
  function dirSync(path: string): boolean;
  function symlinkSync(path: string): boolean;
}
