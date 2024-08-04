import { CartOrderInput, UserInfoInput, DeliveryInput } from "graphql/models";
import nodemailer from "nodemailer";
import { deliveryTypes } from "../../../shared/enums";
import fs from "fs";
import { mediaPath } from "app";
import { IOrderInfo } from "database/interfaces";
import axios from "axios";

const transporter = nodemailer.createTransport({
    service: "yandex",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

const sendEmail = (
    subject: string,
    html: string,
    to: string | undefined = process.env.TARGET_EMAIL
) => {
    if (!to) return;
    transporter.sendMail({
        to: to,
        from: process.env.EMAIL_USER,
        subject: subject,
        html: html,
    });
};
const templatesPath = mediaPath.replace("/media", "/src/common/templates");

const getAdressByCoords = async (geo: [number, number]): Promise<string> => {
    try {
        const res = (
            await axios.get(
                `https://geocode-maps.yandex.ru/1.x/?apikey=ba8d9899-bf4c-4afe-83be-87c06bf8f529&geocode=${geo.join(
                    ","
                )}&format=json`
            )
        ).data.response.GeoObjectCollection.featureMember;
        return (
            res[0].GeoObject.metaDataProperty.GeocoderMetaData.Address
                .formatted || "Не удалось определить адрес!"
        );
    } catch {
        return "Не удалось определить адрес!";
    }
};

const applyUserOrder = async (orderInfo: IOrderInfo) => {
    let res = fs.readFileSync(templatesPath + "/newOrder.html", "utf-8");
    res = res.replace(
        /\$price/gm,
        (
            orderInfo.products.reduce((a, b) => a + b.count * b.price, 0) *
            (1 - (orderInfo.client.sale ? 0.1 : 0))
        ).toLocaleString()
    );
    res = res.replace(
        /\$table/gm,
        "<tr>" +
            orderInfo.products
                .map(
                    (product) => `
            <td>${product.title}</td>
            <td>${product.count}</td>
            <td>${product.size}</td>
            <td>${product.price * product.count}</td>
            `
                )
                .join("</tr><tr>") +
            "</tr>"
    );
    return res;
};
const applyCustomOrder = async (orderInfo: IOrderInfo) => {
    let res = fs.readFileSync(templatesPath + "/customOrder.html", "utf-8");
    res = res.replace(
        /\$fio/gm,
        `${orderInfo.client.name} ${orderInfo.client.surname} ${
            orderInfo.client.lastname ? orderInfo.client.lastname : ""
        }`
    );
    res = res.replace(
        /\$phone/gm,
        orderInfo.client
            .phone!.toString()
            .replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "8 $1 $2-$3-$4")
    );
    res = res.replace(/\$email/gm, orderInfo.client.email!.toString());
    res = res.replace(
        /\$price/gm,
        (
            orderInfo.products.reduce((a, b) => a + b.count * b.price, 0) *
            (1 - (orderInfo.client.sale ? 0.1 : 0))
        ).toLocaleString()
    );
    res = res.replace(
        /\$cord/gm,
        `${orderInfo.customDelivery!.longitude},${
            orderInfo.customDelivery!.latitude
        }`
    );

    res = res.replace(
        /\$adress/gm,
        await getAdressByCoords([
            orderInfo.customDelivery!.longitude,
            orderInfo.customDelivery!.latitude,
        ])
    );

    res = res.replace(
        /\$entrance/gm,
        orderInfo.customDelivery!.entrance.toString()
    );
    res = res.replace(
        /\$apartment/gm,
        orderInfo.customDelivery!.apartment.toString()
    );
    res = res.replace(
        /\$description/gm,
        orderInfo.customDelivery!.description.toString()
    );
    res = res.replace(
        /\$table/gm,
        "<tr>" +
            orderInfo.products
                .map(
                    (product) => `
            <td>${product.title}</td>
            <td>${product.count}</td>
            <td>${product.size}</td>
            `
                )
                .join("</tr><tr>") +
            "</tr>"
    );
    return res;
};

export const newOrderInfo = async (orderInfo: IOrderInfo) => {
    if (orderInfo.deliveryType === deliveryTypes.CUSTOM_COURIER) {
        sendEmail(
            "[RIGS] Новый заказ курьера",
            await applyCustomOrder(orderInfo)
        );
    }
    sendEmail(
        "[RIGS] Ваш заказ сформирован",
        await applyUserOrder(orderInfo),
        orderInfo.client.email!.toString()
    );
};
