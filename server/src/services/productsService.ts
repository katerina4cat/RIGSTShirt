import DBManager from "database/DBManager";
import { IResultProduct } from "database/interfaces";
import { ProductsQuery } from "graphql/models";

export const productsServices = {
    getProducts: async ({ id, showDeleted }: ProductsQuery) => {
        let query = `SELECT
    product.*,
    getPrice(product.id) AS price,
    getPreviousPrice(product.id) AS previousPrice,
    getSizes(product.id) AS sizes
FROM
    product`;
        const filter = [];

        if (showDeleted !== true) filter.push(`product.deleted=0`);
        if (id !== undefined) filter.push(`product.id=${id}`);

        if (filter.length) query += " WHERE " + filter.join(" AND ");

        const products = await DBManager.query<IResultProduct>(query + ";");
        return products;
    },
    getSizes: async () => {
        return await DBManager.query(`SELECT * FROM size;`);
    },
};
