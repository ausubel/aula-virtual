import User from "../entities/User";
import AuthModel from "../models/auth.model";



export default class AuthService {
	private authModel: AuthModel;
	constructor() {
		this.authModel = new AuthModel();
	}
	async getPasswordByEmail(username: string): Promise<any> {
		return await this.authModel.getPasswordByEmail(username);
	}
	async getUserDataById(id: number): Promise<User> {
		return await this.authModel.getUserDataById(id);
	}

	async getOrCreateGoogleUser(profile: any): Promise<User> {
		// Si es un perfil de Google, extraer datos del formato de Google
		if (profile.emails && profile.name) {
			const email = profile.emails[0].value;
			const name = profile.name.givenName;
			const lastname = profile.name.familyName;
			// Para usuarios de Google, la contraseña es vacía
			return await this.authModel.getOrCreateGoogleUser(email, name, lastname);
		} 
		// Si es un registro manual, usar los datos proporcionados directamente
		else {
			const { email, name, surname, password = '' } = profile;
			// Pasar la contraseña ya encriptada al modelo
			return await this.authModel.getOrCreateGoogleUser(email, name, surname, password);
		}
	}

}
