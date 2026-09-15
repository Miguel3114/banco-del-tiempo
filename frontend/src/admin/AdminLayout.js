import React from "react";

import {
    Link
} from "react-router-dom";

import "../static/css/admin/adminLayout.css";


export default function AdminLayout({
    children,
    activeSection
}) {

    return (

        <div className="admin-layout">

            <aside className="admin-sidebar">

                <div className="admin-sidebar-brand">

                    <div className="admin-sidebar-logo">

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


                    <div>

                        <span className="admin-sidebar-brand-small">
                            Panel de Control
                        </span>

                        <strong>
                            Banco del Tiempo
                        </strong>

                    </div>

                </div>


                <nav className="admin-sidebar-menu">

                    <span className="admin-sidebar-link admin-sidebar-link-disabled">

                        <AdminIcon type="statistics" />

                        <span>
                            Estadísticas
                        </span>

                    </span>


                    <Link
                        to="/admin/users"
                        className={
                            activeSection === "users"
                                ? "admin-sidebar-link admin-sidebar-link-active"
                                : "admin-sidebar-link"
                        }
                    >

                        <AdminIcon type="users" />

                        <span>
                            Usuarios
                        </span>

                        {
                            activeSection === "users"
                                ? (
                                    <span className="admin-sidebar-chevron">
                                        ›
                                    </span>
                                )
                                : null
                        }

                    </Link>


                    <Link
                        to="/admin/categories"
                        className={
                            activeSection === "categories"
                                ? "admin-sidebar-link admin-sidebar-link-active"
                                : "admin-sidebar-link"
                        }
                    >

                        <AdminIcon type="categories" />

                        <span>
                            Categorías
                        </span>

                        {
                            activeSection === "categories"
                                ? (
                                    <span className="admin-sidebar-chevron">
                                        ›
                                    </span>
                                )
                                : null
                        }

                    </Link>


                    <span className="admin-sidebar-link admin-sidebar-link-disabled">

                        <AdminIcon type="listings" />

                        <span>
                            Anuncios
                        </span>

                    </span>


                    <span className="admin-sidebar-link admin-sidebar-link-disabled">

                        <AdminIcon type="reviews" />

                        <span>
                            Valoraciones
                        </span>

                    </span>

                </nav>


                <div className="admin-sidebar-footer">

                    <Link
                        to="/logout"
                        className="admin-sidebar-logout"
                    >

                        <AdminIcon type="logout" />

                        <span>
                            Cerrar sesión
                        </span>

                    </Link>

                </div>

            </aside>


            <main className="admin-main">

                {children}

            </main>

        </div>
    );
}


function AdminIcon({
    type
}) {

    if (type === "statistics") {

        return (

            <svg
                className="admin-sidebar-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path d="M5 19V9" />
                <path d="M12 19V5" />
                <path d="M19 19v-7" />

            </svg>
        );
    }


    if (type === "users") {

        return (

            <svg
                className="admin-sidebar-icon"
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
        );
    }


    if (type === "categories") {

        return (

            <svg
                className="admin-sidebar-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path d="M3 8V4h7l9 9-6 6-10-10Z" />

                <circle
                    cx="7.5"
                    cy="7.5"
                    r="1"
                />

            </svg>
        );
    }


    if (type === "listings") {

        return (

            <svg
                className="admin-sidebar-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path d="M4 12 20 6v12L4 12Z" />
                <path d="M7 13.5 8.5 18" />

            </svg>
        );
    }


    if (type === "reviews") {

        return (

            <svg
                className="admin-sidebar-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >

                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />

            </svg>
        );
    }


    return (

        <svg
            className="admin-sidebar-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >

            <path d="M14 5h5v14h-5" />
            <path d="m10 8-4 4 4 4" />
            <path d="M6 12h10" />

        </svg>
    );
}