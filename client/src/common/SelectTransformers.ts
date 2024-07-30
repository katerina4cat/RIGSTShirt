import { deliveryTypes } from "../../../shared/enums";

interface options {
    label: string;
    value: string;
}
export const selections = {
    size: {
        options: (sizes?: { id: number; title?: string }[]): options[] =>
            sizes === undefined
                ? []
                : sizes
                      .filter((size) => size.title !== undefined)
                      .map((size) => selections.size.convert2value(size)!),

        convert2value: (size?: { id: number; title?: string }) =>
            size === undefined
                ? undefined
                : {
                      label: size.title || "-",
                      value: `${size.id}$${size.title}`,
                  },
    },
};

export const selectionValue2id = (value: string) => Number(value.split("$")[0]);

export const selectionDeliverys: options[] = [
    {
        label: "СДЕК",
        value: `${deliveryTypes.CDEK}$СДЕК`,
    },
    {
        label: "Почта России",
        value: `${deliveryTypes.RUSSIAN_POST}$Почта России`,
    },
    {
        label: "Курьер",
        value: `${deliveryTypes.CUSTOM_COURIER}$Курьер`,
    },
];
