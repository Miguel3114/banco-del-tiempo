export const formValidators = {

    notEmptyValidator: {

        validate: (value) => {

            return (
                value !== null &&
                value !== undefined &&
                value.toString().trim().length > 0
            );
        },

        message:
            "El campo no puede estar vacío"
    },


    emailFormatValidator: {

        validate: (value) => {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(value);
        },

        message:
            "Debe ser un email válido"
    },


    passwordLengthValidator: {

        validate: (value) => {

            return value.length >= 8;
        },

        message:
            "La contraseña debe tener al menos 8 caracteres"
    },


    positiveIntegerValidator: {

        validate: (value) => {

            const number =
                Number(value);

            return (
                Number.isInteger(number) &&
                number > 0
            );
        },

        message:
            "Debe ser un número entero mayor que cero"
    }
};