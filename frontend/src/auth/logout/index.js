import React from "react";

import {
    Link
} from "react-router-dom";

import tokenService
    from "../../services/token.service";

import "../../static/css/auth/authPage.css";


const Logout = () => {


    function sendLogoutRequest() {

        const jwt =
            tokenService
                .getLocalAccessToken();

        if (jwt) {

            tokenService.removeUser();

            window.location.href =
                "/login";

        } else {

            alert(
                "No hay ningún usuario con sesión iniciada"
            );
        }
    }


    return (

        <div className="auth-page-container">

            <div className="auth-card logout-card">

                <div className="auth-header">

                    <h1>
                        Cerrar sesión
                    </h1>

                    <p>
                        ¿Seguro que quieres cerrar sesión?
                        <br />
                        Tendrás que volver a identificarte
                        para acceder a tu cuenta.
                    </p>

                </div>


                <div className="logout-options">

                    <Link
                        to="/listings"
                        className={
                            "logout-button logout-cancel-button"
                        }
                    >
                        No
                    </Link>


                    <button
                        type="button"
                        className={
                            "logout-button logout-confirm-button"
                        }
                        onClick={
                            sendLogoutRequest
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