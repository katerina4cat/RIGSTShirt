import { Router } from "express";
import { authMiddleware } from "middleware/authMiddleware";
import { pictureService } from "services/pictureService";

export const pictureRouter = Router();

pictureRouter.get("/product/picture", pictureService.getProductPicture);
pictureRouter.get("/product/list", pictureService.getProductFileList);

pictureRouter.post(
    "/product/picture",
    authMiddleware,
    pictureService.uploadProductPicture
);

pictureRouter.delete(
    "/product/picture",
    authMiddleware,
    pictureService.deleteProductPicture
);
