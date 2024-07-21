import { ApiError } from "exceptions/errorService";
import jwt from "jsonwebtoken";
import DBManager from "database/DBManager";
import { IContext } from "app";
import { IPayload } from "models/Payload";

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

class tokenService {
    public login = async (
        login: string,
        password: string,
        context: IContext
    ) => {
        const res = (
            await DBManager.query(
                `SELECT worker.id FROM worker JOIN userSecret u ON worker.id=u.id WHERE worker.login="${login}" AND u.password=SHA2("${password}", 256);`
            )
        )[0];
        if (res !== undefined) {
            this.generateToken({ id: res.id }, context);
            return true;
        } else
            return ApiError.BadRequest("Вы ввели неверные логин или пароль!");
    };
    private generateToken = async (
        payload: WithOptional<IPayload, "created">,
        context: IContext
    ) => {
        payload = { id: payload.id, created: new Date() };
        if (!process.env.ACCESS_SECRET_KEY || !process.env.ACCESS_TIME)
            return "Не указаны данные в .env";
        const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY, {
            expiresIn: process.env.ACCESS_TIME,
        });
        context.res.cookie("access", accessToken, {
            maxAge: Number(process.env.ACCESS_TIME_MS),
            httpOnly: true,
            secure: false,
        });
        return accessToken;
    };

    public validateAcessToken = async (context: IContext) => {
        if (
            !process.env.ACCESS_SECRET_KEY ||
            !process.env.ACCESS_TIME ||
            !process.env.ACCESS_REFRESH_TIME_MS
        )
            return ApiError.RuntimeError("Не указаны данные в .env");
        try {
            const payload = jwt.verify(
                context.req.cookies.access,
                process.env.ACCESS_SECRET_KEY
            ) as IPayload;
            payload.created = new Date(payload.created);
            // Если время больше 22.5m
            if (
                Date.now() - payload.created.getTime() >
                Number(process.env.ACCESS_REFRESH_TIME_MS)
            )
                this.generateToken({ ...payload, created: undefined }, context);
            return payload;
        } catch (err) {
            return ApiError.UnauthorizedError();
        }
    };
}

export default new tokenService();
