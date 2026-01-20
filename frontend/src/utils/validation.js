/**
 * Form Validation Utilities
 * Helper functions for validating user input
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    return { isValid: true, message: '' };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateName = (name) => {
    if (!name || name.trim().length === 0) {
        return { isValid: false, message: 'Name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters' };
    }

    return { isValid: true, message: '' };
};

/**
 * Validate signup form
 * @param {object} formData - { name, email, password }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateSignupForm = (formData) => {
    const errors = {};

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
        errors.name = nameValidation.message;
    }

    if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.message;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};

/**
 * Validate login form
 * @param {object} formData - { email, password }
 * @returns {object} - { isValid: boolean, errors: object }
 */
export const validateLoginForm = (formData) => {
    const errors = {};

    if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
