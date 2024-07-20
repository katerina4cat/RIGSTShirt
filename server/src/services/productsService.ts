import DBManager from "database/DBManager";
import { IResultProduct, ISize } from "database/interfaces";
import { ProductsQuery } from "graphql/models";

export const productsServices = {
    getProducts: async ({
        id,
        showDeleted,
    }: ProductsQuery): Promise<IResultProduct[]> => {
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
    getSizes: async (): Promise<ISize[]> => {
        return await DBManager.query<ISize>(`SELECT * FROM size;`);
    },
};
