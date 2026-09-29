import tokenService from "./token.service";


describe("tokenService", () => {

    afterEach(() => {
        localStorage.clear();
    });

    test("shouldStoreAndReadAccessToken", () => {
        expect(tokenService.getLocalAccessToken()).toBeNull();

        tokenService.updateLocalAccessToken("token-1");

        expect(tokenService.getLocalAccessToken()).toBe("token-1");
    });

    test("shouldStoreReadAndRemoveUserSession", () => {
        const user = {
            id: 1,
            firstName: "Miguel"
        };

        tokenService.setUser(user);
        tokenService.updateLocalAccessToken("token-1");

        expect(tokenService.getUser()).toEqual(user);

        tokenService.removeUser();

        expect(tokenService.getUser()).toBeNull();
        expect(tokenService.getLocalAccessToken()).toBeNull();
    });
});
