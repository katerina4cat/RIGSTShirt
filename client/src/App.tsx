import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { roots } from "./router/routes";

interface Props {}

export class AppViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}
const App = view(AppViewModel)<Props>(({ viewModel }) => {
    return <RouterProvider router={createBrowserRouter(roots)} />;
});

export default App;
