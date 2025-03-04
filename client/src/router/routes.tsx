import { Navigate, RouteObject } from "react-router-dom";
import Login from "../pages/admin/login/Login";
import Main from "../pages/common/main/Main";
import Menu from "../pages/admin/menu/Menu";
import ProductEditor from "../pages/admin/productEditor/ProductEditor";
import ProductViewer from "../pages/common/productViewer/ProductViewer";
import Cart from "../pages/common/cart/Cart";
import CreatingOrder from "../pages/common/creatingOrder/CreatingOrder";
import ProductList from "../pages/admin/productList/ProductList";
import OrderList from "../pages/admin/orderList/OrderList";
import OrderInfo from "../pages/admin/orderInfo/OrderInfo";
import Sizes from "../pages/admin/sizes/Sizes";

export const roots: RouteObject[] = [
    {
        path: "/admin",
        children: [
            {
                path: "login",
                element: <Login />,
            },
            {
                path: "menu",
                element: <Menu />,
            },
            {
                path: "sizes",
                element: <Sizes />,
            },
            {
                path: "orders",
                element: <OrderList />,
            },
            {
                path: "order/:id",
                element: <OrderInfo />,
            },
            {
                path: "list",
                element: <ProductList />,
            },
            {
                path: "edit/:id?",
                element: <ProductEditor />,
            },
        ],
    },
    {
        path: "/",
        element: <Main />,
    },
    {
        path: "product/:id",
        element: <ProductViewer />,
    },
    {
        path: "cart",
        element: <Cart />,
    },
    {
        path: "order",
        element: <CreatingOrder />,
    },
    { path: "*", element: <Navigate to={"/"} /> },
];
