const userStates = {};

function getUserState(userId) {
    if (!userStates[userId]) {
        userStates[userId] = { step: 'askJenisKaos' };
    }
    return userStates[userId];
}

function updateUserState(userId, newState) {
    userStates[userId] = { ...userStates[userId], ...newState };
}

// Added 'active' to manage if a user is currently in a conversation.
function initializeUserState(userId) {
    userStates[userId] = {
        step: 'askJenisKaos',
        active: false,
        responses: {}, // Store user responses here        
    };
}

function activateConversation(userId) {
    if (userStates[userId]) {
        userStates[userId].active = true;
    }
}

function saveUserResponse(userId, step, response) {
    if (userStates[userId]) {
        userStates[userId].responses[step] = response;
    }
}

function deactivateConversation(userId) {
    if (userStates[userId]) {
        userStates[userId].active = false;
    }
}

module.exports = {
    getUserState,
    updateUserState,
    initializeUserState,
    activateConversation,
    saveUserResponse, 
    deactivateConversation,
};

