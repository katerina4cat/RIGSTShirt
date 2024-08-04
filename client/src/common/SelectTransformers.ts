import { delivertTitles, deliveryTypes } from "../../../shared/enums";

interface options {
    label: string;
    value: string;
}

const selectionValue2id = (value?: string) =>
    value === undefined ? undefined : Number(value.split("$")[0]);

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
        getvalue: selectionValue2id,
    },
    status: {
        options: (statuses: string[]): options[] =>
            statuses.filter(Boolean).map(
                (status) =>
                    selections.status.convert2value(status) as {
                        label: string;
                        value: string;
                    }
            ),

        convert2value: (size?: string) =>
            size === undefined
                ? undefined
                : {
                      label: size,
                      value: size,
                  },
        getvalue: (value?: string) => value,
    },
    delivery: {
        options: (): options[] =>
            Object.keys(delivertTitles).map((e) =>
                selections.delivery.convert2value(Number(e) as deliveryTypes)
            ),

        convert2value: (deliveryType: deliveryTypes) => ({
            label: delivertTitles[deliveryType],
            value: `${deliveryType}$${delivertTitles[deliveryType]}`,
        }),
        getvalue: selectionValue2id,
    },
};
