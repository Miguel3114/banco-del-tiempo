import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import UserListAdmin
    from "./UserListAdmin";


describe("UserListAdmin", () => {

    beforeEach(() => {

        localStorage.setItem(
            "jwt",
            JSON.stringify(
                "admin-token"
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
        "shouldBlockActiveUser",
        async () => {

            const activeUser = {
                id: 2,
                firstName: "Ana",
                lastName: "García",
                email:
                    "ana@example.com",
                hourBalance: 3,
                accountStatus:
                    "ACTIVE"
            };


            const blockedUser = {
                ...activeUser,
                accountStatus:
                    "BLOCKED"
            };


            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify([
                            activeUser
                        ])
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            blockedUser
                        )
                });


            render(
                <UserListAdmin />
            );


            expect(
                await screen.findByText(
                    "Ana García"
                )
            ).toBeInTheDocument();


            const checkbox =
                screen.getByRole(
                    "checkbox"
                );


            expect(
                checkbox
            ).toBeChecked();


            fireEvent.click(
                checkbox
            );


            expect(
                await screen.findByText(
                    "Bloqueado"
                )
            ).toBeInTheDocument();


            expect(
                checkbox
            ).not.toBeChecked();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledTimes(
                    2
                );
            });


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
                "/api/admin/users/2/status"
            );


            expect(
                options.method
            ).toBe("PUT");


            expect(
                JSON.parse(
                    options.body
                )
            ).toEqual({
                status: "BLOCKED"
            });
        }
    );
});

describe("UserListAdmin additional coverage", () => {

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("admin-token"));
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    test("shouldUnblockBlockedUser", async () => {
        const blockedUser = {
            id: 3,
            firstName: "Luis",
            lastName: "Pérez",
            email: "luis@example.com",
            hourBalance: null,
            accountStatus: "BLOCKED"
        };

        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify([blockedUser])
            })
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify({
                    ...blockedUser,
                    accountStatus: "ACTIVE"
                })
            });

        render(<UserListAdmin />);

        expect(
            await screen.findByText("Luis Pérez")
        ).toBeInTheDocument();

        const checkbox = screen.getByRole("checkbox");
        expect(checkbox).not.toBeChecked();

        fireEvent.click(checkbox);

        expect(
            await screen.findByText("Activo")
        ).toBeInTheDocument();

        expect(
            JSON.parse(global.fetch.mock.calls[1][1].body)
        ).toEqual({ status: "ACTIVE" });
    });

    test("shouldShowEmptyState", async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            text: async () => ""
        });

        render(<UserListAdmin />);

        expect(
            await screen.findByText("No hay miembros registrados.")
        ).toBeInTheDocument();
    });

    test("shouldShowLoadError", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            text: async () => "No autorizado"
        });

        render(<UserListAdmin />);

        expect(
            await screen.findByText("No autorizado")
        ).toBeInTheDocument();
    });

    test("shouldShowUpdateStatusError", async () => {
        const user = {
            id: 4,
            firstName: "Eva",
            lastName: "Ruiz",
            email: "eva@example.com",
            hourBalance: 0,
            accountStatus: "ACTIVE"
        };

        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                text: async () => JSON.stringify([user])
            })
            .mockResolvedValueOnce({
                ok: false,
                text: async () => JSON.stringify({
                    message: "No se puede bloquear"
                })
            });

        render(<UserListAdmin />);

        await screen.findByText("Eva Ruiz");
        fireEvent.click(screen.getByRole("checkbox"));

        expect(
            await screen.findByText("No se puede bloquear")
        ).toBeInTheDocument();
    });
});
