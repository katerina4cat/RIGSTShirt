import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Menu.module.scss";
import Footer from "../../../modules/Footer/Footer";
import Header from "../../../modules/Header/Header";
import ptemp from "../../../modules/Header/PageTemplate.module.scss";
import { Button } from "antd";
import { NavigateMVVM } from "../../../router/NavigateMVVM";
import { checkLogin } from "../../../router/authCheck";

interface Props {}

export class MenuViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
    }
}
const Menu = view(MenuViewModel)<Props>(({ viewModel }) => {
    if (!checkLogin()) {
        viewModel.nav.navigate("/admin/login");
        return viewModel.nav.Navigator;
    }

    return (
        <div className={ptemp.wrapper}>
            <Header logout />
            <div className={cl.Menu}>
                <h1>Меню</h1>
                <div className={cl.FunctionList}>
                    <Button
                        className={cl.FunctionButton}
                        onClick={() => viewModel.nav.navigate("/admin/edit")}
                    >
                        Изменение/добавление товаров
                    </Button>
                    <Button className={cl.FunctionButton}>Заказы</Button>
                    <Button className={cl.FunctionButton}>
                        Заказ по номеру
                    </Button>
                    <Button className={cl.FunctionButton}>
                        Добавить новый размер
                    </Button>
                </div>
                {viewModel.nav.Navigator}
            </div>
            <Footer />
        </div>
    );
});

export default Menu;
