export interface OrderProduct {
    id: number;
    title: string;
    description: string;
    deleted: boolean;
    size: string;
    count: number;
    price: number;
}

export interface ClientInfo {
    name: String;
    surname: String;
    lastname?: String;
    phone?: String;
    email?: String;
}

export interface DeliveryInfo {
    latitude: number;
    longitude: number;
    entrance: String;
    apartment: String;
    description?: String;
}
