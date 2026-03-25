import express from 'express';
import canvas from 'canvas';

const { createCanvas, loadImage } = canvas;
const app = express();
const PORT = process.env.PORT || 3000;

// --- আপনার নির্দিষ্ট ছবিগুলোর ডাইরেক্ট লিঙ্ক ---
const IMAGES = {
    toilet: "https://i.ibb.co/pBT966n/image.png", 
    jail: "https://i.postimg.cc/Xv8P3p7K/jail.png", 
    hack: "https://i.postimg.cc/6pM0rX3V/hack.png", 
    trash: "https://i.postimg.cc/85zX3S6m/trash.png", 
    wanted: "https://i.postimg.cc/qR8v6S80/wanted.png", 
    rip: "https://i.postimg.cc/L5vP8hYn/rip.png",
    hitler: "https://i.postimg.cc/j5X3fW3X/hitler.png"
};

// মেইন ইমেজ এডিটিং ফাংশন
async function generateFrame(type, userId, res, size, x, y, isCircle = true) {
    try {
        const bgUrl = IMAGES[type];
        // হাই রেজোলিউশন ফেসবুক প্রোফাইল পিকচার
        const userImgUrl = `https://graph.facebook.com/${userId}/picture?width=1024&height=1024&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        const [bgImg, userImg] = await Promise.all([
            loadImage(bgUrl),
            loadImage(userImgUrl)
        ]);

        const canvas = createCanvas(bgImg.width, bgImg.height);
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ১. ব্যাকগ্রাউন্ড ইমেজ ড্র করা
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        // ২. প্রোফাইল পিকচার এডিট করে বসানো
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
        console.error(`Error in ${type}:`, error.message);
        res.status(500).json({ error: "Image generation failed" });
    }
}

// --- API Endpoints (এগুলো বোটের কমান্ডে ব্যবহার করবেন) ---

// ১. Toilet (size, x, y)
app.get('/toilet/:id', (req, res) => generateFrame('toilet', req.params.id, res, 170, 215, 410));

// ২. Jail
app.get('/jail/:id', (req, res) => generateFrame('jail', req.params.id, res, 250, 125, 150));

// ৩. Hack (isCircle = false, চারকোনা হবে)
app.get('/hack/:id', (req, res) => generateFrame('hack', req.params.id, res, 280, 110, 80, false));

// ৪. Trash
app.get('/trash/:id', (req, res) => generateFrame('trash', req.params.id, res, 200, 280, 450));

// ৫. Wanted (isCircle = false)
app.get('/wanted/:id', (req, res) => generateFrame('wanted', req.params.id, res, 320, 90, 230, false));

// ৬. RIP
app.get('/rip/:id', (req, res) => generateFrame('rip', req.params.id, res, 150, 175, 110));

// ৭. Hitler
app.get('/hitler/:id', (req, res) => generateFrame('hitler', req.params.id, res, 140, 230, 160));

// এপিআই লিস্ট দেখার জন্য
app.get('/api-list', (req, res) => {
    const host = `https://${req.get('host')}`;
    res.json({
        success: true,
        endpoints: {
            toilet: `${host}/toilet/ID`,
            jail: `${host}/jail/ID`,
            hack: `${host}/hack/ID`,
            trash: `${host}/trash/ID`,
            wanted: `${host}/wanted/ID`,
            rip: `${host}/rip/ID`,
            hitler: `${host}/hitler/ID`
        }
    });
});

app.get('/', (req, res) => {
    res.send('<h1>Sabbir Custom API is Online!</h1><p>Visit /api-list for more info.</p>');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
