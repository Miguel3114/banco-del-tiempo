import {
    formValidators
} from "../../validators/formValidators";


export function getListingCreateForm(
    categories
) {

    return [

        {
            tag: "Título",
            name: "title",
            type: "text",
            placeholder:
                "Introduce un título para el anuncio",
            defaultValue: "",
            maxLength: 150,
            isRequired: true,
            validators: [
                formValidators
                    .notEmptyValidator
            ]
        },


        {
            tag: "Categoría",
            name: "categoryId",
            type: "select",
            defaultValue: "",
            isRequired: true,
            values: [

                {
                    value: "",
                    label:
                        "Selecciona una categoría"
                },

                ...categories.map(
                    (category) => ({

                        value:
                            category.id,

                        label:
                            category.name
                    })
                )
            ],
            validators: [
                formValidators
                    .notEmptyValidator
            ]
        },


        {
            tag: "Horas estimadas",
            name: "estimatedHours",
            type: "number",
            placeholder: "Ej. 2",
            defaultValue: "",
            min: 1,
            isRequired: true,
            validators: [

                formValidators
                    .notEmptyValidator,

                formValidators
                    .positiveIntegerValidator
            ]
        },


        {
            tag: "Descripción",
            name: "description",
            type: "textarea",
            placeholder:
                "Describe con detalle el servicio...",
            defaultValue: "",
            isRequired: true,
            validators: [
                formValidators
                    .notEmptyValidator
            ]
        }

    ];
}