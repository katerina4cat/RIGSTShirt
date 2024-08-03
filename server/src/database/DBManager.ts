import mysql, { RowDataPacket } from "mysql2";
class DatabaseManager {
    connection: mysql.Connection;

    public query = async <RowType extends RowDataPacket>(
        sql: string
    ): Promise<RowType[]> => {
        return await new Promise((result) =>
            this.connection.query<RowType[]>(sql, (_err, rows) => result(rows))
        );
    };

    constructor() {
        this.connection = mysql.createConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_ADRESS,
            port: Number(process.env.DB_PORT),
        });
        this.connection.connect();
        this.init();
    }

    private init(): void {
        this.connection.query(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_DATABASE};`
        );
        this.connection.query(`USE ${process.env.DB_DATABASE};`);
        this.connection.commit();
        this.connection.query("SET NAMES 'utf8mb4'");
    }
}
const DBManager = new DatabaseManager();
export default DBManager;
