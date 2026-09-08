import "./css/formGenerator.css";

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";

import FormInput
    from "./formInput";


const FormGenerator =
    forwardRef((props, ref) => {

        const [
            formValues,
            setFormValues
        ] = useState({});

        const [
            submitForm,
            setSubmitForm
        ] = useState(false);

        const formInputs =
            useRef([]);


        useImperativeHandle(
            ref,
            () => {

                return {

                    validate: () => {

                        let isValid =
                            true;


                        for (
                            let i = 0;
                            i < props.inputs.length;
                            i++
                        ) {

                            const input =
                                props.inputs[i];

                            const errors =
                                [];


                            for (
                                const validator
                                of input.validators
                            ) {

                                if (
                                    !validator.validate(
                                        formValues[
                                            input.name
                                        ]
                                    )
                                ) {

                                    errors.push(
                                        validator.message
                                    );

                                    isValid =
                                        false;
                                }
                            }


                            formInputs
                                .current[i]
                                ?.setErrors(
                                    errors
                                );
                        }


                        return isValid;
                    },


                    setFieldErrors: (
                        fieldName,
                        errors
                    ) => {

                        const index =
                            props.inputs
                                .findIndex(
                                    (input) =>
                                        input.name ===
                                        fieldName
                                );


                        if (
                            index !== -1 &&
                            formInputs
                                .current[index]
                        ) {

                            formInputs
                                .current[index]
                                .setErrors(
                                    errors
                                );
                        }
                    },


                    clearFieldErrors: (
                        fieldName
                    ) => {

                        const index =
                            props.inputs
                                .findIndex(
                                    (input) =>
                                        input.name ===
                                        fieldName
                                );


                        if (
                            index !== -1 &&
                            formInputs
                                .current[index]
                        ) {

                            formInputs
                                .current[index]
                                .setErrors(
                                    []
                                );
                        }
                    }
                };
            }
        );


        function handleSubmit(
            event
        ) {

            event.preventDefault();

            const formValuesCopy =
                {};


            for (
                let i = 0;
                i < props.inputs.length;
                i++
            ) {

                const input =
                    props.inputs[i];


                formValuesCopy[
                    input.name
                ] =
                    formInputs
                        .current[i]
                        .value;
            }


            setFormValues(
                formValuesCopy
            );

            setSubmitForm(
                true
            );
        }


        useEffect(() => {

            if (
                Object.keys(
                    formValues
                ).length === 0
            ) {

                const newFormValues =
                    {};


                for (
                    const input
                    of props.inputs
                ) {

                    newFormValues[
                        input.name
                    ] =
                        input.defaultValue
                            ? input.defaultValue
                            : "";
                }


                setFormValues(
                    newFormValues
                );
            }

        }, [
            formValues,
            props.inputs
        ]);


        useEffect(() => {

            if (submitForm) {

                props.onSubmit({
                    values:
                        formValues
                });

                setSubmitForm(
                    false
                );
            }

        }, [
            submitForm,
            formValues,
            props
        ]);


        return (

            <div className="class-profile-form">

                <form className="class-form">

                    {
                        Object.keys(
                            formValues
                        ).length > 0 &&
                        props.inputs.map(
                            (
                                input,
                                index
                            ) => {

                                return (

                                    <div
                                        key={
                                            input.name
                                        }
                                    >

                                        {
                                            props.childrenPosition !==
                                                -1 &&
                                            index ===
                                                props.childrenPosition &&
                                            props.children
                                        }


                                        <FormInput
                                            key={
                                                index
                                            }
                                            tag={
                                                input.tag
                                            }
                                            name={
                                                input.name
                                            }
                                            type={
                                                input.type
                                            }
                                            values={
                                                input.values
                                            }
                                            defaultValue={
                                                input.defaultValue
                                            }
                                            isRequired={
                                                input.isRequired
                                            }
                                            minValue={
                                                input.min
                                            }
                                            maxValue={
                                                input.max
                                            }
                                            numberOfColumns={
                                                props.numberOfColumns
                                            }
                                            validators={
                                                input.validators
                                            }
                                            formValues={
                                                formValues
                                            }
                                            setFormValues={
                                                setFormValues
                                            }
                                            onChange={
                                                input?.onChange
                                            }
                                            disabled={
                                                input.disabled
                                            }
                                            placeholder={
                                                input.placeholder
                                            }
                                            maxLength={
                                                input.maxLength
                                            }
                                            ref={
                                                (
                                                    currentInput
                                                ) =>
                                                    (
                                                        formInputs
                                                            .current[
                                                            index
                                                        ] =
                                                            currentInput
                                                    )
                                            }
                                        />

                                    </div>
                                );
                            }
                        )
                    }


                    {
                        props.childrenPosition ===
                            -1 &&
                        props.children
                    }

                </form>


                <button
                    onClick={
                        handleSubmit
                    }
                    className={
                        props.buttonClassName
                    }
                >

                    {
                        props.buttonText
                    }

                </button>

            </div>
        );
    });


FormGenerator.defaultProps = {
    inputs: [],
    onSubmit: () => {},
    buttonText: "Enviar",
    buttonClassName: "",
    childrenPosition: -1
};


export default FormGenerator;