import React, {
    useEffect,
    useState
} from "react";

import {
    Alert,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from "reactstrap";

import tokenService
    from "../../services/token.service";

import "../../static/css/admin/adminCategories.css";


export default function CategoryListAdmin() {

    const [categories, setCategories] =
        useState([]);

    const [message, setMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        updatingCategoryId,
        setUpdatingCategoryId
    ] = useState(null);

    const [
        createModalOpen,
        setCreateModalOpen
    ] = useState(false);

    const [createName, setCreateName] =
        useState("");

    const [
        createNameError,
        setCreateNameError
    ] = useState(null);

    const [creating, setCreating] =
        useState(false);

    const [
        editModalOpen,
        setEditModalOpen
    ] = useState(false);

    const [
        editingCategory,
        setEditingCategory
    ] = useState(null);

    const [editName, setEditName] =
        useState("");

    const [
        editNameError,
        setEditNameError
    ] = useState(null);

    const [editing, setEditing] =
        useState(false);

    const jwt =
        tokenService.getLocalAccessToken();


    useEffect(() => {

        let ignore = false;


        async function loadCategories() {

            try {

                const response =
                    await fetch(
                        "/api/admin/categories",
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
                            "No se han podido cargar las categorías"
                        )
                    );
                }


                if (!ignore) {

                    setCategories(
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


        loadCategories();


        return () => {

            ignore = true;
        };

    }, [jwt]);


    function openCreateModal() {

        setCreateName("");
        setCreateNameError(null);
        setMessage(null);

        setCreateModalOpen(
            true
        );
    }


    function closeCreateModal() {

        if (creating) {
            return;
        }

        setCreateModalOpen(
            false
        );

        setCreateName("");
        setCreateNameError(null);
    }


    async function createCategory(
        event
    ) {

        event.preventDefault();

        const name =
            createName.trim();


        if (!validateName(
            name,
            setCreateNameError
        )) {
            return;
        }


        setCreating(true);
        setCreateNameError(null);
        setMessage(null);


        try {

            const response =
                await fetch(
                    "/api/admin/categories",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${jwt}`,

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                {
                                    name
                                }
                            )
                    }
                );

            const data =
                await getResponseData(
                    response
                );


            if (!response.ok) {

                if (
                    response.status === 400 ||
                    response.status === 409
                ) {

                    setCreateNameError(
                        getErrorMessage(
                            data,
                            "El nombre de la categoría no es válido"
                        )
                    );

                    return;
                }


                throw new Error(
                    getErrorMessage(
                        data,
                        "No se ha podido crear la categoría"
                    )
                );
            }


            setCategories(
                (currentCategories) => [
                    ...currentCategories,
                    data
                ]
            );

            setCreateModalOpen(
                false
            );

            setCreateName("");

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setCreating(false);
        }
    }


    function openEditModal(
        category
    ) {

        setEditingCategory(
            category
        );

        setEditName(
            category.name
        );

        setEditNameError(null);
        setMessage(null);

        setEditModalOpen(
            true
        );
    }


    function closeEditModal() {

        if (editing) {
            return;
        }

        setEditModalOpen(
            false
        );

        setEditingCategory(null);
        setEditName("");
        setEditNameError(null);
    }


    async function updateCategory(
        event
    ) {

        event.preventDefault();

        if (!editingCategory) {
            return;
        }


        const name =
            editName.trim();


        if (!validateName(
            name,
            setEditNameError
        )) {
            return;
        }


        setEditing(true);
        setEditNameError(null);
        setMessage(null);


        try {

            const response =
                await fetch(
                    `/api/admin/categories/${editingCategory.id}`,
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
                                    name
                                }
                            )
                    }
                );

            const data =
                await getResponseData(
                    response
                );


            if (!response.ok) {

                if (
                    response.status === 400 ||
                    response.status === 409
                ) {

                    setEditNameError(
                        getErrorMessage(
                            data,
                            "El nombre de la categoría no es válido"
                        )
                    );

                    return;
                }


                throw new Error(
                    getErrorMessage(
                        data,
                        "No se ha podido modificar la categoría"
                    )
                );
            }


            replaceCategory(
                data
            );

            setEditModalOpen(
                false
            );

            setEditingCategory(null);
            setEditName("");

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setEditing(false);
        }
    }


    async function updateStatus(
        category
    ) {

        const newStatus =
            category.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";


        setUpdatingCategoryId(
            category.id
        );

        setMessage(null);


        try {

            const response =
                await fetch(
                    `/api/admin/categories/${category.id}/status`,
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
                    getErrorMessage(
                        data,
                        "No se ha podido modificar el estado de la categoría"
                    )
                );
            }


            replaceCategory(
                data
            );

        } catch (error) {

            setMessage(
                error.message
            );

        } finally {

            setUpdatingCategoryId(
                null
            );
        }
    }


    function replaceCategory(
        category
    ) {

        setCategories(
            (currentCategories) =>
                currentCategories.map(
                    (currentCategory) =>
                        currentCategory.id ===
                        category.id
                            ? category
                            : currentCategory
                )
        );
    }


    return (

        <div className="admin-categories-page">

            <header className="admin-categories-header">

                <div>

                    <h1>
                        Gestión de Categorías
                    </h1>

                    <p>
                        Administración de las categorías del sistema
                    </p>

                </div>


                <div className="admin-categories-header-actions">

                    <button
                        type="button"
                        className="admin-category-create-button"
                        onClick={
                            openCreateModal
                        }
                    >
                        + Nueva Categoría
                    </button>


                    <div className="admin-category-admin-avatar">
                        A
                    </div>

                </div>

            </header>


            <div className="admin-categories-content">

                {message ? (

                    <Alert color="danger">

                        {message}

                    </Alert>

                ) : null}


                {
                    loading
                        ? (

                            <div className="admin-categories-state">
                                Cargando categorías...
                            </div>

                        )
                        : categories.length === 0
                            ? (

                                <div className="admin-categories-state">
                                    No hay categorías registradas.
                                </div>

                            )
                            : (

                                <div className="admin-categories-table-wrapper">

                                    <table className="admin-categories-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Nombre
                                                </th>

                                                <th>
                                                    Nº Anuncios
                                                </th>

                                                <th>
                                                    Estado
                                                </th>

                                                <th>
                                                    Acciones
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                categories.map(
                                                    (category) => (

                                                        <tr
                                                            key={
                                                                category.id
                                                            }
                                                        >

                                                            <td className="admin-category-id">

                                                                #
                                                                {
                                                                    category.id
                                                                }

                                                            </td>


                                                            <td className="admin-category-name">

                                                                {
                                                                    category.name
                                                                }

                                                            </td>


                                                            <td>

                                                                <span className="admin-category-listing-count">

                                                                    {
                                                                        category.listingCount
                                                                    }

                                                                </span>

                                                            </td>


                                                            <td>

                                                                <div className="admin-category-status-cell">

                                                                    <label className="admin-category-switch">

                                                                        <input
                                                                            type="checkbox"
                                                                            checked={
                                                                                category.status ===
                                                                                "ACTIVE"
                                                                            }
                                                                            disabled={
                                                                                updatingCategoryId ===
                                                                                category.id
                                                                            }
                                                                            onChange={
                                                                                () =>
                                                                                    updateStatus(
                                                                                        category
                                                                                    )
                                                                            }
                                                                        />

                                                                        <span className="admin-category-switch-slider" />

                                                                    </label>


                                                                    <span
                                                                        className={
                                                                            category.status ===
                                                                            "ACTIVE"
                                                                                ? "admin-category-status-text admin-category-status-active"
                                                                                : "admin-category-status-text admin-category-status-inactive"
                                                                        }
                                                                    >

                                                                        {
                                                                            updatingCategoryId ===
                                                                            category.id
                                                                                ? "Actualizando..."
                                                                                : category.status ===
                                                                                    "ACTIVE"
                                                                                    ? "Activa"
                                                                                    : "Inactiva"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                <button
                                                                    type="button"
                                                                    className="admin-category-edit-button"
                                                                    onClick={
                                                                        () =>
                                                                            openEditModal(
                                                                                category
                                                                            )
                                                                    }
                                                                >
                                                                    Editar
                                                                </button>

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


            <Modal
                isOpen={
                    createModalOpen
                }
                toggle={
                    closeCreateModal
                }
                centered
                className="admin-category-modal"
            >

                <ModalHeader
                    toggle={
                        closeCreateModal
                    }
                    className="admin-category-modal-header"
                >

                    <div>

                        <h2>
                            Nueva Categoría
                        </h2>

                        <p>
                            Introduce el nombre de la nueva categoría
                        </p>

                    </div>

                </ModalHeader>


                <form
                    onSubmit={
                        createCategory
                    }
                >

                    <ModalBody className="admin-category-modal-body">

                        <label
                            htmlFor="create-category-name"
                            className="admin-category-form-label"
                        >
                            Nombre de la categoría
                        </label>


                        <input
                            id="create-category-name"
                            type="text"
                            value={
                                createName
                            }
                            maxLength="100"
                            placeholder="Ej. Deportes"
                            className={
                                createNameError
                                    ? "admin-category-form-input admin-category-form-input-error"
                                    : "admin-category-form-input"
                            }
                            onChange={
                                (event) => {

                                    setCreateName(
                                        event.target.value
                                    );

                                    setCreateNameError(
                                        null
                                    );
                                }
                            }
                        />


                        {createNameError ? (

                            <span className="admin-category-field-error">

                                {
                                    createNameError
                                }

                            </span>

                        ) : null}

                    </ModalBody>


                    <ModalFooter className="admin-category-modal-footer">

                        <button
                            type="button"
                            className="admin-category-cancel-button"
                            disabled={
                                creating
                            }
                            onClick={
                                closeCreateModal
                            }
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="admin-category-save-button"
                            disabled={
                                creating
                            }
                        >

                            {
                                creating
                                    ? "Creando..."
                                    : "Crear categoría"
                            }

                        </button>

                    </ModalFooter>

                </form>

            </Modal>


            <Modal
                isOpen={
                    editModalOpen
                }
                toggle={
                    closeEditModal
                }
                centered
                className="admin-category-modal"
            >

                <ModalHeader
                    toggle={
                        closeEditModal
                    }
                    className="admin-category-modal-header"
                >

                    <div>

                        <h2>
                            Editar Categoría
                        </h2>

                        <p>
                            Modifica el nombre de la categoría
                        </p>

                    </div>

                </ModalHeader>


                <form
                    onSubmit={
                        updateCategory
                    }
                >

                    <ModalBody className="admin-category-modal-body">

                        <label
                            htmlFor="edit-category-name"
                            className="admin-category-form-label"
                        >
                            Nombre de la categoría
                        </label>


                        <input
                            id="edit-category-name"
                            type="text"
                            value={
                                editName
                            }
                            maxLength="100"
                            className={
                                editNameError
                                    ? "admin-category-form-input admin-category-form-input-error"
                                    : "admin-category-form-input"
                            }
                            onChange={
                                (event) => {

                                    setEditName(
                                        event.target.value
                                    );

                                    setEditNameError(
                                        null
                                    );
                                }
                            }
                        />


                        {editNameError ? (

                            <span className="admin-category-field-error">

                                {
                                    editNameError
                                }

                            </span>

                        ) : null}

                    </ModalBody>


                    <ModalFooter className="admin-category-modal-footer">

                        <button
                            type="button"
                            className="admin-category-cancel-button"
                            disabled={
                                editing
                            }
                            onClick={
                                closeEditModal
                            }
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="admin-category-save-button"
                            disabled={
                                editing
                            }
                        >

                            {
                                editing
                                    ? "Guardando..."
                                    : "Guardar cambios"
                            }

                        </button>

                    </ModalFooter>

                </form>

            </Modal>

        </div>
    );
}


function validateName(
    name,
    setError
) {

    if (!name) {

        setError(
            "El nombre de la categoría no puede estar vacío"
        );

        return false;
    }


    if (name.length > 100) {

        setError(
            "El nombre de la categoría no puede superar los 100 caracteres"
        );

        return false;
    }


    return true;
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