import React, {
    useEffect,
    useState
} from "react";

import {
    Collapse,
    Nav,
    Navbar,
    NavbarBrand,
    NavbarText,
    NavbarToggler,
    NavItem,
    NavLink
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

    const [email, setEmail] =
        useState("");

    const [collapsed, setCollapsed] =
        useState(true);


    const jwt =
        tokenService.getLocalAccessToken();


    const toggleNavbar =
        () => setCollapsed(!collapsed);


    useEffect(() => {

        if (jwt) {

            const decodedToken =
                jwt_decode(jwt);

            setRoles(
                decodedToken.authorities
            );

            setEmail(
                decodedToken.sub
            );
        }

    }, [jwt]);


    let publicLinks = <></>;
    let userLinks = <></>;
    let userLogout = <></>;
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


        userLogout = (
            <>

                <NavbarText
                    className="navbar-user-email"
                >
                    {email}
                </NavbarText>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/logout"
                        className="navbar-logout-link"
                    >
                        Cerrar sesión
                    </NavLink>

                </NavItem>

            </>
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

                {jwt ? (

                    <Nav
                        className="navbar-center-links"
                        navbar
                    >

                        {userLinks}

                    </Nav>

                ) : null}


                <Nav
                    className="navbar-right-links"
                    navbar
                >

                    {publicLinks}
                    {userLogout}

                </Nav>


                {adminLinks}

            </Collapse>

        </Navbar>
    );
}


export default AppNavbar;