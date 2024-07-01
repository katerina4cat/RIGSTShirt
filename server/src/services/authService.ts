import { IContext } from "app";
import DBManager from "database/DBManager";
import { ApiError } from "exceptions/errorService";
import tokenService from "./tokenService";

export const authServices = {
    login: (
        { login, password }: { login: string; password: string },
        context: IContext
    ) => {
        return tokenService.login(login, password, context);
    },
    logout: (_: any, context: IContext) => {
        context.res.clearCookie("access");
        return true;
    },
    register: async (
        {
            login,
            password,
        }: {
            login: string;
            password: string;
        },
        context: IContext
    ) => {
        const payload = await tokenService.validateAcessToken(context);
        if (payload instanceof ApiError) return payload;
        if (
            (
                await DBManager.query(`CALL register("${login}","${password}")`)
            )[0]
        ) {
            DBManager.connection.commit();
            return true;
        }
        return false;
    },
};
