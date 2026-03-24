import express from 'express';
import { createCanvas, loadImage } from 'canvas';

const app = express();
const PORT = process.env.PORT || 3000;

// আপনার দেওয়া টয়লেটের ছবির ডাইরেক্ট লিঙ্ক
const TOILET_IMG_URL = "https://i.ibb.co/pBT966n/image.png"; 

app.get('/toilet/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const userProfilePic = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

        // ১. ছবিগুলো লোড করা
        const [toiletImg, userImg] = await Promise.all([
            loadImage(TOILET_IMG_URL),
            loadImage(userProfilePic)
        ]);

        // ২. ক্যানভাস তৈরি করা (টয়লেটের ছবির সাইজ অনুযায়ী)
        const canvas = createCanvas(toiletImg.width, toiletImg.height);
        const ctx = canvas.getContext('2d');

        // ৩. প্রথমে টয়লেটের ছবি আঁকা
        ctx.drawImage(toiletImg, 0, 0, canvas.width, canvas.height);

        // ৪. ইউজারের ছবি গোল করে কাটা এবং বসানো
        const avatarSize = 130; // ছবির সাইজ ছোট-বড় করতে এটা পরিবর্তন করুন
        const x = canvas.width / 2 - avatarSize / 2;
        const y = canvas.height / 2 + 50; // টয়লেটের ভেতরের পজিশন অনুযায়ী অ্যাডজাস্ট করা

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(userImg, x, y, avatarSize, avatarSize);
        ctx.restore();

        // ৫. ফাইনাল ছবি পাঠানো
        res.setHeader('Content-Type', 'image/png');
        res.send(canvas.toBuffer());

    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating image");
    }
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
