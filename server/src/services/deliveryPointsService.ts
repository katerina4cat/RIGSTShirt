import axios from "axios";
import deliveryPoints from "common/DeliveryPointsManager";
import { NextFunction, Request, Response } from "express";
import stream from "stream";

export const deliveryPointsService = {
    getPostRusOffice: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const readStream = new stream.PassThrough();
        readStream.end(deliveryPoints.PRusPoints);

        res.set("Content-disposition", "attachment; filename=output.docx");
        res.set("Content-Type", "application/octet-stream"); // Измените MIME-тип по необходимости

        readStream.pipe(res);
    },
    getCDEKOffices: async (req: Request, res: Response, next: NextFunction) => {
        const readStream = new stream.PassThrough();
        readStream.end(deliveryPoints.CDEKPoints);

        res.set("Content-disposition", "attachment; filename=output.docx");
        res.set("Content-Type", "application/octet-stream"); // Измените MIME-тип по необходимости

        readStream.pipe(res);
    },
    getCDEKOfficeInfo: async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const officeID = req.params.id;
        if (officeID === undefined) {
            res.send({ errors: [{ message: "Не указа идентификатор офиса" }] });
            return;
        }
        try {
            res.send(
                (
                    await axios.post(
                        `https://www.cdek.ru/api-site/v1/graphql/`,
                        {
                            query: " \nquery websiteOfficeByCode( \n  $code: String!, \n  $filter: WebsiteEntityOfficeFilter \n  ) { \n  websiteOfficeByCode( \n    code: $code, \n    filter: $filter \n  ) \n  { \n    id \n    type \n    city \n    active \n    isReception \n    isHangout \n    holidays { \n        dateBegin \n        dateEnd \n    } \n    shorterDays { \n        dateBegin \n        dateEnd \n        timeBegin \n        timeEnd \n    } \n    maxDimensions { \n      depth \n      height \n      width \n    } \n    metroStations { \n      name \n      line { \n        name \n        color \n      } \n    } \n    geoLatitude \n    geoLongitude \n    weight { \n        weightMin \n        weightMax \n    } \n    worktime \n    worktimes { \n        day \n        startTime \n        stopTime \n    } \n    code \n    address \n    dimensions { \n      depth \n      height \n      width \n    } \n    timezone \n } \n} \n",
                            variables: {
                                code: officeID,
                                filter: {
                                    locale: "ru",
                                },
                            },
                        }
                    )
                ).data.data.websiteOfficeByCode
            );
        } catch {
            res.send({
                errors: [
                    {
                        message:
                            "Произошла ошибка при попытке получить информацию о офисе CDEK",
                    },
                ],
            });
        }
    },
};
