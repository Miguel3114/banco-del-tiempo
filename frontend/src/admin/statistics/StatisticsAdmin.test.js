import {
    render,
    screen
} from "@testing-library/react";

import StatisticsAdmin
    from "./StatisticsAdmin";


describe("StatisticsAdmin", () => {

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
        "shouldDisplayStatistics",
        async () => {

            global.fetch
                .mockResolvedValue({
                    ok: true,

                    text: async () =>
                        JSON.stringify({
                            totalUsers: 10,
                            activeListings: 7,
                            totalHours: 25
                        })
                });


            render(
                <StatisticsAdmin />
            );


            expect(
                await screen.findByText(
                    "10"
                )
            ).toBeInTheDocument();


            expect(
                screen.getByText(
                    "7"
                )
            ).toBeInTheDocument();


            expect(
                screen.getByText(
                    "25"
                )
            ).toBeInTheDocument();


            expect(
                global.fetch
            ).toHaveBeenCalledWith(
                "/api/admin/statistics",
                {
                    headers: {
                        Authorization:
                            "Bearer admin-token"
                    }
                }
            );
        }
    );
});

describe("StatisticsAdmin additional coverage", () => {

    beforeEach(() => {
        localStorage.setItem("jwt", JSON.stringify("admin-token"));
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
        localStorage.clear();
    });

    test("shouldShowApiErrorMessage", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            text: async () => JSON.stringify({
                message: "No autorizado"
            })
        });

        render(<StatisticsAdmin />);

        expect(
            await screen.findByText("No autorizado")
        ).toBeInTheDocument();
    });

    test("shouldShowPlainTextError", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            text: async () => "Error del servidor"
        });

        render(<StatisticsAdmin />);

        expect(
            await screen.findByText("Error del servidor")
        ).toBeInTheDocument();
    });

    test("shouldShowDefaultErrorWhenResponseIsEmpty", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            text: async () => ""
        });

        render(<StatisticsAdmin />);

        expect(
            await screen.findByText(
                "No se han podido cargar las estadísticas"
            )
        ).toBeInTheDocument();
    });
});
