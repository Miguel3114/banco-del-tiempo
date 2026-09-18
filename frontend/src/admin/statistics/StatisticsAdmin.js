import React, {
    useEffect,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import tokenService
    from "../../services/token.service";

import "../../static/css/admin/adminStatistics.css";


export default function StatisticsAdmin() {

    const [statistics, setStatistics] =
        useState(null);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        let ignore = false;


        async function loadStatistics() {

            try {

                const response =
                    await fetch(
                        "/api/admin/statistics",
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
                            "No se han podido cargar las estadísticas"
                        )
                    );
                }


                if (!ignore) {

                    setStatistics(data);
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


        loadStatistics();


        return () => {

            ignore = true;
        };

    }, [jwt]);


    return (

        <div className="admin-statistics-page">

            <header className="admin-statistics-header">

                <div>

                    <h1>
                        Estadísticas
                    </h1>

                    <p>
                        Resumen general del Banco del Tiempo
                    </p>

                </div>


                <div className="admin-statistics-admin-avatar">
                    A
                </div>

            </header>


            <div className="admin-statistics-content">

                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                {
                    loading
                        ? (

                            <div className="admin-statistics-state">
                                Cargando estadísticas...
                            </div>

                        )
                        : statistics
                            ? (

                                <div className="admin-statistics-grid">

                                    <div className="admin-statistics-card">

                                        <div className="admin-statistics-icon admin-statistics-users-icon">

                                            <svg
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    cx="9"
                                                    cy="8"
                                                    r="3"
                                                />

                                                <path d="M3.5 19c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />

                                                <path d="M15 5.5a3 3 0 0 1 0 5" />

                                                <path d="M16 14c2.7.2 4.5 2 4.5 5" />
                                            </svg>

                                        </div>


                                        <div className="admin-statistics-card-content">

                                            <span className="admin-statistics-card-label">
                                                Usuarios registrados
                                            </span>

                                            <strong>
                                                {statistics.totalUsers}
                                            </strong>

                                            <p>
                                                Miembros registrados en la plataforma
                                            </p>

                                        </div>

                                    </div>


                                    <div className="admin-statistics-card">

                                        <div className="admin-statistics-icon admin-statistics-listings-icon">

                                            <svg
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d="M4 12 20 6v12L4 12Z" />

                                                <path d="M7 13.5 8.5 18" />
                                            </svg>

                                        </div>


                                        <div className="admin-statistics-card-content">

                                            <span className="admin-statistics-card-label">
                                                Anuncios activos
                                            </span>

                                            <strong>
                                                {statistics.activeListings}
                                            </strong>

                                            <p>
                                                Ofertas y demandas disponibles
                                            </p>

                                        </div>

                                    </div>


                                    <div className="admin-statistics-card">

                                        <div className="admin-statistics-icon admin-statistics-hours-icon">

                                            <svg
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="8"
                                                />

                                                <path d="M12 7v5l3 2" />
                                            </svg>

                                        </div>


                                        <div className="admin-statistics-card-content">

                                            <span className="admin-statistics-card-label">
                                                Horas intercambiadas
                                            </span>

                                            <strong>
                                                {statistics.totalHours}
                                            </strong>

                                            <p>
                                                Horas de intercambios completados
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            )
                            : null
                }

            </div>

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