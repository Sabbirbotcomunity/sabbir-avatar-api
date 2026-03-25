import express from 'express';
import canvas from 'canvas';
import axios from 'axios';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

// আপনার দেওয়া নতুন ডাইরেক্ট লিঙ্ক
const IMAGES = {
    toilet: "https://i.ibb.co.com/WNzX1bf0/IMG-20260325-122616.jpg"
};

async function fetchImage(url) {
    try {
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return await loadImage(Buffer.from(response.data));
    } catch (e) {
        // ছবি লোড না হলে ডিফল্ট ছবি দিবে
        const fallback = await axios.get("https://i.imgur.com/6VBn396.png", { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(fallback.data));
    }
}

async function generateFrame(userId, res, size, x, y) {
    try {
        const bgImg = await fetchImage(IMAGES.toilet);
        
        // ফেসবুক প্রোফাইল পিকচার প্রক্সি (429 Error এড়াতে)
        const userImgUrl = `https://www.facebook.com/sharing/restoration/?id=${userId}&field=picture&width=512&height=512`;
        const userImg = await fetchImage(userImgUrl);

        const cvs = createCanvas(bgImg.width, bgImg.height);
        const ctx = cvs.getContext('2d');

        // ১. আপনার ব্যাকগ্রাউন্ড ছবি আঁকা
        ctx.drawImage(bgImg, 0, 0, cvs.width, cvs.height);

        // ২. ইউজারের ছবি গোল করে বসানো
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImg, x, y, size, size);
        ctx.restore();

        res.setHeader('Content-Type', 'image/png');
        res.send(cvs.toBuffer());
    } catch (error) {
        res.status(500).json({ error: "API Error", msg: error.message });
    }
}

app.get('/toilet/:id', (req, res) => {
    // এই মানগুলো আপনার নতুন ছবির পজিশন অনুযায়ী (চেক করে দেখতে পারেন)
    generateFrame(req.params.id, res, 48, 134, 196);
});

app.get('/', (req, res) => res.json({ status: "Online", endpoint: "/toilet/ID" }));

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
