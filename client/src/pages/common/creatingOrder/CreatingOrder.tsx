import { ViewModel, view } from "@yoskutik/react-vvm";
import {
    action,
    makeObservable,
    observable,
    reaction,
    runInAction,
} from "mobx";
import cl from "./CreatingOrder.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Input from "../../../modules/Input/Input";
import { Button, Select } from "antd";
import { selections } from "../../../common/SelectTransformers";
import { deliveryTypes } from "../../../../../shared/enums";
import { Point } from "../../../common/MapPointerFilter";
import { createNotify, NotifyTypes } from "../../../App";
import cartManager from "../../../common/CartManager";
import {
    APICreateOrder,
    APICreateOrderCustom,
    APIGetProductsCartInfo,
} from "../../../common/ApiManager";
import Map from "../../../modules/MapOrder/MapOrder";
import InputArea from "../../../modules/InputArea/InputArea";
import {
    getAdressByCoords,
    getAdressByIDDeliveryOfices,
} from "../../../common/AdressManager";

interface Props {}
type Inputs =
    | "first"
    | "last"
    | "middle"
    | "phone"
    | "email"
    | "entrance"
    | "apartment"
    | "description";
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
                condition:
                    !/(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))$/.test(
                        this.inputData.phone.replace(/\s|-/gm, "")
                    ),
                errorMsg: "Вы ввели не верный номер телефона!",
            },
            {
                condition: !this.inputData.email,
                errorMsg: "Вы не ввели адрес электронной почты!",
            },
            {
                condition:
                    !!this.inputData.email &&
                    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(
                        this.inputData.email
                    ),
                errorMsg: "Вы ввели не верный адрес электронной почты!",
            },
            {
                condition: !this.deliveryType,
                errorMsg: "Вы не выбрали способ доставки!",
            },
            {
                condition:
                    this.deliveryType !== undefined &&
                    this.deliveryType !== deliveryTypes.CUSTOM_COURIER &&
                    this.selectedID === undefined,
                errorMsg: "Вы не выбрали офис/постамат!",
            },
            {
                condition:
                    this.deliveryType === deliveryTypes.CUSTOM_COURIER &&
                    this.selectedGeo === undefined,
                errorMsg: "Вы не выбрали точку доставки!",
            },
            {
                condition: cartManager.selectedProducts.length < 1,
                errorMsg: "Ваша корзина пуста!",
            },
        ];
        let hasError = false;
        checkResult
            .filter((el) => el.condition)
            .forEach((check) => {
                createNotify("", check.errorMsg, NotifyTypes.ERROR, 2.5);
                hasError = true;
            });
        if (hasError) return;
        let res: any = {};
        if (this.deliveryType === deliveryTypes.CUSTOM_COURIER) {
            res = await APICreateOrderCustom(
                this.inputData.first,
                this.inputData.last,
                /(^8|7|\+7)((\d{10})|(\s\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}))$/.exec(
                    this.inputData.phone.replace(/\s|-/gm, "")
                )![2],
                this.inputData.email,
                this.deliveryType!,
                this.selectedGeo!,
                this.inputData.entrance,
                this.inputData.apartment,
                this.inputData.description,
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
        } else {
            res = await APICreateOrder(
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
        this.loadProductInfo();
        reaction(
            () => this.selectedID,
            async (value) => {
                const res = await getAdressByIDDeliveryOfices(
                    value,
                    this.deliveryType
                );
                console.log(res);
                runInAction(() => (this.selectedAdress = res));
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
        runInAction(() => {
            if (res.data) this.productsInfo = res.data.getProducts;
        });
    };

    @observable
    deliveryType?: deliveryTypes;
    @action
    changeDeliveryType = (value: string) => {
        this.deliveryType = selections.delivery.getvalue(value);
        this.selectedID = undefined;
    };

    @observable
    selectedID?: number | string;
    @observable
    selectedAdress?: JSX.Element | string;
    @observable
    selectedGeo?: [number, number];

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
        entrance: "",
        apartment: "",
        description: "",
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
                        options={selections.delivery.options()}
                        placeholder="Служба доставки"
                        onChange={viewModel.changeDeliveryType}
                        className={cl.DeliverySelect}
                    />
                    <h4 className={cl.MapInfo}>
                        {viewModel.deliveryType === deliveryTypes.CUSTOM_COURIER
                            ? `Выберите точку доставки на карте:`
                            : `Выберите пункт выдачи на карте:`}
                    </h4>
                    <Map parent={viewModel} />
                    {viewModel.deliveryType !== deliveryTypes.CUSTOM_COURIER &&
                        viewModel.deliveryType !== undefined && (
                            <div className={cl.Address}>
                                <div>Выберанный адрес доставки:</div>
                                {viewModel.selectedAdress}
                            </div>
                        )}
                    {viewModel.deliveryType ===
                        deliveryTypes.CUSTOM_COURIER && (
                        <>
                            <div className={cl.AdditinalInfoDelivery}>
                                Дополнительная информация доставки
                            </div>
                            <Input
                                value={viewModel.inputData.entrance}
                                onChange={viewModel.handleInput}
                                name="entrance"
                                placeholder="Подъезд"
                            />
                            <Input
                                value={viewModel.inputData.apartment}
                                onChange={viewModel.handleInput}
                                name="apartment"
                                placeholder="Квартира"
                            />
                            <InputArea
                                value={viewModel.inputData.description}
                                onChange={action((e) => {
                                    viewModel.inputData.description =
                                        e.target.value;
                                })}
                                name="description"
                                placeholder="Дополнительный комментарий"
                                style={{
                                    resize: "none",
                                    height: "8em",
                                }}
                            />
                        </>
                    )}
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
