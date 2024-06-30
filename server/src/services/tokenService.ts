import { ApiError } from "exceptions/errorService";
import jwt from "jsonwebtoken";
import DBManager from "database/DBManager";

class tokenService {
    public generateToken = (payload: any) => {
        // TODO QUERY CHECK DB
        if (!process.env.ACCESS_SECRET_KEY || !process.env.ACCESS_TIME)
            throw "Не указаны секретные ключи в .env";
        const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, {
            expiresIn: process.env.ACCESS_TIME,
        });
        return accessToken;
    };

    public validateAcessToken = (token: string) => {
        if (!process.env.ACCESS_SECRET_KEY || !process.env.ACCESS_TIME)
            throw "Не указаны секретные ключи в .env";
        try {
            return jwt.verify(token, process.env.ACCESS_SECRET_KEY);
        } catch {
            return null;
        }
    };
}

export default new tokenService();
