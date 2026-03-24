const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const app = express();

// Render-এর দেওয়া পোর্ট অথবা লোকাল ৩০০০ পোর্ট ব্যবহার করবে
const PORT = process.env.PORT || 3000;
const ASSETS_PATH = path.join(__dirname, 'assets');

app.get('/generate', async (req, res) => {
    const { hair, eyes, skin } = req.query;

    // 4K ক্যানভাস (৩৮৪০ x ৩৮৪০)
    const canvas = createCanvas(3840, 3840);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    try {
        // ১. বডি বা স্কিন (ডিফল্ট ১)
        const skinVal = skin || '1';
        const baseImg = await loadImage(path.join(ASSETS_PATH, `face_${skinVal}.png`));
        ctx.drawImage(baseImg, 0, 0, 3840, 3840);

        // ২. চোখ (যদি প্যারামিটার থাকে)
        if (eyes) {
            const eyeImg = await loadImage(path.join(ASSETS_PATH, `eyes_${eyes}.png`));
            ctx.drawImage(eyeImg, 0, 0, 3840, 3840);
        }

        // ৩. চুল (যদি প্যারামিটার থাকে)
        if (hair) {
            const hairImg = await loadImage(path.join(ASSETS_PATH, `hair_${hair}.png`));
            ctx.drawImage(hairImg, 0, 0, 3840, 3840);
        }

        // ছবি জেনারেট করে রেসপন্স পাঠানো
        const buffer = canvas.toBuffer('image/png');
        res.set('Content-Type', 'image/png');
        res.send(buffer);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error: Assets not found or corrupted.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
