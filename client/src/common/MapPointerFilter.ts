export interface Point {
    id: string | number;
    lat: number;
    long: number;
    childrens?: number;
}

export type Bounds = [[number, number], [number, number]];

export const getDistance = (
    point1: [number, number],
    point2: [number, number] = [0, 0]
) => Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);

export const filterPoints = (
    points: Point[],
    currentBounds: Bounds,
    rangeToCombine: number
) => {
    points = points.filter(
        (point) =>
            point.lat > currentBounds[0][0] &&
            point.lat < currentBounds[1][0] &&
            point.long > currentBounds[1][1] &&
            point.long < currentBounds[0][1]
    );
    const mergedPoints: Point[] = [];

    for (let i = 0; i < points.length; i++) {
        const closePoints = points.filter((point2, index2) => {
            if (i === index2) return true;
            const distance = getDistance(
                [points[i].lat, points[i].long],
                [point2.lat, point2.long]
            );
            return distance <= rangeToCombine;
        });
        if (closePoints.length > 1) {
            mergedPoints.push({
                id: "***" + points[i].id,
                lat:
                    closePoints.reduce((a, b) => a + b.lat, 0) /
                    closePoints.length,
                long:
                    closePoints.reduce((a, b) => a + b.long, 0) /
                    closePoints.length,
                childrens: closePoints.length,
            });
            closePoints.forEach((point) => {
                const ind = points.indexOf(point);
                if (ind !== -1 && ind !== i) points.splice(ind, 1);
            });
        } else mergedPoints.push(points[i]);
    }

    return mergedPoints;
};
