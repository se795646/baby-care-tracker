import { computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import {
    email as emailRoot,
    helpers,
    maxLength as maxLengthRoot,
    minLength as minLengthRoot,
    required as requiredRoot
} from '@vuelidate/validators';
import i18n from '@/i18n';

export default function useCustomVuelidate() {
    const { t } = i18n.global;
    const v$ = useVuelidate();

    const fieldsMaxLength = {
        GENERAL_TEXT: 60,
        EMAIL: 100,
        URL: 1024,
        DESCRIPTION: 255
    };

    const customValidator = helpers.withMessage;
    const required = customValidator(
        computed(() => t('validation.required')),
        requiredRoot
    );

    const notOnlyWhitespace = customValidator(
        computed(() => t('validation.whitespaceOnly')),
        (value) => !value || value.trim().length > 0
    );

    const noEmoji = customValidator(
        computed(() => t('validation.noEmoji')),
        (value) => {
            if (!value) {
                return true;
            }

            const emojiRegex =
                /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
            return !emojiRegex.test(value);
        }
    );

    const maxLengthRule = (length) =>
        customValidator(
            computed(() => t('validation.maxLength', { length })),
            maxLengthRoot(length)
        );

    const minLengthRule = (length) =>
        customValidator(
            computed(() => t('validation.minLength', { length })),
            minLengthRoot(length)
        );

    const emailRules = () => ({
        required,
        noEmoji,
        email: customValidator(
            computed(() => t('validation.invalidEmail')),
            emailRoot
        ),
        maxLength: maxLengthRule(fieldsMaxLength.EMAIL)
    });

    const nameRules = () => ({
        required,
        noEmoji,
        notOnlyWhitespace,
        minLength: minLengthRule(3),
        maxLength: maxLengthRule(fieldsMaxLength.GENERAL_TEXT)
    });

    const roleRules = () => ({
        required,
        noEmoji,
        notOnlyWhitespace,
        maxLength: maxLengthRule(fieldsMaxLength.GENERAL_TEXT)
    });

    const descriptionRules = () => ({
        required,
        notOnlyWhitespace,
        maxLength: maxLengthRule(fieldsMaxLength.DESCRIPTION)
    });

    const getErrors = (keys, v) => {
        let model = v;
        const keyArray = Array.isArray(keys) ? keys : [keys];

        for (const key of keyArray) {
            model = model[key];
        }

        return model.$error ? model.$errors.map((error) => error.$message) : [];
    };

    const validate = (value, keys) => {
        if (value) {
            return;
        }

        let model = v$.value;
        const keyArray = Array.isArray(keys) ? keys : [keys];

        for (const key of keyArray) {
            model = model[key];
        }

        model.$validate();
    };

    return {
        v$,
        customValidator,
        fieldsMaxLength,
        emailRules: emailRules(),
        nameRules: nameRules(),
        roleRules: roleRules(),
        descriptionRules: descriptionRules(),
        getErrors,
        validate
    };
}
