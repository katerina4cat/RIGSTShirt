import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./MapMarker.module.scss";
import { Point } from "../../common/MapPointerFilter";
import { YMapMarker } from "ymap3-components";
import { deliveryTypes } from "../../../../shared/enums";
import OfficeIcon from "../../icons/office.svg?react";

interface Props {
    points: Point[];
    onClick?: (point: Point) => void;
    markerType: deliveryTypes;
    icon?: JSX.Element;
    zoomIn: (center: [number, number]) => void;
}

export class MapMarkerViewModel extends ViewModel<unknown, Props> {
    constructor() {
        super();
        makeObservable(this);
    }
}

const MarkersClassNames: { [key in deliveryTypes]: string } = {
    [deliveryTypes.CDEK]: cl.CDEK,
    [deliveryTypes.RUSSIAN_POST]: cl.PRus,
    [deliveryTypes.CUSTOM_COURIER]: cl.Custom,
};

const MapMarker = view(MapMarkerViewModel)<Props>(({ viewModel }) => {
    return viewModel.viewProps.points.map((point) => (
        <YMapMarker
            key={point.id}
            coordinates={[point.lat, point.long]}
            draggable={false}
            onClick={
                point.childrens
                    ? () => viewModel.viewProps.zoomIn([point.lat, point.long])
                    : viewModel.viewProps.onClick &&
                      (() => viewModel.viewProps.onClick!(point))
            }
        >
            <div
                className={`${
                    point.childrens === undefined
                        ? cl.PointBorder
                        : cl.PointMany
                } ${MarkersClassNames[viewModel.viewProps.markerType]}`}
            >
                <div className={cl.Point}>
                    {point.childrens || viewModel.viewProps.icon || (
                        <OfficeIcon className={cl.Icon} />
                    )}
                </div>
            </div>
        </YMapMarker>
    ));
});

export default MapMarker;
