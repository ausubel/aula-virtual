import User from "../entities/User";
import UserModel from "../models/user.model";
import Encrypter from "../utils/encripter";

export default class UserService {
	private UserModel: UserModel;
	constructor() {
		this.UserModel = new UserModel();
	}

	async getUserDataById(id: number): Promise<User> {
		return await this.UserModel.getUserDataById(id);
	}

	async updateUserDataById(profile: User): Promise<any> {
		if(profile.password && profile.password.length > 0) {
			profile.password = await Encrypter.encrypt(profile.password);
		}
		return await this.UserModel.updateUserDataById(profile);
	}

	async getStudentProfileData(studentId: number): Promise<any> {
		return await this.UserModel.getStudentProfileData(studentId);
	}

	async updateStudentProfileInfo(
		studentId: number, 
		name: string, 
		surname: string, 
		phone: string, 
		location: string, 
		bio: string
	): Promise<any> {
		return await this.UserModel.updateStudentProfileInfo(
			studentId, 
			name, 
			surname, 
			phone, 
			location, 
			bio
		);
	}
}
