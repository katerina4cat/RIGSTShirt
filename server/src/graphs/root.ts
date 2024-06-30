import { IPrice, IProduct, IResultProduct, ISize } from "database/interfaces";
import DBManager from "../database/DBManager";
import { NewProductInput, ProductsQuery } from "./iterfaces";
import { IContext } from "app";
import { validate } from "graphql";
import tokenService from "services/tokenService";

const root = {
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
    login: async (login: string, password: string) => {
        // TODO VALIDATE
    },
    addProduct: async ({ product }: { product: NewProductInput }) => {
        // TODO VALIDATE
        await DBManager.query(
            `INSERT INTO product(title, description, deleted, showSale) VALUES("${product.title}", "${product.description}", false, false);`
        );
        const createdProduct = (
            await DBManager.query<IProduct>(
                `SELECT * FROM product WHERE id=LAST_INSERT_ID() LIMIT 1;`
            )
        )[0];
        await DBManager.query(
            `INSERT INTO priceHistory(id, workerID, price) VALUES(${createdProduct.id}, 1, "${product.price}");`
        );
        await DBManager.query(
            `INSERT INTO sizes VALUES
            ${product.sizes
                .map((sizeID) => `(${createdProduct.id},${sizeID})`)
                .join(",")};`
        );
        DBManager.connection.commit();
        return (await root.getProducts({ id: createdProduct.id }))[0];
    },
    updateProductPrice: async (
        data: { id: number; newPrice: number },
        context: IContext
    ) => {
        // TODO VALIDATE
        await DBManager.query(
            `INSERT INTO priceHistory(id, workerID, price) VALUES(${data.id}, 1, "${data.newPrice}");`
        );
        DBManager.connection.commit();
        return (await root.getProducts({ id: data.id }))[0];
    },
    deleteProduct: async ({
        id,
        recovery,
    }: {
        id: number;
        recovery?: boolean;
    }) => {
        // TODO VALIDATE
        await DBManager.query(
            `UPDATE product SET deleted=${recovery ? 0 : 1} WHERE id=${id};`
        );
        DBManager.connection.commit();
        return true;
    },
};

export default root;
