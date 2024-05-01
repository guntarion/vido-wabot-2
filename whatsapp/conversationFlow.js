const conversationSteps = {
    askJenisKaos: {
        message:
            'Jenis kaos apa yang rencana Anda buat?\n(Silahkan merespon dg menulis angka 1 atau 2 atau 3)\n\n1 Kaos Oblong\n2 Kaos Kerah\n3 Kaos Raglan',
        nextStep: 'askJenisSablon',
    },
    askJenisSablon: {
        message:
            'Jenis Sablon apa yang Anda inginkan?\n\n 1.Sablon Plastisol\n2.Sablon Rubber\n3. Sablon Discharge\n4. Belum Tahu',
        nextStep: 'askTitikSablon',
    },
    askTitikSablon: {
        message: 'Berapa perkiraan jumlah lokasi/titik sablonnya?',
        nextStep: 'askQuantityPesan',
    },
    askQuantityPesan: {
        message: 'Berapa rencana jumlah pcs pembuatannya?',
        nextStep: null, // End of conversation
    }
};

function getNextStepMessage(step) {
    return conversationSteps[step].message;
}

module.exports = { getNextStepMessage, conversationSteps };
