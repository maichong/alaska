declare module 'alaska-queue-array' {
  declare class ArrayQueueDriver {
    constructor(options: Object): void;
    key: string;
    options: Object;
    _free: boolean;
    isQueueDriver: boolean;
    push(item: any): void;
    pop(timeout: number): any;
    free(): void;
    sleep(seconds: number): Promise<void>;
    destroy(): void;
  }

  declare var exports: Class<ArrayQueueDriver>;
}
