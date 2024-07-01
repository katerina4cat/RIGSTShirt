import { IContext } from "app";
import DBManager from "database/DBManager";
import { IProduct } from "database/interfaces";
import { ApiError } from "exceptions/errorService";
import { NewProductInput } from "graphql/models";
import root from "graphql/root";
import tokenService from "./tokenService";

export const adminServices = {
    addProduct: async (
        { product }: { product: NewProductInput },
        context: IContext
    ) => {
        const payload = await tokenService.validateAcessToken(context);
        if (payload instanceof ApiError) return payload;
        await DBManager.query(
            `INSERT INTO product(title, description, deleted, showSale) VALUES("${product.title}", "${product.description}", false, false);`
        );
        const createdProduct = (
            await DBManager.query<IProduct>(
                `SELECT * FROM product WHERE id=LAST_INSERT_ID() LIMIT 1;`
            )
        )[0];
        await DBManager.query(
            `INSERT INTO priceHistory(id, workerID, price) VALUES(${createdProduct.id}, ${payload.id}, "${product.price}");`
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
        const payload = await tokenService.validateAcessToken(context);
        if (payload instanceof ApiError) return payload;

        await DBManager.query(
            `INSERT INTO priceHistory(id, workerID, price) VALUES(${data.id}, ${payload.id}, "${data.newPrice}");`
        );
        DBManager.connection.commit();
        return (await root.getProducts({ id: data.id }))[0];
    },
    deleteProduct: async (
        {
            id,
            recovery,
        }: {
            id: number;
            recovery?: boolean;
        },
        context: IContext
    ) => {
        await tokenService.validateAcessToken(context);
        await DBManager.query(
            `UPDATE product SET deleted=${recovery ? 0 : 1} WHERE id=${id};`
        );
        DBManager.connection.commit();
        return true;
    },
};
