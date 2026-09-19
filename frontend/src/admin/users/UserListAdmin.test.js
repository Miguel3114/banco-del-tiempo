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