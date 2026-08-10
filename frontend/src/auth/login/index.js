import React, {
    useRef,
    useState
} from "react";

import { Alert } from "reactstrap";

import FormGenerator
    from "../../components/formGenerator/formGenerator";

import tokenService
    from "../../services/token.service";

import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";

import {
    loginFormInputs
} from "./form/loginFormInputs";

export default function Login() {

    const [message, setMessage] =
        useState(null);

    const loginFormRef = useRef();

    async function handleSubmit({ values }) {

        if (!loginFormRef.current.validate()) {
            return;
        }

        setMessage(null);

        const request = values;

        fetch("/api/auth/login", {

            headers: {
                "Content-Type": "application/json"
            },

            method: "POST",

            body: JSON.stringify(request)

        })
            .then((res) =>
                res.json().then((data) => ({
                    status: res.status,
                    data
                }))
            )

            .then(({ status, data }) => {

                if (status !== 200) {

                    setMessage(
                        data.message ||
                        "Error al iniciar sesión"
                    );

                    return;
                }

                tokenService.setUser(data);

                tokenService.updateLocalAccessToken(
                    data.token
                );

                window.location.href = "/listings";
            })

            .catch(() => {

                setMessage(
                    "No se ha podido conectar con el servidor"
                );
            });
    }

    return (
        <div className="auth-page-container">

            {message ? (
                <Alert color="danger">
                    {message}
                </Alert>
            ) : (
                <></>
            )}

            <h1>Iniciar sesión</h1>

            <div className="auth-form-container">

                <FormGenerator
                    ref={loginFormRef}
                    inputs={loginFormInputs}
                    onSubmit={handleSubmit}
                    buttonText="Entrar"
                    buttonClassName="auth-button"
                />

            </div>

        </div>
    );
}