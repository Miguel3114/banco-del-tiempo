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