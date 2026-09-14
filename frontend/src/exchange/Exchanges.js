import React, {
    useEffect,
    useState
} from "react";

import {
    Alert,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import tokenService
    from "../services/token.service";

import "../static/css/exchange/exchanges.css";


export default function Exchanges() {

    const [pendingExchanges, setPendingExchanges] =
        useState([]);

    const [historyExchanges, setHistoryExchanges] =
        useState([]);

    const [activeTab, setActiveTab] =
        useState("pending");

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState(null);

    const [rejectExchangeId, setRejectExchangeId] =
        useState(null);

    const [rejectReason, setRejectReason] =
        useState("");

    const [rejectReasonError, setRejectReasonError] =
        useState(null);

    const [actionLoading, setActionLoading] =
        useState(null);

    const [reviewExchange, setReviewExchange] =
        useState(null);

    const [reviewRating, setReviewRating] =
        useState(0);

    const [reviewComment, setReviewComment] =
        useState("");

    const [reviewRatingError, setReviewRatingError] =
        useState(null);

    const [reviewError, setReviewError] =
        useState(null);

    const [reviewSaving, setReviewSaving] =
        useState(false);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        loadData();

    }, []);


    async function loadData() {

        setLoading(true);
        setMessage(null);

        try {

            const [
                pendingResponse,
                historyResponse
            ] =
                await Promise.all([
                    fetch(
                        "/api/exchanges/pending",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    ),

                    fetch(
                        "/api/exchanges/history",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${jwt}`
                            }
                        }
                    )
                ]);

            const pendingData =
                await getResponseData(
                    pendingResponse
                );

            const historyData =
                await getResponseData(
                    historyResponse
                );

            if (!pendingResponse.ok) {

                throw new Error(
                    pendingData?.message ||
                    pendingData ||
                    "No se han podido cargar los intercambios pendientes"
                );
            }

            if (!historyResponse.ok) {

                throw new Error(
                    historyData?.message ||
                    historyData ||
                    "No se ha podido cargar el historial"
                );
            }

            setPendingExchanges(
                pendingData || []
            );

            setHistoryExchanges(
                historyData || []
            );

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setLoading(false);
        }
    }


    async function acceptExchange(
        exchange
    ) {

        setActionLoading(
            `accept-${exchange.id}`
        );

        setMessage(null);

        try {

            const response =
                await fetch(
                    `/api/exchanges/${exchange.id}/accept`,
                    {
                        method: "PUT",

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
                    data?.message ||
                    data ||
                    "No se ha podido aceptar el intercambio"
                );
            }

            await loadData();

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setActionLoading(
                null
            );
        }
    }


    function openRejectForm(
        exchangeId
    ) {

        setRejectExchangeId(
            exchangeId
        );

        setRejectReason(
            ""
        );

        setRejectReasonError(
            null
        );

        setMessage(
            null
        );
    }


    function closeRejectForm() {

        setRejectExchangeId(
            null
        );

        setRejectReason(
            ""
        );

        setRejectReasonError(
            null
        );
    }


    async function rejectExchange(
        event,
        exchange
    ) {

        event.preventDefault();

        setRejectReasonError(
            null
        );

        setMessage(
            null
        );

        const reason =
            rejectReason.trim();

        if (!reason) {

            setRejectReasonError(
                "El motivo del rechazo no puede estar vacío"
            );

            return;
        }

        setActionLoading(
            `reject-${exchange.id}`
        );

        try {

            const response =
                await fetch(
                    `/api/exchanges/${exchange.id}/reject`,
                    {
                        method: "PUT",

                        headers: {
                            Authorization:
                                `Bearer ${jwt}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                {
                                    reason
                                }
                            )
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                if (
                    response.status ===
                    400
                ) {

                    setRejectReasonError(
                        data?.message ||
                        data ||
                        "El motivo del rechazo no es válido"
                    );

                    return;
                }

                throw new Error(
                    data?.message ||
                    data ||
                    "No se ha podido rechazar el intercambio"
                );
            }

            closeRejectForm();

            await loadData();

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setActionLoading(
                null
            );
        }
    }


    function openReviewModal(
        exchange
    ) {

        setReviewExchange(
            exchange
        );

        setReviewRating(
            0
        );

        setReviewComment(
            ""
        );

        setReviewRatingError(
            null
        );

        setReviewError(
            null
        );
    }


    function closeReviewModal() {

        if (reviewSaving) {
            return;
        }

        setReviewExchange(
            null
        );

        setReviewRating(
            0
        );

        setReviewComment(
            ""
        );

        setReviewRatingError(
            null
        );

        setReviewError(
            null
        );
    }


    async function createReview() {

        setReviewRatingError(
            null
        );

        setReviewError(
            null
        );

        if (
            reviewRating < 1 ||
            reviewRating > 5
        ) {

            setReviewRatingError(
                "Selecciona una puntuación de 1 a 5 estrellas"
            );

            return;
        }

        setReviewSaving(
            true
        );

        try {

            const response =
                await fetch(
                    `/api/reviews/exchanges/${reviewExchange.id}`,
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${jwt}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                {
                                    rating:
                                        reviewRating,

                                    comment:
                                        reviewComment.trim()
                                }
                            )
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                const errorMessage =
                    data?.message ||
                    data ||
                    "No se ha podido publicar la valoración";

                if (
                    response.status ===
                    400
                ) {

                    setReviewRatingError(
                        errorMessage
                    );

                    return;
                }

                setReviewError(
                    errorMessage
                );

                return;
            }

            setHistoryExchanges(
                (currentExchanges) =>
                    currentExchanges.map(
                        (exchange) =>
                            exchange.id ===
                            reviewExchange.id
                                ? {
                                    ...exchange,
                                    reviewed: true
                                }
                                : exchange
                    )
            );

            setReviewExchange(
                null
            );

            setReviewRating(
                0
            );

            setReviewComment(
                ""
            );

            setReviewRatingError(
                null
            );

            setReviewError(
                null
            );

        } catch (error) {

            setReviewError(
                error.message ||
                "No se ha podido conectar con el servidor"
            );

        } finally {

            setReviewSaving(
                false
            );
        }
    }


    function formatHours(
        hours
    ) {

        return hours === 1
            ? "1 hora"
            : `${hours} horas`;
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


    function getOtherUser(
        exchange
    ) {

        if (
            exchange.currentUserProvider
        ) {

            return {
                id:
                    exchange.receiverId,

                firstName:
                    exchange.receiverFirstName,

                lastName:
                    exchange.receiverLastName,

                profileImageUrl:
                    exchange.receiverProfileImageUrl
            };
        }

        return {
            id:
                exchange.providerId,

            firstName:
                exchange.providerFirstName,

            lastName:
                exchange.providerLastName,

            profileImageUrl:
                exchange.providerProfileImageUrl
        };
    }


    function getInitials(
        user
    ) {

        const firstName =
            user.firstName || "";

        const lastName =
            user.lastName || "";

        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();
    }


    function getListingRoute(
        exchange
    ) {

        return exchange.listingType ===
            "OFFER"
            ? `/listings/${exchange.listingId}`
            : `/requests/${exchange.listingId}`;
    }


    function renderPendingExchange(
        exchange
    ) {

        const provider = {
            id:
                exchange.providerId,

            firstName:
                exchange.providerFirstName,

            lastName:
                exchange.providerLastName,

            profileImageUrl:
                exchange.providerProfileImageUrl
        };

        const accepting =
            actionLoading ===
            `accept-${exchange.id}`;

        const rejecting =
            actionLoading ===
            `reject-${exchange.id}`;

        const rejectFormOpen =
            rejectExchangeId ===
            exchange.id;

        return (

            <article
                key={
                    exchange.id
                }
                className="exchange-card"
            >

                <div className="exchange-card-header">

                    <div>

                        <span className="exchange-type-label">
                            {
                                exchange.listingType ===
                                "OFFER"
                                    ? "Oferta"
                                    : "Demanda"
                            }
                        </span>

                        <h2>
                            {
                                exchange.listingTitle
                            }
                        </h2>

                    </div>

                    <span className="exchange-status exchange-status-pending">
                        Pendiente
                    </span>

                </div>

                <div className="exchange-user-row">

                    <Link
                        to={
                            `/users/${provider.id}`
                        }
                        className="exchange-user-link"
                    >

                        {
                            provider.profileImageUrl
                                ? (

                                    <img
                                        src={
                                            provider.profileImageUrl
                                        }
                                        alt={
                                            `${provider.firstName} ${provider.lastName}`
                                        }
                                        className="exchange-avatar-image"
                                    />

                                )
                                : (

                                    <div className="exchange-avatar">
                                        {
                                            getInitials(
                                                provider
                                            )
                                        }
                                    </div>
                                )
                        }

                        <div>

                            <span className="exchange-user-label">
                                Prestador
                            </span>

                            <strong>
                                {
                                    provider.firstName
                                }{" "}
                                {
                                    provider.lastName
                                }
                            </strong>

                        </div>

                    </Link>

                </div>

                <div className="exchange-data">

                    <div className="exchange-hours">

                        <span>
                            Horas realizadas
                        </span>

                        <strong>
                            {
                                formatHours(
                                    exchange.hours
                                )
                            }
                        </strong>

                    </div>

                    <div className="exchange-date">

                        <span>
                            Registrado
                        </span>

                        <strong>
                            {
                                formatDate(
                                    exchange.registeredAt
                                )
                            }
                        </strong>

                    </div>

                </div>

                <div className="exchange-links">

                    <Link
                        to={
                            `/chats/${exchange.chatId}`
                        }
                        className="btn btn-outline-primary btn-lg"
                    >
                        Ver conversación
                    </Link>

                    <Link
                        to={
                            getListingRoute(
                                exchange
                            )
                        }
                        className="btn btn-outline-primary btn-lg"
                    >
                        Ver anuncio
                    </Link>

                </div>

                {
                    rejectFormOpen
                        ? (

                            <form
                                className="exchange-reject-form"
                                onSubmit={
                                    (event) =>
                                        rejectExchange(
                                            event,
                                            exchange
                                        )
                                }
                            >

                                <label
                                    htmlFor={
                                        `reject-reason-${exchange.id}`
                                    }
                                >
                                    Motivo del rechazo
                                </label>

                                <textarea
                                    id={
                                        `reject-reason-${exchange.id}`
                                    }
                                    rows="3"
                                    value={
                                        rejectReason
                                    }
                                    disabled={
                                        rejecting
                                    }
                                    placeholder="Explica por qué ha rechazado el intercambio..."
                                    onChange={
                                        (event) => {

                                            setRejectReason(
                                                event.target.value
                                            );

                                            setRejectReasonError(
                                                null
                                            );
                                        }
                                    }
                                />

                                {
                                    rejectReasonError
                                        ? (

                                            <span className="class-error-message">
                                                {
                                                    rejectReasonError
                                                }
                                            </span>

                                        )
                                        : null
                                }

                                <div className="exchange-reject-actions">

                                    <button
                                        type="button"
                                        className="exchange-secondary-button"
                                        disabled={
                                            rejecting
                                        }
                                        onClick={
                                            closeRejectForm
                                        }
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        className="exchange-reject-confirm-button"
                                        disabled={
                                            rejecting
                                        }
                                    >

                                        {
                                            rejecting
                                                ? "Rechazando..."
                                                : "Confirmar rechazo"
                                        }

                                    </button>

                                </div>

                            </form>

                        )
                        : (

                            <div className="exchange-actions">

                                <button
                                    type="button"
                                    className="exchange-reject-button"
                                    disabled={
                                        accepting ||
                                        rejecting
                                    }
                                    onClick={
                                        () =>
                                            openRejectForm(
                                                exchange.id
                                            )
                                    }
                                >
                                    Rechazar
                                </button>

                                <button
                                    type="button"
                                    className="exchange-accept-button"
                                    disabled={
                                        accepting ||
                                        rejecting
                                    }
                                    onClick={
                                        () =>
                                            acceptExchange(
                                                exchange
                                            )
                                    }
                                >

                                    {
                                        accepting
                                            ? "Confirmando..."
                                            : "Confirmar horas"
                                    }

                                </button>

                            </div>
                        )
                }

            </article>
        );
    }


    function renderHistoryExchange(
        exchange
    ) {

        const otherUser =
            getOtherUser(
                exchange
            );

        return (

            <article
                key={
                    exchange.id
                }
                className="exchange-card"
            >

                <div className="exchange-card-header">

                    <div>

                        <span className="exchange-type-label">
                            {
                                exchange.listingType ===
                                "OFFER"
                                    ? "Oferta"
                                    : "Demanda"
                            }
                        </span>

                        <h2>
                            {
                                exchange.listingTitle
                            }
                        </h2>

                    </div>

                    <span className="exchange-status exchange-status-accepted">
                        Aceptado
                    </span>

                </div>

                <Link
                    to={
                        `/users/${otherUser.id}`
                    }
                    className="exchange-user-link"
                >

                    {
                        otherUser.profileImageUrl
                            ? (

                                <img
                                    src={
                                        otherUser.profileImageUrl
                                    }
                                    alt={
                                        `${otherUser.firstName} ${otherUser.lastName}`
                                    }
                                    className="exchange-avatar-image"
                                />

                            )
                            : (

                                <div className="exchange-avatar">
                                    {
                                        getInitials(
                                            otherUser
                                        )
                                    }
                                </div>
                            )
                    }

                    <div>

                        <span className="exchange-user-label">
                            Intercambio con
                        </span>

                        <strong>
                            {
                                otherUser.firstName
                            }{" "}
                            {
                                otherUser.lastName
                            }
                        </strong>

                    </div>

                </Link>

                <div className="exchange-data">

                    <div className="exchange-hours">

                        <span>
                            Horas
                        </span>

                        <strong>
                            {
                                formatHours(
                                    exchange.hours
                                )
                            }
                        </strong>

                    </div>

                    <div className="exchange-date">

                        <span>
                            Registrado
                        </span>

                        <strong>
                            {
                                formatDate(
                                    exchange.registeredAt
                                )
                            }
                        </strong>

                    </div>

                </div>

                <div className="exchange-links">

                    <Link
                        to={
                            `/chats/${exchange.chatId}`
                        }
                        className="btn btn-outline-primary exchange-history-button"
                    >
                        Ver conversación
                    </Link>

                    <Link
                        to={
                            getListingRoute(
                                exchange
                            )
                        }
                        className="btn btn-outline-primary exchange-history-button"
                    >
                        Ver anuncio
                    </Link>

                    {
                        exchange.reviewed
                            ? (

                                <span className="btn btn-success exchange-history-button">
                                    ✓ Valorado
                                </span>

                            )
                            : (

                                <Button
                                    type="button"
                                    color="primary"
                                    className="exchange-history-button"
                                    onClick={
                                        () =>
                                            openReviewModal(
                                                exchange
                                            )
                                    }
                                >
                                    Valorar
                                </Button>
                            )
                    }

                </div>

            </article>
        );
    }


    function renderReviewModal() {

        if (!reviewExchange) {
            return null;
        }

        const otherUser =
            getOtherUser(
                reviewExchange
            );

        return (

            <Modal
                isOpen={
                    reviewExchange !== null
                }
                toggle={
                    closeReviewModal
                }
                centered
            >

                <ModalHeader
                    toggle={
                        closeReviewModal
                    }
                >
                    Valorar a{" "}
                    {
                        otherUser.firstName
                    }
                </ModalHeader>

                <ModalBody>

                    <p className="mb-2">
                        ¿Cómo valorarías tu experiencia
                        en este intercambio?
                    </p>

                    <div className="mb-3">

                        <label className="form-label">
                            Puntuación
                        </label>

                        <div className="d-flex gap-2">

                            {
                                [
                                    1,
                                    2,
                                    3,
                                    4,
                                    5
                                ].map(
                                    (rating) => (

                                        <Button
                                            key={
                                                rating
                                            }
                                            type="button"
                                            color="link"
                                            className="p-0 border-0 shadow-none text-decoration-none text-warning fs-2"
                                            disabled={
                                                reviewSaving
                                            }
                                            aria-label={
                                                `${rating} ${rating === 1
                                                    ? "estrella"
                                                    : "estrellas"}`
                                            }
                                            onClick={
                                                () => {

                                                    setReviewRating(
                                                        rating
                                                    );

                                                    setReviewRatingError(
                                                        null
                                                    );
                                                }
                                            }
                                        >
                                            {
                                                rating <=
                                                reviewRating
                                                    ? "★"
                                                    : "☆"
                                            }
                                        </Button>
                                    )
                                )
                            }

                        </div>

                        {
                            reviewRatingError
                                ? (

                                    <span className="class-error-message">
                                        {
                                            reviewRatingError
                                        }
                                    </span>

                                )
                                : null
                        }

                    </div>

                    <div className="mb-3">

                        <label
                            htmlFor="review-comment"
                            className="form-label"
                        >
                            Comentario
                            {" "}
                            <span className="text-muted">
                                (opcional)
                            </span>
                        </label>

                        <textarea
                            id="review-comment"
                            className="form-control"
                            rows="4"
                            value={
                                reviewComment
                            }
                            disabled={
                                reviewSaving
                            }
                            placeholder="Cuenta brevemente cómo ha sido tu experiencia..."
                            onChange={
                                (event) =>
                                    setReviewComment(
                                        event.target.value
                                    )
                            }
                        />

                    </div>

                    {
                        reviewError
                            ? (

                                <Alert
                                    color="danger"
                                    className="mb-0"
                                >
                                    {
                                        reviewError
                                    }
                                </Alert>

                            )
                            : null
                    }

                </ModalBody>

                <ModalFooter>

                    <Button
                        type="button"
                        color="secondary"
                        disabled={
                            reviewSaving
                        }
                        onClick={
                            closeReviewModal
                        }
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        color="primary"
                        disabled={
                            reviewSaving
                        }
                        onClick={
                            createReview
                        }
                    >

                        {
                            reviewSaving
                                ? "Publicando..."
                                : "Publicar valoración"
                        }

                    </Button>

                </ModalFooter>

            </Modal>
        );
    }


    if (loading) {

        return (

            <div className="exchanges-page">

                <div className="exchanges-container">

                    <div className="exchanges-loading">
                        Cargando intercambios...
                    </div>

                </div>

            </div>
        );
    }


    return (

        <div className="exchanges-page">

            <div className="exchanges-container">

                <div className="exchanges-header">

                    <div>

                        <h1>
                            Mis intercambios
                        </h1>

                        <p>
                            Gestiona las horas pendientes
                            y consulta tus intercambios completados.
                        </p>

                    </div>

                </div>

                {
                    message
                        ? (

                            <Alert color="danger">
                                {message}
                            </Alert>

                        )
                        : null
                }

                <div className="exchanges-tabs">

                    <button
                        type="button"
                        className={
                            activeTab ===
                            "pending"
                                ? "exchange-tab exchange-tab-active"
                                : "exchange-tab"
                        }
                        onClick={
                            () =>
                                setActiveTab(
                                    "pending"
                                )
                        }
                    >

                        Pendientes de validar

                        {
                            pendingExchanges.length >
                            0
                                ? (

                                    <span className="exchange-tab-count">
                                        {
                                            pendingExchanges.length
                                        }
                                    </span>

                                )
                                : null
                        }

                    </button>

                    <button
                        type="button"
                        className={
                            activeTab ===
                            "history"
                                ? "exchange-tab exchange-tab-active"
                                : "exchange-tab"
                        }
                        onClick={
                            () =>
                                setActiveTab(
                                    "history"
                                )
                        }
                    >
                        Historial
                    </button>

                </div>

                <div className="exchanges-content">

                    {
                        activeTab ===
                        "pending"
                            ? (

                                pendingExchanges.length ===
                                0
                                    ? (

                                        <div className="exchanges-empty">

                                            <h2>
                                                No tienes intercambios pendientes
                                            </h2>

                                            <p>
                                                Cuando tengas horas por validar,
                                                aparecerán aquí.
                                            </p>

                                        </div>

                                    )
                                    : (

                                        <div className="exchange-grid">

                                            {
                                                pendingExchanges.map(
                                                    (
                                                        exchange
                                                    ) =>
                                                        renderPendingExchange(
                                                            exchange
                                                        )
                                                )
                                            }

                                        </div>
                                    )

                            )
                            : (

                                historyExchanges.length ===
                                0
                                    ? (

                                        <div className="exchanges-empty">

                                            <h2>
                                                Todavía no hay intercambios completados
                                            </h2>

                                            <p>
                                                Los intercambios aceptados
                                                aparecerán en tu historial.
                                            </p>

                                        </div>

                                    )
                                    : (

                                        <div className="exchange-grid">

                                            {
                                                historyExchanges.map(
                                                    (
                                                        exchange
                                                    ) =>
                                                        renderHistoryExchange(
                                                            exchange
                                                        )
                                                )
                                            }

                                        </div>
                                    )
                            )
                    }

                </div>

            </div>

            {
                renderReviewModal()
            }

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