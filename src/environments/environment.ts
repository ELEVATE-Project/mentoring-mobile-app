export const environment = {
  production: false,
  name: 'debug environment',
  staging: false,
  dev: false,
  baseUrl: 'https://dev.elevate-apis.shikshalokam.org',
  sqliteDBName: 'mentoring.db',
  deepLinkUrl: 'https://mentored.shikshalokam.org',
  privacyPolicyUrl:'https://shikshalokam.org/mentoring/privacy-policy',
  termsOfServiceUrl:'https://shikshalokam.org/mentoring/term-of-use',
  supportEmail: "mentoredtest1@yopmail.com",
  // recaptchaSiteKey:"6LfWEKYpAAAAACxKbR7H42o3BwbJkJA06vIM_6Ea",
  recaptchaSiteKey:"",
  restictedPages: [],
  isAuthBypassed: false,
  unauthorizedRedirectUrl: "/auth/login",
  password:{
    minLength:10,
    regexPattern:"^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%$&()\\-`.+,/]).{10,}$",
    errorMessage:"Password should contain at least one uppercase letter, one number and one special character."
  },
};