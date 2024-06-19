import fs from "fs";
export const path = __dirname;
const cert = fs.readFileSync(path + "/ssl/certificate.pem", "utf-8");
const key = fs.readFileSync(path + "/ssl/key.key", "utf-8");
export const credentials = {
    key: key,
    cert: cert,
};
