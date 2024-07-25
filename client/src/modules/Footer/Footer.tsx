import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Footer.module.scss";
import { NavigateMVVM } from "../../router/NavigateMVVM";
import TelegramIcon from "../../icons/telegram.svg?react";

interface Props {}

export class FooterViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
    }
}
const Footer = view(FooterViewModel)<Props>(({ viewModel }) => {
    return (
        <footer className={cl.Footer}>
            {viewModel.nav.Navigator}
            <div
                className={cl.AboutUs}
                onClick={() => viewModel.nav.navigate("/about")}
            >
                О нас
            </div>
            <div className={cl.TelegramBox}>
                <TelegramIcon className={cl.TelegramIcon} />
            </div>
            <div className={cl.Author}>by katerina4cat</div>
        </footer>
    );
});

export default Footer;
