import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Loading.module.scss";
import LoadingIcon from "../../icons/loading.svg?react";

interface Props {
    loading: boolean;
    children: React.ReactNode;
}

export class LoadingViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const Loading = view(LoadingViewModel)<Props>(({ viewModel }) => {
    if (viewModel.viewProps.loading)
        return (
            <div className={cl.LoadingBox}>
                <LoadingIcon className={cl.Loading} />
                <p>Загрузка...</p>
            </div>
        );
    return viewModel.viewProps.children;
});

export default Loading;
