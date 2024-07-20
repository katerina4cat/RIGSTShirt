import { authServices } from "services/authService";
import { orderService } from "services/orderService";
import { productEditorServices } from "services/productEditorService";
import { productsServices } from "services/productsService";

const root = {
    ...authServices,
    ...productsServices,
    ...orderService,
    ...productEditorServices,
};

export default root;
