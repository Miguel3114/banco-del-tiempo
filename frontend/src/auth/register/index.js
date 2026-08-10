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

    const registerFormRef =
        useRef();


    useEffect(() => {

        fetch("/api/skills")

            .then((response) => {

                if (response.status === 200) {
                    return response.json();
                }

                return Promise.reject(
                    "No se han podido cargar las habilidades"
                );
            })

            .then((data) => {

                setSkills(data);
            })

            .catch((error) => {

                setMessage(error);
            });

    }, []);


    useEffect(() => {

        return () => {

            if (profileImagePreview) {

                URL.revokeObjectURL(
                    profileImagePreview
                );
            }
        };

    }, [profileImagePreview]);


    function toggleSkill(skillId) {

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


    function handleProfileImage(event) {

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

            setMessage(
                "La foto debe estar en formato JPG o PNG"
            );

            event.target.value = "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setMessage(
                "La foto no puede superar los 5 MB"
            );

            event.target.value = "";

            return;
        }

        setMessage(null);

        setProfileImage(file);

        setProfileImagePreview(
            URL.createObjectURL(file)
        );
    }


    function uploadProfileImage(token) {

        const formData =
            new FormData();

        formData.append(
            "file",
            profileImage
        );

        return fetch(
            "/api/users/me/profile-image",
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                },

                body: formData
            }
        )

            .then((response) => {

                if (response.status === 200) {
                    return response.json();
                }

                return response
                    .text()
                    .then((error) => {

                        return Promise.reject(
                            error ||
                            "No se ha podido guardar la foto de perfil"
                        );
                    });
            });
    }


    function handleSubmit({ values }) {

        if (
            !registerFormRef.current
                .validate()
        ) {
            return;
        }

        setMessage(null);

        const request = {
            ...values,
            skillIds: selectedSkillIds
        };

        fetch(
            "/api/auth/register",
            {
                headers: {
                    "Content-Type":
                        "application/json"
                },

                method: "POST",

                body:
                    JSON.stringify(
                        request
                    )
            }
        )

            .then((response) => {

                return response
                    .json()
                    .then((data) => ({
                        status:
                            response.status,
                        data: data
                    }));
            })

            .then(
                ({ status, data }) => {

                    if (status !== 200) {

                        setMessage(
                            data.message ||
                            "Error al registrarse"
                        );

                        return;
                    }

                    tokenService.setUser(
                        data
                    );

                    tokenService
                        .updateLocalAccessToken(
                            data.token
                        );

                    if (!profileImage) {

                        window.location.href =
                            "/listings";

                        return;
                    }

                    uploadProfileImage(
                        data.token
                    )

                        .then(() => {

                            window.location.href =
                                "/listings";
                        })

                        .catch((error) => {

                            setMessage(
                                "La cuenta se ha creado correctamente, pero no se ha podido guardar la foto de perfil: " +
                                error
                            );
                        });
                }
            )

            .catch(() => {

                setMessage(
                    "No se ha podido conectar con el servidor"
                );
            });
    }


    return (
        <div className="register-page-container">

            <div className="register-card">

                {message ? (
                    <Alert color="danger">
                        {message}
                    </Alert>
                ) : null}


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

                        {profileImagePreview ? (

                            <img
                                src={
                                    profileImagePreview
                                }
                                alt="Foto de perfil"
                                className="profile-image-preview"
                            />

                        ) : (

                            <span className="profile-image-icon">
                                📷
                            </span>
                        )}

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

                        {profileImage
                            ? profileImage.name
                            : "JPG, PNG, Máx. 5MB."
                        }

                    </span>

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
                        numberOfColumns={1}
                        listenEnterKey
                        buttonText="Registrarse"
                        buttonClassName={
                            "register-submit-button"
                        }
                        childrenPosition={-1}
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

                                {skills.map(
                                    (skill) => {

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


                                                {selected ? (

                                                    <span className="skill-check">
                                                        ✓
                                                    </span>

                                                ) : null}

                                            </button>
                                        );
                                    }
                                )}

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