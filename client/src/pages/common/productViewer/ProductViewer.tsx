import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable, observable, runInAction } from "mobx";
import cl from "./ProductViewer.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import { useParams } from "react-router-dom";
import { APIGetProductInfo, IProductInfo } from "../../../common/ApiManager";
import { createNotify, navigate, NotifyTypes } from "../../../App";
import ImageSlider from "../../../modules/ImageSlider/ImageSlider";
import CartBlock from "../../../modules/CartBlock/CartBlock";
import { Button, Select } from "antd";
import CartAddIcon from "../../../icons/shopping-bag-plus.svg?react";
import cartManager from "../../../common/CartManager";
import { selections } from "../../../common/SelectTransformers";

interface Props {}

export class ProductViewerViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);

        const { id } = useParams();
        if (id !== undefined && /^\d+$/.test(id)) this.productID = Number(id);
        if (this.productID == -1) {
            setTimeout(() => navigate.current("/"), 500);
            createNotify("", "Товар не найден", NotifyTypes.ERROR, 2);
        }
        this.loadProductData();
    }

    loadProductData = async (deepth = 0): Promise<void> => {
        const res = await APIGetProductInfo(this.productID, undefined, true);
        if (res.errors !== undefined) {
            if (deepth >= 3) {
                setTimeout(() => navigate.current("/"), 2000);
                return createNotify(
                    "",
                    "Произошла ошибка при загрузке товара",
                    NotifyTypes.ERROR,
                    2.25
                );
            }
            return this.loadProductData(deepth + 1);
        }
        runInAction(() => {
            this.productInfo = res;
        });
    };

    addProductToCart = () => {
        if (this.currentSelect === undefined)
            return createNotify(
                "",
                "Вы не выбрали размер!",
                NotifyTypes.WARNING
            );
        cartManager.addProduct(this.productID, this.currentSelect);
        createNotify("", "Товар добавлен в корзину!", NotifyTypes.SUCCESS);
    };

    currentSelect?: number;
    @observable
    productInfo?: IProductInfo;
    productID = -1;
}
const ProductViewer = view(ProductViewerViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate back>
            <div className={cl.ProductViewer}>
                <div className={cl.Box}>
                    <div className={cl.Title}>
                        {viewModel.productInfo?.title}
                    </div>
                    <ImageSlider
                        productID={viewModel.productInfo?.id}
                        className={cl.Carousel}
                        imageClassName={cl.Image}
                    />
                    <div className={cl.Description}>
                        {viewModel.productInfo?.description}
                    </div>
                    <div className={cl.ThreeElement}>
                        <div className={cl.Prices}>
                            <div className={cl.Current}>
                                {viewModel.productInfo?.price.toLocaleString()}{" "}
                                ₽
                            </div>
                            {viewModel.productInfo?.showSale ? (
                                <del className={cl.Previous}>
                                    {viewModel.productInfo?.previousPrice?.toLocaleString()}{" "}
                                    ₽
                                </del>
                            ) : null}
                        </div>
                        <Select
                            onChange={(value) =>
                                (viewModel.currentSelect =
                                    selections.size.getvalue(value))
                            }
                            className={cl.SelectSize}
                            placeholder="Размер"
                            options={selections.size.options(
                                viewModel.productInfo?.sizes
                            )}
                        />
                        <Button
                            icon={<CartAddIcon className={cl.Icon} />}
                            className={cl.AddToCart}
                            onClick={viewModel.addProductToCart}
                        >
                            В корзину
                        </Button>
                    </div>
                </div>
                <CartBlock />
            </div>
        </BaseTemplate>
    );
});

export default ProductViewer;
