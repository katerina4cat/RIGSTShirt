import { ViewModel, view } from "@yoskutik/react-vvm";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import cl from "./OrderInfo.module.scss";
import {
    APIChangeOrderStatus,
    APIGetOrderInfo,
    APIGetStatuses,
    Orders,
} from "../../../common/ApiManager";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";
import { createNotify, navigate, NotifyTypes } from "../../../App";
import { useParams } from "react-router-dom";
import { delivertTitles, deliveryTypes } from "../../../../../shared/enums";
import {
    getAdressByCoords,
    getAdressByIDDeliveryOfices,
} from "../../../common/AdressManager";
import { Select, Table, TableColumnsType } from "antd";
import { selections } from "../../../common/SelectTransformers";

interface Props {}

const columns: TableColumnsType<DataTable> = [
    {
        title: "Название",
        dataIndex: "title",
        key: "title",
    },
    {
        title: "Кол-во",
        dataIndex: "count",
        key: "count",
    },
    {
        title: "Размер",
        dataIndex: "size",
        key: "size",
    },
    {
        title: "Сумма",
        dataIndex: "price",
        key: "price",
        render: (v) => "₽ " + v.toLocaleString(),
    },
];

interface DataTable {
    key: React.Key;
    title: string;
    count: number;
    size: string;
    price: number;
}

