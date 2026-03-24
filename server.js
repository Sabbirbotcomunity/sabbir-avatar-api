import express from 'express';
import multiavatar from '@multiavatar/multiavatar';

const app = express();
const PORT = process.env.PORT || 3000;

// ১. এপিআই এর তথ্য জানার জন্য একটি লিস্ট রাউট
app.get('/api/list', (req, res) => {
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}`;

    res.json({
        status: "success",
        author: "Sabbir",
        data: {
            AvatarCanvas: `${fullUrl}/avatar/Sabbir`, // ডিফল্ট একটা লিঙ্ক
            GenerateAvatar: `${fullUrl}/avatar/:id`,   // ডাইনামিক লিঙ্ক
            Version: "1.0.0"
        }
    });
});

// ২. মেইন অবতার জেনারেটর রাউট
app.get('/avatar/:id', (req, res) => {
    try {
        const id = req.params.id;
        const svgCode = multiavatar(id);
        
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svgCode);
    } catch (error) {
        res.status(500).json({ error: "Avatar generation failed" });
    }
});

// ৩. হোম পেজ (লিঙ্ক চেক করার জন্য সহজ হবে)
app.get('/', (req, res) => {
    res.send('<h1>Sabbir Avatar API is Live!</h1><p>Visit <a href="/api/list">/api/list</a> to see endpoints.</p>');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
