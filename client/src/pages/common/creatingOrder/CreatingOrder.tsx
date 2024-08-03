import { ViewModel, view } from "@yoskutik/react-vvm";
import {
    action,
    computed,
    makeObservable,
    observable,
    reaction,
    runInAction,
} from "mobx";
import cl from "./CreatingOrder.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Input from "../../../modules/Input/Input";
import { Button, Select } from "antd";
import {
    selectionDeliverys,
    selectionValue2id,
} from "../../../common/SelectTransformers";
import { deliveryTypes } from "../../../../../shared/enums";
import {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapComponentsProvider,
    YMapListener,
} from "ymap3-components";
import axios from "axios";
import {
    CDEKPointInfo,
    decoders,
    PRusPointInfo,
} from "../../../../../shared/Decoders";
import {
    Bounds,
    filterPoints,
    getDistance,
    Point,
} from "../../../common/MapPointerFilter";
import MapMarker from "../../../modules/MapMarker/MapMarker";
import { createNotify, NotifyTypes } from "../../../App";
import cartManager from "../../../common/CartManager";
import {
    APICreateOrder,
    APIGetProductsCartInfo,
} from "../../../common/ApiManager";

interface Props {}
type Inputs = "first" | "last" | "middle" | "phone" | "email";
interface InputCheck {
    condition: boolean;
    errorMsg: string;
}

