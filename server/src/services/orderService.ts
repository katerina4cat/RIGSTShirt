import DBManager from "database/DBManager";
import { IClientInfo, IOrderInfo } from "database/interfaces";
import { ApiError } from "exceptions/errorService";
import { ClientInfo } from "graphql/exportModels";
import {
    CartOrderInput,
    DeliveryInput,
    OrderFilterInput,
    UserInfoInput,
} from "graphql/models";

abstract class userUUID {
    uuid!: string;
}

export const orderService = {
    orderSales: async ({
        phone,
    }: {
        phone: String;
    }): Promise<number | ApiError> => {
        try {
            const hasSale = (
                await DBManager.query(
                    `SELECT checkClientSaleByPhone(${phone}) as res;`
                )
            )[0]["res"];
            if (hasSale) return 0.1;
            else return 0;
        } catch {
            return 0;
        }
    },
    addOrder: async ({
        cart,
        user,
        delivery,
    }: {
        cart: CartOrderInput[];
        user: UserInfoInput | userUUID;
        delivery: DeliveryInput;
    }): Promise<IOrderInfo | ApiError> => {
        let client: IClientInfo | undefined;

        // Скорее всего поиск пользовательских данных по UUID не будет использоваться!
        if (user instanceof userUUID) {
            client = (
                await DBManager.query<IClientInfo>(
                    `SELECT * FROM clientInfo WHERE uuid = "${user.uuid}" LIMIT 1;`
                )
            )[0];
            if (!client)
                return ApiError.BadRequest("Указан неверный uuid пользователя");
        } else {
            try {
                await DBManager.query(`INSERT INTO clientInfo(name, surname${
                    user.lastname && `, lastname`
                }, phone, email)
                VALUES("${user.name}", "${user.surname}"${
                    user.lastname && `, "${user.lastname}"`
                }, "${user.phone}", "${user.email}");`);
            } catch {}
            client = (
                await DBManager.query<IClientInfo>(
                    `SELECT * FROM clientInfo WHERE phone = ${user.phone} LIMIT 1;`
                )
            )[0];
        }
        // Создание нового заказа
        await DBManager.query(`INSERT INTO \`order\`(deliveryType, ${
            delivery.PVZID && `PVZID,`
        } clientID)
            VALUES(${delivery.deliveryType}, ${
            delivery.PVZID && `"${delivery.PVZID}",`
        } ${client.id});`);
        // Получение ID созданного заказа
        const orderID: number = (
            await DBManager.query(`SELECT LAST_INSERT_ID() as id;`)
        )[0]["id"];
        // Установка статуса заказа
        await DBManager.query(`INSERT INTO statusHistory(orderID, workerID, statusID) VALUES
        (${orderID}, 1, 25);`);
        // Заполнение заказанных товаров
        await DBManager.query(`INSERT INTO orderPosition(orderID, productID, sizeID, count) VALUES
            ${cart
                .map(
                    (product) =>
                        `(${orderID}, ${product.id}, ${product.size}, ${product.count})`
                )
                .join(",")};`);
        // Запись адреса доставки до двери
        if (delivery.customPoint)
            await DBManager.query(
                `INSERT INTO deliveryInfo(latitude, longitude, entrance, apartment, description) VALUES(${delivery.customPoint.latitude},${delivery.customPoint.longitude},"${delivery.customPoint.entrance}","${delivery.customPoint.apartment}","${delivery.customPoint.description}");`
            );
        const res = await orderService.getOrders({
            filter: { orderID: orderID },
        });
        if (res instanceof ApiError) return res;

        return res[0];
    },
    getOrders: async ({
        filter,
    }: {
        filter?: OrderFilterInput;
    }): Promise<IOrderInfo[] | ApiError> => {
        try {
            let query = `SELECT 
        \`order\`.id,
        \`order\`.deliveryType,
        \`order\`.PVZID,
        getOrderProducts(\`order\`.id, \`order\`.createdAt) as products,
        getOrderStatus(\`order\`.id) as status,
        getClientInfo(\`order\`.clientID) as client
        FROM \`order\``;
            const filters = [];
            if (filter?.orderID) filters.push(`\`order\`.id=${filter.orderID}`);
            if (filter?.deliveryType)
                filters.push(`\`order\`.deliveryType=${filter.deliveryType}`);
            if (filter?.orderStatus)
                filters.push(
                    `getOrderStatus(\`order\`.id)="${filter.orderStatus}"`
                );
            if (filters.length) query += ` WHERE ${filters.join(" AND ")}`;
            const result = await DBManager.query<IOrderInfo>(query + ";");
            return result || [];
        } catch (err) {
            return ApiError.RuntimeError("Произошла ошибка");
        }
    },
};
