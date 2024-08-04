import { ViewModel, view } from "@yoskutik/react-vvm";
import { makeObservable } from "mobx";
import cl from "./MapMarker.module.scss";
import { YMapMarker } from "ymap3-components";
import { deliveryTypes } from "../../../../shared/enums";
import OfficeIcon from "../../icons/office.svg?react";

interface Props {
    geo: [number, number];
    onClick?: () => void;
    markerType: deliveryTypes;
    childrens?: number;
    icon?: JSX.Element;
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
    return (
        <YMapMarker
            coordinates={viewModel.viewProps.geo}
            draggable={false}
            onClick={viewModel.viewProps.onClick}
        >
            <div
                className={`${
                    viewModel.viewProps.childrens === undefined
                        ? cl.PointBorder
                        : cl.PointMany
                } ${MarkersClassNames[viewModel.viewProps.markerType]}`}
            >
                <div className={cl.Point}>
                    {viewModel.viewProps.childrens ||
                        viewModel.viewProps.icon || (
                            <OfficeIcon className={cl.Icon} />
                        )}
                </div>
            </div>
        </YMapMarker>
    );
});

export default MapMarker;
