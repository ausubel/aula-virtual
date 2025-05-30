import User from "../../entities/User";


export default function userMapper(record: any): User {
    return {
        id: record["id"],
        name: record["name"],
        surname: record["surname"],
        email: record["email"],
        active: record["active"],
        password: record["password"],
        roleId: record["roleId"],
        hasCV: record["hasCV"] === 1 || record["hasCV"] === true,
        phone: record["phone"],
        degree: record["degree"]
    }
}