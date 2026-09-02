import React, {
    useEffect,
    useState
} from "react";

import {
    Alert,
    Spinner
} from "reactstrap";

import {
    useParams
} from "react-router-dom";

import tokenService
    from "../../services/token.service";

import "../../static/css/user/profile.css";


export default function PublicProfile() {

    const { id } =
        useParams();

    const [user, setUser] =
        useState(null);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        setLoading(true);
        setMessage(null);

        fetch(
            `/api/users/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )
            .then(async (response) => {

                const text =
                    await response.text();

                let data;

                try {
                    data =
                        text
                            ? JSON.parse(text)
                            : null;
                } catch {
                    data = text;
                }


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        data ||
                        "No se ha podido cargar el perfil"
                    );
                }


                return data;
            })
            .then((data) => {

                setUser(data);
            })
            .catch((error) => {

                setMessage(
                    error.message
                );
            })
            .finally(() => {

                setLoading(false);
            });

    }, [id, jwt]);


    function getInitials() {

        if (!user) {
            return "";
        }

        const firstInitial =
            user.firstName
                ? user.firstName
                    .charAt(0)
                    .toUpperCase()
                : "";

        const lastInitial =
            user.lastName
                ? user.lastName
                    .charAt(0)
                    .toUpperCase()
                : "";

        return firstInitial +
            lastInitial;
    }


    function getRating() {

        if (
            user.averageRating === null ||
            user.averageRating === undefined
        ) {
            return "Sin valoraciones";
        }

        return Number(
            user.averageRating
        ).toFixed(1);
    }


    function getBalance() {

        const balance =
            user.hourBalance ?? 0;

        if (balance > 0) {
            return `+${balance}`;
        }

        return balance;
    }


    if (loading) {

        return (

            <div className="profile-page">

                <div className="profile-loading">

                    <Spinner />

                </div>

            </div>
        );
    }


    if (!user) {

        return (

            <div className="profile-page">

                <div className="profile-container">

                    <Alert color="danger">

                        {
                            message ||
                            "No se ha podido cargar el perfil"
                        }

                    </Alert>

                </div>

            </div>
        );
    }


    return (

        <div className="profile-page">

            <div className="profile-container">


                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                <section className="profile-main-card">

                    {
                        user.profileImageUrl
                            ? (

                                <img
                                    src={
                                        user.profileImageUrl
                                    }
                                    alt={
                                        `${user.firstName} ${user.lastName}`
                                    }
                                    className="profile-avatar"
                                />

                            )
                            : (

                                <div className="profile-avatar-placeholder">

                                    {
                                        getInitials()
                                    }

                                </div>
                            )
                    }


                    <h1 className="profile-name">

                        {
                            user.firstName
                        }

                        {" "}

                        {
                            user.lastName
                        }

                    </h1>


                    <div className="profile-rating">

                        <span className="profile-stars">
                            ★★★★★
                        </span>

                        <span className="profile-rating-value">

                            {
                                getRating()
                            }

                        </span>

                    </div>


                    <div className="profile-balance">

                        <span className="profile-balance-label">
                            SALDO
                        </span>

                        <span className="profile-balance-value">

                            {
                                getBalance()
                            }

                            {" "}

                            {
                                Math.abs(
                                    user.hourBalance ?? 0
                                ) === 1
                                    ? "Hora"
                                    : "Horas"
                            }

                        </span>

                    </div>


                    <p className="profile-biography">

                        {
                            user.biography
                                ? user.biography
                                : "Este usuario todavía no ha añadido una descripción personal."
                        }

                    </p>


                    <div className="profile-skills">

                        {
                            user.skills &&
                            user.skills.length > 0
                                ? (

                                    user.skills.map(
                                        (skill) => (

                                            <span
                                                key={skill.id}
                                                className="profile-skill"
                                            >
                                                {
                                                    skill.name
                                                }
                                            </span>
                                        )
                                    )

                                )
                                : (

                                    <span className="profile-no-skills">

                                        No hay habilidades seleccionadas

                                    </span>
                                )
                        }

                    </div>

                </section>


                <section className="profile-reviews">

                    <h2 className="profile-reviews-title">
                        Valoraciones de la Comunidad
                    </h2>


                    <div className="profile-reviews-empty">

                        <span className="profile-reviews-empty-star">
                            ★
                        </span>

                        <h3>
                            Todavía no tiene valoraciones
                        </h3>

                        <p>
                            Las valoraciones que reciba después
                            de completar intercambios aparecerán aquí.
                        </p>

                    </div>

                </section>

            </div>

        </div>
    );
}