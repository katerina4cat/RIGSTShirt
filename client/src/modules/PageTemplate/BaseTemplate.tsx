import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./BaseTemplate.module.scss";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { navigate } from "../../App";
import { useNavigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
    back?: boolean;
    logout?: boolean;
    admin?: boolean;
}

export class BaseTemplateViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const BaseTemplate = view(BaseTemplateViewModel)<Props>(({ viewModel }) => {
    navigate.current = useNavigate();
    return (
        <div className={cl.wrapper}>
            <Header
                logout={viewModel.viewProps.logout}
                back={viewModel.viewProps.back}
                admin={viewModel.viewProps.admin}
            />
            {viewModel.viewProps.children}
            <Footer />
        </div>
    );
});

export default BaseTemplate;
