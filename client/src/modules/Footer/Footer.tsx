import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Footer.module.scss";
import TelegramIcon from "../../icons/telegram.svg?react";
import { navigate } from "../../App";

interface Props {}

export class FooterViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const Footer = view(FooterViewModel)<Props>(({ viewModel }) => {
    return (
        <footer className={cl.Footer}>
            <div
                className={cl.AboutUs}
                onClick={() => navigate.current("/about")}
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
