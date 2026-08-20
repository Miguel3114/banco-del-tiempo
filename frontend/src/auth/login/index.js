import React, {
    useRef,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import FormGenerator
    from "../../components/formGenerator/formGenerator";

import tokenService
    from "../../services/token.service";

import "../../static/css/auth/authPage.css";

import {
    loginFormInputs
} from "./form/loginFormInputs";


export default function Login() {

    const [message, setMessage] =
        useState(null);

    const loginFormRef =
        useRef();


    async function handleSubmit({
        values
    }) {

        if (
            !loginFormRef.current
                .validate()
        ) {
            return;
        }

        setMessage(null);

        const request =
            values;


        fetch(
            "/api/auth/login",
            {
                headers: {
                    "Content-Type":
                        "application/json"
                },

                method: "POST",

                body:
                    JSON.stringify(
                        request
                    )
            }
        )

            .then((response) => {

                return response
                    .json()
                    .then((data) => ({
                        status:
                            response.status,
                        data: data
                    }));
            })

            .then(
                ({ status, data }) => {

                    if (status !== 200) {

                        setMessage(
                            data.message ||
                            "Error al iniciar sesión"
                        );

                        return;
                    }

                    tokenService.setUser(
                        data
                    );

                    tokenService
                        .updateLocalAccessToken(
                            data.token
                        );

                    window.location.href =
                        "/listings";
                }
            )

            .catch(() => {

                setMessage(
                    "No se ha podido conectar con el servidor"
                );
            });
    }


    return (

        <div className="auth-page-container">

            <div className="auth-card">

                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                <div className="auth-header">

                    <h1>
                        Iniciar sesión
                    </h1>

                    <p>
                        Accede a tu cuenta para
                        seguir compartiendo tu tiempo
                        <br />
                        con la comunidad.
                    </p>

                </div>


                <FormGenerator
                    ref={
                        loginFormRef
                    }
                    inputs={
                        loginFormInputs
                    }
                    onSubmit={
                        handleSubmit
                    }
                    numberOfColumns={1}
                    buttonText="Entrar"
                    buttonClassName={
                        "auth-submit-button"
                    }
                />


                <p className="auth-register-link">

                    ¿Todavía no tienes cuenta?{" "}

                    <Link to="/register">
                        Regístrate
                    </Link>

                </p>

            </div>

        </div>
    );
}