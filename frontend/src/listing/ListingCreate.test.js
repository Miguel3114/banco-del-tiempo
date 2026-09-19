import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import ListingCreate
    from "./ListingCreate";


describe("ListingCreate", () => {

    beforeEach(() => {

        localStorage.setItem(
            "jwt",
            JSON.stringify(
                "test-token"
            )
        );

        global.fetch =
            jest.fn();
    });


    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });


    test(
        "shouldNotSubmitWhenTitleIsEmpty",
        async () => {

            global.fetch
                .mockResolvedValue({
                    ok: true,

                    json: async () => [
                        {
                            id: 1,
                            name:
                                "Informática"
                        }
                    ]
                });


            render(
                <MemoryRouter>
                    <ListingCreate
                        listingType="OFFER"
                    />
                </MemoryRouter>
            );


            await screen.findByText(
                "Informática"
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Categoría:/i
                ),
                {
                    target: {
                        value: "1"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Horas estimadas:/i
                ),
                {
                    target: {
                        value: "2"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Descripción:/i
                ),
                {
                    target: {
                        value:
                            "Descripción de prueba"
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Publicar oferta"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "El campo no puede estar vacío"
                )
            ).toBeInTheDocument();


            expect(
                global.fetch
            ).toHaveBeenCalledTimes(
                1
            );
        }
    );


    test(
        "shouldSendCorrectOfferData",
        async () => {

            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    json: async () => [
                        {
                            id: 1,
                            name:
                                "Informática"
                        }
                    ]
                })

                .mockResolvedValueOnce({
                    ok: false,

                    json: async () => ({
                        message:
                            "Error de prueba"
                    })
                });


            render(
                <MemoryRouter>
                    <ListingCreate
                        listingType="OFFER"
                    />
                </MemoryRouter>
            );


            await screen.findByText(
                "Informática"
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Título:/i
                ),
                {
                    target: {
                        value:
                            "  Clases de Java  "
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Categoría:/i
                ),
                {
                    target: {
                        value: "1"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Horas estimadas:/i
                ),
                {
                    target: {
                        value: "2"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Descripción:/i
                ),
                {
                    target: {
                        value:
                            "  Introducción a Java  "
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Publicar oferta"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "Error de prueba"
                )
            ).toBeInTheDocument();


            const [
                url,
                options
            ] =
                global.fetch
                    .mock
                    .calls[1];


            expect(
                url
            ).toBe(
                "/api/listings"
            );


            expect(
                options.method
            ).toBe("POST");


            expect(
                JSON.parse(
                    options.body
                )
            ).toEqual({
                title:
                    "Clases de Java",

                description:
                    "Introducción a Java",

                categoryId:
                    1,

                listingType:
                    "OFFER",

                estimatedHours:
                    2
            });
        }
    );
});