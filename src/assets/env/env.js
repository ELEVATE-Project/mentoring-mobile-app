window["env"] = {
    production: false,
    name: 'debug environment',
    baseUrl: 'BASE_URL',
    sqliteDBName: 'DB_NAME',
    deepLinkUrl: 'DEEPLINK_URL',
    privacyPolicyUrl:'PRIVACY_POLICY',
    termsOfServiceUrl:'TERMS_OF_SERVICE_URL',
    supportEmail: "SUPPORT_URL",
    recaptchaSiteKey:"",
    restictedPages: [],
    isAuthBypassed: false,
    unauthorizedRedirectUrl: "REDIRECT_URL",
    password:{
      minLength:10,
      regexPattern: "^(?=(?:.*[A-Z]){2})(?=(?:.*[0-9]){2})(?=(?:.*[!@#%$&()\\-`.+,]){3}).{11,}$",
      errorMessage:"Password should contain at least one uppercase letter, one number and one special character."
    },
  };