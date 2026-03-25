import express from 'express';
import canvas from 'canvas';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

// --- আপনার নির্ধারিত ছবিগুলোর ডাইরেক্ট লিঙ্ক ---
const IMAGES = {
    toilet: "https://i.ibb.co/pBT966n/image.png", 
    jail: "https://i.postimg.cc/Xv8P3p7K/jail.png", 
    hack: "https://i.postimg.cc/6pM0rX3V/hack.png", 
    trash: "https://i.postimg.cc/85zX3S6m/trash.png", 
    wanted: "https://i.postimg.cc/qR8v6S80/wanted.png", 
    rip: "https://i.postimg.cc/L5vP8hYn/rip.png",
    hitler: "https://i.postimg.cc/j5X3fW3X/hitler.png"
};

// কমন ফাংশন: ছবি জেনারেট করার জন্য
async function generateFrame(type, userId, res, size, x, y, isCircle = true) {
    try {
        const bgUrl = IMAGES[type];
        // ফেসবুকের প্রোফাইল পিকচার পাওয়ার জন্য সবচেয়ে স্টেবল লিঙ্ক
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=512&height=512`;

        // ছবিগুলো লোড করা
        const [bgImg, userImg] = await Promise.all([
            loadImage(bgUrl),
            loadImage(userImgUrl).catch(() => loadImage("https://i.imgur.com/6VBn396.png")) // ছবি না পেলে ডিফল্ট ছবি
        ]);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        
        // কোয়ালিটি স্মুথ করা
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ১. মেইন ব্যাকগ্রাউন্ড আঁকা
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // ২. প্রোফাইল পিকচার প্রসেসিং
        ctx.save();
        if (isCircle) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
        }
        ctx.drawImage(userImg, x, y, size, size);
        ctx.restore();

        // আউটপুট পাঠানো
        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());

    } catch (error) {
        console.error(`Error generating ${type}:`, error.message);
        res.status(500).json({ 
            success: false, 
            error: "Image generation failed",
            msg: error.message 
        });
    }
}

// --- সব কমান্ডের এন্ডপয়েন্ট (Routes) ---

// ১. Toilet (size, x, y) - আপনার প্রথম ছবির পজিশন অনুযায়ী সেট করা
app.get('/toilet/:id', (req, res) => {
    generateFrame('toilet', req.params.id, res, 125, 345, 620); 
});

// ২. Jail
app.get('/jail/:id', (req, res) => {
    generateFrame('jail', req.params.id, res, 250, 125, 150);
});

// ৩. Hack (Square image)
app.get('/hack/:id', (req, res) => {
    generateFrame('hack', req.params.id, res, 300, 100, 80, false);
});

// ৪. Trash
app.get('/trash/:id', (req, res) => {
    generateFrame('trash', req.params.id, res, 200, 280, 450);
});

// ৫. Wanted
app.get('/wanted/:id', (req, res) => {
    generateFrame('wanted', req.params.id, res, 320, 90, 230, false);
});

// ৬. RIP
app.get('/rip/:id', (req, res) => {
    generateFrame('rip', req.params.id, res, 150, 175, 110);
});

// ৭. Hitler
app.get('/hitler/:id', (req, res) => {
    generateFrame('hitler', req.params.id, res, 140, 230, 160);
});

// হোম পেজ এবং হেল্প লিস্ট
app.get('/', (req, res) => {
    res.send(`
        <h1>Sabbir Custom API</h1>
        <p>Status: Online ✅</p>
        <ul>
            <li>/toilet/:id</li>
            <li>/jail/:id</li>
            <li>/hack/:id</li>
            <li>/trash/:id</li>
            <li>/wanted/:id</li>
            <li>/rip/:id</li>
            <li>/hitler/:id</li>
        </ul>
    `);
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
