import React, {
    useEffect,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import tokenService
    from "../../services/token.service";

import "../../static/css/admin/adminUsers.css";


export default function UserListAdmin() {

    const [users, setUsers] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        updatingUserId,
        setUpdatingUserId
    ] = useState(null);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        let ignore = false;


        async function loadUsers() {

            try {

                const response =
                    await fetch(
                        "/api/admin/users",
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
                        "No se han podido cargar los usuarios"
                    );
                }


                if (!ignore) {

                    setUsers(
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


        loadUsers();


        return () => {

            ignore = true;
        };

    }, [jwt]);


    async function updateStatus(user) {

        const newStatus =
            user.accountStatus === "ACTIVE"
                ? "BLOCKED"
                : "ACTIVE";

        setMessage(null);

        setUpdatingUserId(
            user.id
        );


        try {

            const response =
                await fetch(
                    `/api/admin/users/${user.id}/status`,
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
                                    status:
                                        newStatus
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
                    "No se ha podido modificar el estado del usuario"
                );
            }


            setUsers(
                (currentUsers) =>
                    currentUsers.map(
                        (currentUser) =>
                            currentUser.id ===
                            data.id
                                ? data
                                : currentUser
                    )
            );

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setUpdatingUserId(
                null
            );
        }
    }


    function getInitial(user) {

        return user.firstName
            ? user.firstName
                .charAt(0)
                .toUpperCase()
            : "?";
    }


    return (

        <div className="admin-users-page">

            <header className="admin-users-header">

                <div>

                    <h1>
                        Gestión de Usuarios
                    </h1>

                    <p>

                        {
                            loading
                                ? "Cargando miembros..."
                                : (
                                    <>
                                        {users.length}{" "}

                                        {
                                            users.length === 1
                                                ? "miembro registrado"
                                                : "miembros registrados"
                                        }
                                    </>
                                )
                        }

                    </p>

                </div>


                <div className="admin-user-admin-avatar">
                    A
                </div>

            </header>


            {message ? (

                <div className="admin-users-alert-container">

                    <Alert color="danger">
                        {message}
                    </Alert>

                </div>

            ) : null}


            {
                loading
                    ? (

                        <div className="admin-users-state">
                            Cargando usuarios...
                        </div>

                    )
                    : users.length === 0
                        ? (

                            <div className="admin-users-state">
                                No hay miembros registrados.
                            </div>

                        )
                        : (

                            <div className="admin-users-table-wrapper">

                                <table className="admin-users-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Nombre
                                            </th>

                                            <th>
                                                Email
                                            </th>

                                            <th>
                                                Saldo
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {
                                            users.map(
                                                (user) => (

                                                    <tr
                                                        key={
                                                            user.id
                                                        }
                                                    >

                                                        <td className="admin-user-id">

                                                            #
                                                            {
                                                                user.id
                                                            }

                                                        </td>


                                                        <td>

                                                            <div className="admin-user-name-cell">

                                                                <div className="admin-user-avatar">

                                                                    {
                                                                        getInitial(
                                                                            user
                                                                        )
                                                                    }

                                                                </div>


                                                                <span>

                                                                    {
                                                                        user.firstName
                                                                    }

                                                                    {" "}

                                                                    {
                                                                        user.lastName
                                                                    }

                                                                </span>

                                                            </div>

                                                        </td>


                                                        <td className="admin-user-email">

                                                            {
                                                                user.email
                                                            }

                                                        </td>


                                                        <td>

                                                            <span className="admin-user-balance">

                                                                {
                                                                    user.hourBalance ??
                                                                    0
                                                                }

                                                                h

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <div className="admin-user-status-cell">

                                                                <label className="admin-user-switch">

                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            user.accountStatus ===
                                                                            "ACTIVE"
                                                                        }
                                                                        disabled={
                                                                            updatingUserId ===
                                                                            user.id
                                                                        }
                                                                        onChange={
                                                                            () =>
                                                                                updateStatus(
                                                                                    user
                                                                                )
                                                                        }
                                                                    />

                                                                    <span className="admin-user-switch-slider" />

                                                                </label>


                                                                <span
                                                                    className={
                                                                        user.accountStatus ===
                                                                        "ACTIVE"
                                                                            ? "admin-user-status-text admin-user-status-active"
                                                                            : "admin-user-status-text admin-user-status-blocked"
                                                                    }
                                                                >

                                                                    {
                                                                        updatingUserId ===
                                                                        user.id
                                                                            ? "Actualizando..."
                                                                            : user.accountStatus ===
                                                                                "ACTIVE"
                                                                                ? "Activo"
                                                                                : "Bloqueado"
                                                                    }

                                                                </span>

                                                            </div>

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