import {
    formValidators
} from "../../../validators/formValidators";

export const loginFormInputs = [

    {
        tag: "Correo electrónico",
        name: "email",
        type: "email",
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
        defaultValue: "",
        isRequired: true,
        validators: [
            formValidators.notEmptyValidator
        ]
    }
];