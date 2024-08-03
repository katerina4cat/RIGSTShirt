import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable, runInAction } from "mobx";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import cl from "./Main.module.scss";
import ProductElement from "../../../modules/ProductElement/ProductElement";
import { APIGetProductsInfo, IProductInfo } from "../../../common/ApiManager";
import { createNotify, NotifyTypes } from "../../../App";
import CartBlock from "../../../modules/CartBlock/CartBlock";

interface Props {}

export class MainViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.loadProducts();
        this.calculateAspect();
    }
    nav = { navigate: (to: string) => {} };
    loadProducts = async (deepth = 1): Promise<void> => {
        const res = await APIGetProductsInfo();
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
    @observable
    aspectRatio = 1;
    protected onViewMounted(): void {
        window.addEventListener("resize", this.calculateAspect);
    }
    protected onViewUnmounted(): void {
        window.removeEventListener("resize", this.calculateAspect);
    }
    @action
    calculateAspect = () => {
        this.aspectRatio = window.innerWidth / window.innerHeight;
    };
    goToProduct = (id: number) => {
        this.nav?.navigate("/product/" + id);
    };
}
const Main = view(MainViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate nav={viewModel.nav}>
            <div className={cl.Main}>
                <div className={cl.PreviewScreen}>
                    {viewModel.aspectRatio < 0.677 ? (
                        <video
                            className={cl.VideoBackground}
                            src="/vertical.mp4"
                            loop
                            muted
                            playsInline
                            autoPlay
                        />
                    ) : (
                        <video
                            className={cl.VideoBackground}
                            src="/horisontal.mp4"
                            loop
                            muted
                            playsInline
                            autoPlay
                        />
                    )}
                    <div className={cl.PreviewText}>
                        Текст/слоган над превью видео
                    </div>
                </div>
                <h3>Каталог продукции:</h3>
                <div className={cl.Catalog}>
                    {viewModel.productList.map((product) => (
                        <ProductElement
                            productID={product.id}
                            title={product.title}
                            price={product.price}
                            showSale={product.showSale}
                            previousPrice={product.previousPrice}
                            onClick={() => viewModel.goToProduct(product.id)}
                        />
                    ))}
                </div>
                <CartBlock nav={viewModel.nav!} />
            </div>
        </BaseTemplate>
    );
});

export default Main;
