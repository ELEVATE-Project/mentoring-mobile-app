window["env"] = {
  production: false, // Toggle between development (false) and production (true) mode
  name: '<APP_NAME>', // Application name, e.g., "Mentoring App"
  baseUrl: 'https://dev.elevate-apis.shikshalokam.org',
  sqliteDBName: 'mentoring.db',
  deepLinkUrl: 'https://mentored.shikshalokam.org',
  privacyPolicyUrl:'https://shikshalokam.org/mentoring/privacy-policy',
  termsOfServiceUrl:'https://shikshalokam.org/mentoring/term-of-use',
  supportEmail: "mentoredtest1@yopmail.com",
  recaptchaSiteKey:"6LfWEKYpAAAAACxKbR7H42o3BwbJkJA06vIM_6Ea", // Google reCAPTCHA site key for enabling CAPTCHA verification
  restictedPages: ['PROFILE_PAGE','LOGIN_ACTIVITY_PAGE','CHANGE_PASSWORD_PAGE','LOGIN_PAGE','REGISTER_PAGE','RESET_PASSWORD_PAGE','OTP_PAGE','EDIT_PROFILE'], // Array of page IDs to restrict access. Add page IDs from `src/app/core/constants/page.ids.ts`
  isAuthBypassed: true, // Set to "true" to disable the default user authentication service, allowing bypass of login
  unauthorizedRedirectUrl: "/tabs/home", // URL to redirect users to if their session expires (e.g., "/auth/login")
  password:{ 
    minLength:10, // Minimum password length requirement (e.g., 10 characters)
    regexPattern: "^(?=(?:.*[A-Z]){2})(?=(?:.*[0-9]){2})(?=(?:.*[!@#%$&()\\-`.+,]){3}).{11,}$", // Regex pattern for strong password validation
    errorMessage:"Password should contain at least one uppercase letter, one number and one special character." // Error message displayed for invalid passwords
  }
};
