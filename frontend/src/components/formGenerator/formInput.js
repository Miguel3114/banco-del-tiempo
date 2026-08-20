import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";


const FormInput = forwardRef(({
    tag,
    name,
    type,
    defaultValue,
    values,
    isRequired,
    numberOfColumns,
    validators,
    minValue,
    maxValue,
    onChange,
    disabled,
    placeholder,
    maxLength
}, ref) => {

    const [inputErrors, setInputErrors] =
        useState([]);

    const inputField =
        useRef(null);


    useImperativeHandle(ref, () => {

        return {

            setErrors: (errors) => {
                setInputErrors(errors);
            },

            value: inputField.current
                ? inputField.current.value
                : ""
        };
    });


    useEffect(() => {

        const currentInput =
            inputField.current;

        if (!currentInput) {
            return;
        }


        const validateInput = () => {

            const errors = [];

            validators.forEach(
                (validator) => {

                    if (
                        !validator.validate(
                            currentInput.value
                        )
                    ) {

                        errors.push(
                            validator.message
                        );
                    }
                }
            );

            setInputErrors(errors);


            if (onChange) {

                onChange({
                    value:
                        currentInput.value
                });
            }
        };


        currentInput.addEventListener(
            "change",
            validateInput
        );


        return () => {

            currentInput.removeEventListener(
                "change",
                validateInput
            );
        };

    }, [
        validators,
        onChange
    ]);


    if (type === "select") {

        return (

            <div
                id={`${name}_form`}
                className={
                    `class-form-group ${
                        inputErrors.length > 0
                            ? "class-error-form"
                            : ""
                    }`
                }
            >

                <select
                    className="class-form-input"
                    disabled={disabled}
                    id={name}
                    name={name}
                    required={isRequired}
                    defaultValue={
                        defaultValue ?? ""
                    }
                    ref={inputField}
                >

                    {values.map(
                        (option, index) => {

                            const optionValue =
                                typeof option === "object"
                                    ? option.value
                                    : option;

                            const optionLabel =
                                typeof option === "object"
                                    ? option.label
                                    : option;


                            return (

                                <option
                                    key={
                                        `${name}-${optionValue}-${index}`
                                    }
                                    value={
                                        optionValue
                                    }
                                >

                                    {
                                        optionLabel
                                    }

                                </option>
                            );
                        }
                    )}

                </select>


                <label
                    htmlFor={name}
                    className="class-form-label"
                >
                    {tag}:
                </label>


                {inputErrors.map(
                    (error, index) => (

                        <span
                            key={index}
                            className="class-error-message"
                        >
                            {error}
                        </span>
                    )
                )}

            </div>
        );
    }


    if (type === "textarea") {

        return (

            <div
                id={`${name}_form`}
                className={
                    `class-form-group ${
                        inputErrors.length > 0
                            ? "class-error-form"
                            : ""
                    }`
                }
            >

                <textarea
                    className="class-form-input"
                    disabled={disabled}
                    id={name}
                    name={name}
                    placeholder={
                        placeholder || " "
                    }
                    defaultValue={
                        `${
                            defaultValue
                                ? defaultValue
                                : ""
                        }`
                    }
                    required={isRequired}
                    maxLength={maxLength}
                    ref={inputField}
                />


                <label
                    htmlFor={name}
                    className="class-form-label"
                >
                    {tag}:
                </label>


                {inputErrors.map(
                    (error, index) => (

                        <span
                            key={index}
                            className="class-error-message"
                        >
                            {error}
                        </span>
                    )
                )}

            </div>
        );
    }


    return (

        <div
            id={`${name}_form`}
            className={
                `class-form-group ${
                    inputErrors.length > 0
                        ? "class-error-form"
                        : ""
                }`
            }
        >

            <input
                className="class-form-input"
                disabled={disabled}
                type={type}
                id={name}
                name={name}
                placeholder={
                    placeholder || " "
                }
                defaultValue={
                    `${
                        defaultValue
                            ? defaultValue
                            : ""
                    }`
                }
                required={isRequired}
                min={minValue}
                max={maxValue}
                maxLength={maxLength}
                ref={inputField}
            />


            <label
                htmlFor={name}
                className="class-form-label"
            >
                {tag}:
            </label>


            {inputErrors.map(
                (error, index) => (

                    <span
                        key={index}
                        className="class-error-message"
                    >
                        {error}
                    </span>
                )
            )}

        </div>
    );
});


FormInput.defaultProps = {

    tag: "default",

    name: "default",

    type: "text",

    defaultValue: "",

    values: [],

    isRequired: false,

    validators: [],

    disabled: false,

    onChange: null
};


export default FormInput;