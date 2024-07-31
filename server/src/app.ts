import dotenv from "dotenv";
dotenv.config();
export const mediaPath =
    __dirname.substring(0, __dirname.length - 3) + "/media";

declare module "express-serve-static-core" {
    interface Request {
        user?: IPayload;
    }
}

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Response, Request, NextFunction } from "express";
import { credentials } from "../env";
import { graphqlHTTP } from "express-graphql";
import schema from "graphql/schema";
import root from "graphql/root";
import { IPayload } from "models/Payload";
import { pictureRouter } from "router/pictureRoots";
import { errorMiddleware } from "middleware/errorMiddleware";
import { deliveryRouter } from "router/deliveryRoots";

const app = express();

app.use(
    cors({
        origin: "https://185.197.34.18:8443",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use("/graphql", (req, res) =>
    graphqlHTTP({
        graphiql: true,
        schema: schema,
        rootValue: root,
        context: { req, res },
    })(req, res)
);
app.use(deliveryRouter);

app.use(
    express.raw({
        inflate: true,
        limit: "4mb",
        type: () => true,
    })
);
app.use(pictureRouter);

app.use(errorMiddleware);
const httpsServer = require("https").createServer(credentials, app);
httpsServer.listen(443, () => {
    console.log("Server run on https://katerina4cat.ru");
});

export interface IContext {
    req: Request;
    res: Response;
}
