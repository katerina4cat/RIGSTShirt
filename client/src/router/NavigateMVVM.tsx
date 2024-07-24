import { observable, action, makeObservable, computed } from "mobx";
import { Navigate } from "react-router-dom";

export class NavigateMVVM {
    constructor() {
        makeObservable(this);
    }
    @observable
    path?: string;
    @action
    navigate = async (to: string) => {
        this.path = to;
        console.log(this.path);
    };
    @computed
    get Navigator() {
        return this.path ? <Navigate to={this.path} /> : undefined;
    }
}
