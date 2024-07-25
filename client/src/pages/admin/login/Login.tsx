import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";

import { NavigateMVVM } from "../../../router/NavigateMVVM";
import { Button } from "antd";
import cl from "./Login.module.scss";
import ptemp from "../../../modules/Header/PageTemplate.module.scss";
import Input from "../../../modules/Input/Input";
import Header from "../../../modules/Header/Header";
import Footer from "../../../modules/Footer/Footer";
import { createNotify, NotifyTypes } from "../../../App";
import axios from "axios";

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
    };
    @action
    tryLogin = async () => {
        if (this.inputData.login)
            return createNotify(
                "Авторизация",
                "Вы не указали свой логин!",
                NotifyTypes.ERROR
            );
        if (this.inputData.password)
            return createNotify(
                "Авторизация",
                "Вы не указали пароль!",
                NotifyTypes.ERROR
            );
        axios.post();
        createNotify("Авторизация", "Тест", NotifyTypes.SUCCESS);
    };
}

const Login = view(LoginViewModel)<Props>(({ viewModel }) => {
    return (
        <div className={ptemp.wrapper}>
            <Header />
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
            <Footer />
        </div>
    );
});

export default Login;
