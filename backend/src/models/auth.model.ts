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

  async getOrCreateGoogleUser(
    username: string, 
    name: string, 
    lastname: string, 
    password: string = ''
  ): Promise<any> {
    // Si es un registro con Google, usamos el procedimiento existente
    if (password === '') {
      const [[resultset]] = (await this.database.query(
        StoredProcedures.GetOrCreateGoogleUser,
        [username, name, lastname]
      )) as [[any[]]];
      return resultset.map(userMapper);
    } 
    // Si es un registro manual, usamos el procedimiento de registro de estudiante
    else {
      const [[resultset]] = (await this.database.query(
        StoredProcedures.RegisterStudent,
        [username, name, lastname, password]
      )) as [[any[]]];
      
      // Si el registro fue exitoso, obtenemos los datos del usuario
      if (resultset[0].message === 'SUCCESS') {
        // Obtener el ID del usuario recién creado
        const [[userResult]] = (await this.database.query(
          StoredProcedures.GetPasswordByEmail,
          [username]
        )) as [[any[]]];
        
        const userId = userResult[0].id;
        
        // Obtener los datos completos del usuario
        const [[userData]] = (await this.database.query(
          StoredProcedures.GetUserDataById,
          [userId]
        )) as [[any[]]];
        
        return userData.map(userMapper);
      }
      
      // Si el usuario ya existe, devolver un error
      if (resultset[0].message === 'EMAIL_EXISTS') {
        throw new Error('El email ya está registrado');
      }
      
      // Si hubo otro error, devolver un error genérico
      throw new Error('Error al registrar usuario');
    }
  }

}
