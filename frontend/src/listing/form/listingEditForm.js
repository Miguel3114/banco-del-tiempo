import {
    formValidators
} from "../../validators/formValidators";


export function getListingEditForm(
    listing,
    categories
) {

    return [

        {
            tag: "Título",
            name: "title",
            type: "text",
            placeholder:
                "Introduce un título para el anuncio",
            defaultValue:
                listing.title,
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
            defaultValue:
                listing.category.id,
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
            defaultValue:
                listing.estimatedHours,
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
            defaultValue:
                listing.description,
            isRequired: true,
            validators: [
                formValidators
                    .notEmptyValidator
            ]
        }

    ];
}