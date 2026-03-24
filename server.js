import express from 'express';
import multiavatar from '@multiavatar/multiavatar';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/avatar/:id', (req, res) => {
    const svgCode = multiavatar(req.params.id);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgCode);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
