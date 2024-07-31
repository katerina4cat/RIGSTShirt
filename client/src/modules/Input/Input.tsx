import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Input.module.scss";
import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => string;
}

export class InputViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.value = this.viewProps.value;
    }
    @observable
    active = false;
    @action
    onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.value = this.viewProps.onChange(e);
    };
    @observable
    value: string;
    @action
    focus = () => {
        this.active = true;
    };
    @action
    blure = () => {
        this.active = false;
    };
}
const Input = view(InputViewModel)<Props>(({ viewModel }) => {
    return (
        <div className={cl.InputBox}>
            <div className={cl.Input}>
                <input
                    {...viewModel.viewProps}
                    placeholder=""
                    className={cl.Input}
                    value={viewModel.value}
                    onFocus={viewModel.focus}
                    onBlur={viewModel.blure}
                    onChange={viewModel.onChange}
                />
                <div
                    className={`${cl.Placeholder} ${
                        !viewModel.viewProps.value && !viewModel.active
                            ? cl.Preview
                            : ""
                    }`}
                    style={{
                        fontSize:
                            viewModel.viewProps.value || viewModel.active
                                ? "0.95em"
                                : "1.2em",
                        transform:
                            viewModel.viewProps.value || viewModel.active
                                ? "translateY(-100%)"
                                : "translateY(25%)",
                    }}
                >
                    {viewModel.viewProps.placeholder}
                </div>
            </div>
        </div>
    );
});

export default Input;
