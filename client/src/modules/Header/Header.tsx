import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Header.module.scss";
import LogOutIcon from "../../icons/logout.svg?react";
import BackIcon from "../../icons/back.svg?react";
import { NavigateMVVM } from "../../router/NavigateMVVM";
import { APILogOut } from "../../common/ApiManager";
import { createNotify, NotifyTypes } from "../../App";

interface Props {
    backUrl?: string;
    logout?: boolean;
}

export class HeaderViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
    }
    logout = async () => {
        const res = await APILogOut();
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
        if (res.data?.logout) {
            this.nav.navigate("/admin/login");
            createNotify(
                "Авторизация",
                "Вы успешно вышли из аккаунту",
                NotifyTypes.SUCCESS,
                1.5
            );
        }
    };
}
const Header = view(HeaderViewModel)<Props>(({ viewModel }) => {
    return (
        <header className={cl.Header}>
            {viewModel.nav.Navigator}
            <div
                className={cl.BackBox}
                onClick={
                    viewModel.viewProps.backUrl
                        ? () =>
                              viewModel.nav.navigate(
                                  viewModel.viewProps.backUrl!
                              )
                        : undefined
                }
            >
                {viewModel.viewProps.backUrl && (
                    <>
                        <BackIcon className={cl.BackIcon} />
                        <div className={cl.BackTitle}>Назад</div>
                    </>
                )}
            </div>
            <div className={cl.LogoBox}>
                <img
                    src="/logo/logo.png"
                    alt="RIGS"
                    className={cl.LogoImage}
                    onClick={() => viewModel.nav.navigate("/")}
                    draggable="false"
                />
            </div>
            <div
                className={cl.LogOutBox}
                onClick={
                    viewModel.viewProps.logout ? viewModel.logout : undefined
                }
            >
                {viewModel.viewProps.logout && (
                    <LogOutIcon className={cl.LogOutIcon} />
                )}
            </div>
        </header>
    );
});

export default Header;
