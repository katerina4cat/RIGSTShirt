import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { roots } from "./router/routes";
import { ConfigProvider, notification } from "antd";

interface Props {}

export class AppViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}

export let createNotify = (
    title: string,
    message: string,
    type: NotifyTypes = NotifyTypes.INFO,
    duration: number = 2.5
) => {};
export const enum NotifyTypes {
    INFO,
    WARNING,
    ERROR,
    SUCCESS,
}

const NotifyPlacement = "topRight";

const App = view(AppViewModel)<Props>(({ viewModel }) => {
    const [api, contextHolder] = notification.useNotification();
    createNotify = (
        title: string,
        message: string,
        type: NotifyTypes = NotifyTypes.INFO,
        duration: number = 2.5
    ) => {
        switch (type) {
            case NotifyTypes.INFO:
                return api.info({
                    message: title,
                    description: message,
                    placement: NotifyPlacement,
                    showProgress: true,
                    duration: duration,
                });
            case NotifyTypes.SUCCESS:
                return api.success({
                    message: title,
                    description: message,
                    placement: NotifyPlacement,
                    showProgress: true,
                    duration: duration,
                });
            case NotifyTypes.WARNING:
                return api.warning({
                    message: title,
                    description: message,
                    placement: NotifyPlacement,
                    showProgress: true,
                    duration: duration,
                });
            case NotifyTypes.ERROR:
                return api.error({
                    message: title,
                    description: message,
                    placement: NotifyPlacement,
                    showProgress: true,
                    duration: duration,
                });
        }
    };
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
                        colorPrimary: "rgba(154, 148, 158, 0)",
                        controlOutline: "rgb(154, 148, 158)",
                        colorPrimaryHover: "rgb(154, 148, 158)",
                        colorTextPlaceholder: "rgb(154, 148, 158)",
                    },
                    Switch: {
                        colorPrimary: "rgb(108, 61, 150)",
                        colorPrimaryHover: "rgba(108, 61, 150, 0.6)",
                    },
                    Table: {
                        colorLink: "rgb(127, 96, 171)",
                        colorLinkActive: "rgb(127, 96, 171)",
                        colorLinkHover: "rgb(170, 135, 220)",
                        colorPrimary: "rgb(127, 96, 171)",
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
                    Upload: {
                        colorBorder: "rgb(119, 58, 175)",
                        colorFillAlter: "rgba(54, 40, 67, 0.71)",
                    },
                },
            }}
        >
            {contextHolder}
            <RouterProvider router={createBrowserRouter(roots)} />
        </ConfigProvider>
    );
});

export default App;
