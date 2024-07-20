import { ClientInfo, OrderProduct } from "graphql/exportModels";
import { RowDataPacket } from "mysql2";

export interface IProduct extends RowDataPacket {
    id: number;
    title: string;
    description: string;
    deleted: boolean;
    showSale: boolean;
}

export interface ISize extends RowDataPacket {
    id: number;
    title: string;
}

export interface IPrice extends RowDataPacket {
    id: number;
    changed: Date;
    workerID: number;
    price: number;
}

export interface IResultProduct extends IProduct {
    sizes?: ISize[];
    price?: number;
    previousPrice?: number;
}

export interface IClientInfo extends RowDataPacket {
    id: number;
    uuid: string;
    name: string;
    surname: string;
    lastname?: string;
    phone: number;
    email: string;
    sale: boolean;
}

export interface IOrderInfo extends RowDataPacket {
    client: ClientInfo;
    deliveryType: number;
    status: string;
    PVZID?: String;
    products: OrderProduct[];
}
