import { buildSchema } from "graphql";
import fs from "fs";

const [types, inputs, querys]: [string, string, string] = [
    fs.readFileSync(__dirname + "/schema/types.gql").toString(),
    fs.readFileSync(__dirname + "/schema/inputs.gql").toString(),
    fs.readFileSync(__dirname + "/schema/querys.gql").toString(),
];

const schema = buildSchema(
    `${types}
    ${inputs}
    ${querys}`
);

export default schema;
