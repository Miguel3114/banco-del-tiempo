import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import Register from "./index";


describe("Register", () => {

    beforeEach(() => {

        global.fetch =
            jest.fn();

        global.URL.createObjectURL =
            jest.fn();

        global.URL.revokeObjectURL =
            jest.fn();
    });


    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });


    test(
        "shouldShowEmailErrorWhenEmailAlreadyExists",
        async () => {

            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,

                    text: async () =>
                        JSON.stringify([
                            {
                                id: 1,
                                name: "Java"
                            }
                        ])
                })

                .mockResolvedValueOnce({
                    ok: false,
                    status: 409,

                    text: async () =>
                        JSON.stringify({
                            message:
                                "El correo electrónico ya está registrado"
                        })
                });


            render(
                <MemoryRouter>
                    <Register />
                </MemoryRouter>
            );


            expect(
                await screen.findByText(
                    "Java"
                )
            ).toBeInTheDocument();


            fireEvent.change(
                screen.getByLabelText(
                    /Nombre:/i
                ),
                {
                    target: {
                        value:
                            "  Miguel  "
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Apellidos:/i
                ),
                {
                    target: {
                        value:
                            "  García  "
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Correo electrónico:/i
                ),
                {
                    target: {
                        value:
                            "  MIGUEL@EXAMPLE.COM  "
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Contraseña:/i
                ),
                {
                    target: {
                        value:
                            "password123"
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name: "Registrarse"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "El correo electrónico ya está registrado"
                )
            ).toBeInTheDocument();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledTimes(
                    2
                );
            });


            const request =
                JSON.parse(
                    global.fetch
                        .mock
                        .calls[1][1]
                        .body
                );


            expect(
                request.firstName
            ).toBe("Miguel");

            expect(
                request.lastName
            ).toBe("García");

            expect(
                request.email
            ).toBe(
                "miguel@example.com"
            );
        }
    );
});