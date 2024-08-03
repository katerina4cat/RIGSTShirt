import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable, observable } from "mobx";
import cl from "./OrderPage.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import Loading from "../../../modules/PageTemplate/Loading";

interface Props {}

export class OrderPageViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };
    constructor() {
        super();
        makeObservable(this);
    }
    @observable
    loading = false;
}
const OrderPage = view(OrderPageViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate nav={viewModel.nav} backUrl="/admin/menu" logout>
            <Loading loading={viewModel.loading}>
                <div className={cl.OrderPage}></div>
            </Loading>
        </BaseTemplate>
    );
});

export default OrderPage;
