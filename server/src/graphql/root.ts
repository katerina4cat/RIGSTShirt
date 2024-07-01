import { adminServices } from "services/adminService";
import { authServices } from "services/authService";
import { productsServices } from "services/productsService";

const root = {
    ...authServices,
    ...productsServices,
    ...adminServices,
};

export default root;
