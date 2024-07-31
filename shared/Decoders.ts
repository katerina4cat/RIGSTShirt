export interface CDEKPointInfo {
    id: string;
    long: number;
    lat: number;
    childrens?: number;
}
export interface PRusPointInfo {
    id: number;
    long: number;
    lat: number;
    childrens?: number;
}

export const decoders = {
    CDEK: {
        decodePoint: (encoded: Uint8Array) => {
            const res: CDEKPointInfo[] = [];
            for (let i = 0; i < encoded.byteLength; ) {
                const elementLenght = new Uint8Array(
                    encoded.slice(i, i + 1).buffer
                )[0];
                const long = new Float32Array(
                    encoded.slice(i + 1, i + 5).buffer
                )[0];
                const lat = new Float32Array(
                    encoded.slice(i + 5, i + 9).buffer
                )[0];
                const id = new TextDecoder("ASCII").decode(
                    encoded.slice(i + 9, i + elementLenght).buffer
                );
                res.push({
                    id: id,
                    long: long,
                    lat: lat,
                });
                i += elementLenght;
            }
            return res;
        },
    },
    PRus: {
        decodePoint: (encoded: Uint8Array) => {
            const res: PRusPointInfo[] = [];
            for (let i = 0; i < encoded.byteLength; ) {
                const long = new Float32Array(
                    encoded.slice(i, i + 4).buffer
                )[0];
                const lat = new Float32Array(
                    encoded.slice(i + 4, i + 8).buffer
                )[0];
                const id = new Float64Array(
                    encoded.slice(i + 8, i + 16).buffer
                )[0];
                res.push({
                    id: id,
                    long: long,
                    lat: lat,
                });
                i += 16;
            }
            return res;
        },
    },
};
