import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, keys, makeObservable, observable, runInAction } from "mobx";

import cl from "./Sizes.module.scss";
import BaseTemplate from "../../../modules/PageTemplate/BaseTemplate";
import { Button, Modal, Table, TableColumnsType } from "antd";
import { createNotify, NotifyTypes } from "../../../App";
import {
    APIAccessTest,
    APIAddSize,
    APIGetSizes,
} from "../../../common/ApiManager";
import Input from "../../../modules/Input/Input";

interface Props {}
const columns: TableColumnsType<DataTable> = [
    {
        title: "Название",
        dataIndex: "title",
        key: "title",
    },
    {
        title: "Удалить",
        render: (e) => <Button onClick={() => console.log(e)}>Удалить</Button>,
    },
];

interface DataTable {
    key: React.Key;
    title: string;
}

export class SizesViewModel extends ViewModel<unknown, Props> {
    nav = { navigate: (to: string) => {} };
    constructor() {
        super();
        makeObservable(this);
        this.loadServerData();
    }

    @observable
    sizes: DataTable[] = [];
    @observable
    modal = false;

    @action
    loadServerData = async () => {
        if (!(await APIAccessTest())) {
            this.nav.navigate("/admin/login");
            createNotify(
                "Авторизация",
                "Для открытия данной страницы необходима авторизация!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        const res = await APIGetSizes();
        if ("errors" in res) {
            this.nav.navigate("/admin/menu");
            createNotify(
                "Таблица размеров",
                "Не удалось загрузить размеры!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        runInAction(
            () =>
                (this.sizes = res.map(
                    (size: { id: number; title: string }) => ({
                        key: size.id,
                        title: size.title,
                    })
                ))
        );
    };
    @observable
    inputData: { [key in string]: string } = {
        title: "",
    };
    @observable
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.inputData[event.target.name] = event.target.value;
        return event.target.value;
    };
    addSize = async () => {
        const res = await APIAddSize(this.inputData.title);
        if ("errors" in res) {
            createNotify(
                "Таблица размеров",
                "Не удалось добавить размер!",
                NotifyTypes.ERROR,
                3
            );
            return;
        }
        runInAction(() => {
            this.sizes = [
                ...this.sizes,
                {
                    key: res.addSize,
                    title: this.inputData.title + "",
                },
            ];
            this.inputData.title = "";
            this.modal = false;
        });
    };
}

const Sizes = view(SizesViewModel)<Props>(({ viewModel }) => {
    return (
        <BaseTemplate nav={viewModel.nav} backUrl="/admin/menu" logout>
            <div className={cl.Sizes}>
                <h2>Размеры</h2>
                <Table columns={columns} dataSource={viewModel.sizes} />
                <Button
                    onClick={action(() => {
                        viewModel.modal = true;
                    })}
                >
                    Добавить новый размер
                </Button>
                <Modal
                    title="Новый размер"
                    onCancel={action(() => {
                        viewModel.modal = false;
                    })}
                    onOk={viewModel.addSize}
                    open={viewModel.modal}
                    okText="Добавить"
                    cancelText="Отмена"
                >
                    <p>Добавление нового размера</p>
                    <Input
                        onChange={viewModel.handleInput}
                        name="title"
                        value={viewModel.inputData.title}
                        placeholder="Название"
                    />
                </Modal>
            </div>
        </BaseTemplate>
    );
});

export default Sizes;
