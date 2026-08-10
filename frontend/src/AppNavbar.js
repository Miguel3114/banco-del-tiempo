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

import jwt_decode from "jwt-decode";

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

            setRoles(
                jwt_decode(jwt).authorities
            );

            setEmail(
                jwt_decode(jwt).sub
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
                    >
                        Ofertas
                    </NavLink>

                </NavItem>

            </>
        );


        userLogout = (
            <>

                <NavbarText
                    className="me-3"
                >
                    {email}
                </NavbarText>


                <NavItem>

                    <NavLink
                        tag={Link}
                        to="/logout"
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
            >

                <Nav
                    className="me-auto"
                    navbar
                >

                    {userLinks}
                    {adminLinks}

                </Nav>


                <Nav
                    className="ms-auto"
                    navbar
                >

                    {publicLinks}
                    {userLogout}

                </Nav>

            </Collapse>

        </Navbar>
    );
}


export default AppNavbar;