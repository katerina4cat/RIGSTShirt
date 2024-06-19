import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { credentials } from "../env";

const app = express();

app.use(
    cors({
        origin: "https://katerina4cat.ru:8443",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

const httpsServer = require("https").createServer(credentials, app);
httpsServer.listen(443, () => {
    console.log("Server run on https://katerina4cat.ru");
});
