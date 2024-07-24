import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./Header.module.scss";

interface Props {}

export class HeaderViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const Header = view(HeaderViewModel)<Props>(({ viewModel }) => {
    return <div className={cl.Base}></div>;
});

export default Header;
