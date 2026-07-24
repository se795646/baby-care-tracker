const AuthConfig = {
    /**
     * Set to true to enable auth guard (token check on route navigation).
     * Set to false to skip auth and allow direct access to all pages.
     */
    ENABLED: false,
    LOGIN_PATH: '/login',
    TOKEN_REFRESH_PATH: 'v1/token/refresh'
};

export const AUTH_ENABLED = AuthConfig.ENABLED;

export default AuthConfig;
