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

describe("Register additional coverage", () => {

    beforeEach(() => {
        global.fetch = jest.fn();
        global.URL.createObjectURL = jest.fn(() => "blob:preview");
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    function skillsResponse() {
        return {
            ok: true,
            status: 200,
            text: async () => JSON.stringify([
                { id: 1, name: "Java" },
                { id: 2, name: "Inglés" }
            ])
        };
    }

    function fillValidForm() {
        fireEvent.change(
            screen.getByLabelText(/Nombre:/i),
            { target: { value: "Miguel" } }
        );
        fireEvent.change(
            screen.getByLabelText(/Apellidos:/i),
            { target: { value: "García" } }
        );
        fireEvent.change(
            screen.getByLabelText(/Correo electrónico:/i),
            { target: { value: "miguel@example.com" } }
        );
        fireEvent.change(
            screen.getByLabelText(/Contraseña:/i),
            { target: { value: "password123" } }
        );
        fireEvent.change(
            screen.getByLabelText(/Biografía:/i),
            { target: { value: "Mi biografía" } }
        );
    }

    test("shouldSelectAndUnselectSkill", async () => {
        global.fetch.mockResolvedValue(skillsResponse());

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        const javaButton = await screen.findByRole(
            "button",
            { name: /Java/i }
        );

        fireEvent.click(javaButton);
        expect(javaButton).toHaveClass("skill-card-selected");
        expect(screen.getByText("✓")).toBeInTheDocument();

        fireEvent.click(javaButton);
        expect(javaButton).not.toHaveClass("skill-card-selected");
    });

    test("shouldRejectInvalidImageType", async () => {
        global.fetch.mockResolvedValue(skillsResponse());

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText("Java");

        const file = new File(["text"], "foto.txt", {
            type: "text/plain"
        });

        fireEvent.change(
            document.getElementById("profileImage"),
            { target: { files: [file] } }
        );

        expect(
            screen.getByText("La foto debe estar en formato JPG o PNG")
        ).toBeInTheDocument();
    });

    test("shouldRejectImageLargerThanFiveMb", async () => {
        global.fetch.mockResolvedValue(skillsResponse());

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText("Java");

        const file = new File(["a"], "foto.png", {
            type: "image/png"
        });

        Object.defineProperty(file, "size", {
            value: 5 * 1024 * 1024 + 1
        });

        fireEvent.change(
            document.getElementById("profileImage"),
            { target: { files: [file] } }
        );

        expect(
            screen.getByText("La foto no puede superar los 5 MB")
        ).toBeInTheDocument();
    });

    test("shouldRegisterUserWithoutProfileImage", async () => {
        global.fetch
            .mockResolvedValueOnce(skillsResponse())
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: async () => JSON.stringify({
                    id: 1,
                    token: "register-token",
                    roles: ["MEMBER"]
                })
            });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText("Java");
        fillValidForm();
        fireEvent.click(screen.getByRole("button", { name: "Java" }));
        fireEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        const request = JSON.parse(global.fetch.mock.calls[1][1].body);
        expect(request.skillIds).toEqual([1]);
        expect(request.biography).toBe("Mi biografía");
        expect(JSON.parse(localStorage.getItem("jwt"))).toBe("register-token");
    });

    test("shouldUploadProfileImageAfterRegistration", async () => {
        global.fetch
            .mockResolvedValueOnce(skillsResponse())
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: async () => JSON.stringify({
                    id: 1,
                    token: "register-token",
                    roles: ["MEMBER"]
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                text: async () => JSON.stringify({
                    profileImageUrl: "/uploads/foto.png"
                })
            });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText("Java");
        fillValidForm();

        const file = new File(["image"], "foto.png", {
            type: "image/png"
        });

        fireEvent.change(
            document.getElementById("profileImage"),
            { target: { files: [file] } }
        );

        expect(screen.getByAltText("Foto de perfil")).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });

        expect(global.fetch.mock.calls[2][0]).toBe(
            "/api/users/me/profile-image"
        );
        expect(global.fetch.mock.calls[2][1].method).toBe("POST");
    });

    test("shouldShowImageUploadErrorAfterRegistration", async () => {
        global.fetch
            .mockResolvedValueOnce(skillsResponse())
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                text: async () => JSON.stringify({
                    id: 1,
                    token: "register-token"
                })
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => JSON.stringify({
                    message: "Error de imagen"
                })
            });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText("Java");
        fillValidForm();

        const file = new File(["image"], "foto.jpg", {
            type: "image/jpeg"
        });

        fireEvent.change(
            document.getElementById("profileImage"),
            { target: { files: [file] } }
        );
        fireEvent.click(screen.getByRole("button", { name: "Registrarse" }));

        expect(
            await screen.findByText(
                /La cuenta se ha creado correctamente.*Error de imagen/i
            )
        ).toBeInTheDocument();
    });

    test("shouldShowSkillsLoadError", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            text: async () => "Error al cargar habilidades"
        });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Error al cargar habilidades")
        ).toBeInTheDocument();
    });
});


describe("Register server error coverage", () => {

    beforeEach(() => {
        global.fetch = jest.fn();
        global.URL.createObjectURL = jest.fn();
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    test("shouldShowGenericRegisterError", async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify([])
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                text: async () => ""
            });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        await screen.findByText(/Habilidades que dominas/i);

        fireEvent.change(screen.getByLabelText(/Nombre:/i), {
            target: { value: "Miguel" }
        });
        fireEvent.change(screen.getByLabelText(/Apellidos:/i), {
            target: { value: "García" }
        });
        fireEvent.change(screen.getByLabelText(/Correo electrónico:/i), {
            target: { value: "miguel@example.com" }
        });
        fireEvent.change(screen.getByLabelText(/Contraseña:/i), {
            target: { value: "password123" }
        });

        fireEvent.click(
            screen.getByRole("button", { name: "Registrarse" })
        );

        expect(
            await screen.findByText("Error al registrarse")
        ).toBeInTheDocument();
    });
});
