export interface NewProductInput {
    title: string;
    description: string;
    price: number;
    sizes: number[];
}

export interface ProductOrderInput {
    id: number;
    size: number;
    count: number;
}

export interface CreateOrderInput {
    name: string;
    surname: string;
    lastname?: string;
    phone: string;
    email: string;
    products: ProductOrderInput[];
}

export interface ProductsQuery {
    id?: number;
    showDeleted?: boolean;
}
