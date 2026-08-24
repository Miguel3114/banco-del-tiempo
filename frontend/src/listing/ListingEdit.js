import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Alert,
    Spinner
} from "reactstrap";

import {
    Link,
    useParams
} from "react-router-dom";

import FormGenerator
    from "../components/formGenerator/formGenerator";

import tokenService
    from "../services/token.service";

import {
    getListingEditForm
} from "./form/listingEditForm";

import "../static/css/listing/listingForm.css";


export default function ListingEdit() {

    const { id } =
        useParams();

    const [listing, setListing] =
        useState(null);

    const [categories, setCategories] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const listingFormRef =
        useRef();

    const jwt =
        tokenService.getLocalAccessToken();

    const isOffer =
        listing?.listingType === "OFFER";


    const formInputs =
        useMemo(
            () =>
                listing
                    ? getListingEditForm(
                        listing,
                        categories
                    )
                    : [],
            [
                listing,
                categories
            ]
        );


    useEffect(() => {

        async function loadData() {

            try {

                const [
                    listingResponse,
                    categoriesResponse
                ] = await Promise.all([

                    fetch(
                        `/api/listings/${id}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    ),

                    fetch(
                        "/api/categories/active",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    )
                ]);


                const listingData =
                    await listingResponse.json();

                const categoriesData =
                    await categoriesResponse.json();


                if (!listingResponse.ok) {

                    throw new Error(
                        listingData.message ||
                        "No se ha podido cargar el anuncio"
                    );
                }


                if (!categoriesResponse.ok) {

                    throw new Error(
                        categoriesData.message ||
                        "No se han podido cargar las categorías"
                    );
                }


                setListing(
                    listingData
                );

                setCategories(
                    categoriesData
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

    }, [id, jwt]);


    async function handleSubmit({
        values
    }) {

        if (
            !listingFormRef.current
                .validate()
        ) {
            return;
        }


        setMessage(null);
        setSaving(true);


        const request = {

            title:
                values.title.trim(),

            description:
                values.description.trim(),

            categoryId:
                Number(
                    values.categoryId
                ),

            estimatedHours:
                Number(
                    values.estimatedHours
                )
        };


        try {

            const response =
                await fetch(
                    `/api/listings/${id}`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${jwt}`
                        },

                        body:
                            JSON.stringify(
                                request
                            )
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "No se ha podido modificar el anuncio"
                );
            }


            window.location.href =
                "/mylistings";


        } catch (error) {

            setMessage(
                error.message
            );

            setSaving(false);
        }
    }


    if (loading) {

        return (

            <div className="listing-form-page">

                <div className="listing-form-card">

                    <div className="text-center">

                        <Spinner />

                    </div>

                </div>

            </div>
        );
    }


    if (!listing) {

        return (

            <div className="listing-form-page">

                <div className="listing-form-card">

                    <Alert color="danger">

                        {
                            message ||
                            "No se ha podido cargar el anuncio"
                        }

                    </Alert>


                    <Link
                        to="/mylistings"
                        className="listing-form-cancel"
                    >
                        Volver a mis anuncios
                    </Link>

                </div>

            </div>
        );
    }


    return (

        <div className="listing-form-page">

            <div className="listing-form-card">


                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                <div className="listing-form-header">

                    <h1>

                        {
                            isOffer
                                ? "Editar oferta"
                                : "Editar demanda"
                        }

                    </h1>


                    <p>

                        {
                            isOffer
                                ? "Modifica los datos de la oferta que has publicado."
                                : "Modifica los datos de la demanda que has publicado."
                        }

                    </p>

                </div>


                <FormGenerator
                    ref={
                        listingFormRef
                    }
                    inputs={
                        formInputs
                    }
                    onSubmit={
                        handleSubmit
                    }
                    numberOfColumns={1}
                    buttonText={
                        saving
                            ? "Guardando..."
                            : "Guardar cambios"
                    }
                    buttonClassName={
                        "listing-submit-button"
                    }
                />


                <Link
                    to="/mylistings"
                    className="listing-form-cancel"
                >
                    Cancelar
                </Link>

            </div>

        </div>
    );
}