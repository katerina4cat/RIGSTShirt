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
