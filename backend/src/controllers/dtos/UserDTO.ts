import { isString } from "../../utils/validators";

export default class UserDTO{
    readonly name: string;
    readonly lastName: string;
    readonly phoneNumber: string;
    readonly email: string;
    readonly profession: string;
    readonly cv_file: string;
    constructor({ name, lastName, phoneNumber, email, profession, cv_file}: any){
        this.name = name;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.profession = profession;
        this.cv_file = cv_file;
    }
    static isValid(body: any){
        return (
            isString(body.name) &&
            isString(body.lastName) &&
            isString(body.phoneNumber) &&
            isString(body.email) &&
            isString(body.profession) &&
            isString(body.cv_file)
        );
    }
}