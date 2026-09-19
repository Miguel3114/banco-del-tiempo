import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import Exchanges from "./Exchanges";


describe("Exchanges", () => {

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
        "shouldNotRejectExchangeWithEmptyReason",
        async () => {

            const pendingExchange = {
                id: 1,
                chatId: 2,

                listingId: 3,
                listingTitle:
                    "Clases de Java",

                listingType:
                    "OFFER",

                hours: 2,

                status:
                    "PENDING",

                registeredAt:
                    "2026-09-19T10:00:00",

                providerId: 1,
                providerFirstName:
                    "Ana",

                providerLastName:
                    "García",

                providerProfileImageUrl:
                    null
            };


            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify([
                            pendingExchange
                        ])
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify([])
                });


            render(
                <MemoryRouter>
                    <Exchanges />
                </MemoryRouter>
            );


            expect(
                await screen.findByText(
                    "Clases de Java"
                )
            ).toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name: "Rechazar"
                    }
                )
            );


            expect(
                screen.getByLabelText(
                    "Motivo del rechazo"
                )
            ).toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Confirmar rechazo"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "El motivo del rechazo no puede estar vacío"
                )
            ).toBeInTheDocument();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledTimes(
                    2
                );
            });
        }
    );
});