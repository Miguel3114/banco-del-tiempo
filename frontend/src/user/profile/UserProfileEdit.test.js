import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import ProfileEdit
    from "./ProfileEdit";


describe("ProfileEdit", () => {

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
        "shouldSendUpdatedProfileData",
        async () => {

            const user = {
                id: 1,
                firstName: "Miguel",
                lastName: "García",
                email: "miguel@example.com",
                biography: "Biografía anterior",
                profileImageUrl: null,
                skills: [
                    {
                        id: 1,
                        name: "Java"
                    }
                ]
            };


            const skills = [
                {
                    id: 1,
                    name: "Java"
                },
                {
                    id: 2,
                    name: "Inglés"
                }
            ];


            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            user
                        )
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            skills
                        )
                })

                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,

                    text: async () =>
                        JSON.stringify({
                            message:
                                "Error de prueba"
                        })
                });


            render(
                <MemoryRouter>
                    <ProfileEdit />
                </MemoryRouter>
            );


            expect(
                await screen.findByDisplayValue(
                    "Miguel"
                )
            ).toBeInTheDocument();


            expect(
                screen.getByRole(
                    "button",
                    {
                        name: /Java/i
                    }
                )
            ).toBeInTheDocument();


            fireEvent.change(
                screen.getByLabelText(
                    /Nombre:/i
                ),
                {
                    target: {
                        value:
                            "  Miguel Nuevo  "
                    }
                }
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Biografía:/i
                ),
                {
                    target: {
                        value:
                            "  Nueva biografía  "
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name: /Inglés/i
                    }
                )
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Guardar cambios"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "Error de prueba"
                )
            ).toBeInTheDocument();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledTimes(
                    3
                );
            });


            const [
                url,
                options
            ] =
                global.fetch
                    .mock
                    .calls[2];


            expect(
                url
            ).toBe(
                "/api/users/me"
            );


            expect(
                options.method
            ).toBe("PUT");


            expect(
                JSON.parse(
                    options.body
                )
            ).toEqual({
                firstName:
                    "Miguel Nuevo",

                lastName:
                    "García",

                email:
                    "miguel@example.com",

                biography:
                    "Nueva biografía",

                skillIds:
                    [1, 2],

                password:
                    null
            });
        }
    );
});

describe("ProfileEdit additional coverage", () => {

    const user = {
        id: 1,
        firstName: "Miguel",
        lastName: "García",
        email: "miguel@example.com",
        biography: "Biografía",
        profileImageUrl: "/uploads/old.jpg",
        skills: [{ id: 1, name: "Java" }]
    };

    const skills = [
        { id: 1, name: "Java" },
        { id: 2, name: "Inglés" }
    ];

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
        global.URL.createObjectURL = jest.fn(() => "blob:new-image");
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    function response(data, ok = true, status = 200) {
        return {
            ok,
            status,
            text: async () => data === null
                ? ""
                : JSON.stringify(data)
        };
    }

    function mockInitialData(customUser = user) {
        global.fetch
            .mockResolvedValueOnce(response(customUser))
            .mockResolvedValueOnce(response(skills));
    }

    test("shouldShowProfileLoadError", async () => {
        global.fetch
            .mockResolvedValueOnce(response(
                { message: "Perfil no disponible" },
                false,
                500
            ))
            .mockResolvedValueOnce(response(skills));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Perfil no disponible")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Volver al perfil")
        ).toBeInTheDocument();
    });

    test("shouldShowSkillsLoadError", async () => {
        global.fetch
            .mockResolvedValueOnce(response(user))
            .mockResolvedValueOnce(response(
                { message: "Habilidades no disponibles" },
                false,
                500
            ));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Habilidades no disponibles")
        ).toBeInTheDocument();
    });

    test("shouldRejectInvalidProfileImage", async () => {
        mockInitialData();

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");

        const file = new File(["text"], "file.txt", {
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

    test("shouldRejectOversizedProfileImage", async () => {
        mockInitialData();

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");

        const file = new File(["x"], "foto.png", {
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

    test("shouldUploadNewProfileImageAfterUpdatingProfile", async () => {
        mockInitialData({
            ...user,
            profileImageUrl: null
        });

        global.fetch
            .mockResolvedValueOnce(response(user))
            .mockResolvedValueOnce(response({
                profileImageUrl: "/uploads/new.png"
            }));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");

        const file = new File(["image"], "new.png", {
            type: "image/png"
        });

        fireEvent.change(
            document.getElementById("profileImage"),
            { target: { files: [file] } }
        );

        expect(screen.getByAltText("Foto de perfil")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Guardar cambios" })
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(4);
        });

        expect(global.fetch.mock.calls[2][0]).toBe("/api/users/me");
        expect(global.fetch.mock.calls[3][0]).toBe(
            "/api/users/me/profile-image"
        );
        expect(global.fetch.mock.calls[3][1].method).toBe("POST");
    });

    test("shouldDeleteExistingProfileImageAfterUpdatingProfile", async () => {
        mockInitialData();
        global.fetch
            .mockResolvedValueOnce(response(user))
            .mockResolvedValueOnce(response(null));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");
        fireEvent.click(
            screen.getByRole("button", { name: "Eliminar foto" })
        );

        expect(screen.getByText("Sin foto de perfil")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Guardar cambios" })
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(4);
        });

        expect(global.fetch.mock.calls[3][1].method).toBe("DELETE");
    });

    test("shouldShowDuplicateEmailError", async () => {
        mockInitialData({
            ...user,
            profileImageUrl: null
        });
        global.fetch.mockResolvedValueOnce(response(
            { message: "El correo electrónico ya está registrado" },
            false,
            409
        ));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");

        fireEvent.change(
            screen.getByLabelText(/Correo electrónico:/i),
            { target: { value: "otro@example.com" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Guardar cambios" })
        );

        expect(
            await screen.findByText(
                "El correo electrónico ya está registrado"
            )
        ).toBeInTheDocument();
    });

    test("shouldRemoveSessionWhenEmailChanges", async () => {
        mockInitialData({
            ...user,
            profileImageUrl: null
        });
        global.fetch.mockResolvedValueOnce(response({
            ...user,
            email: "otro@example.com"
        }));

        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        await screen.findByDisplayValue("Miguel");

        fireEvent.change(
            screen.getByLabelText(/Correo electrónico:/i),
            { target: { value: "otro@example.com" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Guardar cambios" })
        );

        await waitFor(() => {
            expect(localStorage.getItem("jwt")).toBeNull();
        });
    });
});


describe("ProfileEdit skill coverage", () => {

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    id: 1,
                    firstName: "Miguel",
                    lastName: "García",
                    email: "miguel@example.com",
                    biography: "Bio",
                    profileImageUrl: null,
                    skills: [{ id: 1, name: "Java" }]
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify([
                    { id: 1, name: "Java" },
                    { id: 2, name: "Inglés" }
                ])
            });
        global.URL.createObjectURL = jest.fn();
        global.URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    test("shouldUnselectExistingSkill", async () => {
        render(
            <MemoryRouter>
                <ProfileEdit />
            </MemoryRouter>
        );

        const java = await screen.findByRole("button", {
            name: /Java/i
        });

        expect(java).toHaveClass("profile-edit-skill-selected");
        fireEvent.click(java);
        expect(java).not.toHaveClass("profile-edit-skill-selected");
    });
});
