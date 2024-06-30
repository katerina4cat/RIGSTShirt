import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { credentials } from "../env";
import { graphqlHTTP } from "express-graphql";
import schema from "graphs/schema";
import root from "graphs/root";

const app = express();

app.use(
    cors({
        origin: "https://katerina4cat.ru:8443",
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

const httpsServer = require("https").createServer(credentials, app);
httpsServer.listen(443, () => {
    console.log("Server run on https://katerina4cat.ru");
});

export interface IContext {
    req: Request;
    res: Response;
}
