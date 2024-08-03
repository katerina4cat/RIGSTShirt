import axios from "axios";
import { encoders } from "./Encoders";
import fs from "fs";
import { mediaPath } from "app";

export interface CDEKPointInfo {
    id: string;
    long: number;
    lat: number;
}
export interface PRusPointInfo {
    id: number;
    long: number;
    lat: number;
}

class DeliveryPoints {
    constructor() {
        if (!fs.existsSync(`${mediaPath}/deliveryPoints`))
            fs.mkdirSync(`${mediaPath}/deliveryPoints`);
        this.loadCDEKPoints();
        this.loadRussianPostsPoints();
    }

    CDEKFile = mediaPath + "/deliveryPoints/CDEK.pcoord";
    PRusFile = mediaPath + "/deliveryPoints/PRus.pcoord";

    getOfficesPochta = (page = 1) =>
        axios.post(`https://widget.pochta.ru/api/pvz`, {
            settings_id: 50317,
            pageSize: 200,
            page: page,
            pvzType: ["russian_post", "postamat"],
        });

    getCDEK = () => axios.get(`https://api.cdek.ru/v2/offices`);

    CDEKPoints: Uint8Array = new Uint8Array();
    PRusPoints: Uint8Array = new Uint8Array();

    loadRussianPostsPoints = async () => {
        if (fs.existsSync(this.PRusFile)) {
            const fileStats = fs.statSync(this.PRusFile);
            const timeFromLastSync = Date.now() - fileStats.mtimeMs;
            if (timeFromLastSync < 8 * 3600000) {
                console.log("Backup sync with PRus points!");
                this.PRusPoints = new Uint8Array(
                    fs.readFileSync(this.PRusFile)
                );
                return;
            }
        }
        console.log("Start sync with PRus points!");
        const res = await this.getOfficesPochta();
        const postOffices: PRusPointInfo[] = res.data.data.map(
            (office: any): PRusPointInfo => ({
                id: office.id,
                lat: office.geo.coordinates[0],
                long: office.geo.coordinates[1],
            })
        );
        const totalPages = res.data.totalPages;
        for (let i = 2; i <= totalPages; i++) {
            const res = await this.getOfficesPochta(i);
            postOffices.push(
                ...res.data.data.map(
                    (office: any): PRusPointInfo => ({
                        id: office.id,
                        lat: office.geo.coordinates[0],
                        long: office.geo.coordinates[1],
                    })
                )
            );
        }
        const encodedArray = postOffices
            .filter(
                (office, ind, array) =>
                    array.findIndex((off) => off.id === office.id) === ind
            )
            .map(encoders.PRus.encodePoint);

        const encode = new Uint8Array(
            encodedArray.reduce((a, b) => a + b.byteLength, 0)
        );
        let offset = 0;
        encodedArray.forEach((uint8Array) => {
            encode.set(uint8Array, offset);
            offset += uint8Array.length;
        });
        this.PRusPoints = encode;
        fs.writeFile(this.PRusFile, encode, () => {});
        console.log("Complete sync with PRus points!");
    };
    loadCDEKPoints = async () => {
        if (fs.existsSync(this.CDEKFile)) {
            const fileStats = fs.statSync(this.CDEKFile);
            const timeFromLastSync = Date.now() - fileStats.mtimeMs;
            if (timeFromLastSync < 8 * 3600000) {
                console.log("Backup sync with CDEK points!");
                this.CDEKPoints = new Uint8Array(
                    fs.readFileSync(this.CDEKFile)
                );
                return;
            }
        }
        console.log("Start sync with CDEK points!");
        const res = await this.getCDEK();
        const points: CDEKPointInfo[] = (
            res.data.pvz.map(
                (office: any): CDEKPointInfo => ({
                    id: office.code,
                    lat: office.coordX,
                    long: office.coordY,
                })
            ) as CDEKPointInfo[]
        ).filter(
            (office, ind, array) =>
                array.findIndex((off) => off.id === office.id) === ind
        );
        const encodedArray = points.map(encoders.CDEK.encodePoint);

        const encode = new Uint8Array(
            encodedArray.reduce((a, b) => a + b.byteLength, 0)
        );
        let offset = 0;
        encodedArray.forEach((uint8Array) => {
            encode.set(uint8Array, offset);
            offset += uint8Array.length;
        });
        this.CDEKPoints = encode;
        fs.writeFile(this.CDEKFile, encode, () => {});
        console.log("Complete sync with CDEK points!");
    };
}

const deliveryPoints = new DeliveryPoints();
export default deliveryPoints;
