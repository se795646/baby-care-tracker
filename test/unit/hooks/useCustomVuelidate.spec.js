import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import useCustomVuelidate from '@/hooks/useCustomVuelidate';

// ─── Mock i18n ────────────────────────────────────────────────────────────────
vi.mock('@/i18n', () => ({
    default: {
        global: {
            t: (key, opts) =>
                opts ? `${key}:${JSON.stringify(opts)}` : key
        }
    }
}));

// ─── withSetup helper ─────────────────────────────────────────────────────────
// Mounts a minimal component so composables that require Vue context work correctly.
function withSetup(composable) {
    let result;
    mount(
        defineComponent({
            setup() {
                result = composable();
                return {};
            },
            template: '<div />'
        })
    );
    return result;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useCustomVuelidate', () => {

    // ── fieldsMaxLength ───────────────────────────────────────────────────────
    describe('fieldsMaxLength', () => {
        it('exports expected length constants', () => {
            const { fieldsMaxLength } = withSetup(useCustomVuelidate);
            expect(fieldsMaxLength.GENERAL_TEXT).toBe(60);
            expect(fieldsMaxLength.EMAIL).toBe(100);
            expect(fieldsMaxLength.URL).toBe(1024);
            expect(fieldsMaxLength.DESCRIPTION).toBe(255);
        });
    });

    // ── Rule factories — key shape ────────────────────────────────────────────
    describe('rule factory — key shape', () => {
        it('emailRules includes required, noEmoji, email, maxLength', () => {
            const { emailRules } = withSetup(useCustomVuelidate);
            expect(emailRules).toHaveProperty('required');
            expect(emailRules).toHaveProperty('noEmoji');
            expect(emailRules).toHaveProperty('email');
            expect(emailRules).toHaveProperty('maxLength');
        });

        it('nameRules includes required, noEmoji, notOnlyWhitespace, minLength, maxLength', () => {
            const { nameRules } = withSetup(useCustomVuelidate);
            expect(nameRules).toHaveProperty('required');
            expect(nameRules).toHaveProperty('noEmoji');
            expect(nameRules).toHaveProperty('notOnlyWhitespace');
            expect(nameRules).toHaveProperty('minLength');
            expect(nameRules).toHaveProperty('maxLength');
        });

        it('roleRules includes required, noEmoji, notOnlyWhitespace, maxLength', () => {
            const { roleRules } = withSetup(useCustomVuelidate);
            expect(roleRules).toHaveProperty('required');
            expect(roleRules).toHaveProperty('noEmoji');
            expect(roleRules).toHaveProperty('notOnlyWhitespace');
            expect(roleRules).toHaveProperty('maxLength');
        });

        it('descriptionRules includes required, notOnlyWhitespace, maxLength', () => {
            const { descriptionRules } = withSetup(useCustomVuelidate);
            expect(descriptionRules).toHaveProperty('required');
            expect(descriptionRules).toHaveProperty('notOnlyWhitespace');
            expect(descriptionRules).toHaveProperty('maxLength');
        });
    });

    // ── Validator predicates ──────────────────────────────────────────────────
    describe('noEmoji validator', () => {
        it('passes for plain text', () => {
            const { emailRules } = withSetup(useCustomVuelidate);
            expect(emailRules.noEmoji.$validator('hello world')).toBe(true);
        });

        it('passes for empty string (handled by required separately)', () => {
            const { emailRules } = withSetup(useCustomVuelidate);
            expect(emailRules.noEmoji.$validator('')).toBe(true);
        });

        it('fails when value contains an emoji', () => {
            const { emailRules } = withSetup(useCustomVuelidate);
            expect(emailRules.noEmoji.$validator('hi 😀')).toBe(false);
        });
    });

    describe('notOnlyWhitespace validator', () => {
        it('passes for normal text', () => {
            const { nameRules } = withSetup(useCustomVuelidate);
            expect(nameRules.notOnlyWhitespace.$validator('Alice')).toBe(true);
        });

        it('passes for empty string', () => {
            const { nameRules } = withSetup(useCustomVuelidate);
            expect(nameRules.notOnlyWhitespace.$validator('')).toBe(true);
        });

        it('fails for whitespace-only string', () => {
            const { nameRules } = withSetup(useCustomVuelidate);
            expect(nameRules.notOnlyWhitespace.$validator('   ')).toBe(false);
        });
    });

    // ── getErrors ─────────────────────────────────────────────────────────────
    describe('getErrors', () => {
        it('returns [] when $error is false', () => {
            const { getErrors } = withSetup(useCustomVuelidate);
            const fakeV = {
                form: {
                    name: { $error: false, $errors: [] }
                }
            };
            expect(getErrors(['form', 'name'], fakeV)).toEqual([]);
        });

        it('returns error messages when $error is true', () => {
            const { getErrors } = withSetup(useCustomVuelidate);
            const fakeV = {
                name: {
                    $error: true,
                    $errors: [{ $message: 'Required' }, { $message: 'Too short' }]
                }
            };
            expect(getErrors('name', fakeV)).toEqual(['Required', 'Too short']);
        });

        it('accepts a single string key (not an array)', () => {
            const { getErrors } = withSetup(useCustomVuelidate);
            const fakeV = {
                email: { $error: true, $errors: [{ $message: 'Invalid email' }] }
            };
            expect(getErrors('email', fakeV)).toEqual(['Invalid email']);
        });

        it('navigates multiple key levels', () => {
            const { getErrors } = withSetup(useCustomVuelidate);
            const fakeV = {
                section: {
                    nested: {
                        field: { $error: true, $errors: [{ $message: 'Bad' }] }
                    }
                }
            };
            expect(getErrors(['section', 'nested', 'field'], fakeV)).toEqual(['Bad']);
        });
    });

    // ── validate ──────────────────────────────────────────────────────────────
    // validate() uses the internal v$ from useVuelidate() (no args), which
    // wires up with vuelidate's Options API `validations()` function.
    describe('validate', () => {
        it('does nothing when value is truthy — safe even with invalid path', () => {
            // If truthy, validate() returns early before navigating keys.
            // Passing a non-existent key would throw if it proceeded.
            const { validate } = withSetup(useCustomVuelidate);
            expect(() => validate('has-a-value', ['nonExistent', 'path'])).not.toThrow();
        });

        it('attempts to navigate v$ when value is falsy — throws for missing path', () => {
            // When value is falsy, validate() tries to walk v$.value['form']['name'].
            // If those keys don't exist in the vuelidate instance, it throws —
            // proving the early-return guard only fires for truthy values.
            const { validate } = withSetup(useCustomVuelidate);
            expect(() => validate('', ['form', 'name'])).toThrow();
        });
    });
});
