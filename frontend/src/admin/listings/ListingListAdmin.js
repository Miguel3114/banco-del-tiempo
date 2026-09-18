import React, {
    useEffect,
    useState
} from "react";

import {
    Alert,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";

import tokenService
    from "../../services/token.service";

import "../../static/css/admin/adminListings.css";


export default function ListingListAdmin() {

    const [listings, setListings] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        selectedListing,
        setSelectedListing
    ] = useState(null);

    const [
        deleteModalOpen,
        setDeleteModalOpen
    ] = useState(false);

    const [deleting, setDeleting] =
        useState(false);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        let ignore = false;


        async function loadListings() {

            try {

                const response =
                    await fetch(
                        "/api/admin/listings",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    );

                const data =
                    await getResponseData(
                        response
                    );


                if (!response.ok) {

                    throw new Error(
                        getErrorMessage(
                            data,
                            "No se han podido cargar los anuncios"
                        )
                    );
                }


                if (!ignore) {

                    setListings(
                        data || []
                    );
                }

            } catch (error) {

                if (!ignore) {

                    setMessage(
                        error.message
                    );
                }

            } finally {

                if (!ignore) {

                    setLoading(false);
                }
            }
        }


        loadListings();


        return () => {

            ignore = true;
        };

    }, [jwt]);


    function openDeleteModal(
        listing
    ) {

        setSelectedListing(
            listing
        );

        setMessage(null);

        setDeleteModalOpen(
            true
        );
    }


    function closeDeleteModal() {

        if (deleting) {
            return;
        }

        setDeleteModalOpen(
            false
        );

        setSelectedListing(
            null
        );
    }


    async function deleteListing() {

        if (!selectedListing) {
            return;
        }


        setDeleting(true);
        setMessage(null);


        try {

            const response =
                await fetch(
                    `/api/admin/listings/${selectedListing.id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${jwt}`
                        }
                    }
                );


            if (!response.ok) {

                const data =
                    await getResponseData(
                        response
                    );

                throw new Error(
                    getErrorMessage(
                        data,
                        "No se ha podido eliminar el anuncio"
                    )
                );
            }


            setListings(
                (currentListings) =>
                    currentListings.filter(
                        (listing) =>
                            listing.id !==
                            selectedListing.id
                    )
            );

            setDeleteModalOpen(
                false
            );

            setSelectedListing(
                null
            );

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setDeleting(false);
        }
    }


    return (

        <div className="admin-listings-page">

            <header className="admin-listings-header">

                <div>

                    <h1>
                        Moderación de Anuncios
                    </h1>

                    <p>

                        {
                            loading
                                ? "Cargando anuncios..."
                                : (
                                    <>
                                        {listings.length}{" "}

                                        {
                                            listings.length === 1
                                                ? "anuncio activo"
                                                : "anuncios activos"
                                        }
                                    </>
                                )
                        }

                    </p>

                </div>


                <div className="admin-listing-admin-avatar">
                    A
                </div>

            </header>


            <div className="admin-listings-content">

                {message ? (

                    <Alert color="danger">

                        {message}

                    </Alert>

                ) : null}


                {
                    loading
                        ? (

                            <div className="admin-listings-state">
                                Cargando anuncios...
                            </div>

                        )
                        : listings.length === 0
                            ? (

                                <div className="admin-listings-state">
                                    No hay anuncios activos.
                                </div>

                            )
                            : (

                                <div className="admin-listings-table-wrapper">

                                    <table className="admin-listings-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Título
                                                </th>

                                                <th>
                                                    Categoría
                                                </th>

                                                <th>
                                                    Tipo
                                                </th>

                                                <th>
                                                    Autor
                                                </th>

                                                <th>
                                                    Acciones
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                listings.map(
                                                    (listing) => (

                                                        <tr
                                                            key={
                                                                listing.id
                                                            }
                                                        >

                                                            <td className="admin-listing-id">

                                                                #
                                                                {
                                                                    listing.id
                                                                }

                                                            </td>


                                                            <td className="admin-listing-title">

                                                                {
                                                                    listing.title
                                                                }

                                                            </td>


                                                            <td>

                                                                <span className="admin-listing-category">

                                                                    {
                                                                        listing.categoryName
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <span
                                                                    className={
                                                                        listing.listingType === "OFFER"
                                                                            ? "admin-listing-type admin-listing-type-offer"
                                                                            : "admin-listing-type admin-listing-type-request"
                                                                    }
                                                                >

                                                                    {
                                                                        listing.listingType === "OFFER"
                                                                            ? "Oferta"
                                                                            : "Demanda"
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td className="admin-listing-author">

                                                                {
                                                                    listing.authorName
                                                                }

                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="admin-listing-delete-button"
                                                                    onClick={
                                                                        () =>
                                                                            openDeleteModal(
                                                                                listing
                                                                            )
                                                                    }
                                                                >
                                                                    Eliminar
                                                                </button>

                                                            </td>

                                                        </tr>
                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>
                            )
                }

            </div>


            <Modal
                isOpen={
                    deleteModalOpen
                }
                toggle={
                    closeDeleteModal
                }
                centered
                className="admin-listing-delete-modal"
            >

                <ModalHeader
                    toggle={
                        closeDeleteModal
                    }
                >
                    Eliminar anuncio
                </ModalHeader>


                <ModalBody>

                    <p className="admin-listing-delete-text">
                        ¿Seguro que deseas eliminar este anuncio?
                    </p>


                    {selectedListing ? (

                        <div className="admin-listing-delete-info">

                            <strong>
                                {
                                    selectedListing.title
                                }
                            </strong>

                            <span>

                                {
                                    selectedListing.authorName
                                }

                                {" · "}

                                {
                                    selectedListing.categoryName
                                }

                            </span>

                        </div>

                    ) : null}

                </ModalBody>


                <ModalFooter>

                    <button
                        type="button"
                        className="admin-listing-cancel-button"
                        disabled={
                            deleting
                        }
                        onClick={
                            closeDeleteModal
                        }
                    >
                        Cancelar
                    </button>


                    <button
                        type="button"
                        className="admin-listing-confirm-delete-button"
                        disabled={
                            deleting
                        }
                        onClick={
                            deleteListing
                        }
                    >

                        {
                            deleting
                                ? "Eliminando..."
                                : "Eliminar"
                        }

                    </button>

                </ModalFooter>

            </Modal>

        </div>
    );
}


function getErrorMessage(
    data,
    defaultMessage
) {

    if (
        data &&
        typeof data === "object" &&
        data.message
    ) {

        return data.message;
    }


    if (
        typeof data === "string" &&
        data.trim()
    ) {

        return data;
    }


    return defaultMessage;
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