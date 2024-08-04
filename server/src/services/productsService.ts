import DBManager from "database/DBManager";
import { IResultProduct, ISize } from "database/interfaces";
import { ProductsQuery } from "graphql/models";

export const productsServices = {
    getProducts: async ({
        id,
        showDeleted,
        ids,
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
        if (ids !== undefined) filter.push(`product.id IN (${ids.join(",")})`);

        if (filter.length) query += " WHERE " + filter.join(" AND ");

        const products = await DBManager.query<IResultProduct>(query + ";");
        return products;
    },
    getSizes: async ({ ids }: { ids?: number[] }): Promise<ISize[]> => {
        return await DBManager.query<ISize>(
            `SELECT * FROM size ${
                ids !== undefined
                    ? `WHERE size.id IN (${ids.join(",")})`
                    : undefined
            };`
        );
    },
    addSize: async ({ size }: { size: string }) => {
        await DBManager.query(`INSERT INTO size(title) VALUES("${size}");`);
        return (await DBManager.query(`SELECT LAST_INSERT_ID() as id`))[0].id;
    },
};
