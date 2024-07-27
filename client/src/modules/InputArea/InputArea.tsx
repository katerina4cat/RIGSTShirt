import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./InputArea.module.scss";
import React from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export class InputAreaViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.value = this.viewProps.value;
    }
    @action
    onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.value = e.target.value;
        this.viewProps.onChange(e);
    };
    @observable
    value: string;
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
const InputArea = view(InputAreaViewModel)<Props>(({ viewModel }) => {
    return (
        <div className={cl.InputAreaBox}>
            <div className={cl.InputArea}>
                <textarea
                    {...viewModel.viewProps}
                    placeholder=""
                    className={cl.InputArea}
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

export default InputArea;
