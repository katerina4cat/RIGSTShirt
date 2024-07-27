import { IContext } from "app";
import DBManager from "database/DBManager";
import { IProduct, IResultProduct } from "database/interfaces";
import { ApiError } from "exceptions/errorService";
import { NewProductInput, UpdateProductInput } from "graphql/models";
import root from "graphql/root";
import tokenService from "./tokenService";

export const productEditorServices = {
    addProduct: async (
        { product }: { product: NewProductInput },
        context: IContext
    ): Promise<IResultProduct | ApiError> => {
        const payload = await tokenService.validateAcessToken(context);
        if (payload instanceof ApiError) return payload;
        await DBManager.query(
            `INSERT INTO product(title, description, deleted, showSale) VALUES("${product.title}", "${product.description}", true, false);`
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
        return (
            await root.getProducts({ id: createdProduct.id, showDeleted: true })
        )[0];
    },
    updateProduct: async (
        {
            id,
            updatedFields,
        }: { id: number; updatedFields: UpdateProductInput },
        context: IContext
    ): Promise<IResultProduct | ApiError> => {
        const payload = await tokenService.validateAcessToken(context);
        if (payload instanceof ApiError) return payload;

        if (!Object.keys(updatedFields).length)
            return ApiError.BadRequest("Вы не изменили ни 1 значения товара");

        if (updatedFields.price)
            await DBManager.query(
                `INSERT INTO priceHistory(id, workerID, price) VALUES(${id}, ${payload.id}, "${updatedFields.price}");`
            );
        if (
            updatedFields.title ||
            updatedFields.description ||
            updatedFields.showSale !== undefined ||
            updatedFields.deleted !== undefined
        )
            await DBManager.query(
                `UPDATE product SET ${[
                    updatedFields.title && `title="${updatedFields.title}"`,
                    updatedFields.description &&
                        `description="${updatedFields.description}"`,
                    updatedFields.showSale !== undefined &&
                        `showSale=${updatedFields.showSale}`,
                    updatedFields.deleted !== undefined &&
                        `deleted=${updatedFields.deleted}`,
                ]
                    .filter(Boolean)
                    .join(",")} WHERE id=${id};`
            );

        if (updatedFields.sizes) {
            await DBManager.query(`DELETE FROM sizes WHERE productID=${id};`);
            await DBManager.query(
                `INSERT INTO sizes VALUES
                    ${updatedFields.sizes
                        .map((sizeID) => `(${id},${sizeID})`)
                        .join(",")};`
            );
        }
        DBManager.connection.commit();
        return (await root.getProducts({ id: id, showDeleted: true }))[0];
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
    ): Promise<Boolean | ApiError> => {
        await tokenService.validateAcessToken(context);
        await DBManager.query(
            `UPDATE product SET deleted=${recovery ? 0 : 1} WHERE id=${id};`
        );
        DBManager.connection.commit();
        return true;
    },
};
