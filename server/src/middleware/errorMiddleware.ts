import { NextFunction, Request, Response } from "express";
import { ApiError } from "../exceptions/errorService";
import ex from "express";

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
    if (err.toString() === "PayloadTooLargeError: request entity too large") {
        return res.status(413).send();
    }
    console.log(err);
    res.status(500).json({ message: "Непредвиденная ошибка" });
};
