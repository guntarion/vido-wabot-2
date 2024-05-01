const userStates = {};

function getUserState(userId) {
    if (!userStates[userId]) {
        userStates[userId] = { step: 'start' };
    }
    return userStates[userId];
}

function updateUserState(userId, newState) {
    userStates[userId] = { ...userStates[userId], ...newState };
}

// Added 'active' to manage if a user is currently in a conversation.
function initializeUserState(userId) {
    userStates[userId] = {
        step: 'start',
        active: false
    };
}

function activateConversation(userId) {
    if (userStates[userId]) {
        userStates[userId].active = true;
    }
}

function deactivateConversation(userId) {
    if (userStates[userId]) {
        userStates[userId].active = false;
    }
}

module.exports = { getUserState, updateUserState, initializeUserState, activateConversation, deactivateConversation };

