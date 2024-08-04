import axios from "axios";
import cartManager from "./CartManager";
import { deliveryTypes } from "../../../shared/enums";

const baseURL = "/api";

export const APILogin = async (login: string, password: string) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
login(login:"${login}", password: "${password}")
}`,
        });
        return res.data;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APILogOut = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
logout
}`,
        });
        return res.data;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIAccessTest = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `{
            hasAccess
            }`,
        });
        return res.data.data.hasAccess;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APICreateNewProduct = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  addProduct(product:{title:"", description:"", price:0, sizes:[]}){
    id
  }
}`,
        });
        return res.data.data.addProduct.id;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export interface IProductInfo {
    id: number;
    title: string;
    description: string;
    price: number;
    previousPrice: number;
    showSale: boolean;
    deleted: boolean;
    sizes: {
        id: number;
        title?: string;
    }[];
    errors: undefined;
}

export const APIGetProductInfo = async (
    id: number,
    deleted = false,
    sizeTitle = false
) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getProducts(id:${id}, showDeleted:${deleted}){
    id
    title
    description
    price
    showSale
    deleted
    previousPrice
    sizes {
      id
      ${sizeTitle ? "title" : ""}
    }
  }
}`,
        });
        return res.data.data.getProducts[0] as IProductInfo;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

interface ProductsInfoApiResult {
    data?: {
        getProducts: IProductInfo[];
    };
    errors?: { message: string }[];
}
export const APIGetProductsInfo = async (
    deleted = false
): Promise<ProductsInfoApiResult> => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getProducts${deleted ? "(showDeleted:true)" : ""}{
    id
    title
    description
    deleted
    price
    showSale
    previousPrice
  }
}`,
        });
        if (res.data.errors !== undefined) throw 1;
        return res.data as ProductsInfoApiResult;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIGetProductsCartInfo = async (
    ids: number[],
    onlyPrice = false
): Promise<ProductsInfoApiResult> => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getProducts(ids:[${ids.join(",")}]){
    id
    price
    ${
        onlyPrice
            ? ""
            : `title
    description
    showSale
    sizes {
      id
      title
    }`
    }
  }
}`,
        });
        if (res.data.errors !== undefined) throw 1;
        return res.data as ProductsInfoApiResult;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIGetProductPictureUrls = async (id: number) => {
    try {
        const res = await axios.get(baseURL + "/product/list/?p=" + id);
        return (res.data as string[]).map(
            (fileName) => `/product/picture/?p=${id}&img=${fileName}`
        );
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIGetSizes = async (ids?: number[]) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getSizes${ids !== undefined ? `(ids:[${ids.join(",")}])` : ""}{
    id
    title
  }
}`,
        });
        return res.data.data.getSizes;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIGetStatuses = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getStatuses
}`,
        });
        return res.data.data.getStatuses;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIEditProduct = async (
    id: number,
    updatedInfo: Partial<IProductInfo>
) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  updateProduct(id:${id},updatedFields:{
    ${[
        updatedInfo.title && `title:"${updatedInfo.title}"`,
        updatedInfo.description && `description:"${updatedInfo.description}"`,
        updatedInfo.showSale !== undefined &&
            `showSale:${updatedInfo.showSale}`,

        updatedInfo.deleted !== undefined && `deleted:${updatedInfo.deleted}`,
        updatedInfo.price !== undefined && `price:${updatedInfo.price}`,
        updatedInfo.sizes &&
            `sizes:[${updatedInfo.sizes.map((size) => size.id)}]`,
    ]
        .filter(Boolean)
        .join("\n")}
  })
  {
    id
    title
    description
    price
    showSale
    deleted
    previousPrice
    sizes {
      id
    }
  }
}`,
        });
        return res.data.data.updateProduct;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APICreateOrder = async (
    name: string,
    surname: string,
    phone: string,
    email: string,
    deliveryType: deliveryTypes,
    PVZID: string | number,
    lastname?: string
) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  addOrder(
    cart:[${cartManager.selectedProducts
        .map(
            (product) =>
                `{id: ${product.id}, size: ${product.size}, count: ${product.count}}`
        )
        .join(",")}], 
    user:{
      name: "${name}"
      surname: "${surname}"
      ${lastname ? `lastname: "${lastname}"` : ""}
      phone: "${phone}"
      email: "${email}"
    },
    delivery: {
      deliveryType: ${deliveryType}
      PVZID: "${PVZID.toString()}"
    }
  ){
    id
    status
  }
}`,
        });
        return res.data.data.addOrder;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APICreateOrderCustom = async (
    name: string,
    surname: string,
    phone: string,
    email: string,
    deliveryType: deliveryTypes,
    geo: [number, number],
    entrance: string,
    apartment: string,
    description: string,
    lastname?: string
) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  addOrder(
    cart:[${cartManager.selectedProducts
        .map(
            (product) =>
                `{id: ${product.id}, size: ${product.size}, count: ${product.count}}`
        )
        .join(",")}], 
    user:{
      name: "${name}"
      surname: "${surname}"
      ${lastname ? `lastname: "${lastname}"` : ""}
      phone: "${phone}"
      email: "${email}"
    },
    delivery: {
      deliveryType: ${deliveryType}
      customPoint:{
        longitude: ${geo[0]}
        latitude: ${geo[1]}
        entrance: "${entrance}"
        apartment: "${apartment}"
        description: "${description}"
      }
    }
  ){
    id
    status
  }
}`,
        });
        if ("errors" in res.data) return res.data;
        return res.data.data.addOrder;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export interface Orders {
    id: number;
    client: {
        name: string;
        surname?: string;
        lastname?: string;
        email?: string;
        sale?: number;
        phone: string;
    };
    deliveryType: deliveryTypes;
    status: string;
    PVZID?: string;
    customDelivery?: {
        latitude: number;
        longitude: number;
        entrance: string;
        apartment: string;
        description: string;
    };
    products: {
        id?: number;
        count: number;
        price: number;
        title?: string;
        size?: string;
    }[];
}

export const APIGetOrders = async (
    filter: {
        deliveryType?: number;
        orderStatus?: string;
    } = {}
) => {
    try {
        let filterStr = "";
        if (Object.values(filter).filter(Boolean).length > 0)
            filterStr = `${Object.keys(filter)
                .filter((key) =>
                    Boolean(filter[key as "deliveryType" | "orderStatus"])
                )
                .map(
                    (key) =>
                        `${key}: ${
                            filter[key as "deliveryType" | "orderStatus"]
                        }`
                )
                .join(",")}`;
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getOrders(filter:{${filterStr}}){
    id
    client{
      name
      phone
    }
    deliveryType
    status
    PVZID
    products{
      count
      price
    }
  }
}`,
        });
        return res.data.data.getOrders as Orders[];
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIGetOrderInfo = async (orderID: number) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
{
  getOrders(filter:{orderID:${orderID}}){
    id
    client{
      name
      surname
      lastname
      phone
      email
      sale
    }
    deliveryType
    status
    PVZID
    customDelivery{
      latitude
      longitude
      entrance
      apartment
      description
    }
    products{
      id
      title
      count
      size
      price
    }
  }
}`,
        });
        return res.data.data.getOrders[0] as Orders;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIChangeOrderStatus = async (orderID: number, status: string) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  updateOrder(orderID:${orderID}, status:"${status}")
}`,
        });
        return res.data.data as { updateOrder: boolean };
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIAddSize = async (size: string) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `
mutation{
  addSize(size:"${size}")
}`,
        });
        return res.data.data as { addSize: number };
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};