export class CreatingOrderViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };
    tryCreateOrder = async () => {
        const checkResult: InputCheck[] = [
            {
                condition: !this.inputData.first,
                errorMsg: "Вы не ввели имя!",
            },
            {
                condition: !this.inputData.last,
                errorMsg: "Вы не ввели фамилию!",
            },
            {
                condition: !this.inputData.phone,
                errorMsg: "Вы не ввели номер телефона!",
            },
            {
                condition:
                    !/(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))$/.test(
                        this.inputData.phone.replace(/\s|-/gm, "")
                    ),
                errorMsg: "Вы не ввели не верный номер телефона!",
            },
            {
                condition: !this.inputData.email,
                errorMsg: "Вы не ввели апдрес электронной почты!",
            },
            {
                condition: !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
                    this.inputData.email
                ),
                errorMsg: "Вы не ввели не верный адрес электронной почты!",
            },
            {
                condition: !this.deliveryType,
                errorMsg: "Вы не выбрали способ доставки!",
            },
            {
                condition: this.selectedID === undefined,
                errorMsg: "Вы не выбрали офис/постамат!",
            },
            {
                condition: cartManager.selectedProducts.length < 1,
                errorMsg: "Ваша корзина пуста!",
            },
        ];
        let hasError = false;
        checkResult.forEach((check) => {
            if (check.condition) {
                createNotify("", check.errorMsg, NotifyTypes.ERROR, 2.5);
                hasError = true;
            }
        });
        if (hasError) return;
        const res = await APICreateOrder(
            this.inputData.first,
            this.inputData.last,
            /(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))$/.exec(
                this.inputData.phone.replace(/\s|-/gm, "")
            )![2],
            this.inputData.email,
            this.deliveryType!,
            this.selectedID!.toString(),
            this.inputData.middle
        );
        if ("errors" in res) {
            res.errors.forEach((error: any) =>
                createNotify(
                    "Создание заказа",
                    error.message,
                    NotifyTypes.ERROR,
                    3
                )
            );
            return;
        }
        cartManager.clearCart();
        this.nav.navigate("/");
        const splice = (base: string, idx: number, rem: number, str: string) =>
            base.slice(0, idx) + str + base.slice(idx + Math.abs(rem));
        createNotify(
            "Заказ",
            `Ваш заказ успешно сформирован. Номер заказа: ${splice(
                (res.id as number).toString().padStart(8),
                4,
                0,
                "-"
            )}`,
            NotifyTypes.SUCCESS
        );
    };

    constructor() {
        super();
        makeObservable(this);
        this.loadCDEK();
        this.loadPRus();
        this.loadProductInfo();
        reaction(
            () => this.selectedID,
            async (value) => {
                if (!value) return;
                if (this.deliveryType === deliveryTypes.RUSSIAN_POST) {
                    const res = await axios.get(
                        `https://widget.pochta.ru/api/pvz/${value}`
                    );
                    const addressData = `${res.data.deliveryPointIndex}, ${
                        res.data.address.place
                            ? res.data.address.place + ", "
                            : ""
                    }${
                        res.data.address.location
                            ? res.data.address.location + ", "
                            : ""
                    }${res.data.address.street || ""}${
                        res.data.address.house
                            ? ", д." + res.data.address.house
                            : ""
                    }`;
                    runInAction(() => {
                        this.selectedAdress = (
                            <>
                                <div className={cl.Address}>{addressData}</div>
                                <div className={cl.GetTo}>{res.data.getto}</div>
                            </>
                        );
                    });
                    return;
                }
                if (this.deliveryType === deliveryTypes.CDEK) {
                    const res = await axios.get("/api/delivery/CDEK/" + value);
                    if ("errors" in res.data) {
                        createNotify(
                            "",
                            "Произошла ошибка при получении информации о выбранном офисе",
                            NotifyTypes.ERROR
                        );
                        return;
                    }

                    const addressData = `${res.data.code}, г. ${
                        res.data.city ? res.data.city + ", " : ""
                    }${res.data.address ? res.data.address : ""}`;
                    runInAction(() => {
                        this.selectedAdress = (
                            <>
                                <div className={cl.Address}>{addressData}</div>
                                <div className={cl.GetTo}>
                                    {res.data.type === "PVZ"
                                        ? "Пунк выдачи заказа"
                                        : res.data.type === "POSTAMAT"
                                        ? "Постамат"
                                        : ""}
                                </div>
                            </>
                        );
                    });
                }
            }
        );
    }
    @observable
    productsInfo: { id: number; price: number }[] = [];

    loadProductInfo = async () => {
        const res = await APIGetProductsCartInfo(
            cartManager.selectedProducts
                .map((product) => product.id)
                .filter(
                    (element, index, arr) => arr.indexOf(element) === index
                ),
            true
        );
        if (res.data) this.productsInfo = res.data.getProducts;
    };

    @observable
    deliveryType?: deliveryTypes;
    @action
    changeDeliveryType = (value: string) => {
        this.selectedID = undefined;
        this.deliveryType = selectionValue2id(value);
    };

    @observable
    currentLocation = {
        center: [37.61556, 55.75222],
        zoom: 12,
    };
    @action
    zoomInCenter = (center: [number, number]) => {
        this.currentLocation = {
            center: center,
            zoom: this.currentLocation.zoom + 0.75,
        };
    };
    @observable
    currentBounds: Bounds = [
        [37.44664520507811, 55.811037458931246],
        [37.78447479492187, 55.69331334155078],
    ];
    @observable
    combineDistance = 0.028619765398027238;

    @action
    onUpdate = ({ location, mapInAction }: any) => {
        if (!mapInAction) {
            this.currentLocation = {
                center: location.center,
                zoom: location.zoom,
            };
            this.currentBounds = location.bounds;
            this.combineDistance = getDistance([
                (location.bounds[1][0] - location.bounds[0][0]) * 0.08,
                (location.bounds[0][1] - location.bounds[1][1]) * 0.08,
            ]);
        }
    };

    @observable
    PRusPoints: PRusPointInfo[] = [];

    @computed
    get viewPRus() {
        return filterPoints(
            this.PRusPoints,
            this.currentBounds,
            this.combineDistance
        );
    }

    loadPRus = async () => {
        const res = await axios.get("/api/delivery/PRus", {
            responseType: "arraybuffer",
        });
        const data = decoders.PRus.decodePoint(new Uint8Array(res.data));
        runInAction(() => {
            this.PRusPoints = data;
        });
    };

    @observable
    CDEKPoints: CDEKPointInfo[] = [];

    @computed
    get viewCDEK() {
        return filterPoints(
            this.CDEKPoints,
            this.currentBounds,
            this.combineDistance
        );
    }

    loadCDEK = async () => {
        const res = await axios.get("/api/delivery/CDEK", {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/gzip",
            },
        });
        const data = decoders.CDEK.decodePoint(new Uint8Array(res.data));
        runInAction(() => {
            this.CDEKPoints = data;
        });
    };

    @computed
    get MapMarkers(): JSX.Element | undefined {
        switch (this.deliveryType) {
            case deliveryTypes.CDEK:
                return (
                    <MapMarker
                        points={this.viewCDEK}
                        markerType={deliveryTypes.CDEK}
                        zoomIn={this.zoomInCenter}
                        onClick={this.onClickMarker}
                    />
                );
            case deliveryTypes.RUSSIAN_POST:
                return (
                    <MapMarker
                        points={this.viewPRus}
                        markerType={deliveryTypes.RUSSIAN_POST}
                        zoomIn={this.zoomInCenter}
                        onClick={this.onClickMarker}
                    />
                );
        }
    }

    @observable
    selectedID?: number | string;
    @observable
    selectedAdress?: JSX.Element | string;

    @action
    onClickMarker = (point: Point) => {
        this.selectedID = point.id;
    };

    @observable
    inputData: { [key in Inputs]: string } = {
        first: "",
        last: "",
        middle: "",
        phone: "8",
        email: "",
    };
    @action
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.name === "phone") {
            const [oldValue, newValue] = [
                this.inputData["phone"],
                event.target.value,
            ];
            if (newValue.length < 2) return oldValue;
            if (oldValue.length > newValue.length) {
                const value = /\d/.test(newValue[newValue.length - 1])
                    ? newValue
                    : newValue.substring(0, newValue.length - 1);
                this.inputData.phone = value;
                return value;
            } else {
                let formated = "";
                // 123456789012345
                // 8 800 600-56-89
                for (
                    let i = 0;
                    i < newValue.length && formated.length < 15;
                    i++
                )
                    if (/\d/.test(newValue[i])) {
                        if (formated.length == 1) formated += " " + newValue[i];
                        else if (formated.length == 5)
                            formated += " " + newValue[i];
                        else if (formated.length == 9)
                            formated += "-" + newValue[i];
                        else if (formated.length == 12)
                            formated += "-" + newValue[i];
                        else formated += newValue[i];
                    }
                this.inputData.phone = formated;
                return formated;
            }
        }
        this.inputData[event.target.name as Inputs] = event.target.value;
        return event.target.value;
    };
}
const CreatingOrder = view(CreatingOrderViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate backUrl="/cart" nav={viewModel.nav}>
            <div className={cl.CreatingOrder}>
                <h3>Оформление заказа</h3>
                <div className={cl.DataBox}>
                    <Input
                        value={viewModel.inputData.first}
                        onChange={viewModel.handleInput}
                        name="first"
                        placeholder="Имя*"
                    />
                    <Input
                        value={viewModel.inputData.last}
                        onChange={viewModel.handleInput}
                        name="last"
                        placeholder="Фамилия*"
                    />
                    <Input
                        value={viewModel.inputData.middle}
                        onChange={viewModel.handleInput}
                        name="middle"
                        placeholder="Отчество"
                    />
                    <Input
                        value={viewModel.inputData.phone}
                        onChange={viewModel.handleInput}
                        name="phone"
                        type="tel"
                        placeholder="Номер телефона*"
                    />
                    <Input
                        value={viewModel.inputData.email}
                        onChange={viewModel.handleInput}
                        name="email"
                        type="email"
                        placeholder="Почта*"
                    />
                    <Select
                        options={selectionDeliverys}
                        placeholder="Служба доставки"
                        onChange={viewModel.changeDeliveryType}
                        className={cl.DeliverySelect}
                    />
                    <h4 className={cl.MapInfo}>
                        Выберите пункт выдачи на карте:
                    </h4>
                    <YMapComponentsProvider
                        apiKey={import.meta.env.VITE_YMAP_KEY}
                    >
                        <YMap
                            location={viewModel.currentLocation}
                            mode={"vector"}
                            className={cl.Map}
                            theme={"dark"}
                        >
                            <YMapDefaultSchemeLayer />
                            <YMapDefaultFeaturesLayer />
                            <YMapListener onUpdate={viewModel.onUpdate} />
                            {viewModel.MapMarkers}
                        </YMap>
                    </YMapComponentsProvider>
                    <div className={cl.Address}>
                        <div>Выберанный адрес доставки:</div>
                        {viewModel.selectedAdress}
                    </div>
                    <div className={cl.EndPage}>
                        <div className={cl.Total}>
                            Сумма:
                            <div className={cl.Price}>
                                {cartManager.selectedProducts
                                    .map(
                                        (cartProduct) =>
                                            (viewModel.productsInfo.find(
                                                (product) =>
                                                    product.id ===
                                                    cartProduct.id
                                            )?.price || 0) * cartProduct.count
                                    )
                                    .reduce((a, b) => a + b, 0)
                                    .toLocaleString()}{" "}
                                ₽
                            </div>
                        </div>
                        <Button onClick={viewModel.tryCreateOrder}>
                            Подтвердить заказ
                        </Button>
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
});

export default CreatingOrder;
