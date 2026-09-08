import React, {
    useEffect,
    useState
} from "react";

import {
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarToggler,
    NavItem,
    NavLink,
    UncontrolledDropdown
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import jwt_decode
    from "jwt-decode";

import tokenService
    from "./services/token.service";

import reloj_logo
    from "./static/images/reloj_logo.jpg";

import "./AppNavbar.css";


function AppNavbar() {

    const [roles, setRoles] =
        useState([]);

    const [user, setUser] =
        useState(null);

    const [hasUnread, setHasUnread] =
        useState(false);

    const [collapsed, setCollapsed] =
        useState(true);

    const jwt =
        tokenService.getLocalAccessToken();


    function toggleNavbar() {

        setCollapsed(
            !collapsed
        );
    }


    useEffect(() => {

        if (!jwt) {

            setRoles([]);
            setUser(null);
            setHasUnread(false);

            return;
        }


        setRoles(
            jwt_decode(jwt).authorities
        );


        loadCurrentUser();
        loadUnreadChats();


        const interval =
            setInterval(
                () => {

                    loadUnreadChats();

                },
                3000
            );


        return () => {

            clearInterval(
                interval
            );
        };

    }, [jwt]);


    async function loadCurrentUser() {

        try {

            const response =
                await fetch(
                    "/api/users/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${jwt}`
                        }
                    }
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            setUser(
                data
            );

        } catch {
        }
    }


    async function loadUnreadChats() {

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


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                setHasUnread(false);

                return;
            }


            setHasUnread(
                data.some(
                    (chat) =>
                        chat.unread === true
                )
            );

        } catch {
        }
    }


    function getInitials() {

        if (!user) {
            return "?";
        }


        const firstName =
            user.firstName || "";

        const lastName =
            user.lastName || "";


        return (
            firstName.charAt(0) +
            lastName.charAt(0)
        ).toUpperCase();
    }


    let publicLinks =
        <></>;

    let userLinks =
        <></>;

    let userMenu =
        <></>;

    let adminLinks =
        <></>;


    roles.forEach(
        (role) => {

            if (
                role === "ADMIN"
            ) {

                adminLinks = (
                    <>
                    </>
                );
            }
        }
    );


    if (!jwt) {

        publicLinks = (
            <>

                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/register"
                        className="auth-navbar-link"
                    >
                        Registrarse
                    </NavLink>

                </NavItem>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/login"
                        className="auth-navbar-link"
                    >
                        Iniciar sesión
                    </NavLink>

                </NavItem>

            </>
        );

    } else {

        userLinks = (
            <>

                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/listings"
                        className="app-navbar-main-link"
                    >
                        Ofertas
                    </NavLink>

                </NavItem>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/requests"
                        className="app-navbar-main-link"
                    >
                        Demandas
                    </NavLink>

                </NavItem>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/chats"
                        className="app-navbar-main-link app-navbar-mailbox-link"
                    >

                        <span>
                            Buzón
                        </span>


                        {
                            hasUnread
                                ? (

                                    <span
                                        className="app-navbar-unread-dot"
                                        title="Tienes mensajes sin leer"
                                    />

                                )
                                : null
                        }

                    </NavLink>

                </NavItem>

            </>
        );


        userMenu = (
            <UncontrolledDropdown
                nav
                inNavbar
            >

                <DropdownToggle
                    nav
                    caret
                    className="app-navbar-user-toggle"
                >

                    <div className="app-navbar-avatar">

                        {
                            user?.profileImageUrl
                                ? (

                                    <img
                                        src={
                                            user.profileImageUrl
                                        }
                                        alt="Foto de perfil"
                                        className="app-navbar-avatar-image"
                                    />

                                )
                                : (

                                    <span>
                                        {
                                            getInitials()
                                        }
                                    </span>
                                )
                        }

                    </div>

                </DropdownToggle>


                <DropdownMenu
                    end
                    className="app-navbar-dropdown"
                >

                    <DropdownItem
                        tag={Link}
                        to="/profile"
                    >
                        Mi perfil
                    </DropdownItem>


                    <DropdownItem
                        tag={Link}
                        to="/mylistings"
                    >
                        Mis anuncios
                    </DropdownItem>


                    <DropdownItem
                        tag={Link}
                        to="/exchanges"
                    >
                        Mis intercambios
                    </DropdownItem>


                    <DropdownItem divider />


                    <DropdownItem
                        tag={Link}
                        to="/logout"
                    >
                        Cerrar sesión
                    </DropdownItem>

                </DropdownMenu>

            </UncontrolledDropdown>
        );
    }


    return (

        <Navbar
            expand="md"
            light
            className="app-navbar"
        >

            <NavbarBrand
                tag={Link}
                to="/"
                className="app-navbar-brand"
            >

                <img
                    src={
                        reloj_logo
                    }
                    alt="Banco del Tiempo"
                    className="app-navbar-logo"
                />

                <span>
                    Banco del Tiempo
                </span>

            </NavbarBrand>


            <NavbarToggler
                onClick={
                    toggleNavbar
                }
            />


            <Collapse
                isOpen={
                    !collapsed
                }
                navbar
            >

                <Nav
                    className="app-navbar-center"
                    navbar
                >

                    {userLinks}
                    {adminLinks}

                </Nav>


                <Nav
                    className="ms-auto app-navbar-right"
                    navbar
                >

                    {publicLinks}
                    {userMenu}

                </Nav>

            </Collapse>

        </Navbar>
    );
}


export default AppNavbar;