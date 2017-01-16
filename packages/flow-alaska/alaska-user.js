declare module 'alaska-user' {
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
