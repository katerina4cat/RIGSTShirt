import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./Input.module.scss";
import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export class InputViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
    @observable
    active = false;
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
                    onFocus={viewModel.focus}
                    onBlur={viewModel.blure}
                />
                <div
                    className={`${cl.Placeholder} ${
                        !viewModel.viewProps.value && !viewModel.active
                            ? cl.Preview
                            : ""
                    }`}
                    style={{
                        top:
                            viewModel.viewProps.value || viewModel.active
                                ? "0"
                                : "50%",
                        fontSize:
                            viewModel.viewProps.value || viewModel.active
                                ? "0.95em"
                                : "1.2em",
                        transform:
                            viewModel.viewProps.value || viewModel.active
                                ? "translateY(-100%)"
                                : "translateY(-50%)",
                    }}
                >
                    {viewModel.viewProps.placeholder}
                </div>
            </div>
        </div>
    );
});

export default Input;
