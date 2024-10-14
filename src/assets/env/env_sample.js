window["env"] = {
    production: false, // Toggle between development (false) and production (true) mode
    name: '<APP_NAME>', // Application name, e.g., "Mentoring App"
    baseUrl: '<BASE_URL>', // Base URL for API requests (e.g., "https://api.example.com")
    sqliteDBName: 'mentoring.db', // Local SQLite database file name used for local storage (e.g., "mentoring.db")
    deepLinkUrl: '<DEEPLINK_URL>', // Base URL for deep linking into the app (e.g., "app://deeplink")
    privacyPolicyUrl:'<PRIVACY_POLICY_LINKS>', // URL to the Privacy Policy page
    termsOfServiceUrl:'<TERMS_OF_USE_LINKS>', // URL to the Terms of Service page
    supportEmail: "SUPPORT_EMAIL", // Support email address (e.g., "support@example.com")
    recaptchaSiteKey:"<CAPTCHA_SITE_KEY>", // Google reCAPTCHA site key for enabling CAPTCHA verification
    restictedPages: [], // Array of page IDs to restrict access. Add page IDs from `src/app/core/constants/page.ids.ts`
    isAuthBypassed: false, // Set to "true" to disable the default user authentication service, allowing bypass of login
    unauthorizedRedirectUrl: "/auth/login", // URL to redirect users to if their session expires (e.g., "/auth/login")
    password:{ 
      minLength:10, // Minimum password length requirement (e.g., 10 characters)
      regexPattern: "^(?=(?:.*[A-Z]){2})(?=(?:.*[0-9]){2})(?=(?:.*[!@#%$&()\\-`.+,]){3}).{11,}$", // Regex pattern for strong password validation
      errorMessage:"Password should contain at least one uppercase letter, one number and one special character." // Error message displayed for invalid passwords
    }
};
