import React, {
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import tokenService
    from "../services/token.service";

import deleteFromList
    from "../util/deleteFromList";

import useFetchState
    from "../util/useFetchState";

import "../static/css/listing/myListings.css";


export default function MyListings() {

    const [message, setMessage] =
        useState(null);

    const jwt =
        tokenService.getLocalAccessToken();

    const [listings, setListings] =
        useFetchState(
            [],
            "/api/listings/mine",
            jwt,
            setMessage
        );


    function getDetailsRoute(listing) {

        return listing.listingType === "OFFER"
            ? `/listings/${listing.id}`
            : `/requests/${listing.id}`;
    }


    function getEditRoute(listing) {

        return listing.listingType === "OFFER"
            ? `/listings/${listing.id}/edit`
            : `/requests/${listing.id}/edit`;
    }


    function getListingType(listingType) {

        return listingType === "OFFER"
            ? "Oferta"
            : "Demanda";
    }


    function handleDelete(listingId) {

        setMessage(null);

        deleteFromList(
            `/api/listings/${listingId}`,
            listingId,
            [
                listings,
                setListings
            ],
            setMessage
        );
    }


    return (

        <div className="my-listings-page">

            <div className="my-listings-container">


                <div className="my-listings-header">

                    <div>

                        <h1>
                            Mis anuncios
                        </h1>

                        <p>
                            Consulta y gestiona las ofertas
                            y demandas que has publicado.
                        </p>

                    </div>

                </div>


                {message ? (

                    <Alert color="danger">

                        {message}

                    </Alert>

                ) : null}


                {
                    listings.length === 0
                        ? (

                            <div className="my-listings-empty">

                                <h2>
                                    No tienes anuncios activos
                                </h2>

                                <p>
                                    Cuando publiques una oferta
                                    o una demanda aparecerá aquí.
                                </p>

                                <div className="my-listings-empty-actions">

                                    <Link
                                        to="/listings/new"
                                        className="my-listings-create-button"
                                    >
                                        Crear oferta
                                    </Link>

                                    <Link
                                        to="/requests/new"
                                        className="my-listings-create-secondary-button"
                                    >
                                        Crear demanda
                                    </Link>

                                </div>

                            </div>

                        )
                        : (

                            <div className="my-listings-grid">

                                {
                                    listings.map(
                                        (listing) => (

                                            <article
                                                key={
                                                    listing.id
                                                }
                                                className="my-listing-card"
                                            >

                                                <div className="my-listing-card-header">

                                                    <div className="my-listing-tags">

                                                        <span className="my-listing-category">

                                                            {
                                                                listing
                                                                    .category
                                                                    .name
                                                            }

                                                        </span>

                                                        <span className="my-listing-type">

                                                            {
                                                                getListingType(
                                                                    listing.listingType
                                                                )
                                                            }

                                                        </span>

                                                    </div>

                                                    <span className="my-listing-hours">

                                                        {
                                                            listing
                                                                .estimatedHours
                                                        }

                                                        {
                                                            listing
                                                                .estimatedHours === 1
                                                                ? " hora"
                                                                : " horas"
                                                        }

                                                    </span>

                                                </div>


                                                <h2 className="my-listing-title">

                                                    {
                                                        listing.title
                                                    }

                                                </h2>


                                                <p className="my-listing-description">

                                                    {
                                                        listing.description
                                                    }

                                                </p>


                                                <div className="my-listing-actions">

                                                    <Link
                                                        to={
                                                            getDetailsRoute(
                                                                listing
                                                            )
                                                        }
                                                        className="my-listing-details-button"
                                                    >
                                                        Ver detalles
                                                    </Link>


                                                    <Link
                                                        to={
                                                            getEditRoute(
                                                                listing
                                                            )
                                                        }
                                                        className="my-listing-edit-button"
                                                    >
                                                        Editar
                                                    </Link>


                                                    <button
                                                        type="button"
                                                        className="my-listing-delete-button"
                                                        onClick={
                                                            () =>
                                                                handleDelete(
                                                                    listing.id
                                                                )
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </article>
                                        )
                                    )
                                }

                            </div>
                        )
                }

            </div>

        </div>
    );
}