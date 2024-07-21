import { NextFunction, Request, Response } from "express";
import { ApiError } from "../exceptions/errorService";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ApiError) {
        return res
            .status(err.status)
            .json({ message: err.message, errors: err.errors });
    }
    console.log(err);
    res.status(500).json({ message: "Непредвиденная ошибка" });
};
