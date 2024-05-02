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

async function generateImage(prompt) {

    // const myPrompt = 'Buatkan desain sablon dalam deskripsi berikut: ' + prompt + '; yang berada di kaos lengan pendek tampak depan. Sesuaikan warna kaos agar sesuai dengan tema desainnya.';
    const myPrompt =
        'Please create a detailed, multi-colored plastisol screen print design for a short-sleeve t-shirt. The design should include the following image: [' +
        prompt +
        '], featuring vibrant colors and a dynamic composition. The style should be bold and visually appealing, suitable for a fashionable t-shirt. Ensure the design is suitable for screen printing with plastisol ink, which may include considerations for color layering and separations. The image should capture the energy and creativity typical of contemporary streetwear. Please make sure all parts of the screen printed image are visible, not cut off. ';

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

module.exports = {
    generateResponseAsCS,
    generateImage,
};