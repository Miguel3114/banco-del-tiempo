import {
    formValidators
} from "./formValidators";


describe("formValidators", () => {

    test("shouldValidateRequiredValues", () => {
        expect(
            formValidators.notEmptyValidator.validate("texto")
        ).toBe(true);
        expect(
            formValidators.notEmptyValidator.validate("   ")
        ).toBe(false);
    });

    test("shouldValidateEmailFormat", () => {
        expect(
            formValidators.emailFormatValidator.validate("a@b.com")
        ).toBe(true);
        expect(
            formValidators.emailFormatValidator.validate("correo")
        ).toBe(false);
    });

    test("shouldValidatePasswordLengths", () => {
        expect(
            formValidators.passwordLengthValidator.validate("12345678")
        ).toBe(true);
        expect(
            formValidators.passwordLengthValidator.validate("123")
        ).toBe(false);
        expect(
            formValidators.optionalPasswordLengthValidator.validate("")
        ).toBe(true);
        expect(
            formValidators.optionalPasswordLengthValidator.validate("123")
        ).toBe(false);
    });

    test("shouldValidatePositiveInteger", () => {
        expect(
            formValidators.positiveIntegerValidator.validate("2")
        ).toBe(true);
        expect(
            formValidators.positiveIntegerValidator.validate("0")
        ).toBe(false);
        expect(
            formValidators.positiveIntegerValidator.validate("1.5")
        ).toBe(false);
    });
});
