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
            timeout: 15000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36' 
            }
        });
        return await loadImage(Buffer.from(response.data));
    } catch (e) {
        console.log("Image Fetch Error:", e.message);
        // ছবি না পেলে একটি ডিফল্ট প্রোফাইল পিকচার
        const fallback = await axios.get("https://i.imgur.com/6VBn396.png", { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(fallback.data));
    }
}

async function generateFrame(userId, res, size, x, y) {
    try {
        const bgImg = await fetchImage(IMAGES.toilet);
        
        // --- প্রোফাইল পিকচার না বদলানোর সমস্যার সমাধান ---
        // লিঙ্কের শেষে একটি টাইমস্ট্যাম্প (t=...) যোগ করা হয়েছে যাতে ব্রাউজার পুরাতন ছবি না দেখায়
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662&t=${Date.now()}`;
        
        const userImg = await fetchImage(userImgUrl);

        const cvs = createCanvas(bgImg.width, bgImg.height);
        const ctx = cvs.getContext('2d');

        // ১. ব্যাকগ্রাউন্ড আঁকা
        ctx.drawImage(bgImg, 0, 0, cvs.width, cvs.height);

        // ২. ইউজারের ছবি গোল করে বসানো
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImg, x, y, size, size);
        ctx.restore();

        // ব্রাউজারকে নতুন ছবি দেখাতে বাধ্য করা (No Cache)
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Content-Type', 'image/png');
        
        res.send(cvs.toBuffer());
    } catch (error) {
        res.status(500).json({ error: "Failed", msg: error.message });
    }
}

app.get('/toilet/:id', (req, res) => {
    // পজিশন: size=45, x=135, y=195
    generateFrame(req.params.id, res, 45, 135, 195);
});

app.get('/', (req, res) => res.json({ status: "Online", endpoint: "/toilet/USER_ID" }));

app.listen(PORT, () => console.log(`Server started!`));