export class OrderInfoViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        const { id } = useParams();
        if (id !== undefined && /^\d+$/.test(id)) this.orderID = Number(id);
    }
    protected onViewMounted(): void {
        this.loadServerData();
    }
    orderID?: number;

    @action
    loadServerData = async () => {
        if (this.orderID === undefined) {
            navigate.current("/admin/menu");
            createNotify(
                "Страница заказа",
                "Не указан ID заказа!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        const res = await APIGetOrderInfo(this.orderID);
        try {
            if ("errors" in res) {
                createNotify(
                    "Страница заказа",
                    "Не удалось загрузить информацию!",
                    NotifyTypes.ERROR,
                    3
                );
                res.errors.forEach((errorInfo: { message: string }) =>
                    createNotify(
                        "Страница заказа",
                        errorInfo.message,
                        NotifyTypes.ERROR,
                        3
                    )
                );
                navigate.current("/admin/menu");
                return;
            }
        } catch {
            navigate.current("/admin/menu");
            createNotify(
                "Страница заказа",
                "Такого заказа не существует!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        runInAction(() => {
            this.orderInfo = res;
            this.loading = false;
        });
        this.loadAdress();
        APIGetStatuses().then(
            action((res) => {
                if (!("errors" in res)) this.statuses = res;
            })
        );
    };

    loadAdress = async () => {
        let res: JSX.Element | string | undefined;
        if (this.orderInfo?.deliveryType === deliveryTypes.CUSTOM_COURIER) {
            res = this.orderInfo.customDelivery
                ? await getAdressByCoords([
                      this.orderInfo.customDelivery.longitude,
                      this.orderInfo.customDelivery.latitude,
                  ])
                : "";
        } else {
            res = await getAdressByIDDeliveryOfices(
                this.orderInfo?.PVZID,
                this.orderInfo?.deliveryType
            );
        }
        runInAction(() => {
            this.adress = res;
        });
    };

    @observable
    adress: JSX.Element | string | undefined;
    @observable
    orderInfo?: Orders;
    @observable
    statuses: string[] = [];
    @computed
    get data(): DataTable[] {
        if (!this.orderInfo) return [];
        return this.orderInfo.products.map((product) => ({
            key: product.size!.toString() + product.id!,
            price: product.count * product.price,
            count: product.count,
            size: product.size!,
            title: product.title!,
        }));
    }

    @observable
    loading = true;

    changeOrderStatus = async (status: string) => {
        if (this.orderID) {
            const res = await APIChangeOrderStatus(this.orderID, status);
            if ("errors" in res)
                createNotify(
                    "Изменение статуса",
                    "Произошла ошибка при изменении статуса!",
                    NotifyTypes.ERROR,
                    3
                );
            else if (this.orderInfo) this.orderInfo.status = status;
        }
    };
}
const OrderInfo = view(OrderInfoViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate logout back admin>
            <Loading loading={viewModel.loading} needAuth>
                <div className={cl.OrderInfoBox}>
                    <div className={cl.OrderInfo}>
                        <h2>Информация о заказе №{viewModel.orderID}</h2>
                        <div className={cl.UserInfoTable}>
                            <div>ФИО:</div>
                            <div>
                                {viewModel.orderInfo?.client.surname}{" "}
                                {viewModel.orderInfo?.client.name}{" "}
                                {viewModel.orderInfo?.client.lastname}{" "}
                            </div>
                            <div>Номер:</div>
                            <a
                                href={`tel:${viewModel.orderInfo?.client.phone.replace(
                                    /(\d{3})(\d{3})(\d{2})(\d{2})/,
                                    "8 $1 $2-$3-$4"
                                )}`}
                            >
                                {viewModel.orderInfo?.client.phone.replace(
                                    /(\d{3})(\d{3})(\d{2})(\d{2})/,
                                    "8 $1 $2-$3-$4"
                                )}
                            </a>
                            <div>Почта:</div>
                            <div>{viewModel.orderInfo?.client.email}</div>
                            <div>Скидка:</div>
                            <div>
                                {viewModel.orderInfo
                                    ? Math.round(
                                          viewModel.orderInfo.client.sale! * 100
                                      )
                                    : ""}
                                %
                            </div>
                            <div>Сумма со скидкой:</div>
                            <div>
                                {viewModel.orderInfo
                                    ? (
                                          viewModel.orderInfo.products.reduce(
                                              (a, b) => a + b.count * b.price,
                                              0
                                          ) *
                                          (1 - viewModel.orderInfo.client.sale!)
                                      ).toLocaleString()
                                    : ""}
                                {" ₽"}
                            </div>
                            <div>Способ доставки:</div>
                            <div>
                                {viewModel.orderInfo &&
                                    delivertTitles[
                                        viewModel.orderInfo.deliveryType
                                    ]}
                            </div>
                        </div>
                        <div className={cl.Line}></div>
                        <div>Адрес доставки:</div>
                        {viewModel.orderInfo?.PVZID}
                        {viewModel.orderInfo?.customDelivery ? (
                            <a
                                target="_blank"
                                href={`https://yandex.ru/maps/?whatshere[point]=${viewModel.orderInfo.customDelivery.longitude},${viewModel.orderInfo.customDelivery.latitude}&whatshere[zoom]=16`}
                            >
                                {viewModel.adress}
                            </a>
                        ) : (
                            <div>{viewModel.adress}</div>
                        )}
                        <div style={{ textAlign: "start" }}>
                            <div>
                                Подъезд:{" "}
                                {viewModel.orderInfo?.customDelivery?.entrance}
                            </div>
                            <div>
                                Квартира:{" "}
                                {viewModel.orderInfo?.customDelivery?.apartment}
                            </div>
                            <div>
                                Комментарий:{" "}
                                {
                                    viewModel.orderInfo?.customDelivery
                                        ?.description
                                }
                            </div>
                        </div>
                        <div className={cl.ChangeStatus}>
                            Статус заказа:
                            <Select
                                options={selections.status.options(
                                    viewModel.statuses
                                )}
                                value={viewModel.orderInfo?.status}
                                placeholder="Статус заказа"
                                onChange={viewModel.changeOrderStatus}
                                className={cl.StatusSelect}
                            />
                        </div>
                        <div className={cl.Positions}>
                            <div>Позиции:</div>
                            <Table
                                columns={columns}
                                dataSource={viewModel.data}
                                onRow={(record) => ({
                                    onClick: () => {
                                        navigate.current(
                                            "/product/" + record.key
                                        );
                                    },
                                })}
                                rowClassName={() => cl.RowElement}
                            />
                        </div>
                    </div>
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default OrderInfo;
