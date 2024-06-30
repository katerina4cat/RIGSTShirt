import { buildSchema } from "graphql";
import fs from "fs";

const [types, inputs, querys]: [string, string, string] = [
    fs.readFileSync(__dirname + "/types.gql").toString(),
    fs.readFileSync(__dirname + "/inputs.gql").toString(),
    fs.readFileSync(__dirname + "/querys.gql").toString(),
];

const schema = buildSchema(
    `${types}
    ${inputs}
    ${querys}`
);

export default schema;
