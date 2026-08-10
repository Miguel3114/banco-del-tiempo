import React, {
    useEffect,
    useState
} from "react";

import Login from "../auth/login";

import tokenService
    from "../services/token.service";

const PrivateRoute = ({ children }) => {

    const jwt =
        tokenService.getLocalAccessToken();

    const [isLoading, setIsLoading] =
        useState(true);

    const [isValid, setIsValid] =
        useState(false);

    useEffect(() => {

        if (!jwt) {

            setIsLoading(false);
            setIsValid(false);

            return;
        }

        fetch(
            `/api/auth/validate?token=${encodeURIComponent(jwt)}`,
            {
                method: "GET",

                headers: {
                    "Accept":
                        "application/json",

                    "Content-Type":
                        "application/json"
                }
            }
        )
            .then((response) =>
                response.json()
            )

            .then((valid) => {

                setIsValid(valid);
                setIsLoading(false);
            })

            .catch(() => {

                setIsValid(false);
                setIsLoading(false);
            });

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