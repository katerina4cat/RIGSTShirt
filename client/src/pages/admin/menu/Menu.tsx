import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Menu.module.scss";
import { Button, Modal } from "antd";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";
import Input from "../../../modules/Input/Input";
import { navigate } from "../../../App";

interface Props {}

export class MenuViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }

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
        <BaseTemplate logout admin>
            <Loading needAuth>
                <div className={cl.Menu}>
                    <h1>Меню</h1>
                    <div className={cl.FunctionList}>
                        <Button
                            className={cl.FunctionButton}
                            onClick={() => navigate.current("/admin/list")}
                        >
                            Изменение/добавление товаров
                        </Button>
                        <Button
                            className={cl.FunctionButton}
                            onClick={() => navigate.current("/admin/orders")}
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
                                navigate.current("/admin/sizes");
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
                            navigate.current(
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
