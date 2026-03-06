const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // mengizinkan semua origin (untuk development)
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key-cheesan-tosyah',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 jam
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Data valid
const validCodes = {
    'CHESAN07': { password: '2007', name: 'Susanti' },
    'TOSYAH06': { password: '122006', name: 'Tohang' }
};
const usedCodes = new Set();

// Middleware cek login
const requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// API Login
app.post('/api/login', (req, res) => {
    const { kode, password } = req.body;
    console.log(`Login attempt: kode=${kode}`);
    if (!kode || !password) {
        return res.status(400).json({ error: 'Kode dan password diperlukan' });
    }
    const userData = validCodes[kode];
    if (!userData) {
        return res.status(401).json({ error: 'Kode akses tidak valid' });
    }
    if (usedCodes.has(kode)) {
        return res.status(401).json({ error: 'Kode akses sudah digunakan' });
    }
    if (userData.password !== password) {
        return res.status(401).json({ error: 'Password salah' });
    }
    // Sukses
    usedCodes.add(kode);
    req.session.user = { kode, name: userData.name };
    console.log(`User berhasil login: ${kode} (${userData.name})`);
    res.json({ success: true, name: userData.name });
});

// API Logout
app.post('/api/logout', requireLogin, (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// API Jawab
app.post('/api/jawab', requireLogin, (req, res) => {
    const { nomor, jawaban } = req.body;
    const user = req.session.user;
    console.log(`Jawaban Pertanyaan ${nomor} dari ${user.kode}: ${jawaban}`);
    res.json({ success: true });
});

// Semua route selain API mengarah ke index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log('Sedang menunggu login...');
    console.log(`Server running on port ${PORT}`);
});
