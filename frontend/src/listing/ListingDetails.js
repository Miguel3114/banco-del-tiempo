import React, {
    useEffect,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link,
    useParams
} from "react-router-dom";

import tokenService
    from "../services/token.service";

import "../static/css/listing/listingDetails.css";


export default function ListingDetails() {

    const { id } =
        useParams();

    const [listing, setListing] =
        useState(null);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        loadListing();

    }, [id]);


    function loadListing() {

        setLoading(true);
        setMessage(null);


        fetch(
            `/api/listings/${id}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )

            .then(async (response) => {

                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "No se ha podido cargar el anuncio"
                    );
                }


                return data;
            })

            .then((data) => {

                setListing(data);
            })

            .catch((error) => {

                setMessage(
                    error.message
                );
            })

            .finally(() => {

                setLoading(false);
            });
    }


    function formatDate(date) {

        if (!date) {
            return "";
        }


        return new Date(date)
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

            <div className="listing-details-page">

                <div className="listing-details-message">
                    Cargando anuncio...
                </div>

            </div>
        );
    }


    if (message) {

        return (

            <div className="listing-details-page">

                <div className="listing-details-container">

                    <Alert color="danger">
                        {message}
                    </Alert>

                    <Link
                        to="/listings"
                        className="listing-details-back-link"
                    >
                        Volver a los anuncios
                    </Link>

                </div>

            </div>
        );
    }


    if (!listing) {

        return null;
    }


    const isOffer =
        listing.listingType === "OFFER";


    const backRoute =
        isOffer
            ? "/listings"
            : "/requests";


    const authorInitial =
        listing.author?.firstName
            ? listing.author.firstName
                .charAt(0)
                .toUpperCase()
            : "?";


    return (

        <div className="listing-details-page">

            <div className="listing-details-container">


                <Link
                    to={backRoute}
                    className="listing-details-back-link"
                >
                    ← Volver a {
                        isOffer
                            ? "ofertas"
                            : "demandas"
                    }
                </Link>


                <div className="listing-details-card">


                    <div className="listing-details-top">


                        <div className="listing-details-main">


                            <div className="listing-details-tags">

                                <span className="listing-details-category">

                                    {
                                        listing
                                            .category
                                            .name
                                    }

                                </span>


                                <span className="listing-details-type">

                                    {
                                        isOffer
                                            ? "Oferta"
                                            : "Demanda"
                                    }

                                </span>

                            </div>


                            <h1>
                                {listing.title}
                            </h1>


                            <div className="listing-details-meta">

                                <span>

                                    {
                                        listing
                                            .estimatedHours
                                    }

                                    {
                                        listing
                                            .estimatedHours === 1
                                            ? " hora estimada"
                                            : " horas estimadas"
                                    }

                                </span>


                                <span className="listing-details-separator">
                                    ·
                                </span>


                                <span>

                                    Publicado el{" "}

                                    {
                                        formatDate(
                                            listing
                                                .publishedAt
                                        )
                                    }

                                </span>

                            </div>

                        </div>


                    </div>


                    <div className="listing-details-section">

                        <h2>
                            Descripción
                        </h2>

                        <p className="listing-details-description">
                            {listing.description}
                        </p>

                    </div>


                    <div className="listing-details-author-section">

                        <div className="listing-details-author">


                            {
                                listing.author
                                    .profileImageUrl
                                    ? (

                                        <img
                                            src={
                                                listing
                                                    .author
                                                    .profileImageUrl
                                            }
                                            alt={
                                                listing
                                                    .author
                                                    .firstName
                                            }
                                            className="listing-details-avatar-image"
                                        />

                                    )
                                    : (

                                        <div className="listing-details-avatar">

                                            {
                                                authorInitial
                                            }

                                        </div>
                                    )
                            }


                            <div>

                                <span className="listing-details-author-label">
                                    Publicado por
                                </span>


                                <p className="listing-details-author-name">

                                    {
                                        listing
                                            .author
                                            .firstName
                                    }

                                    {" "}

                                    {
                                        listing
                                            .author
                                            .lastName
                                    }

                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="listing-details-contact-button"
                            disabled
                            title="Disponible cuando implementemos el chat"
                        >
                            Contactar
                        </button>

                    </div>


                </div>

            </div>

        </div>
    );
}