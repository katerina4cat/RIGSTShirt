import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable, observable, runInAction } from "mobx";
import "./ImageSlider.css";
import { Carousel } from "antd";
import axios from "axios";

interface Props {
    productID?: number;
    className?: string;
    imageClassName?: string;
}

export class ImageSliderViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
    protected onViewUpdated(): void {
        if (this.viewProps.productID) this.loadUrls();
    }
    @observable
    imageUrls: string[] = [];
    loadUrls = async () => {
        const res = await axios.get(
            "/api/product/list/?p=" + this.viewProps.productID
        );
        runInAction(() => {
            this.imageUrls = res.data;
        });
    };
}
const ImageSlider = view(ImageSliderViewModel)<Props>(({ viewModel }) => {
    return (
        <div>
            <Carousel
                dotPosition="bottom"
                arrows
                dots={{ className: "Dots" }}
                draggable
                className={viewModel.viewProps.className}
            >
                {viewModel.imageUrls.map((url) => (
                    <img
                        src={
                            "/api/product/picture/?p=" +
                            viewModel.viewProps.productID +
                            "&img=" +
                            url
                        }
                        className={viewModel.viewProps.imageClassName}
                    />
                ))}
            </Carousel>
            <div>
                {viewModel.imageUrls.map((_, i) => (
                    <div />
                ))}
            </div>
        </div>
    );
});

export default ImageSlider;
