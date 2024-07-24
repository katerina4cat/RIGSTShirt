import { observable, action, makeObservable } from "mobx";

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
}
