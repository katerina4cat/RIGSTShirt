import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./ProductEditor.module.scss";
import { Button, Select, Switch } from "antd";
import Input from "../../../modules/Input/Input";
import {
    APIAccessTest,
    APICreateNewProduct,
    APIEditProduct,
    APIGetProductInfo,
    APIGetSizes,
    IProductInfo,
} from "../../../common/ApiManager";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";
import { createNotify, NotifyTypes } from "../../../App";
import Uploader from "../../../modules/Uploader/Uploader";
import { useParams } from "react-router-dom";
import InputArea from "../../../modules/InputArea/InputArea";
import {
    selections,
    selectionValue2id,
} from "../../../common/SelectTransformers";

interface Props {}

type InputsNames = "title" | "description" | "price";

export class ProductEditorViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };
    constructor() {
        super();
        makeObservable(this);
        const { id } = useParams();
        if (id !== undefined && /^\d+$/.test(id)) this.productID = Number(id);
        this.loadSizes();
    }
    protected onViewMounted(): void {
        this.loadServerData();
    }
    productID?: number;
    @observable
    inputData: { [key in InputsNames]: string } = {
        title: "",
        description: "",
        price: "0",
    };
    @observable
    prevPrice = -1;
    @observable
    showSale = false;
    @observable
    deleted = true;

    loadedData?: IProductInfo;

    @action
    handleInput = (
        event:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        this.inputData[event.target.name as InputsNames] = event.target.value;
        return event.target.value;
    };
    @action
    loadServerData = async () => {
        if (!(await APIAccessTest())) {
            this.nav.navigate("/admin/login");
            createNotify(
                "Авторизация",
                "Для открытия данной страницы необходима авторизация!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        if (this.productID === undefined) {
            const res = await APICreateNewProduct();
            if (res.errors !== undefined) {
                createNotify(
                    "Редактор товара",
                    "Не удалось открыть редактор!",
                    NotifyTypes.ERROR,
                    3
                );
                res.errors.forEach((errorInfo: { message: string }) =>
                    createNotify(
                        "Редактор товара",
                        errorInfo.message,
                        NotifyTypes.ERROR,
                        3
                    )
                );
                setTimeout(() => {
                    this.nav.navigate("/admin/menu");
                }, 2500);
                return;
            }
            if (typeof res !== "number") {
                createNotify(
                    "Редактор товара",
                    "Не удалось открыть редактор!",
                    NotifyTypes.ERROR,
                    3
                );
                setTimeout(() => {
                    this.nav.navigate("/admin/menu");
                }, 2500);
                return;
            }
            this.nav.navigate("/admin/edit/" + res);
            this.productID = res;
        }
        const res = await APIGetProductInfo(this.productID, true);
        if (res === undefined || res.errors !== undefined) {
            createNotify(
                "Редактор товара",
                "Не удалось открыть редактор!",
                NotifyTypes.ERROR,
                3
            );
            res.errors.forEach((errorInfo: { message: string }) =>
                createNotify(
                    "Редактор товара",
                    errorInfo.message,
                    NotifyTypes.ERROR,
                    3
                )
            );
            setTimeout(() => {
                this.nav.navigate("/admin/menu");
            }, 2500);
            return;
        }
        action(() => {
            this.loadedData = res;
            this.inputData.title = res.title;
            this.inputData.description = res.description;
            this.inputData.price = res.price.toString();
            this.deleted = res.deleted;
            this.showSale = res.showSale;
            this.prevPrice = res.previousPrice;
            this.selectedSizes = res.sizes.map(
                (size: { id: number }) => size.id
            );

            this.loading = false;
        })();
    };

    tryLoadSize = 0;

    @action
    loadSizes = async () => {
        const res = await APIGetSizes();
        if (res.errors !== undefined) {
            createNotify(
                "Редактор товара",
                `Не удалось загрузить список размеров!
                ${this.tryLoadSize + 1} попытка`,
                NotifyTypes.ERROR,
                1.5
            );
            if (this.tryLoadSize >= 3) {
                this.tryLoadSize++;
                setTimeout(() => {
                    this.loadSizes();
                }, 1000);
            }
            return;
        }
        this.sizes = selections.size.options(res);
    };

    handleSelected = (values: string[]) => {
        this.selectedSizes = values.map((value) => selectionValue2id(value));
    };

    saveChanges = () => {
        let dataToSave: Partial<IProductInfo> = {};

        if (this.loadedData?.title !== this.inputData.title)
            dataToSave.title = this.inputData.title;

        if (this.loadedData?.description !== this.inputData.description)
            dataToSave.description = this.inputData.description;

        if (this.loadedData?.deleted !== this.deleted)
            dataToSave.deleted = this.deleted;

        if (this.loadedData?.showSale !== this.showSale)
            dataToSave.showSale = this.showSale;

        if (this.loadedData?.price != Number(this.inputData.price))
            dataToSave.price = Number(this.inputData.price);

        if (
            this.loadedData!.sizes.length != this.selectedSizes.length ||
            this.loadedData!.sizes.filter(
                (size, i) => size.id != this.selectedSizes[i]
            ).length > 0
        )
            dataToSave.sizes = this.selectedSizes.map((size) => ({ id: size }));

        if (Object.values(dataToSave).filter((x) => x !== undefined).length > 0)
            APIEditProduct(this.productID!, dataToSave).then((res) => {
                if (res.errors !== undefined) {
                    res.errors.forEach((errorInfo: { message: string }) =>
                        createNotify(
                            "Редактор товара",
                            errorInfo.message,
                            NotifyTypes.ERROR,
                            3
                        )
                    );
                    return;
                }
                this.loadedData = res;
                createNotify(
                    "Редактор товара",
                    `Новые данные товара №${res.id} успешно сохранены`,
                    NotifyTypes.SUCCESS,
                    2
                );
            });
        else
            createNotify(
                "Редактор товара",
                "Вы не внесли никакие изменения!",
                NotifyTypes.WARNING,
                1.75
            );
    };

    @observable
    loading = true;
    @observable
    selectedSizes: number[] = [];
    @observable
    sizes: { label: string; value: string }[] = [];
}
const ProductEditor = view(ProductEditorViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate backUrl="/admin/list" logout nav={viewModel.nav}>
            <Loading loading={viewModel.loading}>
                <div className={cl.ProductEditor}>
                    <div className={cl.EditorBox}>
                        <h3>Добавление/редактирование товара</h3>
                        <Uploader productID={viewModel.productID!} />
                        <br />
                        <Input
                            value={viewModel.inputData.title}
                            name={"title"}
                            onChange={viewModel.handleInput}
                            placeholder="Название"
                        />
                        <InputArea
                            value={viewModel.inputData.description}
                            name={"description"}
                            onChange={viewModel.handleInput}
                            placeholder="Описание"
                            style={{
                                height: "35vh",
                                width: "80vw",
                                resize: "none",
                            }}
                        />
                        <Select
                            placeholder="Размер"
                            mode="multiple"
                            options={viewModel.sizes}
                            value={
                                viewModel.selectedSizes
                                    .map(
                                        (select) =>
                                            viewModel.sizes.find(
                                                (element) =>
                                                    selectionValue2id(
                                                        element.value
                                                    ) === select
                                            )?.value
                                    )
                                    .filter(Boolean) as string[]
                            }
                            className={cl.Select}
                            onChange={viewModel.handleSelected}
                        />
                        <br />
                        <br />
                        <div className={cl.PrevPriceBox}>
                            Предыдущая цена:
                            <div className={cl.PrevPrice}>
                                {viewModel.prevPrice > 0
                                    ? viewModel.prevPrice
                                    : "-"}
                            </div>
                        </div>
                        <Input
                            type="number"
                            value={viewModel.inputData.price}
                            name={"price"}
                            onChange={viewModel.handleInput}
                            placeholder="Цена"
                        />
                        <div className={cl.SwitchBox}>
                            Показать скидку:
                            <Switch
                                value={viewModel.showSale}
                                onChange={action((checked) => {
                                    viewModel.showSale = checked;
                                })}
                                className={cl.Switch}
                            />
                            <div />
                            Скрыть товар:
                            <Switch
                                value={viewModel.deleted}
                                onChange={action((checked) => {
                                    viewModel.deleted = checked;
                                })}
                                className={cl.Switch}
                            />
                        </div>
                        <div className={cl.SaveBox}>
                            <Button onClick={viewModel.saveChanges}>
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default ProductEditor;
