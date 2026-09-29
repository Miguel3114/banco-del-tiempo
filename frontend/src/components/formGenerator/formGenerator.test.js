import React, {
    createRef
} from "react";

import {
    act,
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import FormGenerator from "./formGenerator";

import {
    formValidators
} from "../../validators/formValidators";


const inputs = [
    {
        tag: "Nombre",
        name: "name",
        type: "text",
        defaultValue: "",
        validators: [
            formValidators.notEmptyValidator
        ]
    },
    {
        tag: "Tipo",
        name: "type",
        type: "select",
        defaultValue: "a",
        values: [
            { value: "a", label: "Tipo A" },
            { value: "b", label: "Tipo B" }
        ],
        validators: []
    },
    {
        tag: "Descripción",
        name: "description",
        type: "textarea",
        defaultValue: "Inicial",
        validators: []
    }
];


describe("FormGenerator", () => {

    test("shouldValidateFieldsAndShowErrors", async () => {

        const ref = createRef();
        const onSubmit = jest.fn();

        render(
            <FormGenerator
                ref={ref}
                inputs={inputs}
                buttonText="Guardar"
                onSubmit={onSubmit}
            />
        );

        await screen.findByLabelText("Nombre:");

        act(() => {
            expect(
                ref.current.validate()
            ).toBe(false);
        });

        expect(
            screen.getByText(
                "El campo no puede estar vacío"
            )
        ).toBeInTheDocument();

        fireEvent.change(
            screen.getByLabelText("Nombre:"),
            {
                target: {
                    value: "Miguel"
                }
            }
        );

        fireEvent.click(
            screen.getByRole(
                "button",
                { name: "Guardar" }
            )
        );

        await waitFor(() => {

            expect(
                ref.current.validate()
            ).toBe(true);

        });

        expect(onSubmit).toHaveBeenCalled();
    });

    test("shouldSubmitCurrentValues", async () => {
        const onSubmit = jest.fn();

        render(
            <FormGenerator
                inputs={inputs}
                onSubmit={onSubmit}
                buttonText="Guardar"
            />
        );

        await screen.findByLabelText("Nombre:");

        fireEvent.change(
            screen.getByLabelText("Nombre:"),
            { target: { value: "Miguel" } }
        );
        fireEvent.change(
            screen.getByLabelText("Tipo:"),
            { target: { value: "b" } }
        );
        fireEvent.change(
            screen.getByLabelText("Descripción:"),
            { target: { value: "Nueva" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Guardar" })
        );

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                values: {
                    name: "Miguel",
                    type: "b",
                    description: "Nueva"
                }
            });
        });
    });

    test("shouldSetAndClearFieldErrors", async () => {
        const ref = createRef();

        render(
            <FormGenerator
                ref={ref}
                inputs={inputs}
            />
        );

        await screen.findByLabelText("Nombre:");

        act(() => {
            ref.current.setFieldErrors(
                "name",
                ["Error manual"]
            );
        });

        expect(
            screen.getByText("Error manual")
        ).toBeInTheDocument();

        act(() => {
            ref.current.clearFieldErrors("name");
        });

        expect(
            screen.queryByText("Error manual")
        ).not.toBeInTheDocument();
    });
});
