import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable, runInAction } from "mobx";
import cl from "./OrderList.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import { Button, Select, Table, TableColumnsType } from "antd";
import FilterIcon from "../../../icons/filter.svg?react";
import FilterClearIcon from "../../../icons/clear-filter.svg?react";
import { delivertTitles, deliveryTypes } from "../../../../../shared/enums";
import {
    APIAccessTest,
    APIGetOrders,
    APIGetStatuses,
} from "../../../common/ApiManager";
import { createNotify, NotifyTypes } from "../../../App";
import Loading from "../../../modules/PageTemplate/Loading";
import { selections } from "../../../common/SelectTransformers";

interface Props {}
const columns: TableColumnsType<DataTable> = [
    {
        title: "Имя",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Телефон",
        dataIndex: "phone",
        key: "phone",
        render: (v) => (
            <a href={`tel:${v}`} onClick={(e) => e.stopPropagation()}>
                {v}
            </a>
        ),
    },
    {
        title: "Сумма",
        dataIndex: "price",
        key: "price",
        render: (v) => "₽ " + v.toLocaleString(),
    },
    {
        title: "Доставка",
        dataIndex: "delivery",
        key: "delivery",
        render: (v) => delivertTitles[v as deliveryTypes],
    },
];

interface DataTable {
    key: React.Key;
    name: string;
    phone: string;
    price: number;
    delivery: deliveryTypes;
}

export class OrderListViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.loadPage();
    }

    @observable
    loading = true;
    @observable
    statuses: string[] = [];
    @observable
    currentStatus: any = undefined;
    @observable
    currentDeliveryType: any = undefined;
    @observable
    data: DataTable[] = [];
    nav = { navigate: (to: string) => {} };

    loadPage = async () => {
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
        APIGetStatuses().then(
            action((res) => {
                if (!("errors" in res)) this.statuses = res;
            })
        );
        this.loading = false;
        this.loadData();
    };

    loadData = async (orderStatus?: string, deliveryType?: deliveryTypes) => {
        runInAction(() => {
            this.currentStatus =
                orderStatus === undefined
                    ? orderStatus
                    : selections.status.convert2value(orderStatus);
            this.currentDeliveryType =
                deliveryType === undefined
                    ? deliveryType
                    : selections.delivery.convert2value(deliveryType);
        });
        const res = await APIGetOrders({
            orderStatus: orderStatus ? `"${orderStatus}"` : undefined,
            deliveryType: deliveryType,
        });
        if ("errors" in res) {
            res.errors.map((error) =>
                createNotify("Список заказов", error.message, NotifyTypes.ERROR)
            );
            return;
        }
        runInAction(() => {
            this.data = res.map((order) => ({
                key: order.id,
                name: order.client.name,
                phone: order.client.phone.replace(
                    /(\d{3})(\d{3})(\d{2})(\d{2})/,
                    "8 $1 $2-$3-$4"
                ),
                price: order.products.reduce(
                    (a, b) => a + b.count * b.price,
                    0
                ),
                delivery: order.deliveryType,
            }));
        });
    };
}

const OrderList = view(OrderListViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate backUrl="/admin/menu" nav={viewModel.nav} logout>
            <Loading loading={viewModel.loading}>
                <div className={cl.OrderList}>
                    <h1>Список заказов</h1>
                    <div className={cl.FilterList}>
                        <Button
                            className={`${cl.FilterBtn} ${cl.FilterElement}`}
                            style={{ aspectRatio: 1, padding: "0.1em" }}
                            onClick={() => viewModel.loadData()}
                        >
                            <FilterClearIcon className={cl.Icon} />
                        </Button>
                        <Select
                            options={selections.status.options(
                                viewModel.statuses
                            )}
                            className={cl.FilterElement}
                            value={viewModel.currentStatus}
                            placeholder="Статус заказа"
                            onChange={(e) => {
                                viewModel.loadData(
                                    e,
                                    selections.delivery.getvalue(
                                        viewModel.currentDeliveryType?.value
                                    )
                                );
                            }}
                        />
                        <Select
                            options={selections.delivery.options()}
                            className={cl.FilterElement}
                            value={viewModel.currentDeliveryType}
                            placeholder="Тип доставки"
                            onChange={(e) => {
                                viewModel.loadData(
                                    selections.status.getvalue(
                                        viewModel.currentStatus?.value
                                    ),
                                    selections.delivery.getvalue(e)
                                );
                            }}
                        />
                    </div>
                    <Table
                        columns={columns}
                        dataSource={viewModel.data}
                        className={cl.Table}
                        onRow={(record) => ({
                            onClick: () => {
                                viewModel.nav.navigate(
                                    "/admin/order/" + record.key
                                );
                            },
                        })}
                        rowClassName={() => cl.RowElement}
                    />
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default OrderList;
