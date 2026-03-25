import express from 'express';
import canvas from 'canvas';

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

// এই ফাংশনটি ছবি লোড করতে সাহায্য করবে, ৪০৪ এরর দিবে না
async function getSafeImage(url) {
    try {
        return await loadImage(url);
    } catch (e) {
        // ছবি না পেলে একটি ডিফল্ট প্রোফাইল পিকচার দিবে
        return await loadImage("https://i.imgur.com/6VBn396.png");
    }
}

async function generateFrame(type, userId, res, size, x, y, isCircle = true) {
    try {
        const bgUrl = IMAGES[type];
        // ফেসবুকের প্রোফাইল পিকচার পাওয়ার বিকল্প লিঙ্ক
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512`;

        const bgImg = await loadImage(bgUrl);
        const userImg = await getSafeImage(userImgUrl);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

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

// --- আপনার স্ক্রিনশটের মতো JSON API List ---
app.get('/api-list', (req, res) => {
    const host = `https://${req.get('host')}`;
    res.json({
        "toilet": `${host}/toilet/ID`,
        "jail": `${host}/jail/ID`,
        "hack": `${host}/hack/ID`,
        "trash": `${host}/trash/ID`,
        "wanted": `${host}/wanted/ID`,
        "rip": `${host}/rip/ID`,
        "AvatarCanvas": `${host}/toilet/`
    });
});

// Routes
app.get('/toilet/:id', (req, res) => generateFrame('toilet', req.params.id, res, 130, 345, 620));
app.get('/jail/:id', (req, res) => generateFrame('jail', req.params.id, res, 250, 125, 150));
app.get('/hack/:id', (req, res) => generateFrame('hack', req.params.id, res, 300, 100, 80, false));

app.get('/', (req, res) => {
    res.redirect('/api-list');
});

app.listen(PORT, () => console.log(`Server live on ${PORT}`));
