import {
    formValidators
} from "../../../validators/formValidators";


export function getProfileEditForm(user) {

    return [

        {
            tag: "Nombre",
            name: "firstName",
            type: "text",
            defaultValue:
                user.firstName || "",
            placeholder:
                "Ingresa tu nombre",
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
            defaultValue:
                user.lastName || "",
            placeholder:
                "Ingresa tus apellidos",
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
            defaultValue:
                user.email || "",
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
            tag: "Biografía",
            name: "biography",
            type: "textarea",
            defaultValue:
                user.biography || "",
            placeholder:
                "Cuéntanos un poco sobre ti...",
            maxLength: 1000,
            isRequired: false,
            validators: []
        },

        {
            tag: "Nueva contraseña",
            name: "password",
            type: "password",
            defaultValue: "",
            placeholder:
                "Déjala vacía para mantener la actual",
            maxLength: 100,
            isRequired: false,
            validators: [
                formValidators
                    .optionalPasswordLengthValidator
            ]
        }

    ];
}