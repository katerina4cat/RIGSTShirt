export class LongClickHandler {
    delay: number;
    shouldPreventDefault: boolean;
    timeout?: number;
    triggered = false;
    startPos = [0, 0];

    constructor(
        delay = 500,
        shouldPreventDefault = true,
        onLongPress: (
            event:
                | React.MouseEvent<HTMLDivElement, MouseEvent>
                | React.TouchEvent<HTMLDivElement>
        ) => void
    ) {
        this.delay = delay;
        this.shouldPreventDefault = shouldPreventDefault;
        this.onLongPress = onLongPress;
    }

    onLongPress = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.TouchEvent<HTMLDivElement>
    ) => {
        console.log("first");
    };

    maxDeltaPos = 10;

    onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
        this.start(e);
    onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => this.start(e);
    onMouseUp = () => this.clear();
    onMouseLeave = () => this.clear();
    onTouchEnd = () => this.clear();
    onMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const currentPos = getPosEvent(e);
        if (
            currentPos[0] - this.startPos[0] > this.maxDeltaPos ||
            currentPos[1] - this.startPos[1] > this.maxDeltaPos
        )
            this.clear();
    };

    onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const currentPos = getPosEvent(e);
        if (
            currentPos[0] - this.startPos[0] > this.maxDeltaPos ||
            currentPos[1] - this.startPos[1] > this.maxDeltaPos
        )
            this.clear();
    };

    get bind() {
        return {
            onMouseDown: this.onMouseDown,
            onTouchStart: this.onTouchStart,
            onMouseUp: this.onMouseUp,
            onMouseLeave: this.onMouseLeave,
            onTouchEnd: this.onTouchEnd,
            onMouseMove: this.onMouseMove,
            onTouchMove: this.onTouchMove,
        };
    }

    clear = () => {
        this.timeout && clearTimeout(this.timeout);
        this.timeout = undefined;
        this.triggered = false;
    };

    start = (
        event:
            | React.TouchEvent<HTMLDivElement>
            | React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (event.target && this.timeout === undefined) {
            this.startPos = getPosEvent(event);
            this.timeout = setTimeout(() => {
                this.onLongPress(event);
                this.triggered = true;
            }, this.delay);
        }
    };
}

export const isTouchEvent = (
    event:
        | React.TouchEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement, MouseEvent>
) => "touches" in event;

export const getPosEvent = (
    event:
        | React.TouchEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement, MouseEvent>
): [number, number] => {
    if (isTouchEvent(event))
        return [
            (event as React.TouchEvent<HTMLDivElement>).touches[0].pageX,
            (event as React.TouchEvent<HTMLDivElement>).touches[0].pageY,
        ];
    else
        return [
            (event as React.MouseEvent<HTMLDivElement, MouseEvent>).pageX,
            (event as React.MouseEvent<HTMLDivElement, MouseEvent>).pageY,
        ];
};
