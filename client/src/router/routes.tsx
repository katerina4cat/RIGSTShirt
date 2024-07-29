import { Navigate, RouteObject } from "react-router-dom";
import Login from "../pages/admin/login/Login";
import Main from "../pages/common/main/Main";
import Menu from "../pages/admin/menu/Menu";
import ProductEditor from "../pages/admin/productEditor/ProductEditor";
import ProductViewer from "../pages/common/productViewer/ProductViewer";

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
    { path: "*", element: <Navigate to={"/"} /> },
];
