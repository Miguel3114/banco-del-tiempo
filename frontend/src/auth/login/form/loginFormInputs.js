import {
    formValidators
} from "../../../validators/formValidators";


export const loginFormInputs = [

    {
        tag: "Correo electrónico",
        name: "email",
        type: "email",
        placeholder:
            "Ingresa tu correo electrónico",
        defaultValue: "",
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
        defaultValue: "",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator
        ]
    }

];