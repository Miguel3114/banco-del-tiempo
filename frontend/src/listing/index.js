import React, {
    useEffect,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import tokenService
    from "../services/token.service";

import "../static/css/listing/listing.css";


export default function Listings({
    listingType
}) {

    const [listings, setListings] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [
        selectedCategory,
        setSelectedCategory
    ] = useState("");

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);


    const jwt =
        tokenService.getLocalAccessToken();


    const isOffer =
        listingType === "OFFER";


    useEffect(() => {

        loadCategories();

    }, []);


    useEffect(() => {

        loadListings();

    }, [
        listingType,
        selectedCategory
    ]);


    function loadCategories() {

        fetch(
            "/api/categories/active",
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )

            .then((response) => {

                if (response.status === 200) {
                    return response.json();
                }

                return response
                    .json()
                    .then((data) => {

                        return Promise.reject(
                            data.message ||
                            "No se han podido cargar las categorías"
                        );
                    });
            })

            .then((data) => {

                setCategories(data);
            })

            .catch((error) => {

                setMessage(error);
            });
    }


    function loadListings() {

        setLoading(true);

        setMessage(null);


        const params =
            new URLSearchParams();


        params.append(
            "type",
            listingType
        );


        if (selectedCategory) {

            params.append(
                "categoryId",
                selectedCategory
            );
        }


        if (search.trim()) {

            params.append(
                "search",
                search.trim()
            );
        }


        fetch(
            `/api/listings?${params.toString()}`,
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )

            .then((response) => {

                if (response.status === 200) {
                    return response.json();
                }


                return response
                    .json()
                    .then((data) => {

                        return Promise.reject(
                            data.message ||
                            "No se han podido cargar los anuncios"
                        );
                    });
            })

            .then((data) => {

                setListings(data);
            })

            .catch((error) => {

                setMessage(error);
            })

            .finally(() => {

                setLoading(false);
            });
    }


    function handleSearch(event) {

        event.preventDefault();

        loadListings();
    }


    function handleClearFilters() {

        setSearch("");

        setSelectedCategory("");
    }


    return (

        <div className="listings-page">

            <div className="listings-container">


                <div className="listings-header">

                    <div>

                        <h1>

                            {
                                isOffer
                                    ? "Ofertas"
                                    : "Demandas"
                            }

                        </h1>


                        <p>

                            {
                                isOffer
                                    ? "Descubre servicios que otros miembros ofrecen a la comunidad."
                                    : "Encuentra solicitudes de otros miembros a los que puedes ayudar."
                            }

                        </p>

                    </div>


                    <Link
                        to={
                            isOffer
                                ? "/listings/new"
                                : "/requests/new"
                        }
                        className="create-listing-button"
                    >

                        {
                            isOffer
                                ? "+ Crear oferta"
                                : "+ Crear demanda"
                        }

                    </Link>

                </div>


                {message ? (

                    <Alert color="danger">
                        {message}
                    </Alert>

                ) : null}


                <div className="listings-content">


                    <aside className="listings-sidebar">

                        <h2>
                            Buscar
                        </h2>


                        <form
                            onSubmit={
                                handleSearch
                            }
                        >

                            <input
                                type="text"
                                value={search}
                                placeholder="Buscar por título..."
                                className="listing-search-input"
                                onChange={
                                    (event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                }
                            />


                            <label
                                htmlFor="category-filter"
                                className="listing-filter-label"
                            >
                                Categoría
                            </label>


                            <select
                                id="category-filter"
                                value={
                                    selectedCategory
                                }
                                className="listing-category-select"
                                onChange={
                                    (event) =>
                                        setSelectedCategory(
                                            event.target.value
                                        )
                                }
                            >

                                <option value="">
                                    Todas las categorías
                                </option>


                                {categories.map(
                                    (category) => (

                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
                                                category.id
                                            }
                                        >
                                            {
                                                category.name
                                            }
                                        </option>
                                    )
                                )}

                            </select>


                            <button
                                type="submit"
                                className="listing-search-button"
                            >
                                Buscar
                            </button>


                            <button
                                type="button"
                                className="listing-clear-button"
                                onClick={
                                    handleClearFilters
                                }
                            >
                                Limpiar filtros
                            </button>

                        </form>

                    </aside>


                    <main className="listings-main">

                        {loading ? (

                            <div className="listings-message">
                                Cargando anuncios...
                            </div>

                        ) : listings.length === 0 ? (

                            <div className="listings-empty">

                                <h2>
                                    No hay anuncios
                                </h2>


                                <p>

                                    {
                                        isOffer
                                            ? "No se han encontrado ofertas con los filtros seleccionados."
                                            : "No se han encontrado demandas con los filtros seleccionados."
                                    }

                                </p>

                            </div>

                        ) : (

                            <div className="listing-grid">

                                {listings.map(
                                    (listing) => (

                                        <article
                                            key={
                                                listing.id
                                            }
                                            className="listing-card"
                                        >

                                            <div className="listing-card-header">

                                                <span className="listing-category">

                                                    {
                                                        listing
                                                            .category
                                                            .name
                                                    }

                                                </span>


                                                <span className="listing-hours">

                                                    {
                                                        listing
                                                            .estimatedHours
                                                    }

                                                    {
                                                        listing
                                                            .estimatedHours === 1
                                                            ? " hora"
                                                            : " horas"
                                                    }

                                                </span>

                                            </div>


                                            <h2 className="listing-title">

                                                {
                                                    listing.title
                                                }

                                            </h2>


                                            <p className="listing-description">

                                                {
                                                    listing.description
                                                }

                                            </p>


                                            <div className="listing-card-footer">

                                                <div className="listing-author">

                                                    <div className="listing-author-avatar">

                                                        {
                                                            listing
                                                                .author
                                                                .firstName
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        }

                                                    </div>


                                                    <span>

                                                        {
                                                            listing
                                                                .author
                                                                .firstName
                                                        }

                                                        {" "}

                                                        {
                                                            listing
                                                                .author
                                                                .lastName
                                                        }

                                                    </span>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="listing-contact-button"
                                                    disabled
                                                    title="Disponible cuando implementemos el chat"
                                                >
                                                    Contactar
                                                </button>

                                            </div>

                                        </article>
                                    )
                                )}

                            </div>
                        )}

                    </main>

                </div>

            </div>

        </div>
    );
}