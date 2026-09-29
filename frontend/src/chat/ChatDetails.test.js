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

describe("ChatDetails additional coverage", () => {

    const chat = {
        id: 5,
        listingId: 10,
        listingTitle: "Clases de Java",
        listingType: "OFFER",
        otherUserId: 2,
        otherUserFirstName: "Bruno",
        otherUserLastName: "López",
        otherUserProfileImageUrl: null,
        openedAt: "2026-09-19T10:00:00"
    };

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
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

    function response(data, ok = true, status = 200) {
        return {
            ok,
            status,
            text: async () => data === null
                ? ""
                : JSON.stringify(data)
        };
    }

    test("shouldShowChatLoadError", async () => {
        global.fetch.mockResolvedValueOnce(response(
            { message: "Chat no disponible" },
            false,
            404
        ));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Chat no disponible")
        ).toBeInTheDocument();
    });

    test("shouldRegisterExchangeWhenCurrentUserIsProvider", async () => {
        const onMessagesRead = jest.fn();

        global.fetch
            .mockResolvedValueOnce(response(chat))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response(null, true, 204))
            .mockResolvedValueOnce(response({ id: 1 }))
            .mockResolvedValueOnce(response({
                id: 10,
                author: { id: 1 }
            }))
            .mockResolvedValueOnce(response({
                id: 9,
                hours: 2,
                status: "PENDING",
                currentUserProvider: true
            }))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <ChatDetails
                    chatId={5}
                    embedded={true}
                    onMessagesRead={onMessagesRead}
                />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Registrar intercambio"
            })
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Registrar" })
        );

        expect(
            screen.getByText("El campo no puede estar vacío")
        ).toBeInTheDocument();

        fireEvent.change(
            screen.getByLabelText("Horas realizadas"),
            { target: { value: "2" } }
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Registrar" })
        );

        expect(
            await screen.findByText("Pendiente")
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(7);
        });

        expect(global.fetch.mock.calls[5][0]).toBe(
            "/api/exchanges/chats/5"
        );
        expect(global.fetch.mock.calls[5][1].method).toBe("POST");
        expect(
            JSON.parse(global.fetch.mock.calls[5][1].body)
        ).toEqual({ hours: 2 });
        expect(onMessagesRead).toHaveBeenCalled();
    });

    test("shouldResendRejectedExchange", async () => {
        global.fetch
            .mockResolvedValueOnce(response(chat))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response({
                id: 7,
                hours: 2,
                status: "REJECTED",
                currentUserProvider: true
            }))
            .mockResolvedValueOnce(response({
                id: 7,
                hours: 3,
                status: "PENDING",
                currentUserProvider: true
            }))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Corregir intercambio"
            })
        );

        expect(
            screen.getByLabelText("Horas realizadas")
        ).toHaveValue(2);

        fireEvent.change(
            screen.getByLabelText("Horas realizadas"),
            { target: { value: "3" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Reenviar" })
        );

        expect(
            await screen.findByText("Pendiente")
        ).toBeInTheDocument();

        expect(global.fetch.mock.calls[3][0]).toBe(
            "/api/exchanges/7/resend"
        );
        expect(global.fetch.mock.calls[3][1].method).toBe("PUT");
    });

    test("shouldArchiveAcceptedChat", async () => {
        global.fetch
            .mockResolvedValueOnce(response(chat))
            .mockResolvedValueOnce(response([
                {
                    id: 4,
                    content: "Intercambio completado",
                    system: true,
                    mine: false,
                    sentAt: "2026-09-19T11:00:00"
                }
            ]))
            .mockResolvedValueOnce(response({
                id: 7,
                hours: 1,
                status: "ACCEPTED",
                currentUserProvider: true
            }))
            .mockResolvedValueOnce(response({ archived: true }));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Completado")
        ).toBeInTheDocument();
        expect(
            screen.getByText("1 hora")
        ).toBeInTheDocument();
        expect(
            screen.getByText("Intercambio completado")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Archivar chat" })
        );

        expect(
            await screen.findByText("Archivar conversación")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Archivar" })
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(4);
        });

        expect(global.fetch.mock.calls[3][0]).toBe(
            "/api/chats/5/archive"
        );
        expect(global.fetch.mock.calls[3][1].method).toBe("PUT");
    });
});


