import axios from "axios";
import { deliveryTypes } from "../../../shared/enums";
import cl from "../pages/common/creatingOrder/CreatingOrder.module.scss";
import { createNotify, NotifyTypes } from "../App";

export const getAdressByCoords = async (geo: [number, number]) => {
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
export const getAdressByIDDeliveryOfices = async (
    id: string | number | undefined,
    deliveryType: deliveryTypes | undefined
) => {
    if (id === undefined) return;
    if (deliveryType === deliveryTypes.RUSSIAN_POST) {
        const res = await axios.get(`https://widget.pochta.ru/api/pvz/${id}`);
        const addressData = `${res.data.deliveryPointIndex}, ${
            res.data.address.place ? res.data.address.place + ", " : ""
        }${res.data.address.location ? res.data.address.location + ", " : ""}${
            res.data.address.street || ""
        }${res.data.address.house ? ", д." + res.data.address.house : ""}`;
        return (
            <>
                <div className={cl.Address}>{addressData}</div>
                <div className={cl.GetTo}>{res.data.getto}</div>
            </>
        );
    }
    if (deliveryType === deliveryTypes.CDEK) {
        const res = await axios.get("/api/delivery/CDEK/" + id);
        if ("errors" in res.data) {
            createNotify(
                "",
                "Произошла ошибка при получении информации о выбранном офисе",
                NotifyTypes.ERROR
            );
            return;
        }

        const addressData = `${res.data.code}, г. ${
            res.data.city ? res.data.city + ", " : ""
        }${res.data.address ? res.data.address : ""}`;
        return (
            <>
                <div className={cl.Address}>{addressData}</div>
                <div className={cl.GetTo}>
                    {res.data.type === "PVZ"
                        ? "Пунк выдачи заказа"
                        : res.data.type === "POSTAMAT"
                        ? "Постамат"
                        : ""}
                </div>
            </>
        );
    }
};
