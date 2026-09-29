import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import Login from "./index";


describe("Login", () => {

    beforeEach(() => {
        global.fetch =
            jest.fn();
    });


    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });


    test(
        "shouldShowErrorWhenEmailIsInvalid",
        async () => {

            render(
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Correo electrónico/i
                ),
                {
                    target: {
                        value:
                            "correo-invalido"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Contraseña/i
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
                        name: "Entrar"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "Debe ser un email válido"
                )
            ).toBeInTheDocument();


            expect(
                global.fetch
            ).not.toHaveBeenCalled();
        }
    );


    test(
        "shouldShowErrorWhenCredentialsAreIncorrect",
        async () => {

            global.fetch
                .mockResolvedValue({
                    status: 401,

                    json: async () => ({
                        message:
                            "Credenciales incorrectas"
                    })
                });


            render(
                <MemoryRouter>
                    <Login />
                </MemoryRouter>
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Correo electrónico/i
                ),
                {
                    target: {
                        value:
                            "miguel@example.com"
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Contraseña/i
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
                        name: "Entrar"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "Credenciales incorrectas"
                )
            ).toBeInTheDocument();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledWith(
                    "/api/auth/login",
                    expect.objectContaining({
                        method: "POST"
                    })
                );
            });
        }
    );
});

describe("Login additional coverage", () => {

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    function fillLogin() {
        fireEvent.change(
            screen.getByLabelText(/Correo electrónico/i),
            { target: { value: "miguel@example.com" } }
        );

        fireEvent.change(
            screen.getByLabelText(/Contraseña/i),
            { target: { value: "password123" } }
        );
    }

    test("shouldStoreSessionWhenLoginSucceeds", async () => {
        global.fetch.mockResolvedValue({
            status: 200,
            json: async () => ({
                id: 1,
                token: "jwt-token",
                roles: ["MEMBER"]
            })
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fillLogin();
        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        await waitFor(() => {
            expect(
                JSON.parse(localStorage.getItem("jwt"))
            ).toBe("jwt-token");
        });

        expect(
            JSON.parse(localStorage.getItem("user"))
        ).toEqual(expect.objectContaining({ id: 1 }));
    });

    test("shouldShowDefaultLoginError", async () => {
        global.fetch.mockResolvedValue({
            status: 500,
            json: async () => ({})
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fillLogin();
        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        expect(
            await screen.findByText("Error al iniciar sesión")
        ).toBeInTheDocument();
    });

    test("shouldShowConnectionError", async () => {
        global.fetch.mockRejectedValue(new Error("network"));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fillLogin();
        fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

        expect(
            await screen.findByText(
                "No se ha podido conectar con el servidor"
            )
        ).toBeInTheDocument();
    });
});
