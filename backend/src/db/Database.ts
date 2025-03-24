import { Pool, PoolOptions, createPool } from "mysql2/promise";

// DB_BACKEND_ACCESS_PASSWORD
export default class Database {
	private pool: Pool;
	private static instance: Database;
	private constructor() {
		this.pool = createPool(this.getConfig());
	}
	private getConfig(): PoolOptions {
		const { 
			MYSQL_HOST,
			MYSQL_PORT, 
			DB_BACKEND_ACCESS_USERNAME, 
			DB_BACKEND_ACCESS_PASSWORD, 
			DB_BACKEND_CONN_LIMIT, 
			DB_BASE_NAME
		} = process.env;
		return {
			host: MYSQL_HOST,
			port: parseInt(MYSQL_PORT),
			user: DB_BACKEND_ACCESS_USERNAME,
			password: DB_BACKEND_ACCESS_PASSWORD,
			connectionLimit: parseInt(DB_BACKEND_CONN_LIMIT) || 10,
			database: DB_BASE_NAME,
			multipleStatements: true
		};
	}
	async query(sql: string, params?: any[]): Promise<any> {
		return await this.pool.query(sql, params || []);
	}
	static getInstance(): Database {
		if (!Database.instance) Database.instance = new Database();
		return Database.instance;
	}
}
