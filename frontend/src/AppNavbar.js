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

    const [collapsed, setCollapsed] =
        useState(true);


    const jwt =
        tokenService.getLocalAccessToken();

    const storedUser =
        tokenService.getUser();


    const toggleNavbar =
        () => setCollapsed(!collapsed);


    useEffect(() => {

        if (!jwt) {
            return;
        }

        const decodedToken =
            jwt_decode(jwt);

        setRoles(
            decodedToken.authorities
        );


        fetch(
            "/api/users/me",
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )
            .then((response) => {

                if (!response.ok) {
                    throw new Error();
                }

                return response.json();
            })

            .then((data) => {

                setUser(data);
            })

            .catch(() => {

                setUser(null);
            });

    }, [jwt]);


    function getUserInitials() {

        if (
            user?.firstName &&
            user?.lastName
        ) {

            return (
                user.firstName
                    .charAt(0)
                    .toUpperCase()
                +
                user.lastName
                    .charAt(0)
                    .toUpperCase()
            );
        }


        if (user?.firstName) {

            return user.firstName
                .charAt(0)
                .toUpperCase();
        }


        if (storedUser?.email) {

            return storedUser.email
                .charAt(0)
                .toUpperCase();
        }


        return "?";
    }


    let publicLinks = <></>;

    let userLinks = <></>;

    let userMenu = <></>;

    let adminLinks = <></>;


    roles.forEach((role) => {

        if (role === "ADMIN") {

            adminLinks = (
                <>
                </>
            );
        }
    });


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
                        className="main-navbar-link"
                    >
                        Ofertas
                    </NavLink>

                </NavItem>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/requests"
                        className="main-navbar-link"
                    >
                        Demandas
                    </NavLink>

                </NavItem>

            </>
        );


        userMenu = (

            <UncontrolledDropdown
                nav
                inNavbar
                className="user-dropdown"
            >

                <DropdownToggle
                    nav
                    className="user-avatar-toggle"
                >

                    {
                        user?.profileImageUrl
                            ? (

                                <img
                                    src={
                                        user.profileImageUrl
                                    }
                                    alt="Perfil"
                                    className="navbar-user-avatar"
                                />

                            )
                            : (

                                <div className="navbar-user-avatar-placeholder">

                                    {
                                        getUserInitials()
                                    }

                                </div>
                            )
                    }


                    <span className="navbar-avatar-chevron">
                        ▾
                    </span>

                </DropdownToggle>


                <DropdownMenu
                    end
                    className="user-dropdown-menu"
                >

                    <DropdownItem
                        tag={Link}
                        to="/profile"
                        className="user-dropdown-item"
                    >
                        Mi perfil
                    </DropdownItem>


                    <DropdownItem
                        tag={Link}
                        to="/mylistings"
                        className="user-dropdown-item"
                    >
                        Mis anuncios
                    </DropdownItem>


                    <DropdownItem
                        disabled
                        className="user-dropdown-item"
                    >
                        Mis intercambios
                    </DropdownItem>


                    <DropdownItem divider />


                    <DropdownItem
                        tag={Link}
                        to="/logout"
                        className="user-dropdown-item user-dropdown-logout"
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
                href="/"
                className="app-navbar-brand"
            >

                <img
                    src={reloj_logo}
                    alt="Banco del Tiempo"
                    className="app-navbar-logo"
                />

                <span>
                    Banco del Tiempo
                </span>

            </NavbarBrand>


            <NavbarToggler
                onClick={toggleNavbar}
            />


            <Collapse
                isOpen={!collapsed}
                navbar
                className="app-navbar-collapse"
            >

                {
                    jwt
                        ? (

                            <Nav
                                className="navbar-center-links"
                                navbar
                            >

                                {userLinks}

                            </Nav>

                        )
                        : null
                }


                <Nav
                    className="navbar-right-links"
                    navbar
                >

                    {publicLinks}

                    {userMenu}

                </Nav>


                {adminLinks}

            </Collapse>

        </Navbar>
    );
}


export default AppNavbar;