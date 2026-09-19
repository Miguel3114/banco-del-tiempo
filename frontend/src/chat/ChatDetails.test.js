import {
    fireEvent,
    render,
    screen,
    waitFor
} from "@testing-library/react";

import {
    MemoryRouter
} from "react-router-dom";

import ChatDetails
    from "./ChatDetails";


describe("ChatDetails", () => {

    beforeEach(() => {

        localStorage.setItem(
            "jwt",
            JSON.stringify(
                "test-token"
            )
        );

        global.fetch =
            jest.fn();


        Object.defineProperty(
            window.HTMLElement.prototype,
            "scrollIntoView",
            {
                configurable: true,
                value: jest.fn()
            }
        );
    });


    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });


    test(
        "shouldSendMessage",
        async () => {

            const chat = {
                id: 5,
                listingId: 10,
                listingTitle:
                    "Clases de Java",
                listingType:
                    "OFFER",

                otherUserId: 2,
                otherUserFirstName:
                    "Bruno",
                otherUserLastName:
                    "López",
                otherUserProfileImageUrl:
                    null,

                openedAt:
                    "2026-09-19T10:00:00"
            };


            const messages = [
                {
                    id: 1,
                    content: "Hola",
                    mine: false,
                    system: false,
                    sentAt:
                        "2026-09-19T10:01:00"
                }
            ];


            const exchange = {
                id: 7,
                hours: 2,
                status:
                    "PENDING",
                currentUserProvider:
                    true
            };


            const newMessage = {
                id: 2,
                content:
                    "¿Seguimos mañana?",
                mine: true,
                system: false,
                sentAt:
                    "2026-09-19T10:05:00"
            };


            global.fetch
                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            chat
                        )
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            messages
                        )
                })

                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,

                    text: async () =>
                        JSON.stringify(
                            exchange
                        )
                })

                .mockResolvedValueOnce({
                    ok: true,

                    text: async () =>
                        JSON.stringify(
                            newMessage
                        )
                });


            render(
                <MemoryRouter>
                    <ChatDetails
                        chatId={5}
                        embedded={true}
                    />
                </MemoryRouter>
            );


            expect(
                await screen.findByText(
                    "Hola"
                )
            ).toBeInTheDocument();


            expect(
                screen.getByText(
                    "Bruno López"
                )
            ).toBeInTheDocument();


            fireEvent.change(
                screen.getByPlaceholderText(
                    "Escribe un mensaje..."
                ),
                {
                    target: {
                        value:
                            "  ¿Seguimos mañana?  "
                    }
                }
            );


            fireEvent.click(
                screen.getByRole(
                    "button",
                    {
                        name: "Enviar"
                    }
                )
            );


            expect(
                await screen.findByText(
                    "¿Seguimos mañana?"
                )
            ).toBeInTheDocument();


            await waitFor(() => {

                expect(
                    global.fetch
                ).toHaveBeenCalledTimes(
                    4
                );
            });


            const [
                url,
                options
            ] =
                global.fetch
                    .mock
                    .calls[3];


            expect(
                url
            ).toBe(
                "/api/chats/5/messages"
            );


            expect(
                options.method
            ).toBe("POST");


            expect(
                JSON.parse(
                    options.body
                )
            ).toEqual({
                content:
                    "¿Seguimos mañana?"
            });


            expect(
                screen.getByPlaceholderText(
                    "Escribe un mensaje..."
                )
            ).toHaveValue("");
        }
    );
});