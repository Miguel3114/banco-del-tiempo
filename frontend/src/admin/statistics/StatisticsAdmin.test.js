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