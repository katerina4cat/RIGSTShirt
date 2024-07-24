import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { roots } from "./router/routes";
import { ConfigProvider } from "antd";

interface Props {}

export class AppViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const App = view(AppViewModel)<Props>(({ viewModel }) => {
    return (
        <ConfigProvider
            theme={{
                token: {
                    wireframe: false,
                    colorBgBase: "#262428",
                    colorTextBase: "#e6e2e9",
                },
                components: {
                    Select: {
                        colorBgContainer: "rgba(54, 40, 67, 0.75)",
                        colorBgContainerDisabled: "rgba(54, 40, 67, 0.5)",
                        colorBgElevated: "rgb(64, 51, 77)",
                        colorBorder: "rgb(68, 68, 68)",
                        optionSelectedBg: "rgb(82, 57, 106)",
                    },
                    Switch: {
                        colorPrimary: "rgb(108, 61, 150)",
                    },
                    Table: {
                        colorLink: "rgb(127, 96, 171)",
                        colorLinkActive: "rgb(127, 96, 171)",
                        colorLinkHover: "rgb(170, 135, 220)",
                        colorPrimary: "rgb(127, 96, 171)",
                    },
                    Input: {
                        activeBg: "rgb(68, 40, 94)",
                        activeBorderColor: "rgba(22, 119, 255, 0)",
                        addonBg: "rgba(0, 0, 0, 0)",
                        hoverBorderColor: "rgb(104, 95, 112)",
                        colorBorder: "rgb(68, 68, 68)",
                        colorBgContainer: "rgba(64, 51, 77, 0.75)",
                        colorText: "rgb(230, 226, 233)",
                        colorTextPlaceholder: "rgba(230, 226, 233, 0.25)",
                    },
                    Button: {
                        defaultBg: "rgb(54, 40, 67)",
                        defaultBorderColor: "rgb(68, 68, 68)",
                        defaultActiveBorderColor: "rgb(54, 40, 67)",
                        defaultActiveColor: "rgb(54, 40, 67)",
                        defaultHoverBorderColor: "rgb(87, 47, 124)",
                        defaultHoverBg: "rgb(87, 47, 124)",
                        defaultHoverColor: "rgb(230, 226, 233)",
                    },
                },
            }}
        >
            <RouterProvider router={createBrowserRouter(roots)} />
        </ConfigProvider>
    );
});

export default App;
