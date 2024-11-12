export const environment = {
    production: false,
    name: 'debug environment',
    baseUrl: 'https://dev.elevate-apis.shikshalokam.org',
    sqliteDBName: 'mentoring.db',
    deepLinkUrl: 'https://mentored.shikshalokam.org',
    privacyPolicyUrl:'https://shikshalokam.org/mentoring/privacy-policy',
    termsOfServiceUrl:'https://shikshalokam.org/mentoring/term-of-use',
    supportEmail: "mentoredtest1@yopmail.com",
    recaptchaSiteKey:"",
    restictedPages: [],
    isAuthBypassed: false,
    unauthorizedRedirectUrl: "/auth/login",
    password:{
      minLength:10,
      regexPattern: "^(?=(?:.*[A-Z]){2})(?=(?:.*[0-9]){2})(?=(?:.*[!@#%$&()\\-`.+,]){3}).{11,}$",
      errorMessage:"Password should contain at least one uppercase letter, one number and one special character."
    },
  };


