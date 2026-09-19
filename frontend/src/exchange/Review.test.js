import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import Exchanges
    from "./Exchanges";


describe("Review", () => {

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
        "shouldCreateReview",
        async () => {

            const historyExchange = {
                id: 7,
                chatId: 5,

                listingId: 10,
                listingTitle:
                    "Clases de Java",

                listingType:
                    "OFFER",

                hours: 2,

                status:
                    "ACCEPTED",

                registeredAt:
                    "2026-09-19T10:00:00",

                currentUserProvider:
                    true,

                providerId: 1,
                providerFirstName:
                    "Miguel",
                providerLastName:
                    "García",
                providerProfileImageUrl:
                    null,

                receiverId: 2,
                receiverFirstName:
                    "Bruno",
                receiverLastName:
                    "López",
                receiverProfileImageUrl:
                    null,

                reviewed:
                    false
            };


            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify([])
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify([
                            historyExchange
                        ])
                })

                .mockResolvedValueOnce({
                    ok: true,
                    status: 201,

                    text: async () =>
                        JSON.stringify({
                            id: 3
                        })
                });


            render(
                <MemoryRouter>
                    <Exchanges />
                </MemoryRouter>
            );


            fireEvent.click(
                await screen.findByRole(
                    "button",
                    {
                        name:
                            "Historial"
                    }
                )
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
                        name: "Valorar"
                    }
                )
            );


            expect(
                await screen.findByText(
                    /Valorar a Bruno/i
                )
            ).toBeInTheDocument();


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "5 estrellas"
                    }
                )
            );


            fireEvent.change(
                screen.getByLabelText(
                    /Comentario/i
                ),
                {
                    target: {
                        value:
                            "  Muy buen intercambio  "
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name:
                            "Publicar valoración"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "✓ Valorado"
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
                "/api/reviews/exchanges/7"
            );


            expect(
                options.method
            ).toBe("POST");


            expect(
                JSON.parse(
                    options.body
                )
            ).toEqual({
                rating: 5,
                comment:
                    "Muy buen intercambio"
            });
        }
    );
});