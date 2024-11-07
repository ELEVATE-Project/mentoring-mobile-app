export const CHAT_MESSAGES = {
    MESSAGE_TEXT_LIMIT: 160,
    INITIATOR: {
        PENDING: {
            title: `FIRST_MSG_REQ_INFO_TITLE`,
            subText: 'FIRST_MSG_REQ_INFO_SUBTITLE',
        },
        REQUESTED: {
            title: `MULTIPLE_MSG_REQ_TITLE`,
            subText: `MULTIPLE_MSG_REQ_SUBTITLE`,
        },
    },
    RECEIVER: {
        REJECTED: {
            title: `REJECTED_MESSAGE_REQ_INFO_TITLE`,
            subText: 'REJECTED_MESSAGE_REQ_INFO_SUB_TITLE',
        },
        REQUESTED: {
            title: `RECIEVED_MESSAGE_REQ_INFO_TITLE`,
            subText: 'RECIEVED_MESSAGE_REQ_INFO_SUB_TITLE',
        },
    },

    GENERIC_CARD_REQUEST_BTN_CONFIG: [
        {
            label: 'VIEW_MESSAGE',
            action: 'viewMessage',
            color: 'primary',
        },
    ],
    GENERIC_CARD_MENTOR_DIRECTORY_BTN_CONFIG: [
        {
            label: 'CHAT',
            action: 'chat',
            color: 'light',
        },
        {
            label: 'REQUEST_SESSION',
            action: 'requestSession',
            color: 'primary',
        },
    ],
    GENERIC_CARD_MY_CONNECTION_BTN_CONFIG: [
        {
            label: 'CHAT',
            action: 'chat',
            color: 'light',
        },
        {
            label: 'REQUEST_SESSION',
            action: 'requestSession',
            color: 'primary',
            hasCondition: true,
            is_mentor: true,
            onCheck: 'is_mentor'
        },
    ],
};
