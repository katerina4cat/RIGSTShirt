import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable } from "mobx";
import cl from "./ProductEditor.module.scss";
import Footer from "../../../modules/Footer/Footer";
import Header from "../../../modules/Header/Header";
import ptemp from "../../../modules/Header/PageTemplate.module.scss";
import { GetProp, Image, Upload, UploadFile, UploadProps } from "antd";
import { NavigateMVVM } from "../../../router/NavigateMVVM";
import axios from "axios";
import Input from "../../../modules/Input/Input";
import { ChangeEvent } from "react";
import { checkLogin } from "../../../router/authCheck";

interface Props {}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export class ProductEditorViewModel extends ViewModel<unknown, Props> {
    nav = new NavigateMVVM();
    constructor() {
        super();
        makeObservable(this);
        this.loadImages(1);
    }
    productID = 1;
    @observable
    previewImage = "";
    @observable
    previewOpen = false;
    @action
    setPreview = (value: boolean) => {
        if (!value) this.previewImage = "";
        this.previewOpen = value;
    };
    @action
    setPreviewFile = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        this.previewImage = file.url || (file.preview as string);
        this.previewOpen = true;
    };
    @action
    loadImages = async (productID: number) => {
        const photos: string[] =
            (
                await axios.get(
                    "https://185.197.34.18/product/list/?p=" + productID
                )
            ).data || [];
        photos.forEach((photo) =>
            this.fileList.push({
                uid: photo,
                name: photo,
                status: "done",
                url:
                    "https://185.197.34.18/product/picture?p=" +
                    productID +
                    "&img=" +
                    photo,
            })
        );
    };
    @action
    handleChange: UploadProps["onChange"] = async ({
        fileList: newFileList,
    }) => {
        const deletedFile = this.fileList.find(
            (file) =>
                newFileList.findIndex((newFile) => newFile.uid === file.uid) ===
                -1
        );
        const newFile = newFileList.find(
            (newFile) =>
                this.fileList.findIndex((file) => newFile.uid === file.uid) ===
                -1
        );
        if (newFile !== undefined) {
            this.fileList.push(newFile);
            axios
                .post(
                    "https://185.197.34.18/product/picture?p=" + this.productID,
                    await newFile.originFileObj?.arrayBuffer()
                )
                .then((res) => {
                    if (res.status === 200) {
                        const file = this.fileList.find(
                            (file) => file.uid == newFile.uid
                        );
                        if (!file) return;
                        file.status = "done";
                        file.name = res.data;
                        file.url =
                            "https://185.197.34.18/product/picture?p=" +
                            this.productID +
                            "&img=" +
                            res.data;
                    }
                });
            return;
        }
        if (deletedFile !== undefined) {
            axios
                .delete(
                    "https://185.197.34.18/product/picture?p=" +
                        this.productID +
                        "&img=" +
                        deletedFile.name
                )
                .then((res) => {
                    if (res.status === 200)
                        this.fileList = this.fileList.filter(
                            (file) => file.uid !== deletedFile.uid
                        );
                });
            return;
        }
    };
    @observable
    fileList: UploadFile<any>[] = [];
    @observable
    inputData: { [key in string]: string } = { title: "" };
    @observable
    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.inputData[event.target.name] = event.target.value;
    };
}
const ProductEditor = view(ProductEditorViewModel)<Props>(({ viewModel }) => {
    if (!checkLogin()) {
        viewModel.nav.navigate("/admin/login");
        return viewModel.nav.Navigator;
    }
    const uploadButton = (
        <button style={{ border: 0, background: "none" }} type="button">
            +<div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
    return (
        <div className={ptemp.wrapper}>
            <Header backUrl="/admin/menu" logout />
            <div className={cl.ProductEditor}>
                <h1>Добавление/редактирование товара</h1>
                <Upload
                    listType="picture-card"
                    className={cl.Upload}
                    fileList={viewModel.fileList}
                    onPreview={viewModel.setPreviewFile}
                    onChange={viewModel.handleChange}
                >
                    {viewModel.fileList.length >= 8 ? null : uploadButton}
                </Upload>
                {viewModel.previewImage && (
                    <Image
                        wrapperStyle={{ display: "none" }}
                        preview={{
                            visible: viewModel.previewOpen,
                            onVisibleChange: (visible) =>
                                viewModel.setPreview(visible),
                        }}
                        src={viewModel.previewImage}
                    />
                )}
                <Input
                    value={viewModel.inputData.title}
                    name={"title"}
                    onChange={viewModel.handleInput}
                    placeholder="Название"
                />
                {viewModel.nav.Navigator}
            </div>
            <Footer />
        </div>
    );
});

export default ProductEditor;
