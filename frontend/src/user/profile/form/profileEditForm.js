import {
    formValidators
} from "../../../validators/formValidators";


export function getProfileEditForm(user) {

    return [

        {
            tag: "Nombre",
            name: "firstName",
            type: "text",
            placeholder: "Introduce tu nombre",
            defaultValue: user.firstName,
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
            placeholder: "Introduce tus apellidos",
            defaultValue: user.lastName,
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
            placeholder: "Introduce tu correo electrónico",
            defaultValue: user.email,
            maxLength: 150,
            isRequired: true,
            validators: [
                formValidators.notEmptyValidator,
                formValidators.emailFormatValidator
            ]
        },

        {
            tag: "Biografía",
            name: "biography",
            type: "textarea",
            placeholder: "Cuéntanos un poco sobre ti...",
            defaultValue: user.biography || "",
            maxLength: 1000,
            isRequired: false,
            validators: []
        },

        {
            tag: "Nueva contraseña",
            name: "password",
            type: "password",
            placeholder: "Déjala vacía para mantener la actual",
            defaultValue: "",
            maxLength: 100,
            isRequired: false,
            validators: [
                formValidators.optionalPasswordLengthValidator
            ]
        }

    ];
}