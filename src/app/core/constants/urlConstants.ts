export const urlConstants = {
    API_URLS:{
        CREATE_ACCOUNT:"/user/v1/account/create",
        ACCOUNT_LOGIN:"/user/v1/account/login",
        LOGOUT_ACCOUNT:"/user/v1/account/logout",
        REFRESH_TOKEN:"/user/v1/account/generateToken",
        PROFILE_UPDATE:"/user/v1/profile/update",
        PROFILE_DETAILS: "/user/v1/profile/details",
        MENTORS_DIRECTORY:"/user/v1/mentors/list?page=",
        FILE_UPLOAD:"/user/v1/cloud-services/file/upload",
        SESSIONS:"/mentoring/v1/mentees/sessions?enrolled=", //sessions?enrolled=true/false&page=1&limit=5&search=:search
        HOME_SESSION:"/mentoring/v1/mentees/homeFeed?page=", ///v1/mentees/homefeed?page=1&limit=4
        GET_IMAGE_UPLOAD_URL:'/user/v1/cloud-services/file/getSignedUrl?fileName=',
        // FORMS
        FORM_READ:'/mentoring/v1/form/read',
        GENERATE_OTP:"/user/v1/account/generateOtp",
        RESET_PASSWORD:"/user/v1/account/resetPassword",
        CREATE_SESSION:"/mentoring/v1/sessions/update",
        GET_SESSIONS_LIST:"/mentoring/v1/sessions/list?page=",
        GET_SESSION_DETAILS:"/mentoring/v1/sessions/details/",
        GET_SHARE_SESSION_LINK:"/mentoring/v1/sessions/share/",
    }
};
