export const environment = {
  production: false,
  name: 'debug environment',
  staging: false,
  dev: false,
  baseUrl: 'your api url',
  sqliteDBName: 'DB',
  deepLinkUrl: 'deeplink_url',
  privacyPolicyUrl:'privacy_policy_url',
  termsOfServiceUrl:'terms_of_use_url',
  supportEmail: "",
  recaptchaSiteKey:"",
  restictedPages: ["restricted_pages_id_1", "restricted_pages_id_2"],
  isAuthBypassed: true,
  unauthorizedRedirectUrl: "unauthorized_redirect_url",
  password:{
    minLength:10,
    rejectPattern:"regex for password validation",
    errorMessage:"error message for password"
  },
};
