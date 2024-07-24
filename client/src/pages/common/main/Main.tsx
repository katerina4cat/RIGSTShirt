import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import { Navigate } from "react-router-dom";
import { NavigateMVVM } from "../../../router/NavigateMVVM";

interface Props {}

export class MainViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
    nav = new NavigateMVVM();
}
const Main = view(MainViewModel)<Props>(({ viewModel }) => {
    return (
        <>
            <img
                src="https://185.197.34.18/product/picture?p=1&img=1-1721578234378.jpg"
                alt=""
            />

            <img
                src="https://185.197.34.18/product/picture?p=1&img=1-1721578234378.jpg"
                alt=""
            />

            <img
                src="https://185.197.34.18/product/picture?p=1&img=1-1721578234378.jpg"
                alt=""
            />
            <h2 onClick={() => viewModel.nav.navigate("/admin/login")}>
                Страница товаров
            </h2>

            <img
                src="https://185.197.34.18/product/picture?p=1&img=1-1721578234378.jpg"
                alt=""
            />

            <img
                src="https://185.197.34.18/product/picture?p=1&img=1-1721578234378.jpg"
                alt=""
            />
            {viewModel.nav.path && <Navigate to={viewModel.nav.path} />}
        </>
    );
});

export default Main;
