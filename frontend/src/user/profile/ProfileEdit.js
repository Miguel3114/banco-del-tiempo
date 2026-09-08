import React, {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Alert,
    Spinner
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import FormGenerator
    from "../../components/formGenerator/formGenerator";

import tokenService
    from "../../services/token.service";

import {
    getProfileEditForm
} from "./form/profileEditForm";

import "../../static/css/user/profileEdit.css";


export default function ProfileEdit() {

    const [user, setUser] =
        useState(null);

    const [skills, setSkills] =
        useState([]);

    const [
        selectedSkillIds,
        setSelectedSkillIds
    ] = useState([]);

    const [
        profileImage,
        setProfileImage
    ] = useState(null);

    const [
        profileImagePreview,
        setProfileImagePreview
    ] = useState(null);

    const [
        removeProfileImage,
        setRemoveProfileImage
    ] = useState(false);

    const [message, setMessage] =
        useState(null);

    const [saveError, setSaveError] =
        useState(null);

    const [imageError, setImageError] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const profileFormRef =
        useRef();

    const imageInputRef =
        useRef();

    const jwt =
        tokenService.getLocalAccessToken();


    const formInputs =
        useMemo(
            () =>
                user
                    ? getProfileEditForm(
                        user
                    )
                    : [],
            [user]
        );


    useEffect(() => {

        async function loadData() {

            try {

                const [
                    userResponse,
                    skillsResponse
                ] =
                    await Promise.all([

                        fetch(
                            "/api/users/me",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${jwt}`
                                }
                            }
                        ),

                        fetch(
                            "/api/skills",
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${jwt}`
                                }
                            }
                        )
                    ]);


                const userData =
                    await getResponseData(
                        userResponse
                    );

                const skillsData =
                    await getResponseData(
                        skillsResponse
                    );


                if (
                    !userResponse.ok
                ) {

                    throw new Error(
                        userData?.message ||
                        userData ||
                        "No se ha podido cargar el perfil"
                    );
                }


                if (
                    !skillsResponse.ok
                ) {

                    throw new Error(
                        skillsData?.message ||
                        skillsData ||
                        "No se han podido cargar las habilidades"
                    );
                }


                setUser(
                    userData
                );

                setSkills(
                    skillsData
                );

                setSelectedSkillIds(
                    userData.skills
                        ? userData.skills.map(
                            (skill) =>
                                skill.id
                        )
                        : []
                );


            } catch (error) {

                setMessage(
                    error.message
                );

            } finally {

                setLoading(
                    false
                );
            }
        }


        loadData();

    }, [jwt]);


    useEffect(() => {

        return () => {

            if (
                profileImagePreview &&
                profileImagePreview
                    .startsWith(
                        "blob:"
                    )
            ) {

                URL.revokeObjectURL(
                    profileImagePreview
                );
            }
        };

    }, [profileImagePreview]);


    function toggleSkill(
        skillId
    ) {

        if (
            selectedSkillIds.includes(
                skillId
            )
        ) {

            setSelectedSkillIds(
                selectedSkillIds.filter(
                    (id) =>
                        id !== skillId
                )
            );

        } else {

            setSelectedSkillIds([
                ...selectedSkillIds,
                skillId
            ]);
        }
    }


    function handleProfileImage(
        event
    ) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        const validTypes = [
            "image/jpeg",
            "image/png"
        ];


        if (
            !validTypes.includes(
                file.type
            )
        ) {

            setImageError(
                "La foto debe estar en formato JPG o PNG"
            );

            event.target.value =
                "";

            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setImageError(
                "La foto no puede superar los 5 MB"
            );

            event.target.value =
                "";

            return;
        }


        if (
            profileImagePreview &&
            profileImagePreview
                .startsWith(
                    "blob:"
                )
        ) {

            URL.revokeObjectURL(
                profileImagePreview
            );
        }


        setImageError(
            null
        );

        setSaveError(
            null
        );

        setProfileImage(
            file
        );

        setRemoveProfileImage(
            false
        );

        setProfileImagePreview(
            URL.createObjectURL(
                file
            )
        );
    }


    function handleRemoveProfileImage() {

        if (
            profileImagePreview &&
            profileImagePreview
                .startsWith(
                    "blob:"
                )
        ) {

            URL.revokeObjectURL(
                profileImagePreview
            );
        }


        setProfileImage(
            null
        );

        setProfileImagePreview(
            null
        );

        setRemoveProfileImage(
            Boolean(
                user.profileImageUrl
            )
        );

        setImageError(
            null
        );

        setSaveError(
            null
        );


        if (
            imageInputRef.current
        ) {

            imageInputRef
                .current
                .value =
                "";
        }
    }


    async function uploadProfileImage() {

        const formData =
            new FormData();


        formData.append(
            "file",
            profileImage
        );


        const response =
            await fetch(
                "/api/users/me/profile-image",
                {
                    method:
                        "POST",

                    headers: {
                        Authorization:
                            `Bearer ${jwt}`
                    },

                    body:
                        formData
                }
            );


        const data =
            await getResponseData(
                response
            );


        if (
            !response.ok
        ) {

            throw new Error(
                data?.message ||
                data ||
                "No se ha podido guardar la foto de perfil"
            );
        }


        return data;
    }


    async function deleteProfileImage() {

        const response =
            await fetch(
                "/api/users/me/profile-image",
                {
                    method:
                        "DELETE",

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


        if (
            !response.ok
        ) {

            throw new Error(
                data?.message ||
                data ||
                "No se ha podido eliminar la foto de perfil"
            );
        }


        return data;
    }


    async function updateProfile(
        request
    ) {

        const response =
            await fetch(
                "/api/users/me",
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${jwt}`
                    },

                    body:
                        JSON.stringify(
                            request
                        )
                }
            );


        const data =
            await getResponseData(
                response
            );


        if (
            !response.ok
        ) {

            const error =
                new Error(
                    data?.message ||
                    data ||
                    "No se ha podido actualizar el perfil"
                );


            error.status =
                response.status;


            throw error;
        }


        return data;
    }


    async function handleSubmit({
        values
    }) {

        if (
            !profileFormRef
                .current
                .validate()
        ) {
            return;
        }


        setMessage(
            null
        );

        setSaveError(
            null
        );

        setSaving(
            true
        );


        const newEmail =
            values.email
                .trim()
                .toLowerCase();

        const currentEmail =
            user.email
                .trim()
                .toLowerCase();

        const emailChanged =
            newEmail !==
            currentEmail;


        const request = {

            firstName:
                values.firstName
                    .trim(),

            lastName:
                values.lastName
                    .trim(),

            email:
                newEmail,

            biography:
                values.biography
                    .trim(),

            skillIds:
                selectedSkillIds,

            password:
                values.password
                    .trim()
                    .length > 0
                    ? values.password
                    : null
        };


        try {

            if (
                emailChanged
            ) {

                if (
                    profileImage
                ) {

                    await uploadProfileImage();

                } else if (
                    removeProfileImage
                ) {

                    await deleteProfileImage();
                }
            }


            await updateProfile(
                request
            );


            if (
                !emailChanged
            ) {

                if (
                    profileImage
                ) {

                    await uploadProfileImage();

                } else if (
                    removeProfileImage
                ) {

                    await deleteProfileImage();
                }
            }


            if (
                emailChanged
            ) {

                tokenService
                    .removeUser();


                window.location.href =
                    "/login";

                return;
            }


            window.location.href =
                "/profile";


        } catch (error) {

            if (
                error.status ===
                409
            ) {

                profileFormRef
                    .current
                    .setFieldErrors(
                        "email",
                        [
                            error.message ||
                            "El correo electrónico ya está registrado"
                        ]
                    );

            } else {

                setSaveError(
                    error.message
                );
            }


            setSaving(
                false
            );
        }
    }


    if (loading) {

        return (

            <div className="profile-edit-page">

                <div className="profile-edit-loading">

                    <Spinner />

                </div>

            </div>
        );
    }


    if (!user) {

        return (

            <div className="profile-edit-page">

                <div className="profile-edit-card">

                    <Alert color="danger">

                        {
                            message ||
                            "No se ha podido cargar el perfil"
                        }

                    </Alert>


                    <Link
                        to="/profile"
                        className="profile-edit-cancel"
                    >
                        Volver al perfil
                    </Link>

                </div>

            </div>
        );
    }


    return (

        <div className="profile-edit-page">

            <div className="profile-edit-card">


                {
                    message
                        ? (

                            <Alert color="danger">
                                {message}
                            </Alert>

                        )
                        : null
                }


                <div className="profile-edit-header">

                    <h1>
                        Editar Perfil
                    </h1>

                    <p>
                        Actualiza tu información personal
                        y tus habilidades.
                    </p>

                </div>


                <div className="profile-edit-image-section">

                    <div className="profile-edit-image-circle">

                        {
                            profileImagePreview
                                ? (

                                    <img
                                        src={
                                            profileImagePreview
                                        }
                                        alt="Foto de perfil"
                                        className="profile-edit-image-preview"
                                    />

                                )
                                : (
                                    !removeProfileImage &&
                                    user.profileImageUrl
                                )
                                    ? (

                                        <img
                                            src={
                                                user.profileImageUrl
                                            }
                                            alt="Foto de perfil"
                                            className="profile-edit-image-preview"
                                        />

                                    )
                                    : (

                                        <span className="profile-edit-image-initials">

                                            {
                                                user.firstName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()
                                            }

                                            {
                                                user.lastName
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase()
                                            }

                                        </span>
                                    )
                        }

                    </div>


                    <input
                        ref={
                            imageInputRef
                        }
                        id="profileImage"
                        type="file"
                        accept="image/jpeg,image/png"
                        className="profile-edit-image-input"
                        onChange={
                            handleProfileImage
                        }
                    />


                    <label
                        htmlFor="profileImage"
                        className="profile-edit-image-button"
                    >
                        Cambiar foto
                    </label>


                    {
                        (
                            profileImagePreview ||
                            (
                                user.profileImageUrl &&
                                !removeProfileImage
                            )
                        )
                            ? (

                                <button
                                    type="button"
                                    className="profile-edit-image-remove"
                                    onClick={
                                        handleRemoveProfileImage
                                    }
                                >
                                    Eliminar foto
                                </button>

                            )
                            : null
                    }


                    <span className="profile-edit-image-info">

                        {
                            profileImage
                                ? profileImage.name
                                : removeProfileImage
                                    ? "Sin foto de perfil"
                                    : "JPG, PNG, Máx. 5MB."
                        }

                    </span>


                    {
                        imageError
                            ? (

                                <span className="class-error-message">
                                    {imageError}
                                </span>

                            )
                            : null
                    }

                </div>


                <div className="profile-edit-form-wrapper">

                    <FormGenerator
                        ref={
                            profileFormRef
                        }
                        inputs={
                            formInputs
                        }
                        onSubmit={
                            handleSubmit
                        }
                        numberOfColumns={
                            1
                        }
                        buttonText={
                            saving
                                ? "Guardando..."
                                : "Guardar cambios"
                        }
                        buttonClassName={
                            "profile-edit-submit-button"
                        }
                        childrenPosition={
                            -1
                        }
                    >

                        <>

                            <div className="profile-edit-skills">

                                <h3>

                                    Habilidades que dominas

                                    <span>
                                        {" "}
                                        (elige las que correspondan)
                                    </span>

                                </h3>


                                <div className="profile-edit-skills-list">

                                    {
                                        skills.map(
                                            (
                                                skill
                                            ) => {

                                                const selected =
                                                    selectedSkillIds
                                                        .includes(
                                                            skill.id
                                                        );


                                                return (

                                                    <button
                                                        type="button"
                                                        key={
                                                            skill.id
                                                        }
                                                        className={
                                                            selected
                                                                ? "profile-edit-skill profile-edit-skill-selected"
                                                                : "profile-edit-skill"
                                                        }
                                                        onClick={
                                                            () =>
                                                                toggleSkill(
                                                                    skill.id
                                                                )
                                                        }
                                                    >

                                                        <span>
                                                            {
                                                                skill.name
                                                            }
                                                        </span>


                                                        {
                                                            selected
                                                                ? (

                                                                    <span className="profile-edit-skill-check">
                                                                        ✓
                                                                    </span>

                                                                )
                                                                : null
                                                        }

                                                    </button>
                                                );
                                            }
                                        )
                                    }

                                </div>

                            </div>


                            {
                                saveError
                                    ? (

                                        <Alert
                                            color="danger"
                                            className="profile-edit-save-error"
                                        >
                                            {saveError}
                                        </Alert>

                                    )
                                    : null
                            }

                        </>

                    </FormGenerator>

                </div>


                <Link
                    to="/profile"
                    className="profile-edit-cancel"
                >
                    Cancelar
                </Link>

            </div>

        </div>
    );
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