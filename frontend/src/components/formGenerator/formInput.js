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

    const [inputErrors, setInputErrors] = useState([]);

    let inputField = useRef(null);

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

        const currentInput = inputField.current;

        const validateInput = () => {

            let errors = [];

            validators.forEach((validator) => {

                if (!validator.validate(currentInput.value)) {
                    errors.push(validator.message);
                }
            });

            setInputErrors(errors);
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

    }, [validators]);

    if (type === "textarea") {

        return (
            <div
                className={
                    `class-form-group ${inputErrors.length > 0
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
                    placeholder={placeholder || " "}
                    defaultValue={
                        `${defaultValue ? defaultValue : ""}`
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

                {inputErrors.map((error, index) => (
                    <span
                        key={index}
                        className="class-error-message"
                    >
                        {error}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <div
            className={
                `class-form-group ${inputErrors.length > 0
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
                placeholder={placeholder || " "}
                defaultValue={
                    `${defaultValue ? defaultValue : ""}`
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

            {inputErrors.map((error, index) => (
                <span
                    key={index}
                    className="class-error-message"
                >
                    {error}
                </span>
            ))}
        </div>
    );
});

FormInput.defaultProps = {
    tag: "default",
    name: "default",
    type: "text",
    defaultValue: "",
    isRequired: false,
    validators: []
};

export default FormInput;