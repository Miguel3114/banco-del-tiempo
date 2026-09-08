import React, {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link,
    useNavigate,
    useParams
} from "react-router-dom";

import ChatDetails
    from "./ChatDetails";

import tokenService
    from "../services/token.service";

import "../static/css/chat/mailbox.css";


export default function Mailbox() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [chats, setChats] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const jwt =
        tokenService.getLocalAccessToken();


    const loadChats =
        useCallback(
            async (
                showLoading = false,
                showError = true
            ) => {

                if (showLoading) {
                    setLoading(true);
                }

                try {

                    const response =
                        await fetch(
                            "/api/chats",
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
                            "No se ha podido cargar el buzón"
                        );
                    }


                    const loadedChats =
                        Array.isArray(data)
                            ? data
                            : [];


                    setChats(
                        loadedChats
                    );

                    setMessage(null);


                    if (
                        !id &&
                        loadedChats.length > 0
                    ) {

                        navigate(
                            `/chats/${loadedChats[0].id}`,
                            {
                                replace: true
                            }
                        );
                    }

                } catch (error) {

                    if (showError) {

                        setMessage(
                            error.message
                        );
                    }

                } finally {

                    if (showLoading) {
                        setLoading(false);
                    }
                }
            },
            [
                id,
                jwt,
                navigate
            ]
        );


    const handleMessagesRead =
        useCallback(
            () => {

                loadChats(
                    false,
                    false
                );

            },
            [loadChats]
        );


    useEffect(() => {

        loadChats(
            true,
            true
        );


        const interval =
            setInterval(
                () => {

                    loadChats(
                        false,
                        false
                    );

                },
                3000
            );


        return () => {

            clearInterval(
                interval
            );
        };

    }, [loadChats]);


    function getInitials(chat) {

        const firstName =
            chat.otherUserFirstName || "";

        const lastName =
            chat.otherUserLastName || "";


        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();
    }


    function formatActivity(date) {

        if (!date) {
            return "";
        }


        const value =
            new Date(date);

        const today =
            new Date();


        const sameDay =
            value.getDate() ===
                today.getDate() &&
            value.getMonth() ===
                today.getMonth() &&
            value.getFullYear() ===
                today.getFullYear();


        if (sameDay) {

            return value
                .toLocaleTimeString(
                    "es-ES",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );
        }


        return value
            .toLocaleDateString(
                "es-ES",
                {
                    day: "2-digit",
                    month: "2-digit"
                }
            );
    }


    return (

        <div className="mailbox-page">

            <div className="mailbox-container">


                <div className="mailbox-header">

                    <h1>
                        Buzón
                    </h1>

                    <p>
                        Tus conversaciones activas con otros miembros.
                    </p>

                </div>


                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                <div className="mailbox-card">


                    <aside className="mailbox-sidebar">


                        <div className="mailbox-sidebar-header">

                            <h2>
                                Conversaciones
                            </h2>

                            {
                                chats.some(
                                    (chat) =>
                                        chat.unread
                                )
                                    ? (

                                        <span className="mailbox-unread-label">
                                            Nuevos
                                        </span>

                                    )
                                    : null
                            }

                        </div>


                        <div className="mailbox-chat-list">


                            {
                                loading
                                    ? (

                                        <div className="mailbox-state">
                                            Cargando conversaciones...
                                        </div>

                                    )
                                    : chats.length === 0
                                        ? (

                                            <div className="mailbox-state">

                                                <strong>
                                                    No tienes conversaciones
                                                </strong>

                                                <span>
                                                    Cuando contactes con otro usuario aparecerán aquí.
                                                </span>

                                            </div>

                                        )
                                        : (

                                            chats.map(
                                                (chat) => {

                                                    const selected =
                                                        String(chat.id) ===
                                                        String(id);


                                                    return (

                                                        <div
                                                            key={
                                                                chat.id
                                                            }
                                                            className={
                                                                selected
                                                                    ? "mailbox-chat-item mailbox-chat-item-selected"
                                                                    : "mailbox-chat-item"
                                                            }
                                                        >


                                                            <Link
                                                                to={
                                                                    `/users/${chat.otherUserId}`
                                                                }
                                                                className="mailbox-avatar-link"
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
                                                                                className="mailbox-avatar-image"
                                                                            />

                                                                        )
                                                                        : (

                                                                            <div className="mailbox-avatar">

                                                                                {
                                                                                    getInitials(
                                                                                        chat
                                                                                    )
                                                                                }

                                                                            </div>
                                                                        )
                                                                }

                                                            </Link>


                                                            <Link
                                                                to={
                                                                    `/chats/${chat.id}`
                                                                }
                                                                className="mailbox-chat-link"
                                                            >


                                                                <div className="mailbox-chat-top">

                                                                    <span className="mailbox-chat-user">

                                                                        {
                                                                            chat.otherUserFirstName
                                                                        }

                                                                        {" "}

                                                                        {
                                                                            chat.otherUserLastName
                                                                        }

                                                                    </span>


                                                                    <span className="mailbox-chat-date">

                                                                        {
                                                                            formatActivity(
                                                                                chat.lastActivityAt
                                                                            )
                                                                        }

                                                                    </span>

                                                                </div>


                                                                <div className="mailbox-chat-listing">

                                                                    {
                                                                        chat.listingTitle
                                                                    }

                                                                </div>


                                                                <div className="mailbox-chat-bottom">

                                                                    <span
                                                                        className={
                                                                            chat.unread
                                                                                ? "mailbox-last-message mailbox-last-message-unread"
                                                                                : "mailbox-last-message"
                                                                        }
                                                                    >

                                                                        {
                                                                            chat.lastMessage ||
                                                                            "Conversación iniciada"
                                                                        }

                                                                    </span>


                                                                    {
                                                                        chat.unread
                                                                            ? (

                                                                                <span className="mailbox-unread-dot" />

                                                                            )
                                                                            : null
                                                                    }

                                                                </div>


                                                            </Link>

                                                        </div>
                                                    );
                                                }
                                            )
                                        )
                            }

                        </div>

                    </aside>


                    <main className="mailbox-chat-area">

                        {
                            id
                                ? (

                                    <ChatDetails
                                        chatId={
                                            id
                                        }
                                        embedded
                                        onMessagesRead={
                                            handleMessagesRead
                                        }
                                    />

                                )
                                : (

                                    <div className="mailbox-no-chat">

                                        <div className="mailbox-no-chat-icon">
                                            ✉
                                        </div>

                                        <h2>
                                            Selecciona una conversación
                                        </h2>

                                        <p>
                                            Elige un chat para ver sus mensajes.
                                        </p>

                                    </div>
                                )
                        }

                    </main>


                </div>

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