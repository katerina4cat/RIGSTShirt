import { ViewModel, view } from "@yoskutik/react-vvm";
import { action, makeObservable, observable, runInAction } from "mobx";
import cl from "./Uploader.module.scss";
import { GetProp, Upload, UploadFile, UploadProps, Image } from "antd";
import axios, { AxiosError } from "axios";
import { PlusOutlined } from "@ant-design/icons";
import { createNotify, NotifyTypes } from "../../App";

interface Props {
    productID: number;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export class UploaderViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.loadImages();
    }
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

    @observable
    fileList: UploadFile[] = [];
    @action
    loadImages = async () => {
        const photos: string[] =
            (
                await axios.get(
                    "/api/product/list/?p=" + this.viewProps.productID
                )
            ).data || [];

        photos.forEach((photo) =>
            this.fileList.push({
                uid: photo,
                name: photo,
                status: "done",
                url:
                    "/api/product/picture?p=" +
                    this.viewProps.productID +
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
        // Новый файл добавлен
        if (newFile !== undefined) {
            this.fileList.push(newFile);
            const file = this.fileList.find((file) => file.uid == newFile.uid);
            if (file) file.status = "uploading";
            axios
                .post(
                    "/api/product/picture?p=" + this.viewProps.productID,
                    await newFile.originFileObj?.arrayBuffer(),
                    {
                        onUploadProgress: (e) => {
                            if (file)
                                file.percent = e.progress
                                    ? e.progress * 200
                                    : 1;
                        },
                    }
                )
                .then((res) => {
                    if (file)
                        if (res.status === 200) {
                            if (!file) return;
                            file.status = "done";
                            file.name = res.data;
                            file.url =
                                "/api/product/picture?p=" +
                                this.viewProps.productID +
                                "&img=" +
                                res.data;
                            this.fileList = [...this.fileList];
                        }
                })
                .catch(
                    action((err: AxiosError) => {
                        if (err.response!.status === 413) {
                            runInAction(() => {
                                if (file) {
                                    file.status = "error";
                                    file.error = "Файл слишком большой!";
                                    this.fileList = [...this.fileList];
                                }
                            });
                            createNotify(
                                "Загрузка файла",
                                "Размер файла слишком большой! Не больше 5mb",
                                NotifyTypes.ERROR
                            );
                        }
                    })
                );
            return;
        }
        // Файл удалён
        if (deletedFile !== undefined) {
            if (deletedFile.status === "error")
                this.fileList = this.fileList.filter(
                    (file) => file.uid !== deletedFile.uid
                );
            else
                axios
                    .delete(
                        "/api/product/picture?p=" +
                            this.viewProps.productID +
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
}
const Uploader = view(UploaderViewModel)<Props>(({ viewModel }) => {
    return (
        <div>
            <Upload
                listType="picture-card"
                className={cl.Upload}
                fileList={viewModel.fileList}
                onPreview={viewModel.setPreviewFile}
                onChange={viewModel.handleChange}
                accept="image/png, image/jpeg"
            >
                {viewModel.fileList.length >= 8 ? null : (
                    <div>
                        <PlusOutlined />
                        <div>Upload</div>
                    </div>
                )}
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
        </div>
    );
});

export default Uploader;
