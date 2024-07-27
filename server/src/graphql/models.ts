import { deliveryTypes } from "../../../shared/enums";

export interface NewProductInput {
    title: string;
    description: string;
    price: number;
    sizes: number[];
}

export interface UpdateProductInput {
    title?: string;
    description?: string;
    price?: number;
    sizes?: number[];
    deleted?: boolean;
    showSale?: boolean;
}

export interface CartOrderInput {
    id: number;
    size: number;
    count: number;
}

export interface UserInfoInput {
    name: string;
    surname: string;
    lastname?: string;
    phone: string;
    email: string;
}

export interface DeliveryInput {
    deliveryType: number;
    PVZID?: String;
    customPoint?: CustomPointInput;
}

export interface CustomPointInput {
    latitude: number;
    longitude: number;
    entrance: string;
    apartment: string;
    description?: string;
}

export interface OrderFilterInput {
    orderID?: number;
    deliveryType?: deliveryTypes;
    orderStatus?: number;
}

export interface ProductsQuery {
    id?: number;
    showDeleted?: boolean;
}
