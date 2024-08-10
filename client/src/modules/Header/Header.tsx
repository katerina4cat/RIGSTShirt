import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Header.module.scss";
import LogOutIcon from "../../icons/logout.svg?react";
import BackIcon from "../../icons/back.svg?react";
import { APILogOut } from "../../common/ApiManager";
import { createNotify, navigate, NotifyTypes } from "../../App";

interface Props {
    back?: boolean;
    logout?: boolean;
    admin?: boolean;
}

export class HeaderViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }

    back = () => navigate.current(-1);
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
            navigate.current("/admin/login");
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
            <div
                className={cl.BackBox}
                onClick={viewModel.viewProps.back ? viewModel.back : undefined}
            >
                {viewModel.viewProps.back && (
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
                    onClick={() =>
                        navigate.current(
                            viewModel.viewProps.admin ? "/admin/menu" : "/"
                        )
                    }
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
