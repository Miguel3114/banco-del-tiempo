import React, {
    useEffect,
    useMemo,
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
    from "../components/formGenerator/formGenerator";

import tokenService
    from "../services/token.service";

import {
    getListingCreateForm
} from "./form/listingCreateForm";

import "../static/css/listing/listingForm.css";



export default function ListingCreate({
    listingType
}) {

    const [categories, setCategories] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(false);


    const listingFormRef =
        useRef();


    const jwt =
        tokenService.getLocalAccessToken();


    const isOffer =
        listingType === "OFFER";


    const formInputs =
        useMemo(
            () =>
                getListingCreateForm(
                    categories
                ),
            [categories]
        );


    useEffect(() => {

        fetch(
            "/api/categories/active",
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
                        "No se han podido cargar las categorías"
                    );
                }


                return data;
            })

            .then((data) => {

                setCategories(data);
            })

            .catch((error) => {

                setMessage(
                    error.message
                );
            });

    }, [jwt]);


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
        setLoading(true);


        const request = {

            title:
                values.title.trim(),

            description:
                values.description.trim(),

            categoryId:
                Number(
                    values.categoryId
                ),

            listingType:
                listingType,

            estimatedHours:
                Number(
                    values.estimatedHours
                )
        };


        try {

            const response =
                await fetch(
                    "/api/listings",
                    {
                        method: "POST",

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
                    "No se ha podido publicar el anuncio"
                );
            }


            window.location.href =
                isOffer
                    ? "/listings"
                    : "/requests";


        } catch (error) {

            setMessage(
                error.message
            );

            setLoading(false);
        }
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
                                ? "Crear nueva oferta"
                                : "Crear nueva demanda"
                        }

                    </h1>


                    <p>

                        {
                            isOffer
                                ? "Publica un servicio que quieras ofrecer a otros miembros de la comunidad."
                                : "Publica un servicio en el que necesites la ayuda de otro miembro de la comunidad."
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
                        loading
                            ? "Publicando..."
                            : isOffer
                                ? "Publicar oferta"
                                : "Publicar demanda"
                    }
                    buttonClassName={
                        "listing-submit-button"
                    }
                />


                <Link
                    to={
                        isOffer
                            ? "/listings"
                            : "/requests"
                    }
                    className="listing-form-cancel"
                >
                    Cancelar
                </Link>

            </div>

        </div>
    );
}