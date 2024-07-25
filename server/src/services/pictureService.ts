import { mediaPath } from "app";
import { ApiError } from "exceptions/errorService";
import { NextFunction, Request, Response } from "express";
import fs from "fs";

export const pictureService = {
    getProductFileList: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const product = req.query.p;
            if (product === undefined)
                throw ApiError.BadRequest("Не указан ID товара");
            if (fs.existsSync(`${mediaPath}/products/${product}`))
                res.send(fs.readdirSync(`${mediaPath}/products/${product}`));
            else res.send([]);
        } catch (err) {
            next(err);
        }
    },

    uploadProductPicture: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const product = req.query.p;
            const ext = req.query.ext || "png";
            if (product === undefined)
                throw ApiError.BadRequest(
                    "Не указан ID товара для которого добавляется фото"
                );
            try {
                if (!fs.existsSync(`${mediaPath}/products/${product}`))
                    fs.mkdirSync(`${mediaPath}/products/${product}`);
                const fileName =
                    fs.readdirSync(`${mediaPath}/products/${product}`).length +
                    "-" +
                    Date.now();
                fs.writeFileSync(
                    `${mediaPath}/products/${product}/${fileName}.${ext}`,
                    req.body
                );
                res.status(200).send(`${fileName}.${ext}`);
            } catch (err) {
                console.log(err);
                throw ApiError.RuntimeError(
                    "Не удалось загрузить фото на сервер!"
                );
            }
        } catch (err) {
            next(err);
        }
    },

    deleteProductPicture: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const product = req.query.p;
            const picture = req.query.img;
            if (product === undefined || picture === undefined) {
                throw ApiError.BadRequest(
                    "Не указаны верные параметры запроса!"
                );
            }
            fs.rmSync(`${mediaPath}/products/${product}/${picture}`);
            res.status(200).send(true);
        } catch (err) {
            next(err);
        }
    },

    getProductPicture: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const product = req.query.p;
            const picture = req.query.img;
            if (product === undefined || picture === undefined) {
                throw ApiError.BadRequest(
                    "Не указаны верные параметры запроса!"
                );
            }
            res.sendFile(`${mediaPath}/products/${product}/${picture}`);
        } catch (err) {
            next(err);
        }
    },
};
