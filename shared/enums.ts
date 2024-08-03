export enum deliveryTypes {
    CDEK = 1,
    RUSSIAN_POST = 2,
    CUSTOM_COURIER = 3,
}
export const delivertTitles: { [key in deliveryTypes]: string } = {
    [deliveryTypes.CDEK]: "СДЕК",
    [deliveryTypes.RUSSIAN_POST]: "Почта России",
    [deliveryTypes.CUSTOM_COURIER]: "Курьер",
};
