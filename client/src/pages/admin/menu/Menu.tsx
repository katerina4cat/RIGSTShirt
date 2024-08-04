import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Menu.module.scss";
import { Button, Modal } from "antd";
import { APIAccessTest } from "../../../common/ApiManager";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";
import { createNotify, NotifyTypes } from "../../../App";
import Input from "../../../modules/Input/Input";

interface Props {}

export class MenuViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };

    constructor() {
        super();
        this.authCheck();
        makeObservable(this);
    }

    @action
    authCheck = async () => {
        if (!(await APIAccessTest())) {
            this.nav.navigate("/admin/login");
            createNotify(
                "Авторизация",
                "Для открытия данной страницы необходима авторизация!",
                NotifyTypes.ERROR,
                3
            );
        }
        this.loading = false;
    };
    @observable
    loading = true;
    @observable
    modal = false;
    @observable
    inputData: { [key in string]: string } = {
        orderID: "",
    };
    @observable
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        let res = "";
        switch (event.target.name) {
            case "orderID":
                res = event.target.value.replace(/\D/g, "");
        }
        this.inputData[event.target.name] = event.target.value;
        return event.target.value;
    };
}
const Menu = view(MenuViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate logout nav={viewModel.nav}>
            <Loading loading={viewModel.loading}>
                <div className={cl.Menu}>
                    <h1>Меню</h1>
                    <div className={cl.FunctionList}>
                        <Button
                            className={cl.FunctionButton}
                            onClick={() =>
                                viewModel.nav.navigate("/admin/list")
                            }
                        >
                            Изменение/добавление товаров
                        </Button>
                        <Button
                            className={cl.FunctionButton}
                            onClick={() =>
                                viewModel.nav.navigate("/admin/orders")
                            }
                        >
                            Заказы
                        </Button>
                        <Button
                            className={cl.FunctionButton}
                            onClick={action(() => {
                                viewModel.modal = true;
                            })}
                        >
                            Заказ по номеру
                        </Button>
                        <Button
                            className={cl.FunctionButton}
                            onClick={() => {
                                viewModel.nav.navigate("/admin/sizes");
                            }}
                        >
                            Редактор размеров
                        </Button>
                    </div>
                    <Modal
                        title="Заказ по номеру"
                        onCancel={action(() => {
                            viewModel.modal = false;
                        })}
                        onOk={() =>
                            viewModel.nav.navigate(
                                "/admin/order/" + viewModel.inputData.orderID
                            )
                        }
                        open={viewModel.modal}
                        okText="Найти"
                        cancelText="Отмена"
                    >
                        <Input
                            onChange={viewModel.handleInput}
                            name="orderID"
                            value={viewModel.inputData.orderID}
                            placeholder="ID Заказа"
                        />
                    </Modal>
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default Menu;
