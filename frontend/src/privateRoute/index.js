import React, {
    useEffect,
    useState
} from "react";

import Login from "../auth/login";

import tokenService
    from "../services/token.service";


const PrivateRoute = ({
    children
}) => {

    const jwt =
        tokenService.getLocalAccessToken();

    const [isLoading, setIsLoading] =
        useState(true);

    const [isValid, setIsValid] =
        useState(false);


    useEffect(() => {

        let active =
            true;

        let intervalId;


        async function validateSession() {

            const currentJwt =
                tokenService.getLocalAccessToken();

            if (!currentJwt) {

                if (active) {
                    setIsValid(false);
                    setIsLoading(false);
                }

                return;
            }


            try {

                const response =
                    await fetch(
                        `/api/auth/validate?token=${encodeURIComponent(currentJwt)}`,
                        {
                            method: "GET",

                            headers: {
                                Accept:
                                    "application/json",

                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );

                const valid =
                    response.ok
                        ? await response.json()
                        : false;


                if (!active) {
                    return;
                }


                if (!valid) {

                    tokenService.removeUser();

                    window.location.href =
                        "/login";

                    return;
                }


                setIsValid(true);
                setIsLoading(false);

            } catch {

                if (!active) {
                    return;
                }

                setIsValid(false);
                setIsLoading(false);
            }
        }


        validateSession();


        intervalId =
            setInterval(
                validateSession,
                10000
            );


        return () => {

            active =
                false;

            clearInterval(
                intervalId
            );
        };

    }, [jwt]);


    if (!jwt) {
        return <Login />;
    }


    if (isLoading) {
        return <div>Cargando...</div>;
    }


    return isValid
        ? children
        : <Login />;
};


export default PrivateRoute;