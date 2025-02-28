type User = {
  id?: number;
  name: string;
  surname: string;
  active: string;
  password?: string;
  roleId?: number;
  hasCV?: boolean;
};

export default User;