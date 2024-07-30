import { action, makeObservable, observable } from "mobx";

interface CartElement {
    id: number;
    size: number;
    count: number;
}

class CartManager {
    @action
    loadData = () => {
        this.selectedProducts = JSON.parse(
            localStorage.getItem("CartData") || "[]"
        );
    };

    saveData = () => {
        localStorage.setItem("CartData", JSON.stringify(this.selectedProducts));
    };
    @observable
    selectedProducts: CartElement[] = [];
    constructor() {
        makeObservable(this);
        this.loadData();
    }
    @action
    addProduct = (productID: number, sizeID: number) => {
        const foundedProduct = this.selectedProducts.find(
            (products) => products.id === productID && products.size === sizeID
        );
        if (foundedProduct) {
            foundedProduct.count++;
            return;
        }
        this.selectedProducts.push({
            id: productID,
            size: sizeID,
            count: 1,
        });
        this.saveData();
    };
    @action
    subProduct = (productID: number, sizeID: number) => {
        const foundedProduct = this.selectedProducts.find(
            (products) => products.id === productID && products.size === sizeID
        );
        if (foundedProduct) {
            if (foundedProduct.count <= 1)
                return this.remProduct(productID, sizeID);
            foundedProduct.count--;
        }
        this.saveData();
    };
    @action
    remProduct = (productID: number, sizeID: number) => {
        this.selectedProducts = [
            ...this.selectedProducts.filter(
                (products) =>
                    !(products.id === productID && products.size === sizeID)
            ),
        ];
        this.saveData();
    };
}
const cartManager = new CartManager();
export default cartManager;