describe("ChatDetails error branches", () => {

    const chat = {
        id: 5,
        listingId: 10,
        listingTitle: "Clases de Java",
        listingType: "OFFER",
        otherUserId: 2,
        otherUserFirstName: "Bruno",
        otherUserLastName: "López",
        otherUserProfileImageUrl: null,
        openedAt: "2026-09-19T10:00:00"
    };

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
        Object.defineProperty(
            window.HTMLElement.prototype,
            "scrollIntoView",
            { configurable: true, value: jest.fn() }
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    const response = (data, ok = true, status = 200) => ({
        ok,
        status,
        text: async () => data === null ? "" : JSON.stringify(data)
    });

    function mockProviderWithoutExchange(extraResponse) {
        global.fetch
            .mockResolvedValueOnce(response(chat))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response(null, true, 204))
            .mockResolvedValueOnce(response({ id: 1 }))
            .mockResolvedValueOnce(response({
                id: 10,
                author: { id: 1 }
            }));

        if (extraResponse) {
            global.fetch.mockResolvedValueOnce(extraResponse);
        }
    }

    test("shouldRejectNonIntegerExchangeHours", async () => {
        mockProviderWithoutExchange();

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Registrar intercambio"
            })
        );
        fireEvent.change(
            screen.getByLabelText("Horas realizadas"),
            { target: { value: "1.5" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Registrar" })
        );

        expect(
            screen.getByText("Debe ser un número entero mayor que 0")
        ).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledTimes(5);
    });

    test("shouldShowExchangeValidationErrorFromServer", async () => {
        mockProviderWithoutExchange(response(
            { message: "Horas no válidas" },
            false,
            400
        ));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Registrar intercambio"
            })
        );
        fireEvent.change(
            screen.getByLabelText("Horas realizadas"),
            { target: { value: "2" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Registrar" })
        );

        expect(
            await screen.findByText("Horas no válidas")
        ).toBeInTheDocument();
    });

    test("shouldShowSendMessageError", async () => {
        global.fetch
            .mockResolvedValueOnce(response(chat))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response({
                id: 7,
                hours: 2,
                status: "PENDING",
                currentUserProvider: true
            }))
            .mockResolvedValueOnce(response(
                { message: "No se pudo enviar" },
                false,
                500
            ));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        const input = await screen.findByPlaceholderText(
            "Escribe un mensaje..."
        );
        fireEvent.change(input, {
            target: { value: "Mensaje" }
        });
        fireEvent.keyDown(input, {
            key: "Enter",
            shiftKey: false
        });

        expect(
            await screen.findByText("No se pudo enviar")
        ).toBeInTheDocument();
    });
});


describe("ChatDetails role coverage", () => {

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
        Object.defineProperty(
            window.HTMLElement.prototype,
            "scrollIntoView",
            { configurable: true, value: jest.fn() }
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    test("shouldResolveProviderRoleForRequestListing", async () => {
        const response = (data, status = 200) => ({
            ok: true,
            status,
            text: async () => data === null ? "" : JSON.stringify(data)
        });

        global.fetch
            .mockResolvedValueOnce(response({
                id: 5,
                listingId: 10,
                listingTitle: "Necesito ayuda",
                listingType: "REQUEST",
                otherUserId: 2,
                otherUserFirstName: "Bruno",
                otherUserLastName: "López",
                otherUserProfileImageUrl: null,
                openedAt: null
            }))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response(null, 204))
            .mockResolvedValueOnce(response({ id: 1 }))
            .mockResolvedValueOnce(response({
                id: 10,
                author: { id: 1 }
            }));

        render(
            <MemoryRouter>
                <ChatDetails chatId={5} embedded={true} />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Todavía no hay mensajes.")
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", {
                name: "Registrar intercambio"
            })
        ).not.toBeInTheDocument();
    });
});
