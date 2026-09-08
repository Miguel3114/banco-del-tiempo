import React, {
    useEffect,
    useRef,
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

import "../static/css/chat/chatDetails.css";


export default function ChatDetails({
    chatId,
    embedded = false,
    onMessagesRead
}) {

    const params =
        useParams();

    const id =
        chatId ||
        params.id;

    const [chat, setChat] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

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

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        async function loadChatData() {

            setLoading(true);
            setMessage(null);

            try {

                await loadChat();
                await loadMessages();

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

                    loadMessages()
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

        scrollToBottom();

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


        setChat(data);
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


        setMessages(
            data || []
        );


        if (onMessagesRead) {
            onMessagesRead();
        }
    }


    async function handleSubmit(event) {

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


    function handleKeyDown(event) {

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


    function formatTime(date) {

        if (!date) {
            return "";
        }


        return new Date(date)
            .toLocaleTimeString(
                "es-ES",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
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

                    {message ? (

                        <Alert color="danger">
                            {message}
                        </Alert>

                    ) : null}

                </div>
            );
        }


        return (

            <div className="chat-page">

                <div className="chat-container">

                    {message ? (

                        <Alert color="danger">
                            {message}
                        </Alert>

                    ) : null}

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


            {message ? (

                <Alert
                    color="danger"
                    className="chat-alert"
                >
                    {message}
                </Alert>

            ) : null}


            <div className="chat-messages">


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
                                (currentMessage) => {

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