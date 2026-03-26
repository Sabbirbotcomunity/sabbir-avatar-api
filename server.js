import express from 'express';
import canvas from 'canvas';
import axios from 'axios';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

const IMAGES = {
    toilet: "https://i.ibb.co.com/Rph1rt8G/received-1960377504561612.jpg",
    chore: "https://i.ibb.co.com/0jDzs9xq/file-00000000abf871fab90e3d6afab380f3.png" // চোর/জেলখানা ফ্রেম
};

async function fetchImage(url) {
    try {
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        return await loadImage(Buffer.from(response.data));
    } catch (e) {
        const fallback = await axios.get("https://i.imgur.com/6VBn396.png", { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(fallback.data));
    }
}

// ফাংশনটি আপডেট করা হয়েছে যাতে সঠিক ছবি লোড হয়
async function generateFrame(userId, res, bgUrl, size, x, y) {
    try {
        const bgImg = await fetchImage(bgUrl);
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662&t=${Date.now()}`;
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

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        res.setHeader('Content-Type', 'image/png');
        res.send(cvs.toBuffer());
    } catch (error) {
        res.status(500).json({ error: "Failed", msg: error.message });
    }
}

// ১. টয়লেট কমান্ড
app.get('/toilet/:id', (req, res) => {
    // এখানে IMAGES.toilet সরাসরি পাঠিয়ে দেওয়া হয়েছে
    generateFrame(req.params.id, res, IMAGES.toilet, 40, 239, 440);
});

// ২. চোর কমান্ড (Chore)
app.get('/chore/:id', (req, res) => {
    // চোরের জন্য পজিশন: size=200, x=150, y=130
    generateFrame(req.params.id, res, IMAGES.chore, 90, 170, 130);
});

app.get('/', (req, res) => res.json({ status: "Online", endpoints: ["/toilet/ID", "/chore/ID"] }));

app.listen(PORT, () => console.log(`Server started!`));
