export const environment = {
  production: false,
  staging: false,
  dev: false,
  baseUrl: 'your api url',
  sqliteDBName: 'DB',
  restictedPages: ["EDIT_PROFILE", "PROFILE_PAGE", "LOGIN_ACTIVITY_PAGE", "CHANGE_PASSWORD_PAGE", "LANGUAGE_PAGE", "HELP_VIDEOS_PAGE", "HELP_PAGE", "OTP_PAGE", "RESET_PASSWORD_PAGE", "REGISTER_PAGE", "LOGIN_PAGE", "LANDING_PAGE"],
  isAuthBypassed: true,
  unauthorizedRedirectUrl: "/auth/login",
};
