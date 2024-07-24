import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";

import { NavigateMVVM } from "../../../router/NavigateMVVM";
import { Button } from "antd";
import cl from "./Login.module.scss";
import Input from "../../../modules/Input/Input";

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
    tryLogin = () => {};
}

const Login = view(LoginViewModel)<Props>(({ viewModel }) => {
    return (
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
                ></Input>
                <div className={cl.ButtonTable}>
                    <div></div>
                    <Button onClick={viewModel.tryLogin}>Войти</Button>
                </div>
            </div>
            {viewModel.nav.Navigator}
        </div>
    );
});

export default Login;
