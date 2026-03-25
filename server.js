import express from 'express';
import canvas from 'canvas';
import axios from 'axios';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

// আপনার দেওয়া সেই ডাইরেক্ট ইমেজ লিঙ্ক
const IMAGES = {
    toilet: "https://i.ibb.co.com/WNzX1bf0/IMG-20260325-122616.jpg"
};

async function fetchImage(url) {
    try {
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return await loadImage(Buffer.from(response.data));
    } catch (e) {
        // ছবি না পেলে ডিফল্ট ছবি
        const fallback = await axios.get("https://i.imgur.com/6VBn396.png", { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(fallback.data));
    }
}

async function generateFrame(userId, res, size, x, y) {
    try {
        const bgImg = await fetchImage(IMAGES.toilet);
        
        // --- ৪২৯ এরর ফিক্স: ফেসবুকের বদলে এই প্রক্সি লিঙ্কটি ব্যবহার করুন ---
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512&redirect=true`;
        // বিকল্প (যদি উপরেরটা কাজ না করে): `https://www.facebook.com/sharing/restoration/?id=${userId}&field=picture`
        
        const userImg = await fetchImage(userImgUrl);

        const cvs = createCanvas(bgImg.width, bgImg.height);
        const ctx = cvs.getContext('2d');

        ctx.drawImage(bgImg, 0, 0, cvs.width, cvs.height);

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
        res.status(500).json({ error: "API Error", msg: "Server Busy, try again later" });
    }
}

app.get('/toilet/:id', (req, res) => {
    // আপনার ছবির সঠিক পজিশন: size=45, x=135, y=195 (সামান্য অ্যাডজাস্ট করা হয়েছে)
    generateFrame(req.params.id, res, 45, 135, 195);
});

app.get('/', (req, res) => res.json({ status: "API Online", endpoint: "/toilet/ID" }));

app.listen(PORT, () => console.log(`Server is running!`));
