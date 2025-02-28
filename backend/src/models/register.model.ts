import UserDTO from "../controllers/dtos/UserDTO";
import StoredProcedures from "../db/StoredProcedures";
import ModelBase from "./ModelBase";

export default class RegisterModel extends ModelBase {
  async registerStudent(user: UserDTO): Promise<any> {
    const [[[resultset]]] = await this.database.query(
      StoredProcedures.RegisterStudent,
      [user.name, user.lastName, user.phoneNumber, user.email, user.profession, user.cv_file]
    );
    return resultset;
  }
}