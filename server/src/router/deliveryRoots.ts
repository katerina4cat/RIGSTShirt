import { Router } from "express";
import { authMiddleware } from "middleware/authMiddleware";
import { deliveryPointsService } from "services/deliveryPointsService";
import { pictureService } from "services/pictureService";

export const deliveryRouter = Router();

deliveryRouter.get("/delivery/CDEK", deliveryPointsService.getCDEKOffices);
deliveryRouter.get("/delivery/PRus", deliveryPointsService.getPostRusOffice);
deliveryRouter.get(
    "/delivery/CDEK/:id",
    deliveryPointsService.getCDEKOfficeInfo
);
