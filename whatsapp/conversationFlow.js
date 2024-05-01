const conversationSteps = {
    start: {
        message: 'Jenis kaos apa yang rencana Anda buat?',
        nextStep: 'askJenisKaos',
    },
    askJenisKaos: {
        message: 'Jenis Sablon apa yang Anda inginkan?',
        nextStep: 'askJenisSablon',
    },
    askJenisSablon: {
        message: 'Berapa jumlahnya?',
        nextStep: 'askDeadline',
    },
    askDeadline: {
        message: 'Kapan waktu deadline-nya?',
        nextStep: 'completion',
    },
    completion: {
        message: 'Terima kasih atas info pemesanannya!',
        nextStep: null, // End of conversation
    },
};

function getNextStepMessage(step) {
    return conversationSteps[step].message;
}

module.exports = { getNextStepMessage, conversationSteps };
