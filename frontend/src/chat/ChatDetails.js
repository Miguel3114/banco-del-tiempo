import React, {
    useEffect,
    useRef,
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
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import tokenService
    from "../services/token.service";

import "../static/css/chat/chatDetails.css";


export default function ChatDetails({
    chatId,
    embedded = false,
    onMessagesRead
}) {

    const params =
        useParams();

    const navigate =
        useNavigate();

    const id =
        chatId ||
        params.id;

    const [chat, setChat] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [exchange, setExchange] =
        useState(null);

    const [
        currentUserProvider,
        setCurrentUserProvider
    ] = useState(false);

    const [
        exchangeFormOpen,
        setExchangeFormOpen
    ] = useState(false);

    const [
        exchangeHours,
        setExchangeHours
    ] = useState("");

    const [
        exchangeHoursError,
        setExchangeHoursError
    ] = useState(null);

    const [
        exchangeActionError,
        setExchangeActionError
    ] = useState(null);

    const [
        exchangeSaving,
        setExchangeSaving
    ] = useState(false);

    const [
        archiveModalOpen,
        setArchiveModalOpen
    ] = useState(false);

    const [
        archiving,
        setArchiving
    ] = useState(false);

    const [content, setContent] =
        useState("");

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [sending, setSending] =
        useState(false);

    const messagesEndRef =
        useRef(null);

    const messagesContainerRef =
        useRef(null);

    const shouldAutoScrollRef =
        useRef(true);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        async function loadChatData() {

            setLoading(true);
            setMessage(null);

            shouldAutoScrollRef.current =
                true;

            try {

                const chatData =
                    await loadChat();

                const [
                    ,
                    exchangeData
                ] =
                    await Promise.all([
                        loadMessages(),
                        loadExchange()
                    ]);

                if (exchangeData) {

                    setCurrentUserProvider(
                        exchangeData.currentUserProvider === true
                    );

                } else {

                    await loadExchangeRole(
                        chatData
                    );
                }

            } catch (error) {

                setMessage(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        }

        loadChatData();

        const interval =
            setInterval(
                () => {

                    Promise.all([
                        loadMessages(),
                        loadExchange()
                    ])
                        .catch(() => {
                        });

                },
                3000
            );

        return () => {

            clearInterval(
                interval
            );
        };

    }, [id]);


    useEffect(() => {

        if (
            shouldAutoScrollRef.current
        ) {

            scrollToBottom();
        }

    }, [messages]);


    async function loadChat() {

        const response =
            await fetch(
                `/api/chats/${id}`,
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
                data?.message ||
                data ||
                "No se ha podido cargar el chat"
            );
        }

        setChat(
            data
        );

        return data;
    }


    async function loadMessages() {

        const response =
            await fetch(
                `/api/chats/${id}/messages`,
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
                data?.message ||
                data ||
                "No se han podido cargar los mensajes"
            );
        }

        const newMessages =
            data || [];

        setMessages(
            (currentMessages) => {

                const sameMessages =
                    currentMessages.length ===
                    newMessages.length &&
                    currentMessages.every(
                        (
                            currentMessage,
                            index
                        ) =>
                            currentMessage.id ===
                            newMessages[index].id
                    );

                if (sameMessages) {

                    return currentMessages;
                }

                return newMessages;
            }
        );

        if (onMessagesRead) {
            onMessagesRead();
        }

        return newMessages;
    }


    async function loadExchange() {

        const response =
            await fetch(
                `/api/exchanges/chat/${id}`,
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
                data?.message ||
                data ||
                "No se ha podido cargar el intercambio"
            );
        }

        if (
            response.status === 204 ||
            !data
        ) {

            setExchange(
                null
            );

            return null;
        }

        setExchange(
            data
        );

        setCurrentUserProvider(
            data.currentUserProvider === true
        );

        if (
            data.status !== "REJECTED"
        ) {

            setExchangeFormOpen(
                false
            );

            setExchangeHoursError(
                null
            );
        }

        return data;
    }


    async function loadExchangeRole(
        chatData
    ) {

        const [
            userResponse,
            listingResponse
        ] =
            await Promise.all([

                fetch(
                    "/api/users/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${jwt}`
                        }
                    }
                ),

                fetch(
                    `/api/listings/${chatData.listingId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${jwt}`
                        }
                    }
                )
            ]);

        const userData =
            await getResponseData(
                userResponse
            );

        const listingData =
            await getResponseData(
                listingResponse
            );

        if (!userResponse.ok) {

            throw new Error(
                userData?.message ||
                userData ||
                "No se ha podido cargar el usuario"
            );
        }

        if (!listingResponse.ok) {

            throw new Error(
                listingData?.message ||
                listingData ||
                "No se ha podido cargar el anuncio"
            );
        }

        const currentUserIsAuthor =
            listingData.author?.id ===
            userData.id;

        if (
            chatData.listingType ===
            "OFFER"
        ) {

            setCurrentUserProvider(
                currentUserIsAuthor
            );

        } else {

            setCurrentUserProvider(
                !currentUserIsAuthor
            );
        }
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        const trimmedContent =
            content.trim();

        if (!trimmedContent) {
            return;
        }

        setSending(true);
        setMessage(null);

        try {

            const response =
                await fetch(
                    `/api/chats/${id}/messages`,
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
                                    content:
                                        trimmedContent
                                }
                            )
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
                    "No se ha podido enviar el mensaje"
                );
            }

            shouldAutoScrollRef.current =
                true;

            setMessages(
                (currentMessages) => [
                    ...currentMessages,
                    data
                ]
            );

            setContent("");

            if (onMessagesRead) {
                onMessagesRead();
            }

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setSending(false);
        }
    }


    function handleMessagesScroll() {

        const container =
            messagesContainerRef.current;

        if (!container) {
            return;
        }

        const distanceFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        shouldAutoScrollRef.current =
            distanceFromBottom <
            120;
    }


    function openExchangeForm() {

        setExchangeActionError(
            null
        );

        setExchangeHoursError(
            null
        );

        if (
            exchange?.status ===
            "REJECTED"
        ) {

            setExchangeHours(
                exchange.hours.toString()
            );

        } else {

            setExchangeHours(
                ""
            );
        }

        setExchangeFormOpen(
            true
        );
    }


    function closeExchangeForm() {

        setExchangeFormOpen(
            false
        );

        setExchangeHours(
            ""
        );

        setExchangeHoursError(
            null
        );

        setExchangeActionError(
            null
        );
    }


    async function handleExchangeSubmit(
        event
    ) {

        event.preventDefault();

        setExchangeHoursError(
            null
        );

        setExchangeActionError(
            null
        );

        const hoursValue =
            exchangeHours.trim();

        if (!hoursValue) {

            setExchangeHoursError(
                "El campo no puede estar vacío"
            );

            return;
        }

        const hours =
            Number(
                hoursValue
            );

        if (
            !Number.isInteger(
                hours
            ) ||
            hours <= 0
        ) {

            setExchangeHoursError(
                "Debe ser un número entero mayor que 0"
            );

            return;
        }

        const resend =
            exchange?.status ===
            "REJECTED";

        const url =
            resend
                ? `/api/exchanges/${exchange.id}/resend`
                : `/api/exchanges/chats/${id}`;

        const method =
            resend
                ? "PUT"
                : "POST";

        setExchangeSaving(
            true
        );

        try {

            const response =
                await fetch(
                    url,
                    {
                        method,

                        headers: {
                            Authorization:
                                `Bearer ${jwt}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                {
                                    hours
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
                    "No se ha podido guardar el intercambio";

                if (
                    response.status ===
                    400
                ) {

                    setExchangeHoursError(
                        errorMessage
                    );

                } else {

                    setExchangeActionError(
                        errorMessage
                    );
                }

                return;
            }

            setExchange(
                data
            );

            setCurrentUserProvider(
                data.currentUserProvider === true
            );

            setExchangeFormOpen(
                false
            );

            setExchangeHours(
                ""
            );

            setExchangeHoursError(
                null
            );

            setExchangeActionError(
                null
            );

            await loadMessages();

        } catch (error) {

            setExchangeActionError(
                error.message ||
                "No se ha podido conectar con el servidor"
            );

        } finally {

            setExchangeSaving(
                false
            );
        }
    }


    function openArchiveModal() {

        setExchangeActionError(
            null
        );

        setArchiveModalOpen(
            true
        );
    }


    function closeArchiveModal() {

        if (archiving) {
            return;
        }

        setArchiveModalOpen(
            false
        );
    }


    async function handleArchiveChat() {

        setArchiving(
            true
        );

        setExchangeActionError(
            null
        );

        try {

            const response =
                await fetch(
                    `/api/chats/${id}/archive`,
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
                    "No se ha podido archivar la conversación"
                );
            }

            setArchiveModalOpen(
                false
            );

            navigate(
                "/chats"
            );

        } catch (error) {

            setArchiveModalOpen(
                false
            );

            setExchangeActionError(
                error.message ||
                "No se ha podido archivar la conversación"
            );

        } finally {

            setArchiving(
                false
            );
        }
    }


    function handleKeyDown(
        event
    ) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSubmit(
                event
            );
        }
    }


    function scrollToBottom() {

        messagesEndRef.current
            ?.scrollIntoView(
                {
                    behavior: "smooth"
                }
            );
    }


    function formatTime(
        date
    ) {

        if (!date) {
            return "";
        }

        return new Date(
            date
        )
            .toLocaleTimeString(
                "es-ES",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
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


    function formatHours(
        hours
    ) {

        return hours === 1
            ? "1 hora"
            : `${hours} horas`;
    }


    function getInitials() {

        if (!chat) {
            return "?";
        }

        const firstName =
            chat.otherUserFirstName || "";

        const lastName =
            chat.otherUserLastName || "";

        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();
    }


    function renderExchangeForm() {

        return (

            <form
                className="chat-exchange-form"
                onSubmit={
                    handleExchangeSubmit
                }
            >

                <div className="chat-exchange-field">

                    <label
                        htmlFor={`exchange-hours-${id}`}
                    >
                        Horas realizadas
                    </label>

                    <input
                        id={`exchange-hours-${id}`}
                        type="number"
                        min="1"
                        step="1"
                        value={
                            exchangeHours
                        }
                        disabled={
                            exchangeSaving
                        }
                        placeholder="Ej. 2"
                        onChange={
                            (event) => {

                                setExchangeHours(
                                    event.target.value
                                );

                                setExchangeHoursError(
                                    null
                                );
                            }
                        }
                    />

                    {
                        exchangeHoursError
                            ? (

                                <span className="class-error-message">
                                    {
                                        exchangeHoursError
                                    }
                                </span>

                            )
                            : null
                    }

                </div>

                <div className="chat-exchange-form-actions">

                    <button
                        type="button"
                        className="chat-exchange-cancel-button"
                        disabled={
                            exchangeSaving
                        }
                        onClick={
                            closeExchangeForm
                        }
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="chat-exchange-primary-button"
                        disabled={
                            exchangeSaving
                        }
                    >

                        {
                            exchangeSaving
                                ? "Guardando..."
                                : exchange?.status ===
                                    "REJECTED"
                                    ? "Reenviar"
                                    : "Registrar"
                        }

                    </button>

                </div>

            </form>
        );
    }


    function renderExchangePanel() {

        if (
            !exchange &&
            !currentUserProvider
        ) {

            return null;
        }

        if (!exchange) {

            return (

                <div className="chat-exchange-panel">

                    <div className="chat-exchange-info">

                        <div className="chat-exchange-title">
                            Intercambio
                        </div>

                        <div className="chat-exchange-description">
                            Cuando finalice el servicio,
                            registra las horas realizadas.
                        </div>

                    </div>

                    {
                        exchangeFormOpen
                            ? renderExchangeForm()
                            : (

                                <button
                                    type="button"
                                    className="chat-exchange-primary-button"
                                    onClick={
                                        openExchangeForm
                                    }
                                >
                                    Registrar intercambio
                                </button>
                            )
                    }

                    {
                        exchangeActionError
                            ? (

                                <Alert
                                    color="danger"
                                    className="chat-exchange-alert"
                                >
                                    {
                                        exchangeActionError
                                    }
                                </Alert>

                            )
                            : null
                    }

                </div>
            );
        }

        if (
            exchange.status ===
            "PENDING"
        ) {

            return (

                <div className="chat-exchange-panel">

                    <div className="chat-exchange-info">

                        <div className="chat-exchange-title-row">

                            <div className="chat-exchange-title">
                                Intercambio
                            </div>

                            <span className="chat-exchange-status chat-exchange-status-pending">
                                Pendiente
                            </span>

                        </div>

                        <div className="chat-exchange-hours">
                            {
                                formatHours(
                                    exchange.hours
                                )
                            }
                        </div>

                        <div className="chat-exchange-description">

                            {
                                exchange.currentUserProvider
                                    ? "Pendiente de validación por el receptor."
                                    : "Tienes que validar las horas desde Mis intercambios."
                            }

                        </div>

                    </div>

                </div>
            );
        }

        if (
            exchange.status ===
            "REJECTED"
        ) {

            return (

                <div className="chat-exchange-panel">

                    <div className="chat-exchange-info">

                        <div className="chat-exchange-title-row">

                            <div className="chat-exchange-title">
                                Intercambio
                            </div>

                            <span className="chat-exchange-status chat-exchange-status-rejected">
                                Rechazado
                            </span>

                        </div>

                        <div className="chat-exchange-hours">
                            {
                                formatHours(
                                    exchange.hours
                                )
                            }
                        </div>

                        <div className="chat-exchange-description">

                            {
                                exchange.currentUserProvider
                                    ? "El receptor ha rechazado las horas. Puedes corregirlas y enviarlas de nuevo."
                                    : "Has rechazado este intercambio. El prestador puede corregir las horas."
                            }

                        </div>

                    </div>

                    {
                        exchange.currentUserProvider
                            ? (

                                exchangeFormOpen
                                    ? renderExchangeForm()
                                    : (

                                        <button
                                            type="button"
                                            className="chat-exchange-primary-button"
                                            onClick={
                                                openExchangeForm
                                            }
                                        >
                                            Corregir intercambio
                                        </button>
                                    )
                            )
                            : null
                    }

                    {
                        exchangeActionError
                            ? (

                                <Alert
                                    color="danger"
                                    className="chat-exchange-alert"
                                >
                                    {
                                        exchangeActionError
                                    }
                                </Alert>

                            )
                            : null
                    }

                </div>
            );
        }

        if (
            exchange.status ===
            "ACCEPTED"
        ) {

            return (

                <div className="chat-exchange-panel">

                    <div className="chat-exchange-info">

                        <div className="chat-exchange-title-row">

                            <div className="chat-exchange-title">
                                Intercambio
                            </div>

                            <span className="chat-exchange-status chat-exchange-status-accepted">
                                Completado
                            </span>

                        </div>

                        <div className="chat-exchange-hours">
                            {
                                formatHours(
                                    exchange.hours
                                )
                            }
                        </div>

                        <div className="chat-exchange-description">
                            Las horas han sido confirmadas
                            y los saldos se han actualizado.
                        </div>

                    </div>

                    <button
                        type="button"
                        className="chat-exchange-cancel-button"
                        disabled={
                            archiving
                        }
                        onClick={
                            openArchiveModal
                        }
                    >
                        Archivar chat
                    </button>

                    {
                        exchangeActionError
                            ? (

                                <Alert
                                    color="danger"
                                    className="chat-exchange-alert"
                                >
                                    {
                                        exchangeActionError
                                    }
                                </Alert>

                            )
                            : null
                    }

                </div>
            );
        }

        return null;
    }


    if (loading) {

        if (embedded) {

            return (

                <div className="chat-embedded-state">
                    Cargando conversación...
                </div>
            );
        }

        return (

            <div className="chat-page">

                <div className="chat-loading">
                    Cargando conversación...
                </div>

            </div>
        );
    }


    if (!chat) {

        if (embedded) {

            return (

                <div className="chat-embedded-state">

                    {
                        message
                            ? (

                                <Alert color="danger">
                                    {message}
                                </Alert>

                            )
                            : null
                    }

                </div>
            );
        }

        return (

            <div className="chat-page">

                <div className="chat-container">

                    {
                        message
                            ? (

                                <Alert color="danger">
                                    {message}
                                </Alert>

                            )
                            : null
                    }

                </div>

            </div>
        );
    }


    const listingRoute =
        chat.listingType === "OFFER"
            ? `/listings/${chat.listingId}`
            : `/requests/${chat.listingId}`;


    const chatContent = (

        <div
            className={
                embedded
                    ? "chat-card chat-card-embedded"
                    : "chat-card"
            }
        >

            <div className="chat-header">

                <Link
                    to={
                        `/users/${chat.otherUserId}`
                    }
                    className="chat-user-link"
                >

                    {
                        chat.otherUserProfileImageUrl
                            ? (

                                <img
                                    src={
                                        chat.otherUserProfileImageUrl
                                    }
                                    alt={
                                        `${chat.otherUserFirstName} ${chat.otherUserLastName}`
                                    }
                                    className="chat-avatar-image"
                                />

                            )
                            : (

                                <div className="chat-avatar">

                                    {
                                        getInitials()
                                    }

                                </div>
                            )
                    }

                    <div className="chat-user-info">

                        <h1>

                            {
                                chat.otherUserFirstName
                            }

                            {" "}

                            {
                                chat.otherUserLastName
                            }

                        </h1>

                        <span>
                            Ver perfil
                        </span>

                    </div>

                </Link>

                <Link
                    to={
                        listingRoute
                    }
                    className="chat-listing-link"
                >

                    <span className="chat-listing-label">
                        Anuncio
                    </span>

                    <span className="chat-listing-title">
                        {chat.listingTitle}
                    </span>

                </Link>

            </div>

            {
                renderExchangePanel()
            }

            {
                message
                    ? (

                        <Alert
                            color="danger"
                            className="chat-alert"
                        >
                            {message}
                        </Alert>

                    )
                    : null
            }

            <div
                className="chat-messages"
                ref={
                    messagesContainerRef
                }
                onScroll={
                    handleMessagesScroll
                }
            >

                {
                    messages.length === 0
                        ? (

                            <div className="chat-empty">

                                <p>
                                    Todavía no hay mensajes.
                                </p>

                                <span>
                                    Escribe el primero para comenzar la conversación.
                                </span>

                            </div>

                        )
                        : (

                            messages.map(
                                (
                                    currentMessage
                                ) => {

                                    if (
                                        currentMessage.system
                                    ) {

                                        return (

                                            <div
                                                key={
                                                    currentMessage.id
                                                }
                                                className="chat-system-message"
                                            >

                                                <span>
                                                    {
                                                        currentMessage.content
                                                    }
                                                </span>

                                            </div>
                                        );
                                    }

                                    return (

                                        <div
                                            key={
                                                currentMessage.id
                                            }
                                            className={
                                                currentMessage.mine
                                                    ? "chat-message-row chat-message-row-mine"
                                                    : "chat-message-row"
                                            }
                                        >

                                            <div
                                                className={
                                                    currentMessage.mine
                                                        ? "chat-message chat-message-mine"
                                                        : "chat-message"
                                                }
                                            >

                                                <p>
                                                    {
                                                        currentMessage.content
                                                    }
                                                </p>

                                                <span className="chat-message-time">

                                                    {
                                                        formatTime(
                                                            currentMessage.sentAt
                                                        )
                                                    }

                                                </span>

                                            </div>

                                        </div>
                                    );
                                }
                            )
                        )
                }

                <div
                    ref={
                        messagesEndRef
                    }
                />

            </div>

            <form
                className="chat-form"
                onSubmit={
                    handleSubmit
                }
            >

                <textarea
                    value={
                        content
                    }
                    placeholder="Escribe un mensaje..."
                    className="chat-input"
                    rows="1"
                    disabled={
                        sending
                    }
                    onChange={
                        (event) =>
                            setContent(
                                event.target.value
                            )
                    }
                    onKeyDown={
                        handleKeyDown
                    }
                />

                <button
                    type="submit"
                    className="chat-send-button"
                    disabled={
                        sending ||
                        !content.trim()
                    }
                >

                    {
                        sending
                            ? "Enviando..."
                            : "Enviar"
                    }

                </button>

            </form>

            <div className="chat-footer">

                Conversación iniciada el{" "}

                {
                    formatDate(
                        chat.openedAt
                    )
                }

            </div>


            <Modal
                isOpen={
                    archiveModalOpen
                }
                toggle={
                    closeArchiveModal
                }
                centered
            >

                <ModalHeader
                    toggle={
                        closeArchiveModal
                    }
                >
                    Archivar conversación
                </ModalHeader>

                <ModalBody>

                    La conversación dejará de aparecer
                    en tu buzón.

                    <br />
                    <br />

                    ¿Estás seguro de archivar la conversación?

                </ModalBody>

                <ModalFooter>

                    <Button
                        color="secondary"
                        disabled={
                            archiving
                        }
                        onClick={
                            closeArchiveModal
                        }
                    >
                        Cancelar
                    </Button>

                    <Button
                        color="primary"
                        disabled={
                            archiving
                        }
                        onClick={
                            handleArchiveChat
                        }
                    >

                        {
                            archiving
                                ? "Archivando..."
                                : "Archivar"
                        }

                    </Button>

                </ModalFooter>

            </Modal>

        </div>
    );


    if (embedded) {

        return chatContent;
    }

    return (

        <div className="chat-page">

            <div className="chat-container">

                {chatContent}

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