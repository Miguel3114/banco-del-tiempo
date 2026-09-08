import {
    formValidators
} from "../../../validators/formValidators";


export const registerFormMembers = [

    {
        tag: "Nombre",
        name: "firstName",
        type: "text",
        placeholder: "Ingresa tu nombre",
        maxLength: 50,
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
        maxLength: 100,
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
        maxLength: 150,
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
        maxLength: 100,
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator,
            formValidators.passwordLengthValidator
        ]
    },

    {
        tag: "Biografía",
        name: "biography",
        type: "textarea",
        placeholder:
            "Cuéntanos un poco sobre ti...",
        maxLength: 1000,
        isRequired: false,
        validators: []
    }

];