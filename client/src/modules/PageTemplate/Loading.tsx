import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, computed, makeObservable, observable } from "mobx";
import cl from "./Loading.module.scss";
import LoadingIcon from "../../icons/loading.svg?react";
import { createNotify, navigate, NotifyTypes } from "../../App";
import { APIAccessTest } from "../../common/ApiManager";
import { BaseTemplateViewModel } from "./BaseTemplate";

interface Props {
    loading?: boolean;
    children: React.ReactNode;
    needAuth?: boolean;
}

export class LoadingViewModel extends ViewModel<BaseTemplateViewModel, Props> {
    @observable
    authResult?: boolean;
    constructor() {
        super();
        makeObservable(this);
        if (this.viewProps.needAuth) {
            this.authCheck();
        }
    }

    @computed
    get isLoadingCompleted() {
        let res = true;
        if (this.viewProps.needAuth)
            if (this.authResult === undefined)
                // Если необходимо проверять авторизацию
                // И авторизация ещё не проверенна
                return false;
            else res = true;

        if (this.viewProps.loading !== undefined)
            res = res && !this.viewProps.loading; // Если страница дополнительно загружаеться, то она ещё НЕ ЗАГРУЗИЛАСЬ
        return res;
    }

    @action
    authCheck = async () => {
        if (!(await APIAccessTest())) {
            navigate.current("/admin/login");
            createNotify(
                "Авторизация",
                "Для открытия данной страницы необходима авторизация!",
                NotifyTypes.ERROR,
                3
            );
            this.authResult = false;
        }
        this.authResult = true;
    };
}
const Loading = view(LoadingViewModel)<Props>(({ viewModel }) => {
    if (viewModel.isLoadingCompleted) return viewModel.viewProps.children;
    return (
        <div className={cl.LoadingBox}>
            <LoadingIcon className={cl.Loading} />
            <p>Загрузка...</p>
        </div>
    );
});

export default Loading;
