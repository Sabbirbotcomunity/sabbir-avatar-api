import express from 'express';
import canvas from 'canvas';
import axios from 'axios';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

const IMAGES = {
    toilet: "https://i.ibb.co/pBT966n/image.png",
    jail: "https://i.postimg.cc/Xv8P3p7K/jail.png",
    hack: "https://i.postimg.cc/6pM0rX3V/hack.png",
    trash: "https://i.postimg.cc/85zX3S6m/trash.png",
    wanted: "https://i.postimg.cc/qR8v6S80/wanted.png",
    rip: "https://i.postimg.cc/L5vP8hYn/rip.png"
};

// এই ফাংশনটি যেকোনো লিঙ্ক থেকে ছবি ডাউনলোড করে ক্যানভাসে দিবে
async function fetchImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(response.data));
    } catch (e) {
        console.log("Image load failed, using default.");
        // ছবি না পেলে একটি ডিফল্ট প্রোফাইল পিকচার দিবে
        const fallback = await axios.get("https://i.imgur.com/6VBn396.png", { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(fallback.data));
    }
}

async function generateFrame(type, userId, res, size, x, y, isCircle = true) {
    try {
        const bgUrl = IMAGES[type];
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512`;

        // সরাসরিloadImage না করে আমাদের ফাংশন দিয়ে ছবি আনছি
        const bgImg = await fetchImage(bgUrl);
        const userImg = await fetchImage(userImgUrl);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        ctx.save();
        if (isCircle) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
        }
        ctx.drawImage(userImg, x, y, size, size);
        ctx.restore();

        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// --- API Endpoints ---
app.get('/toilet/:id', (req, res) => generateFrame('toilet', req.params.id, res, 130, 345, 620));
app.get('/jail/:id', (req, res) => generateFrame('jail', req.params.id, res, 250, 125, 150));
app.get('/hack/:id', (req, res) => generateFrame('hack', req.params.id, res, 300, 100, 80, false));

app.get('/api-list', (req, res) => {
    const host = `https://${req.get('host')}`;
    res.json({
        "toilet": `${host}/toilet/ID`,
        "jail": `${host}/jail/ID`,
        "hack": `${host}/hack/ID`,
        "trash": `${host}/trash/ID`,
        "wanted": `${host}/wanted/ID`,
        "rip": `${host}/rip/ID`
    });
});

app.get('/', (req, res) => res.redirect('/api-list'));

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
