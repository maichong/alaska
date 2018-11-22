
declare namespace isDirectory {
  function sync(path: string): boolean;
}

declare function isDirectory(path: string, cb: (err: Error | null, dir: boolean) => void): void;
export = isDirectory;
