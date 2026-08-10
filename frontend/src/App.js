import jwt_decode from "jwt-decode";

import {
    Route,
    Routes
} from "react-router-dom";

import AppNavbar from "./AppNavbar";

import Login from "./auth/login";
import Logout from "./auth/logout";
import Register from "./auth/register";

import Listings from "./listing";

import PrivateRoute from "./privateRoute";

import tokenService
    from "./services/token.service";

function App() {

    const jwt =
        tokenService.getLocalAccessToken();

    let roles = [];

    if (jwt) {
        roles = getRolesFromJWT(jwt);
    }

    function getRolesFromJWT(jwt) {

        return jwt_decode(jwt).authorities;
    }

    let publicRoutes = <></>;
    let userRoutes = <></>;
    let adminRoutes = <></>;

    roles.forEach((role) => {

        if (role === "ADMIN") {

            adminRoutes = (
                <>
                </>
            );
        }
    });

    if (!jwt) {

        publicRoutes = (
            <>
                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />
            </>
        );

    } else {

        userRoutes = (
            <>
                <Route
                    path="/logout"
                    element={<Logout />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />
            </>
        );
    }

    return (
        <div>

            <AppNavbar />

            <Routes>

                <Route
                    path="/"
                    element={
                        jwt
                            ? (
                                <PrivateRoute>
                                    <Listings />
                                </PrivateRoute>
                            )
                            : <Login />
                    }
                />

                <Route
                    path="/listings"
                    element={
                        <PrivateRoute>
                            <Listings />
                        </PrivateRoute>
                    }
                />

                {publicRoutes}

                {userRoutes}

                {adminRoutes}

            </Routes>

        </div>
    );
}

export default App;