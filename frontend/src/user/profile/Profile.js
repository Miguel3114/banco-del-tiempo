import React, {
    useEffect,
    useState
} from "react";

import {
    Alert,
    Spinner
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import tokenService
    from "../../services/token.service";

import "../../static/css/user/profile.css";


export default function Profile() {

    const [user, setUser] =
        useState(null);

    const [reviews, setReviews] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        async function loadData() {

            setLoading(true);
            setMessage(null);

            try {

                const userResponse =
                    await fetch(
                        "/api/users/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    );

                const userData =
                    await getResponseData(
                        userResponse
                    );

                if (!userResponse.ok) {

                    throw new Error(
                        userData?.message ||
                        userData ||
                        "No se ha podido cargar el perfil"
                    );
                }

                const reviewsResponse =
                    await fetch(
                        `/api/reviews/users/${userData.id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    );

                const reviewsData =
                    await getResponseData(
                        reviewsResponse
                    );

                if (!reviewsResponse.ok) {

                    throw new Error(
                        reviewsData?.message ||
                        reviewsData ||
                        "No se han podido cargar las valoraciones"
                    );
                }

                setUser(
                    userData
                );

                setReviews(
                    reviewsData || []
                );

            } catch (error) {

                setMessage(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }

        loadData();

    }, [jwt]);


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


    function getReviewAuthorInitials(
        review
    ) {

        const firstInitial =
            review.authorFirstName
                ? review.authorFirstName
                    .charAt(0)
                    .toUpperCase()
                : "";

        const lastInitial =
            review.authorLastName
                ? review.authorLastName
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


    function getAverageStars() {

        if (
            user.averageRating === null ||
            user.averageRating === undefined
        ) {
            return "☆☆☆☆☆";
        }

        const rating =
            Math.round(
                Number(
                    user.averageRating
                )
            );

        return "★".repeat(
            rating
        ) +
            "☆".repeat(
                5 - rating
            );
    }


    function getReviewStars(
        rating
    ) {

        return "★".repeat(
            rating
        ) +
            "☆".repeat(
                5 - rating
            );
    }


    function getBalance() {

        const balance =
            user.hourBalance ?? 0;

        if (balance > 0) {
            return `+${balance}`;
        }

        return balance;
    }


    function formatDate(
        date
    ) {

        if (!date) {
            return "";
        }

        return new Date(
            date
        )
            .toLocaleDateString(
                "es-ES",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );
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

                {
                    message
                        ? (

                            <Alert color="danger">
                                {message}
                            </Alert>

                        )
                        : null
                }

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

                            {
                                getAverageStars()
                            }

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
                                : "Todavía no has añadido una descripción personal."
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
                                                key={
                                                    skill.id
                                                }
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

                    <Link
                        to="/profile/edit"
                        className="profile-edit-button"
                    >
                        Editar Perfil
                    </Link>

                </section>

                <section className="profile-reviews">

                    <div className="profile-reviews-header">

                        <h2 className="profile-reviews-title">
                            Valoraciones de la Comunidad
                        </h2>

                        {
                            reviews.length > 0
                                ? (

                                    <span className="profile-reviews-count">

                                        {
                                            reviews.length
                                        }

                                        {" "}

                                        {
                                            reviews.length === 1
                                                ? "valoración"
                                                : "valoraciones"
                                        }

                                    </span>

                                )
                                : null
                        }

                    </div>

                    {
                        reviews.length === 0
                            ? (

                                <div className="profile-reviews-empty">

                                    <span className="profile-reviews-empty-star">
                                        ★
                                    </span>

                                    <h3>
                                        Todavía no tienes valoraciones
                                    </h3>

                                    <p>
                                        Las valoraciones que recibas después
                                        de completar intercambios aparecerán aquí.
                                    </p>

                                </div>

                            )
                            : (

                                <div className="profile-reviews-list">

                                    {
                                        reviews.map(
                                            (review) => (

                                                <article
                                                    key={
                                                        review.id
                                                    }
                                                    className="profile-review-card"
                                                >

                                                    <div className="profile-review-header">

                                                        <Link
                                                            to={
                                                                `/users/${review.authorId}`
                                                            }
                                                            className="profile-review-author"
                                                        >

                                                            {
                                                                review.authorProfileImageUrl
                                                                    ? (

                                                                        <img
                                                                            src={
                                                                                review.authorProfileImageUrl
                                                                            }
                                                                            alt={
                                                                                `${review.authorFirstName} ${review.authorLastName}`
                                                                            }
                                                                            className="profile-review-avatar"
                                                                        />

                                                                    )
                                                                    : (

                                                                        <div className="profile-review-avatar-placeholder">

                                                                            {
                                                                                getReviewAuthorInitials(
                                                                                    review
                                                                                )
                                                                            }

                                                                        </div>
                                                                    )
                                                            }

                                                            <div className="profile-review-author-info">

                                                                <strong>

                                                                    {
                                                                        review.authorFirstName
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        review.authorLastName
                                                                    }

                                                                </strong>

                                                                <span>

                                                                    {
                                                                        formatDate(
                                                                            review.publishedAt
                                                                        )
                                                                    }

                                                                </span>

                                                            </div>

                                                        </Link>

                                                        <div className="profile-review-rating">

                                                            <span className="profile-review-stars">

                                                                {
                                                                    getReviewStars(
                                                                        review.rating
                                                                    )
                                                                }

                                                            </span>

                                                            <strong>
                                                                {
                                                                    review.rating
                                                                }
                                                                /5
                                                            </strong>

                                                        </div>

                                                    </div>

                                                    {
                                                        review.comment
                                                            ? (

                                                                <p className="profile-review-comment">

                                                                    {
                                                                        review.comment
                                                                    }

                                                                </p>

                                                            )
                                                            : (

                                                                <p className="profile-review-no-comment">
                                                                    Sin comentario
                                                                </p>
                                                            )
                                                    }

                                                </article>
                                            )
                                        )
                                    }

                                </div>
                            )
                    }

                </section>

            </div>

        </div>
    );
}


async function getResponseData(
    response
) {

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {

        return JSON.parse(
            text
        );

    } catch {

        return text;
    }
}