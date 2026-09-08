import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Alert
} from "reactstrap";

import {
    Link
} from "react-router-dom";

import FormGenerator
    from "../../components/formGenerator/formGenerator";

import tokenService
    from "../../services/token.service";

import "./register.css";
import "./skillsSelector.css";

import {
    registerFormMembers
} from "./form/registerFormMembers";


export default function Register() {

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

    const [message, setMessage] =
        useState(null);

    const [imageError, setImageError] =
        useState(null);

    const registerFormRef =
        useRef();


    useEffect(() => {

        fetch(
            "/api/skills"
        )

            .then(
                async (
                    response
                ) => {

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
                            "No se han podido cargar las habilidades"
                        );
                    }


                    return data;
                }
            )

            .then(
                (data) => {

                    setSkills(
                        data
                    );
                }
            )

            .catch(
                (error) => {

                    setMessage(
                        error.message
                    );
                }
            );

    }, []);


    useEffect(() => {

        return () => {

            if (
                profileImagePreview
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
            profileImagePreview
        ) {

            URL.revokeObjectURL(
                profileImagePreview
            );
        }


        setImageError(
            null
        );

        setProfileImage(
            file
        );

        setProfileImagePreview(
            URL.createObjectURL(
                file
            )
        );
    }


    async function uploadProfileImage(
        token
    ) {

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
                            `Bearer ${token}`
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


    async function handleSubmit({
        values
    }) {

        if (
            !registerFormRef
                .current
                .validate()
        ) {
            return;
        }


        setMessage(
            null
        );


        const request = {

            ...values,

            firstName:
                values.firstName
                    .trim(),

            lastName:
                values.lastName
                    .trim(),

            email:
                values.email
                    .trim()
                    .toLowerCase(),

            biography:
                values.biography
                    .trim(),

            skillIds:
                selectedSkillIds
        };


        try {

            const response =
                await fetch(
                    "/api/auth/register",
                    {
                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        method:
                            "POST",

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
                response.status ===
                409
            ) {

                registerFormRef
                    .current
                    .setFieldErrors(
                        "email",
                        [
                            data?.message ||
                            data ||
                            "El correo electrónico ya está registrado"
                        ]
                    );

                return;
            }


            if (
                !response.ok
            ) {

                throw new Error(
                    data?.message ||
                    data ||
                    "Error al registrarse"
                );
            }


            tokenService.setUser(
                data
            );


            tokenService
                .updateLocalAccessToken(
                    data.token
                );


            if (
                !profileImage
            ) {

                window.location.href =
                    "/listings";

                return;
            }


            try {

                await uploadProfileImage(
                    data.token
                );


                window.location.href =
                    "/listings";

            } catch (error) {

                setMessage(
                    "La cuenta se ha creado correctamente, pero no se ha podido guardar la foto de perfil: " +
                    error.message
                );
            }


        } catch (error) {

            setMessage(
                error.message ||
                "No se ha podido conectar con el servidor"
            );
        }
    }


    return (

        <div className="register-page-container">

            <div className="register-card">


                {
                    message
                        ? (

                            <Alert color="danger">
                                {message}
                            </Alert>

                        )
                        : null
                }


                <div className="register-header">

                    <h1>
                        Registro
                    </h1>

                    <p>
                        Crea tu cuenta para empezar
                        a compartir tu tiempo
                        <br />
                        y aprender de los demás.
                    </p>

                </div>


                <div className="profile-image-section">

                    <div className="profile-image-circle">

                        {
                            profileImagePreview
                                ? (

                                    <img
                                        src={
                                            profileImagePreview
                                        }
                                        alt="Foto de perfil"
                                        className="profile-image-preview"
                                    />

                                )
                                : (

                                    <span className="profile-image-icon">
                                        📷
                                    </span>
                                )
                        }

                    </div>


                    <input
                        id="profileImage"
                        type="file"
                        accept="image/jpeg,image/png"
                        className="profile-image-input"
                        onChange={
                            handleProfileImage
                        }
                    />


                    <label
                        htmlFor="profileImage"
                        className="profile-image-button"
                    >

                        {
                            profileImage
                                ? "Cambiar foto"
                                : "Subir foto"
                        }

                    </label>


                    <span className="profile-image-info">

                        {
                            profileImage
                                ? profileImage.name
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


                <div className="register-form-wrapper">

                    <FormGenerator
                        ref={
                            registerFormRef
                        }
                        inputs={
                            registerFormMembers
                        }
                        onSubmit={
                            handleSubmit
                        }
                        numberOfColumns={
                            1
                        }
                        listenEnterKey
                        buttonText={
                            "Registrarse"
                        }
                        buttonClassName={
                            "register-submit-button"
                        }
                        childrenPosition={
                            -1
                        }
                    >

                        <div className="skills-container">

                            <h3 className="skills-title">

                                Habilidades que dominas

                                <span className="skills-help">
                                    {" "}
                                    (elige las que correspondan)
                                </span>

                            </h3>


                            <div className="skills-list">

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
                                                            ? "skill-card skill-card-selected"
                                                            : "skill-card"
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

                                                                <span className="skill-check">
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

                    </FormGenerator>

                </div>


                <p className="register-login-link">

                    ¿Ya tienes cuenta?{" "}

                    <Link to="/login">
                        Inicia sesión
                    </Link>

                </p>

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