import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";

import { NavigateMVVM } from "../../../router/NavigateMVVM";
import { Button } from "antd";
import cl from "./Login.module.scss";
import Input from "../../../modules/Input/Input";
import { createNotify, NotifyTypes } from "../../../App";
import { APILogin } from "../../../common/ApiManager";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";

interface Props {}

export class LoginViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
    }

    @observable
    inputData: { [key in string]: string } = {
        login: "",
        password: "",
    };
    @action
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.inputData[event.target.name] = event.target.value;
        return event.target.value;
    };
    @action
    tryLogin = async () => {
        if (!this.inputData.login)
            return createNotify(
                "Авторизация",
                "Вы не указали свой логин!",
                NotifyTypes.ERROR
            );
        if (!this.inputData.password)
            return createNotify(
                "Авторизация",
                "Вы не указали пароль!",
                NotifyTypes.ERROR
            );
        const res = await APILogin(
            this.inputData.login,
            this.inputData.password
        );
        if ("errors" in res) {
            res.errors.map((errorInfo: { message: string }) =>
                createNotify(
                    "Авторизация",
                    errorInfo.message,
                    NotifyTypes.ERROR,
                    2
                )
            );
            return;
        }
        if (res.data?.login) {
            this.nav.navigate("/admin/menu");
            createNotify(
                "Авторизация",
                "Вы успешно авторизовались",
                NotifyTypes.SUCCESS,
                1.5
            );
        }
    };
}

const Login = view(LoginViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate>
            <div className={cl.Padder}>
                <div className={cl.Auth}>
                    <h2>Авторизация</h2>
                    <Input
                        placeholder="Логин"
                        value={viewModel.inputData.login}
                        name="login"
                        onChange={viewModel.handleInput}
                    ></Input>
                    <Input
                        placeholder="Пароль"
                        value={viewModel.inputData.password}
                        name="password"
                        onChange={viewModel.handleInput}
                        type="password"
                    ></Input>
                    <div className={cl.ButtonTable}>
                        <div></div>
                        <Button onClick={viewModel.tryLogin}>Войти</Button>
                    </div>
                </div>
                {viewModel.nav.Navigator}
            </div>
        </BaseTemplate>
    );
});

export default Login;
