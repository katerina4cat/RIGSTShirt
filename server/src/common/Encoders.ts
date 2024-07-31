import { CDEKPointInfo, PRusPointInfo } from "./DeliveryPointsManager";

export const encoders = {
    CDEK: {
        encodePoint: (point: CDEKPointInfo) => {
            const longByte = new Float32Array([point.long]);
            const latByte = new Float32Array([point.lat]);
            const idByte = new TextEncoder().encode(point.id);
            const concentrated = new Uint8Array(
                1 + longByte.byteLength + latByte.byteLength + idByte.byteLength
            );
            concentrated.set(
                new Uint8Array([
                    1 +
                        longByte.byteLength +
                        latByte.byteLength +
                        idByte.length,
                ]),
                0
            );
            concentrated.set(new Uint8Array(longByte.buffer), 1);
            concentrated.set(
                new Uint8Array(latByte.buffer),
                longByte.byteLength + 1
            );
            concentrated.set(
                new Uint8Array(idByte.buffer),
                longByte.byteLength + latByte.byteLength + 1
            );
            return concentrated;
        },
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
        encodePoint: (point: PRusPointInfo) => {
            const longByte = new Float32Array([point.long]);
            const latByte = new Float32Array([point.lat]);
            const idByte = new Float64Array([point.id]);
            const concentrated = new Uint8Array(
                longByte.byteLength + latByte.byteLength + idByte.byteLength
            );
            concentrated.set(new Uint8Array(longByte.buffer), 0);
            concentrated.set(
                new Uint8Array(latByte.buffer),
                longByte.byteLength
            );
            concentrated.set(
                new Uint8Array(idByte.buffer),
                longByte.byteLength + latByte.byteLength
            );
            return concentrated;
        },
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
