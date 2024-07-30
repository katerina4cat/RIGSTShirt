import { ViewModel, view } from "@yoskutik/react-vvm";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import cl from "./CreatingOrder.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Input from "../../../modules/Input/Input";
import { Select } from "antd";
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
    YMapMarker,
    YMapListener,
    YMapCollection,
} from "ymap3-components";
import OfficeIcon from "../../../icons/office.svg?react";
import axios from "axios";
import { createNotify, NotifyTypes } from "../../../App";

interface Props {}
type Inputs = "first" | "last" | "middle" | "phone" | "email";

export class CreatingOrderViewModel extends ViewModel<unknown, Props> {
    @action
    onUpdate = ({ location, mapInAction }: any) => {
        if (!mapInAction) {
            this.currentLocation = {
                center: location.center,
                zoom: location.zoom,
            };
            this.currentBounds = location.bounds;
            this.getPochtaOfices();
        }
    };
    @observable
    currentLocation = {
        center: [37.61556, 55.75222],
        zoom: 12,
    };
    @observable
    currentBounds = [
        [37.44664520507811, 55.811037458931246],
        [37.78447479492187, 55.69331334155078],
    ];
    lastPochtaBounds = [
        [37.44664520507811, 55.811037458931246],
        [37.44664520507811, 55.811037458931246],
    ];

    @observable
    pochtaOffices: { id: number; cord: number[] }[] = [];

    getCDEKOfices = async () => {
        const res = await axios.post(
            `https://www.cdek.ru/api-site/website/office/?locale=ru`,
            {
                topLeftPoint: {
                    longitude: this.currentBounds[0][0],
                    latitude: this.currentBounds[0][1],
                },
                bottomRightPoint: {
                    longitude: this.currentBounds[1][0],
                    latitude: this.currentBounds[1][1],
                },
                limit: 10000,
                offset: 0,
                onlyCoordinate: true,
                precision: 3,
                extFilters: [
                    "NOT_TEMPORARY_CLOSED",
                    "NOT_PRIVATE",
                    "NOT_CLOSED",
                    "ONLY_ATI",
                ],
            }
        );
    };

    getOfficesPochta = (
        currentBounds: number[][],
        lastPochtaBounds: number[][],
        page = 1
    ) =>
        axios.post(`https://widget.pochta.ru/api/pvz`, {
            settings_id: 50317,
            pageSize: 200,
            page: page,
            currentTopRightPoint: currentBounds[0],
            currentBottomLeftPoint: currentBounds[1],
            prevTopRightPoint: lastPochtaBounds[0],
            prevBottomLeftPoint: lastPochtaBounds[1],
            pvzType: ["russian_post", "postamat"],
        });

    getPochtaOfices = async () => {
        const prevLastPochtaBounds = [...this.lastPochtaBounds];
        this.lastPochtaBounds = this.currentBounds;
        const res = await this.getOfficesPochta(
            this.currentBounds,
            prevLastPochtaBounds
        );
        const newPochtaOffices = this.pochtaOffices.filter(
            (office) =>
                office.cord[0] > this.currentBounds[0][0] &&
                office.cord[0] < this.currentBounds[1][0] &&
                office.cord[1] > this.currentBounds[1][1] &&
                office.cord[1] < this.currentBounds[0][1]
        );
        newPochtaOffices.push(
            ...res.data.data.map((office: any) => ({
                id: office.id,
                cord: office.geo.coordinates,
            }))
        );
        const totalPages = res.data.totalPages;
        for (let i = 2; i <= totalPages; i++) {
            const res = await this.getOfficesPochta(
                this.currentBounds,
                prevLastPochtaBounds
            );
            newPochtaOffices.push(
                ...res.data.data.map((office: any) => ({
                    id: office.id,
                    cord: office.geo.coordinates,
                }))
            );
        }
        newPochtaOffices.filter(
            (office, ind, arr) =>
                ind === arr.findIndex((off) => off.id === office.id)
        );
        runInAction(() => {
            this.pochtaOffices = newPochtaOffices;
        });
    };

    @observable
    CDEKOfices = [];

    constructor() {
        super();
        makeObservable(this);
    }
    @observable
    inputData: { [key in Inputs]: string } = {
        first: "",
        last: "",
        middle: "",
        phone: "",
        email: "",
    };
    @action
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.inputData[event.target.name as Inputs] = event.target.value;
    };
    @observable
    deliveryType?: deliveryTypes;
    @action
    changeDeliveryType = (value: string) => {
        this.deliveryType = selectionValue2id(value);
    };
}
const CreatingOrder = view(CreatingOrderViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate>
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
                            <YMapCollection>
                                <YMapListener onUpdate={viewModel.onUpdate} />
                                {viewModel.deliveryType ===
                                deliveryTypes.CDEK ? (
                                    <YMapMarker
                                        coordinates={[37.61556, 55.75222]}
                                        draggable={false}
                                    >
                                        (
                                        <div
                                            className={`${cl.PointBorder} ${cl.CDEK}`}
                                        >
                                            <div className={cl.Point}>
                                                <OfficeIcon
                                                    className={cl.Icon}
                                                />
                                            </div>
                                        </div>
                                        )
                                    </YMapMarker>
                                ) : undefined}
                                {viewModel.deliveryType ===
                                deliveryTypes.RUSSIAN_POST
                                    ? viewModel.pochtaOffices.map((office) => (
                                          <YMapMarker
                                              key={office.id}
                                              coordinates={office.cord}
                                              draggable={false}
                                              onClick={() => {
                                                  createNotify(
                                                      "",
                                                      "Вы выбрали офис #" +
                                                          office.id,
                                                      NotifyTypes.INFO
                                                  );
                                              }}
                                          >
                                              <div
                                                  className={`${cl.PointBorder} ${cl.RUSSIAN_POST}`}
                                              >
                                                  <div className={cl.Point}>
                                                      <OfficeIcon
                                                          className={cl.Icon}
                                                      />
                                                  </div>
                                              </div>
                                          </YMapMarker>
                                      ))
                                    : undefined}
                            </YMapCollection>
                        </YMap>
                    </YMapComponentsProvider>
                    <div className={cl.Adress}>
                        <div>Выберанный адрес доставки:</div>
                        <div></div>
                    </div>
                </div>
            </div>
        </BaseTemplate>
    );
});

export default CreatingOrder;
