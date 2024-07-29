import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./ProductElement.module.scss";

interface Props {
    productID: number;
    title: string;
    price: number;
    previousPrice?: number;
    showSale: boolean;
    onClick?: () => void;
}

export class ProductElementViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const ProductElement = view(ProductElementViewModel)<Props>(({ viewModel }) => {
    return (
        <div
            className={cl.ProductElement}
            onClick={viewModel.viewProps.onClick}
        >
            <img
                src={`/api/product/picture/?p=${viewModel.viewProps.productID}`}
                alt=""
                className={cl.PreviewImage}
                onError={(e) => {
                    e.currentTarget.src = "/notImage.svg";
                }}
            />
            <div className={cl.Info}>
                <div className={cl.Title}>{viewModel.viewProps.title}</div>
                <div className={cl.Prices}>
                    <div className={cl.Current}>
                        {viewModel.viewProps.price.toLocaleString()} ₽
                    </div>
                    {viewModel.viewProps.showSale ? (
                        <del className={cl.Previous}>
                            {viewModel.viewProps.previousPrice?.toLocaleString()}{" "}
                            ₽
                        </del>
                    ) : null}
                </div>
            </div>
        </div>
    );
});

export default ProductElement;
