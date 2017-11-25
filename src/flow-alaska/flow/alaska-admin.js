declare module 'alaska-admin' {
  declare class AdminService extends Alaska$Service {
  }

  declare var exports: AdminService
}

declare module 'alaska-admin/models/AdminMenu' {
  declare class AdminMenu extends Alaska$Model {
    label: string;
    icon: string;
    type: string;
    parent: Object;
    service: string;
    sort: number;
    super: boolean;
    activated: boolean;
  }

  declare var exports: Class<AdminMenu>
}

declare module 'alaska-admin/sleds/Init' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-admin/sleds/RegisterMenu' {
  declare var exports: Class<Alaska$Sled>
}
