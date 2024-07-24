import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Login.module.scss";
import { Navigate, redirect } from "react-router-dom";
import { NavigateMVVM } from "../../../router/NavigateMVVM";

interface Props {}

export class LoginViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
    }
}

const Login = view(LoginViewModel)<Props>(({ viewModel }) => {
    return (
        <>
            <h2 onClick={() => viewModel.nav.navigate("/")}>Логин</h2>
            {viewModel.nav.path && <Navigate to={viewModel.nav.path} />}
        </>
    );
});

export default Login;
