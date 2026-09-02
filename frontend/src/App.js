import jwt_decode
    from "jwt-decode";

import {
    Route,
    Routes
} from "react-router-dom";

import AppNavbar
    from "./AppNavbar";

import Login
    from "./auth/login";

import Logout
    from "./auth/logout";

import Register
    from "./auth/register";

import Listings
    from "./listing";

import ListingCreate
    from "./listing/ListingCreate";

import ListingDetails
    from "./listing/ListingDetails";

import ListingEdit
    from "./listing/ListingEdit";

import MyListings
    from "./listing/MyListings";

import Profile
    from "./user/profile/Profile";

import ProfileEdit
    from "./user/profile/ProfileEdit";

import PublicProfile
    from "./user/profile/PublicProfile";

import PrivateRoute
    from "./privateRoute";

import tokenService
    from "./services/token.service";


function App() {

    const jwt =
        tokenService.getLocalAccessToken();

    let roles = [];

    if (jwt) {
        roles = getRolesFromJWT(jwt);
    }


    function getRolesFromJWT(token) {

        return jwt_decode(token).authorities;
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
                    element={
                        <Register />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

            </>
        );

    } else {

        userRoutes = (
            <>

                <Route
                    path="/logout"
                    element={
                        <Logout />
                    }
                />

                <Route
                    path="/listings"
                    element={
                        <PrivateRoute>
                            <Listings listingType="OFFER" />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/requests"
                    element={
                        <PrivateRoute>
                            <Listings listingType="REQUEST" />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/listings/new"
                    element={
                        <PrivateRoute>
                            <ListingCreate listingType="OFFER" />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/requests/new"
                    element={
                        <PrivateRoute>
                            <ListingCreate listingType="REQUEST" />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/listings/:id"
                    element={
                        <PrivateRoute>
                            <ListingDetails />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/requests/:id"
                    element={
                        <PrivateRoute>
                            <ListingDetails />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/listings/:id/edit"
                    element={
                        <PrivateRoute>
                            <ListingEdit />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/requests/:id/edit"
                    element={
                        <PrivateRoute>
                            <ListingEdit />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/mylistings"
                    element={
                        <PrivateRoute>
                            <MyListings />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile/edit"
                    element={
                        <PrivateRoute>
                            <ProfileEdit />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/users/:id"
                    element={
                        <PrivateRoute>
                            <PublicProfile />
                        </PrivateRoute>
                    }
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
                                    <Listings listingType="OFFER" />
                                </PrivateRoute>
                            )
                            : (
                                <Login />
                            )
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