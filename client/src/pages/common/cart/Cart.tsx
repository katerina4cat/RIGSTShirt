import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Cart.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import {
    APIGetProductsCartInfo,
    APIGetSizes,
} from "../../../common/ApiManager";
import cartManager from "../../../common/CartManager";
import { Button, Select } from "antd";
import {
    selections,
    selectionValue2id,
} from "../../../common/SelectTransformers";
import { createNotify, NotifyTypes } from "../../../App";

interface Props {}

interface IProductInfo {
    id: number;
    title: string;
    description: string;
    price: number;
    showSale: boolean;
    sizes: { id: number; title?: string }[];
}

export class CartViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };
    constructor() {
        super();
        makeObservable(this);
        this.loadProductInfo();
    }
    @observable
    productsInfo: IProductInfo[] = [];

    loadProductInfo = async () => {
        const res = await APIGetProductsCartInfo(
            cartManager.selectedProducts
                .map((product) => product.id)
                .filter((element, index, arr) => arr.indexOf(element) === index)
        );
        if (res.data) this.productsInfo = res.data.getProducts;
    };
    @action
    changeSize = (productID: number, fromSizeID: number, toSizeID: number) => {
        const prevSizeElementIndex = cartManager.selectedProducts.findIndex(
            (product) => product.id === productID && product.size === fromSizeID
        );
        if (prevSizeElementIndex === -1) {
            createNotify(
                "",
                "Произошла ошибка при попытке изменения размера",
                NotifyTypes.ERROR,
                1.75
            );
            return;
        }
        const newSizeElementIndex = cartManager.selectedProducts.findIndex(
            (product) => product.id === productID && product.size === toSizeID
        );
        if (newSizeElementIndex === -1)
            cartManager.selectedProducts[prevSizeElementIndex].size = toSizeID;
        else {
            cartManager.selectedProducts[newSizeElementIndex].count +=
                cartManager.selectedProducts[prevSizeElementIndex].count;
            cartManager.selectedProducts.splice(prevSizeElementIndex, 1);
        }
    };
}
const Cart = view(CartViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate nav={viewModel.nav} backUrl="/">
            <div className={cl.Cart}>
                <h3>Корзина</h3>
                {cartManager.selectedProducts.map((cartRawProduct) => {
                    const product = viewModel.productsInfo.find(
                        (p) => p.id === cartRawProduct.id
                    );
                    if (product)
                        return (
                            <div className={cl.CartElement}>
                                <img
                                    src={`/api/product/picture/?p=${product.id}`}
                                    alt="Изображение"
                                    onError={(e) => {
                                        e.currentTarget.src = "/notImage.svg";
                                    }}
                                    className={cl.Image}
                                />
                                <div className={cl.Title}>{product.title}</div>
                                <div className={cl.ThreeElement}>
                                    <div className={cl.Counter}>
                                        <button
                                            onClick={() =>
                                                cartManager.subProduct(
                                                    cartRawProduct.id,
                                                    cartRawProduct.size
                                                )
                                            }
                                            className={cl.BTN}
                                        >
                                            -
                                        </button>
                                        <div className={cl.Count}>
                                            {cartRawProduct.count}
                                        </div>
                                        <button
                                            onClick={() =>
                                                cartManager.addProduct(
                                                    cartRawProduct.id,
                                                    cartRawProduct.size
                                                )
                                            }
                                            className={cl.BTN}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className={cl.Price}>
                                        {product.price.toLocaleString()} ₽
                                    </div>
                                    <Select
                                        className={cl.SizeSelect}
                                        options={selections.size.options(
                                            product.sizes
                                        )}
                                        value={
                                            selections.size.convert2value(
                                                product.sizes.find(
                                                    (size) =>
                                                        size.id ===
                                                        cartRawProduct.size
                                                )
                                            )?.value
                                        }
                                        onChange={(value) =>
                                            viewModel.changeSize(
                                                product.id,
                                                cartRawProduct.size,
                                                selectionValue2id(value)
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        );
                })}
                <div className={cl.EndPage}>
                    <div className={cl.Total}>
                        Сумма:
                        <div className={cl.Price}>
                            {cartManager.selectedProducts
                                .map(
                                    (cartProduct) =>
                                        (viewModel.productsInfo.find(
                                            (product) =>
                                                product.id === cartProduct.id
                                        )?.price || 0) * cartProduct.count
                                )
                                .reduce((a, b) => a + b, 0)
                                .toLocaleString()}{" "}
                            ₽
                        </div>
                    </div>
                    <Button onClick={() => viewModel.nav.navigate("/order")}>
                        Оформить заказ
                    </Button>
                </div>
            </div>
        </BaseTemplate>
    );
});

export default Cart;
