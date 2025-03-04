type User = {
  id?: number;
  name: string;
  surname: string;
  email?: string;
  active: string;
  password?: string;
  roleId?: number;
  hasCV?: boolean;
  phone?: string;
  degree?: string;
};

export default User;