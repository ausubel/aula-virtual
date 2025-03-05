import { Pool, createPool } from "mysql2/promise";

class DatabaseParameters {
	readonly host: string;
	readonly port: number;
	readonly user: string;
	readonly connectionLimit: number;
	readonly database: string;
	readonly password: string;
	constructor() {
		this.host = "localhost";
		this.port = 3306;
		this.user = "root";
		this.connectionLimit = 10;
		this.database = "virtual_class";
		this.password = "Navia1212.";
	}
}
export default class Database {
	private pool: Pool;
	private static instance: Database;
	private constructor() {
		const params = new DatabaseParameters();
		this.pool = createPool({ ...params, multipleStatements: true });
	}
	async query(sql: string, params?: any[]): Promise<any> {
		return await this.pool.query(sql, params);
	}
	static getInstance(): Database {
		if (!this.instance) return new Database();
		return this.instance;
	}
}
