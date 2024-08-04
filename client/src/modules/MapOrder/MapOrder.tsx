import { ViewModel, view } from "@yoskutik/react-vvm";
import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import cl from "./Map.module.scss";
import {
    YMapComponentsProvider,
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapListener,
} from "ymap3-components";
import { CreatingOrderViewModel } from "../../pages/common/creatingOrder/CreatingOrder";
import {
    CDEKPointInfo,
    decoders,
    PRusPointInfo,
} from "../../../../shared/Decoders";
import axios from "axios";
import {
    filterPoints,
    Bounds,
    getDistance,
} from "../../common/MapPointerFilter";
import { deliveryTypes } from "../../../../shared/enums";
import MapMarker from "../MapMarker/MapMarker";
import {
    getPosEvent,
    isTouchEvent,
    LongClickHandler,
} from "../LongClick/lognClick";
import { createRef } from "react";

interface Props {
    parent: CreatingOrderViewModel;
}

export class MapOrderViewModel extends ViewModel<undefined, Props> {
    constructor() {
        super();
        makeObservable(this);
        this.loadCDEK();
        this.loadPRus();
    }

    @observable
    PRusPoints: PRusPointInfo[] = [];

    @computed
    get viewPRus() {
        return filterPoints(
            this.PRusPoints,
            this.currentBounds,
            this.combineDistance
        );
    }

    loadPRus = async () => {
        const res = await axios.get("/api/delivery/PRus", {
            responseType: "arraybuffer",
        });
        const data = decoders.PRus.decodePoint(new Uint8Array(res.data));
        runInAction(() => {
            this.PRusPoints = data;
        });
    };

    @observable
    CDEKPoints: CDEKPointInfo[] = [];

    @computed
    get viewCDEK() {
        return filterPoints(
            this.CDEKPoints,
            this.currentBounds,
            this.combineDistance
        );
    }

    loadCDEK = async () => {
        const res = await axios.get("/api/delivery/CDEK", {
            responseType: "arraybuffer",
            headers: {
                "Content-Type": "application/gzip",
            },
        });
        const data = decoders.CDEK.decodePoint(new Uint8Array(res.data));
        runInAction(() => {
            this.CDEKPoints = data;
        });
    };

    @observable
    currentLocation = {
        center: [37.61556, 55.75222],
        zoom: 12,
    };
    @observable
    currentBounds: Bounds = [
        [37.44664520507811, 55.811037458931246],
        [37.78447479492187, 55.69331334155078],
    ];
    @observable
    combineDistance = 0.028619765398027238;
    viewBounds: [number, number] = [
        this.currentBounds[1][0] - this.currentBounds[0][0],
        this.currentBounds[0][1] - this.currentBounds[1][1],
    ];

    @action
    onUpdate = ({ location, mapInAction }: any) => {
        if (!mapInAction) {
            this.currentLocation = {
                center: location.center,
                zoom: location.zoom,
            };
            this.currentBounds = location.bounds;
            this.combineDistance = getDistance([
                (location.bounds[1][0] - location.bounds[0][0]) * 0.08,
                (location.bounds[0][1] - location.bounds[1][1]) * 0.08,
            ]);
            this.viewBounds = [
                this.currentBounds[1][0] - this.currentBounds[0][0],
                this.currentBounds[0][1] - this.currentBounds[1][1],
            ];
        }
    };

    @computed
    get MapMarkers(): JSX.Element | undefined {
        switch (this.viewProps.parent.deliveryType) {
            case deliveryTypes.CDEK:
                return (
                    <>
                        {this.viewCDEK.map((point) => (
                            <MapMarker
                                key={point.id}
                                geo={[point.lat, point.long]}
                                markerType={deliveryTypes.CDEK}
                                onClick={() =>
                                    this.viewProps.parent.onClickMarker(point)
                                }
                                childrens={point.childrens}
                            />
                        ))}
                    </>
                );
            case deliveryTypes.RUSSIAN_POST:
                return (
                    <>
                        {this.viewPRus.map((point) => (
                            <MapMarker
                                key={point.id}
                                geo={[point.lat, point.long]}
                                markerType={deliveryTypes.RUSSIAN_POST}
                                onClick={() =>
                                    this.viewProps.parent.onClickMarker(point)
                                }
                                childrens={point.childrens}
                            />
                        ))}
                    </>
                );
            case deliveryTypes.CUSTOM_COURIER:
                if (this.viewProps.parent.selectedGeo)
                    return (
                        <MapMarker
                            geo={this.viewProps.parent.selectedGeo}
                            markerType={deliveryTypes.CUSTOM_COURIER}
                        />
                    );
                return;
        }
    }

    onLongClick = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        if (this.viewProps.parent.deliveryType !== deliveryTypes.CUSTOM_COURIER)
            return;
        if (!this.mapBoxRef.current) return;
        const topLeftMapBox = [
            this.mapBoxRef.current.offsetLeft,
            this.mapBoxRef.current.offsetTop,
        ];
        const clickPos = getPosEvent(event);
        if (clickPos.filter((x) => x === undefined).length != 0) return;
        const percAtMapBox = [
            (clickPos[0] - topLeftMapBox[0]) /
                this.mapBoxRef.current.offsetWidth,
            (clickPos[1] - topLeftMapBox[1]) /
                this.mapBoxRef.current.offsetHeight,
        ];
        // Долгота это горизонталь, широта вертикаль
        runInAction(() => {
            this.viewProps.parent.selectedGeo = [
                this.currentBounds[0][0] + percAtMapBox[0] * this.viewBounds[0],
                this.currentBounds[0][1] - percAtMapBox[1] * this.viewBounds[1],
            ];
        });
    };

    mapBoxRef = createRef<HTMLDivElement>();

    longClickHander = new LongClickHandler(1250, true, this.onLongClick);
}
const MapOrder = view(MapOrderViewModel)<Props>(({ viewModel }) => {
    return (
        <YMapComponentsProvider apiKey={import.meta.env.VITE_YMAP_KEY}>
            <div {...viewModel.longClickHander.bind} ref={viewModel.mapBoxRef}>
                <YMap
                    location={viewModel.currentLocation}
                    mode={"vector"}
                    className={cl.Map}
                    theme={"dark"}
                >
                    <YMapDefaultSchemeLayer />
                    <YMapDefaultFeaturesLayer />
                    <YMapListener onUpdate={viewModel.onUpdate} />
                    {viewModel.MapMarkers}
                </YMap>
            </div>
        </YMapComponentsProvider>
    );
});

export default MapOrder;
