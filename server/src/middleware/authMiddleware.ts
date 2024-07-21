import { NextFunction, Request, Response } from "express";
import { ApiError } from "../exceptions/errorService";
import tokenService from "services/tokenService";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userData = await tokenService.validateAcessToken({
            req: req,
            res: res,
        });
        if (userData instanceof ApiError) return next(userData);
        req.user = userData;
        next();
    } catch {
        return next(ApiError.UnauthorizedError());
    }
};
