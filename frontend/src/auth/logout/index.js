import React from "react";

import { Link } from "react-router-dom";

import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";

import tokenService
    from "../../services/token.service";

const Logout = () => {

    function sendLogoutRequest() {

        const jwt =
            tokenService.getLocalAccessToken();

        if (jwt) {

            tokenService.removeUser();

            window.location.href = "/login";

        } else {

            alert(
                "No hay ningún usuario con sesión iniciada"
            );
        }
    }

    return (
        <div className="auth-page-container">

            <div className="auth-form-container">

                <h2 className="text-center">
                    ¿Seguro que quieres cerrar sesión?
                </h2>

                <div className="options-row">

                    <Link
                        className="auth-button"
                        to="/listings"
                        style={{
                            textDecoration: "none"
                        }}
                    >
                        No
                    </Link>

                    <button
                        className="auth-button"
                        onClick={
                            () =>
                                sendLogoutRequest()
                        }
                    >
                        Sí
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Logout;