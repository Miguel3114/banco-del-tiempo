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

import "../../static/css/admin/adminReviews.css";


export default function ReviewListAdmin() {

    const [reviews, setReviews] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        selectedReview,
        setSelectedReview
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


        async function loadReviews() {

            try {

                const response =
                    await fetch(
                        "/api/admin/reviews",
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
                            "No se han podido cargar las valoraciones"
                        )
                    );
                }


                if (!ignore) {

                    setReviews(
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


        loadReviews();


        return () => {

            ignore = true;
        };

    }, [jwt]);


    function openDeleteModal(
        review
    ) {

        setSelectedReview(
            review
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

        setSelectedReview(
            null
        );
    }


    async function deleteReview() {

        if (!selectedReview) {
            return;
        }


        setDeleting(true);
        setMessage(null);


        try {

            const response =
                await fetch(
                    `/api/admin/reviews/${selectedReview.id}`,
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
                        "No se ha podido eliminar la valoración"
                    )
                );
            }


            setReviews(
                (currentReviews) =>
                    currentReviews.filter(
                        (review) =>
                            review.id !==
                            selectedReview.id
                    )
            );

            setDeleteModalOpen(
                false
            );

            setSelectedReview(
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

        <div className="admin-reviews-page">

            <header className="admin-reviews-header">

                <div>

                    <h1>
                        Moderación de Valoraciones
                    </h1>

                    <p>

                        {
                            loading
                                ? "Cargando valoraciones..."
                                : (
                                    <>
                                        {reviews.length}{" "}

                                        {
                                            reviews.length === 1
                                                ? "valoración"
                                                : "valoraciones"
                                        }
                                    </>
                                )
                        }

                    </p>

                </div>


                <div className="admin-review-admin-avatar">
                    A
                </div>

            </header>


            <div className="admin-reviews-content">

                {message ? (

                    <Alert color="danger">

                        {message}

                    </Alert>

                ) : null}


                {
                    loading
                        ? (

                            <div className="admin-reviews-state">
                                Cargando valoraciones...
                            </div>

                        )
                        : reviews.length === 0
                            ? (

                                <div className="admin-reviews-state">
                                    No hay valoraciones.
                                </div>

                            )
                            : (

                                <div className="admin-reviews-table-wrapper">

                                    <table className="admin-reviews-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Anuncio
                                                </th>

                                                <th>
                                                    Autor
                                                </th>

                                                <th>
                                                    Usuario valorado
                                                </th>

                                                <th>
                                                    Puntuación
                                                </th>

                                                <th>
                                                    Comentario
                                                </th>

                                                <th>
                                                    Acciones
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                reviews.map(
                                                    (review) => (

                                                        <tr
                                                            key={
                                                                review.id
                                                            }
                                                        >

                                                            <td className="admin-review-id">

                                                                #
                                                                {
                                                                    review.id
                                                                }

                                                            </td>


                                                            <td className="admin-review-listing">

                                                                {
                                                                    review.listingTitle
                                                                }

                                                            </td>


                                                            <td className="admin-review-user">

                                                                {
                                                                    review.authorName
                                                                }

                                                            </td>


                                                            <td className="admin-review-user">

                                                                {
                                                                    review.reviewedUserName
                                                                }

                                                            </td>


                                                            <td>

                                                                <span className="admin-review-rating">

                                                                    <span className="admin-review-star">
                                                                        ★
                                                                    </span>

                                                                    {
                                                                        review.rating
                                                                    }

                                                                    /5

                                                                </span>

                                                            </td>


                                                            <td className="admin-review-comment">

                                                                {
                                                                    review.comment
                                                                        ? review.comment
                                                                        : "Sin comentario"
                                                                }

                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="admin-review-delete-button"
                                                                    onClick={
                                                                        () =>
                                                                            openDeleteModal(
                                                                                review
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
                className="admin-review-delete-modal"
            >

                <ModalHeader
                    toggle={
                        closeDeleteModal
                    }
                >
                    Eliminar valoración
                </ModalHeader>


                <ModalBody>

                    <p className="admin-review-delete-text">
                        ¿Seguro que deseas eliminar esta valoración?
                    </p>


                    {selectedReview ? (

                        <div className="admin-review-delete-info">

                            <strong>
                                {
                                    selectedReview.listingTitle
                                }
                            </strong>

                            <span>

                                {
                                    selectedReview.authorName
                                }

                                {" → "}

                                {
                                    selectedReview.reviewedUserName
                                }

                            </span>

                            <span>

                                Puntuación:{" "}

                                {
                                    selectedReview.rating
                                }

                                /5

                            </span>


                            {
                                selectedReview.comment
                                    ? (

                                        <p>
                                            {
                                                selectedReview.comment
                                            }
                                        </p>

                                    )
                                    : null
                            }

                        </div>

                    ) : null}

                </ModalBody>


                <ModalFooter>

                    <button
                        type="button"
                        className="admin-review-cancel-button"
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
                        className="admin-review-confirm-delete-button"
                        disabled={
                            deleting
                        }
                        onClick={
                            deleteReview
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