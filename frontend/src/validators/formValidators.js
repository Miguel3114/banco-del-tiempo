export const formValidators = {

    notEmptyValidator: {
        validate: (value) => {
            return value.trim().length > 0;
        },
        message: "El campo no puede estar vacío"
    },

    emailFormatValidator: {
        validate: (value) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Debe ser un email válido"
    },

    passwordLengthValidator: {
        validate: (value) => {
            return value.length >= 8;
        },
        message: "La contraseña debe tener al menos 8 caracteres"
    }
};