import StoredProcedures from "../db/StoredProcedures";
import User from "../entities/User";
import ModelBase from "./ModelBase";
import userMapper from "./mappers/user.mapper";

export default class UserModel extends ModelBase {
    async getUserDataById(id: number): Promise<any> {
        try {
          const [[resultset]] = (await this.database.query(
            StoredProcedures.GetUserDataById,
            [id]
          )) as [[any[]]];
          
          if (!resultset || resultset.length === 0) {
            return null;
          }
          
          return resultset.map(userMapper);
        } catch (error) {
          console.error("Error fetching user data:", error);
          return null;
        }
      }
  async updateUserDataById(data: User): Promise<any> {
    const [[[resultset]]] = (await this.database.query(
      StoredProcedures.UpdateUserDataById,
      [data.id, data.name, data.surname, data.email, data.password, data.phone, data.degree]
    ));
    return resultset;
  }

  async getStudentProfileData(studentId: number): Promise<any> {
    try {
      const [result] = await this.database.query(
        StoredProcedures.GetStudentProfileData,
        [studentId]
      );
      
      // El resultado está en la segunda posición del array
      if (result && result.length > 1 && result[1][0] && result[1][0].profileData) {
        return JSON.parse(result[1][0].profileData);
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching student profile data:", error);
      return null;
    }
  }
}
