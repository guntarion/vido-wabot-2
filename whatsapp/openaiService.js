const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

async function generateResponseAsCS(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'Anda adalah customer service yang ramah dari Vido Garment, perusahaan yang bergerak di pembuatan seragam untuk berbagai kebutuhan. Untuk pertanyaan atau permintaan yang di luar konteks lingkup bisnis vido garment dan wawasan di luar lini bisnis konfeksi atau garment atau apapun di luar pembahasan di lingkup industri tekstil, Anda sampaikan maaf tidak bisa memberi tanggapan atasnya.',
                },
                { role: 'user', content: prompt },
            ],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw new Error('An error occurred while processing your request.');
    }
}

async function generateLogoBordir(requirement) {
    const myPrompt =
        'Create a professional-looking logo design, in one image, depicting: ' +
        requirement +
        '. The logo should have a solid background color, with no gradients or shadows. The design should be simple, yet distinctive and memorable. The logo should be scalable to various sizes without losing its clarity. The design should be created using a limited color palette, with a maximum of 4 colors. The logo should be designed in a way that it can be easily embroidered on various fabrics, including cotton, polyester, and blends. The design should be clean, crisp, and visually appealing. The design should be simple enough to be easily recognizable and memorable, yet unique enough to stand out from other logos. The design should be created with the intention of being used on embroidery.';
    console.log('My Logo Bordir Prompt:', myPrompt);
    try {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            // model: 'dall-e-2',
            prompt: myPrompt,
            n: 1,
            size: '1024x1024',
        });

        const imageUrl = response.data[0].url;

        return imageUrl;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while generating the image');
    }
}

async function generateDesainSablon(requirement) {
    const myPrompt =
        'Create an image of ' +
        requirement +
        '. The design should be clear, bold, with sharp lines, minimal details, and also minimal gradients.  The colors used should be distinct and separable, avoiding overly complex shading or color blending. The background should be simple or non-existent to emphasize the main design. This image should be creative and capable of being a standout piece on merchandise.';
    console.log('My Desain Sablon Prompt:', myPrompt);
    try {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            // model: 'dall-e-2',
            prompt: myPrompt,
            n: 1,
            size: '1024x1024',
        });

        const imageUrl = response.data[0].url;

        return imageUrl;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while generating the image');
    }
}


async function generateDesainKaos(myPrompt) {
    try {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            // model: 'dall-e-2',
            prompt: myPrompt,
            n: 1,
            size: '1024x1024', // the minimum size for DaLL-E-3
            // size: '512x512', // the minimum size for DaLL-E-2
        });
        const imageUrl = response.data[0].url;
        console.log('Image URL:', imageUrl);
        return imageUrl;
    } catch (error) {
        console.error(error);
        throw new Error('An error occurred while generating the image');
    }
}

async function generateSlogan(requirement) {
    const myPrompt =
        'Create a concise and impactful slogan that captures the essence of the following description:  ' +
        requirement +
        '. The slogan should be short, memorable, and thought-provoking, making it suitable for use on a t-shirt. It should be able to convey the main idea or message of the description in a few words, while also being visually appealing and easy to read. Please ensure that the slogan is: Concise (less than 17 words), Clear and easy to understand, Thought-provoking and memorable, Suitable for use on a t-shirt.';
    console.log('My Slogan Prompt:', myPrompt);
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: myPrompt,
                },
            ],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw new Error('An error occurred while processing your request.');
    }
}


async function generateTestimonial(prompt) {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content:
                        'Berikan testimonial singkat untuk perusahaan Vido Garment, suatu usaha yang bergerak di bidang konfeksi/garment, yang spesialisasi dalam pembuatan baju seragam custom made. Sertakan dalam testimonial alasan mengapa Anda memilih memesan seragam di Vido Garment dan apa yang membuat Anda terkesan selama berinteraksi dengan mereka. Jika ada masukan yang ingin Anda sampaikan, silakan tambahkan dengan penataan bahasa yang konstruktif dan halus. Fokuskan narasi pada aspek positif yang menonjol dan bagaimana Vido Garment telah memenuhi atau melebihi ekspektasi Anda dalam hal kualitas produk dan layanan pelanggan. User akan memberikan clue yang menjadi acuan Anda dalam membuat testimoni tersebut: ',
                },
                { role: 'user', content: 'Clue (muatan isi) testimoni: ' + prompt },
            ],
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('OpenAI Error:', error);
        throw new Error('An error occurred while processing your request.');
    }
}

const { google } = require('googleapis');

const googleAuth = new google.auth.GoogleAuth({
    keyFile: 'hardy-position-391701-f77f2a757d7d.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendToGoogleSheet(auth, range, data) {
    const spreadsheetId = '1w7c0MOhPHBbti6Lh49MpkuerAfI9XF8k_Et6Z8B8aGY';
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                    [
                        data.dateTime,
                        'FALSE',
                        data.contactNumber,
                        data.contactPlatform,
                        data.contactPublishedName,
                        data.contactSavedName,
                        data.kodeOrder,
                        data.size,
                        data.name,
                    ],
                ],
            },
        });
        console.log(response.data);
    } catch (err) {
        console.error('The API returned an error: ' + err);
    }
}


module.exports = {
    generateResponseAsCS,
    generateLogoBordir,
    generateDesainSablon,
    generateSlogan,
    generateDesainKaos,
    generateTestimonial,
    appendToGoogleSheet,
    googleAuth,
};