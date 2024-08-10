import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./CartBlock.module.scss";
import CartIcon from "../../icons/shopping-bag.svg?react";
import cartManager from "../../common/CartManager";
import { navigate } from "../../App";

interface Props {}

export class CartBlockViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const CartBlock = view(CartBlockViewModel)<Props>(({ viewModel }) => {
    if (cartManager.selectedProducts.length === 0) return null;
    return (
        <div className={cl.Cart} onClick={() => navigate.current("/cart")}>
            <CartIcon className={cl.Icon} />
            <div className={cl.Count}>
                {cartManager.selectedProducts.length}
            </div>
        </div>
    );
});

export default CartBlock;
