import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Menu.module.scss";
import { Button } from "antd";
import { APIAccessTest } from "../../../common/ApiManager";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";
import { createNotify, NotifyTypes } from "../../../App";

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
                        <Button className={cl.FunctionButton}>
                            Заказ по номеру
                        </Button>
                        <Button className={cl.FunctionButton}>
                            Добавить новый размер
                        </Button>
                    </div>
                </div>
            </Loading>
        </BaseTemplate>
    );
});

export default Menu;
