import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./BaseTemplate.module.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { NavigateMVVM } from "../../router/NavigateMVVM";

interface Props {
    children: React.ReactNode;
    backUrl?: string;
    logout?: boolean;
    nav?: { navigate: (to: string) => void };
}

export class BaseTemplateViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        if (this.viewProps.nav) this.viewProps.nav.navigate = this.nav.navigate;
        makeObservable(this);
    }
}
const BaseTemplate = view(BaseTemplateViewModel)<Props>(({ viewModel }) => {
    return (
        <div className={cl.wrapper}>
            <Header
                backUrl={viewModel.viewProps.backUrl}
                logout={viewModel.viewProps.logout}
            />
            {viewModel.viewProps.children}
            {viewModel.nav.Navigator}
            <Footer />
        </div>
    );
});

export default BaseTemplate;
