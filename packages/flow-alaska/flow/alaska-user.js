declare module 'alaska-user' {
  declare class UserService extends Alaska$Service {
  }

  declare var exports: UserService
}


declare class User extends Alaska$Model {
  username: string;
  email: string;
  password: string;
  avatar: Object;
  roles: Object[];
  abilities: Object[];
  createdAt: Date;
  displayName: string;

  auth(candidate: string): boolean;
  hasAbility(id: string): Promise<boolean>;

}

declare module 'alaska-user/models/User' {
  declare var exports: Class<User>
}

declare module 'alaska-user/models/Ability' {
  declare class Ability extends Alaska$Model {
    title: string;
    service: string;
    createdAt: Date;
  }

  declare var exports: Class<Ability>
}

declare module 'alaska-user/models/Role' {
  declare class Role extends Alaska$Model {
    title: string;
    abilities: Object[];
    sort: number;
    createdAt: Date;
    hasAbility(id: string | Object): Promise<boolean>
  }

  declare var exports: Class<Role>
}

declare module 'alaska-user/sleds/Init' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-user/sleds/Login' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-user/sleds/Logout' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-user/sleds/Register' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-user/sleds/RegisterAbility' {
  declare var exports: Class<Alaska$Sled>
}

declare module 'alaska-user/sleds/RegisterRole' {
  declare var exports: Class<Alaska$Sled>
}
