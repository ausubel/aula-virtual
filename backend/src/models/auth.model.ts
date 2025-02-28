import StoredProcedures from "../db/StoredProcedures";
import ModelBase from "./ModelBase";
import userMapper from "./mappers/user.mapper";

export default class AuthModel extends ModelBase {
  async getPasswordByEmail(username: string): Promise<string> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetPasswordByEmail,
      [username]
    )) as [[any[]]];
    return resultset[0];
  }
  async getUserDataById(id: number): Promise<any> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetUserDataById,
      [id]
    )) as [[any[]]];
    return resultset.map(userMapper);
  }

  async getOrCreateGoogleUser(username: string, name: string, lastname: string): Promise<any> {
    const [[resultset]] = (await this.database.query(
      StoredProcedures.GetOrCreateGoogleUser,
      [username, name, lastname]
    )) as [[any[]]];
    return resultset.map(userMapper)[0]; // Solo esperamos un usuario
  }

}
