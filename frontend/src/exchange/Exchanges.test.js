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

describe("Exchanges additional coverage", () => {

    const pendingExchange = {
        id: 1,
        chatId: 2,
        listingId: 3,
        listingTitle: "Clases de Java",
        listingType: "REQUEST",
        hours: 1,
        status: "PENDING",
        registeredAt: "2026-09-19T10:00:00",
        providerId: 1,
        providerFirstName: "Ana",
        providerLastName: "García",
        providerProfileImageUrl: null
    };

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
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

    test("shouldAcceptExchange", async () => {
        global.fetch
            .mockResolvedValueOnce(response([pendingExchange]))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response({
                ...pendingExchange,
                status: "ACCEPTED"
            }))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Confirmar horas"
            })
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(5);
        });

        expect(global.fetch.mock.calls[2][0]).toBe(
            "/api/exchanges/1/accept"
        );
        expect(global.fetch.mock.calls[2][1].method).toBe("PUT");
    });

    test("shouldRejectExchangeWithReason", async () => {
        global.fetch
            .mockResolvedValueOnce(response([pendingExchange]))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response({
                ...pendingExchange,
                status: "REJECTED"
            }))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", { name: "Rechazar" })
        );
        fireEvent.change(
            screen.getByLabelText("Motivo del rechazo"),
            { target: { value: "  Horas incorrectas  " } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Confirmar rechazo" })
        );

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(5);
        });

        expect(global.fetch.mock.calls[2][0]).toBe(
            "/api/exchanges/1/reject"
        );
        expect(
            JSON.parse(global.fetch.mock.calls[2][1].body)
        ).toEqual({ reason: "Horas incorrectas" });
    });

    test("shouldShowRejectValidationFromServer", async () => {
        global.fetch
            .mockResolvedValueOnce(response([pendingExchange]))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response(
                { message: "Motivo demasiado corto" },
                false,
                400
            ));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", { name: "Rechazar" })
        );
        fireEvent.change(
            screen.getByLabelText("Motivo del rechazo"),
            { target: { value: "No" } }
        );
        fireEvent.click(
            screen.getByRole("button", { name: "Confirmar rechazo" })
        );

        expect(
            await screen.findByText("Motivo demasiado corto")
        ).toBeInTheDocument();
    });

    test("shouldShowLoadError", async () => {
        global.fetch
            .mockResolvedValueOnce(response(
                { message: "Error pendientes" },
                false,
                500
            ))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("Error pendientes")
        ).toBeInTheDocument();
    });

    test("shouldShowEmptyPendingAndHistoryStates", async () => {
        global.fetch
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        expect(
            await screen.findByText("No tienes intercambios pendientes")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Historial" })
        );

        expect(
            screen.getByText("Todavía no hay intercambios completados")
        ).toBeInTheDocument();
    });
});


describe("Exchanges action errors", () => {

    const exchange = {
        id: 1,
        chatId: 2,
        listingId: 3,
        listingTitle: "Clases de Java",
        listingType: "OFFER",
        hours: 2,
        status: "PENDING",
        registeredAt: "2026-09-19T10:00:00",
        providerId: 1,
        providerFirstName: "Ana",
        providerLastName: "García",
        providerProfileImageUrl: null
    };

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("test-token"));
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    const response = (data, ok = true, status = 200) => ({
        ok,
        status,
        text: async () => JSON.stringify(data)
    });

    test("shouldShowAcceptError", async () => {
        global.fetch
            .mockResolvedValueOnce(response([exchange]))
            .mockResolvedValueOnce(response([]))
            .mockResolvedValueOnce(response(
                { message: "No se puede aceptar" },
                false,
                409
            ));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", {
                name: "Confirmar horas"
            })
        );

        expect(
            await screen.findByText("No se puede aceptar")
        ).toBeInTheDocument();
    });

    test("shouldCancelRejectForm", async () => {
        global.fetch
            .mockResolvedValueOnce(response([exchange]))
            .mockResolvedValueOnce(response([]));

        render(
            <MemoryRouter>
                <Exchanges />
            </MemoryRouter>
        );

        fireEvent.click(
            await screen.findByRole("button", { name: "Rechazar" })
        );
        expect(
            screen.getByLabelText("Motivo del rechazo")
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "Cancelar" })
        );

        expect(
            screen.queryByLabelText("Motivo del rechazo")
        ).not.toBeInTheDocument();
    });
});
