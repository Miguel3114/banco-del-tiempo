import "./css/formGenerator.css";

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";

import FormInput from "./formInput";

const FormGenerator = forwardRef((props, ref) => {

    const [formValues, setFormValues] = useState({});
    const [submitForm, setSubmitForm] = useState(false);

    let formInputs = useRef([]);

    useImperativeHandle(ref, () => {

        return {

            validate: () => {

                let isValid = true;

                for (
                    let i = 0;
                    i < props.inputs.length;
                    i++
                ) {

                    let input = props.inputs[i];

                    for (let validator of input.validators) {

                        if (
                            !validator.validate(
                                formValues[input.name]
                            )
                        ) {

                            formInputs.current[i]
                                .setErrors([
                                    validator.message
                                ]);

                            isValid = false;
                        }
                    }
                }

                return isValid;
            }
        };
    });

    function handleSubmit(e) {

        e.preventDefault();

        let formValuesCopy = {};

        for (
            let i = 0;
            i < props.inputs.length;
            i++
        ) {

            let input = props.inputs[i];

            formValuesCopy[input.name] =
                formInputs.current[i].value;
        }

        setFormValues(formValuesCopy);
        setSubmitForm(true);
    }

    useEffect(() => {

        if (Object.keys(formValues).length === 0) {

            let newFormValues = {};

            for (let input of props.inputs) {

                newFormValues[input.name] =
                    input.defaultValue
                        ? input.defaultValue
                        : "";
            }

            setFormValues(newFormValues);
        }

    }, [formValues, props.inputs]);

    useEffect(() => {

        if (submitForm) {

            props.onSubmit({
                values: formValues
            });

            setSubmitForm(false);
        }

    }, [submitForm, formValues, props]);

    return (
        <div className="class-profile-form">

            <form className="class-form">

                {Object.keys(formValues).length > 0 &&
                    props.inputs.map(
                        (input, index) => {

                            return (
                                <div key={input.name}>

                                    {props.childrenPosition !== -1 &&
                                        index ===
                                            props.childrenPosition &&
                                        props.children}

                                    <FormInput
                                        key={index}
                                        tag={input.tag}
                                        name={input.name}
                                        type={input.type}
                                        values={input.values}
                                        defaultValue={input.defaultValue}
                                        isRequired={input.isRequired}
                                        minValue={input.min}
                                        maxValue={input.max}
                                        numberOfColumns={props.numberOfColumns}
                                        validators={input.validators}
                                        formValues={formValues}
                                        setFormValues={setFormValues}
                                        onChange={input?.onChange}
                                        disabled={input.disabled}
                                        placeholder={input.placeholder}
                                        maxLength={input.maxLength}
                                        ref={(input) =>
                                            (formInputs.current[index] = input)
                                        }
                                    />
                                </div>
                            );
                        }
                    )
                }

                {props.childrenPosition === -1 &&
                    props.children}

            </form>

            <button
                onClick={handleSubmit}
                className={props.buttonClassName}
            >
                {props.buttonText}
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