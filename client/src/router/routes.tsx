import { Navigate, RouteObject } from "react-router-dom";
import Login from "../pages/admin/login/Login";
import Main from "../pages/common/main/Main";

export const roots: RouteObject[] = [
    {
        path: "/admin",
        children: [
            {
                path: "login",
                element: <Login />,
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
