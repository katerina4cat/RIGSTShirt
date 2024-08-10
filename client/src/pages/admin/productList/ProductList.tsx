import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable, runInAction } from "mobx";
import cl from "./ProductList.module.scss";
import pr from "../../../modules/ProductElement/ProductElement.module.scss";
import { APIGetProductsInfo, IProductInfo } from "../../../common/ApiManager";
import { createNotify, navigate, NotifyTypes } from "../../../App";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import AddElementLogo from "../../../icons/product-add.svg?react";
import ProductElement from "../../../modules/ProductElement/ProductElement";
import { Switch } from "antd";
import Loading from "../../../modules/PageTemplate/Loading";

interface Props {}

export class ProductListViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.loadProducts();
    }

    loadProducts = async (deepth = 1): Promise<void> => {
        const res = await APIGetProductsInfo(true);
        if (res.errors !== undefined) {
            if (deepth >= 3)
                return createNotify(
                    "",
                    "Произошла ошибка при загрузке списка товаров",
                    NotifyTypes.ERROR,
                    2.25
                );
            return this.loadProducts(deepth + 1);
        }
        runInAction(() => {
            this.productList = res.data!.getProducts;
        });
    };
    @observable
    productList: IProductInfo[] = [];
    goToProduct = (id?: number) => {
        navigate.current("/admin/edit/" + id || "");
    };
    @observable
    showDeleted = false;
    @action
    setDeleted = (value: boolean) => {
        this.showDeleted = value;
    };
}
const ProductList = view(ProductListViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate logout back admin>
            <Loading needAuth>
                <div className={cl.ProductList}>
                    <h1>Список товаров</h1>
                    <h4>
                        Скрытые товары:{" "}
                        <Switch
                            value={viewModel.showDeleted}
                            onChange={viewModel.setDeleted}
                        />
                    </h4>
                    <div className={cl.Catalog}>
                        <div
                            className={pr.ProductElement}
                            style={{ justifyContent: "center" }}
                        >
                            <AddElementLogo
                                className={cl.Icon}
                                onClick={() => viewModel.goToProduct()}
                            />
                        </div>
                        {viewModel.productList
                            .filter((product) =>
                                viewModel.showDeleted
                                    ? product.deleted
                                    : !product.deleted
                            )
                            .map((product) => (
                                <ProductElement
                                    key={product.id}
                                    productID={product.id}
                                    title={product.title}
                                    price={product.price}
                                    showSale={product.showSale}
                                    previousPrice={product.previousPrice}
                                    onClick={() =>
                                        viewModel.goToProduct(product.id)
                                    }
                                />
                            ))}
                    </div>
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default ProductList;
