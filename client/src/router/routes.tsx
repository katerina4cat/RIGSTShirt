import { Navigate, RouteObject } from "react-router-dom";
import Login from "../pages/admin/login/Login";
import Main from "../pages/common/main/Main";
import Menu from "../pages/admin/menu/Menu";
import ProductEditor from "../pages/admin/productEditor/ProductEditor";

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
                path: "edit",
                element: <ProductEditor />,
            },
        ],
    },
    {
        path: "/",
        element: <Main />,
        children: [],
    },
    { path: "*", element: <Navigate to={"/"} /> },
];
