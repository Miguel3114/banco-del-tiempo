import {
    formValidators
} from "../../../validators/formValidators";


export const registerFormMembers = [

    {
        tag: "Nombre",
        name: "firstName",
        type: "text",
        placeholder: "Ingresa tu nombre",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator
        ]
    },

    {
        tag: "Apellidos",
        name: "lastName",
        type: "text",
        placeholder: "Ingresa tus apellidos",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator
        ]
    },

    {
        tag: "Correo electrónico",
        name: "email",
        type: "email",
        placeholder:
            "Ingresa tu correo electrónico",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator,
            formValidators.emailFormatValidator
        ]
    },

    {
        tag: "Contraseña",
        name: "password",
        type: "password",
        placeholder:
            "Ingresa tu contraseña",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator
        ]
    },

    {
        tag: "Biografía",
        name: "biography",
        type: "textarea",
        placeholder:
            "Cuéntanos un poco sobre ti...",
        maxLength: 300,
        isRequired: false,
        validators: []
    }

];