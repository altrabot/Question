// ==================== STATE ====================
let currentPage = 'login'; // login, notif, q1..q14, secret, thanks
let user = null;
let answers = {};
let loginStep = 1; // 1: kode, 2: password
let loginKode = '';
let loginPassword = '';
let errorMessage = '';

// ==================== PARTIKEL CANVAS ====================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const particleCount = 50;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1;
        this.color = `rgba(255, 200, 220, ${Math.random() * 0.5 + 0.2})`;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

resizeCanvas();
initParticles();
animateParticles();

// ==================== DATA PERTANYAAN ====================
const questions = {
    1: {
        text: "Siapa nama mu?",
        type: "radio",
        options: ["A. Susanti", "B. Tohang"],
        validate: (value) => {
            if (!user) return null;
            if (user.name === 'Susanti') return value === 'A. Susanti' ? null : 'Jawaban harus Susanti';
            else return value === 'B. Tohang' ? null : 'Jawaban harus Tohang';
        }
    },
    2: {
        text: "Baju apa yang kamu pakai sekarang?",
        type: "radio-with-other",
        options: ["A. Kaos", "B. T-Shirt", "C. Lainnya"],
        validate: (value) => value ? null : 'Pilih salah satu'
    },
    3: {
        text: "Warna apa pakaian yang sedang kamu pakai?",
        type: "text",
        min: 20,
        max: 50,
        validate: (value) => {
            if (value.length < 20) return 'Minimal 20 huruf';
            if (value.length > 50) return 'Maksimal 50 huruf';
            return null;
        }
    },
    4: {
        text: "Apa hal yang kamu suka?",
        type: "text",
        min: 20,
        max: 50,
        validate: (value) => {
            if (value.length < 20) return 'Minimal 20 huruf';
            if (value.length > 50) return 'Maksimal 50 huruf';
            return null;
        }
    },
    5: {
        text: "Hal yang tidak kamu suka?",
        type: "text",
        min: 20,
        max: 50,
        validate: (value) => {
            if (value.length < 20) return 'Minimal 20 huruf';
            if (value.length > 50) return 'Maksimal 50 huruf';
            return null;
        }
    },
    6: {
        text: "Siapa orang yang kamu sukai saat ini?",
        type: "text",
        validate: (value) => {
            if (value.length > 6) return 'Maksimal 6 huruf';
            if (value.toLowerCase() !== 'tohang') return 'Harus Tohang';
            return null;
        }
    },
    7: {
        text: "Apa alasan kamu menyukainya?",
        type: "text",
        min: 20,
        max: 50,
        validate: (value) => {
            if (value.length < 20) return 'Minimal 20 huruf';
            if (value.length > 50) return 'Maksimal 50 huruf';
            return null;
        }
    },
    8: {
        text: "Apa status kalian berdua saat ini?",
        type: "radio",
        options: ["A. Berpacaran", "B. Suami & Istri", "C. Calon Pasutri"],
        validate: (value) => value ? null : 'Pilih salah satu'
    },
    9: {
        text: "Hal yang kamu benci darinya?",
        type: "text",
        min: 30,
        max: 100,
        validate: (value) => {
            if (value.length < 30) return 'Minimal 30 huruf';
            if (value.length > 100) return 'Maksimal 100 huruf';
            const forbidden = /gak tau|tidak tau|tak tau|rahasia|pokoknya|adalah pokoknya|entah|tidak tahu|nggak tahu|ga tau|nggak tau|ga tahu/i;
            if (forbidden.test(value)) return 'Tidak boleh mengandung kata yang berarti tidak tahu atau rahasia';
            return null;
        }
    },
    10: {
        text: "Hal yang paling kamu suka darinya?",
        type: "text",
        min: 30,
        max: 100,
        validate: (value) => {
            if (value.length < 30) return 'Minimal 30 huruf';
            if (value.length > 100) return 'Maksimal 100 huruf';
            const forbidden = /gak tau|tidak tau|tak tau|rahasia|pokoknya|adalah pokoknya|entah|tidak tahu|nggak tahu|ga tau|nggak tau|ga tahu/i;
            if (forbidden.test(value)) return 'Tidak boleh mengandung kata yang berarti tidak tahu atau rahasia';
            return null;
        }
    },
    11: {
        text: "Apa kamu sedang berharap dengan nya?",
        type: "radio",
        options: ["A. Iya", "B. Tidak"],
        validate: (value) => value ? null : 'Pilih salah satu'
    },
    13: {
        text: "Pertanyaan Jebakan",
        type: "special",
    },
    14: {
        text: "Coba ceritakan tentang dia lebih dalam.",
        type: "text",
        min: 100,
        max: 1000,
        validate: (value) => {
            if (value.length < 100) return 'Minimal 100 huruf';
            if (value.length > 1000) return 'Maksimal 1000 huruf';
            return null;
        }
    }
};

// ==================== RENDER UTAMA ====================
const app = document.getElementById('app');

function render() {
    let html = '';
    if (currentPage === 'login') {
        html = renderLogin();
    } else if (currentPage === 'notif') {
        html = renderNotif();
    } else if (currentPage === 'secret') {
        html = renderSecret();
    } else if (currentPage === 'thanks') {
        html = renderThanks();
    } else if (currentPage === 'q12a' || currentPage === 'q12b') {
        html = renderQuestion12(currentPage === 'q12a' ? 'iya' : 'tidak');
    } else if (currentPage === 'q13') {
        html = renderQuestion13();
    } else if (currentPage === 'q14') {
        html = renderQuestion14();
    } else if (currentPage.startsWith('q')) {
        const qNum = parseInt(currentPage.substring(1));
        html = renderQuestion(qNum);
    }
    app.innerHTML = html;

    // Attach events
    if (currentPage === 'login') attachLoginEvents();
    else if (currentPage === 'notif') attachNotifEvents();
    else if (currentPage === 'secret') attachSecretEvents();
    else if (currentPage === 'thanks') attachThanksEvents();
    else if (currentPage === 'q12a' || currentPage === 'q12b') attachQuestion12Events();
    else if (currentPage === 'q13') attachQ13Events();
    else if (currentPage === 'q14') attachQ14Events();
    else if (currentPage.startsWith('q')) attachQuestionEvents(currentPage);
}

// ==================== FUNGSI RENDER ====================
function renderLogin() {
    return `
        <div class="card">
            <h1>Selamat datang!</h1>
            <p>Silakan masukkan kode akses untuk melanjutkan.</p>
            ${errorMessage ? `<div class="error">${errorMessage}</div>` : ''}
            <div class="form-group">
                <label>Kode Akses</label>
                <input type="text" id="kode" value="${loginKode}" placeholder="Masukkan kode">
            </div>
            ${loginStep === 2 ? `
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="password" value="${loginPassword}" placeholder="Masukkan password">
            </div>
            ` : ''}
            <button class="btn" id="loginBtn">Login</button>
        </div>
    `;
}

function renderNotif() {
    return `
        <div class="card">
            <h2>Hai ${user?.name}!</h2>
            <p>Anda telah berhasil masuk ke sistem.</p>
            <p>Jawaban yang dipilih bersifat permanen dan tidak dapat diubah.</p>
            <p>Kode akses hanya bisa digunakan sekali.</p>
            <p class="warning">PERINGATAN: Jika Anda keluar dari website sebelum menyelesaikan semua pertanyaan, maka sistem yang terhubung dengan HP developer (Tohang) akan melakukan reset dan menyebarkan data sensitif ke seluruh platform media sosial.</p>
            <button class="btn" id="lanjutBtn">Lanjut</button>
        </div>
    `;
}

function renderSecret() {
    return `
        <div class="card">
            <h2>Hai ${user?.name}</h2>
            <h3>Pesan Rahasia</h3>
            <p>Pertanyaan selanjutnya sangat rahasia.</p>
            <p>Hanya kamu yang mengetahui jawabannya.</p>
            <p>Sistem ini tidak menyimpan data yang kamu tulis.</p>
            <p class="warning">(Sebenarnya jawaban tetap dicatat di sistem log, tapi kami tidak akan menyebarkannya.)</p>
            <button class="btn" id="lanjutBtn">Lanjut</button>
        </div>
    `;
}

function renderThanks() {
    return `
        <div class="card">
            <h2>Terima Kasih!</h2>
            <p>Jawaban Anda telah tercatat.</p>
            <a href="https://wa.me/6283131871328" target="_blank" class="btn" id="waBtn">Ayo jujur dengan nya</a>
        </div>
    `;
}

function renderQuestion(qNum) {
    const q = questions[qNum];
    if (!q) return '';
    let optionsHtml = '';
    if (q.type === 'radio' || q.type === 'radio-with-other') {
        optionsHtml = q.options.map(opt => `
            <label class="radio-label">
                <input type="radio" name="q${qNum}" value="${opt}"> ${opt}
            </label>
        `).join('');
        if (q.type === 'radio-with-other') {
            optionsHtml += `<div id="other-input-container" style="display:none; margin-top:10px;"><input type="text" id="other-text" placeholder="Sebutkan lainnya"></div>`;
        }
    } else if (q.type === 'text') {
        optionsHtml = `<textarea id="answer" rows="4" placeholder="Tulis jawaban..."></textarea>`;
    }
    return `
        <div class="card">
            <h2>Hai ${user?.name}</h2>
            <h3>Pertanyaan ${qNum}</h3>
            <p>${q.text}</p>
            <div class="form-group">
                ${optionsHtml}
            </div>
            <div id="error" class="error"></div>
            <button class="btn" id="nextBtn">Lanjut</button>
        </div>
    `;
}

function renderQuestion12(type) {
    const text = type === 'iya' ? 'Apa yang kamu harapkan darinya?' : 'Kenapa kamu tidak berharap dengan nya?';
    return `
        <div class="card">
            <h2>Hai ${user?.name}</h2>
            <h3>Pertanyaan 12</h3>
            <p>${text}</p>
            <div class="form-group">
                <textarea id="answer" rows="4" placeholder="Tulis jawaban..."></textarea>
            </div>
            <div id="error" class="error"></div>
            <button class="btn" id="nextBtn">Lanjut</button>
        </div>
    `;
}

function renderQuestion13() {
    return `
        <div class="card">
            <h2>Hai ${user?.name}</h2>
            <h3>Pertanyaan 13</h3>
            <p>Pilih salah satu:</p>
            <div class="button-group">
                <button class="btn-choice" id="choiceA">A. Menyapa</button>
                <button class="btn-choice" id="choiceB">B. Peluk</button>
                <button class="btn-choice" id="choiceC">C. Cium</button>
            </div>
        </div>
    `;
}

function renderQuestion14() {
    return `
        <div class="card">
            <h2>Hai ${user?.name}</h2>
            <h3>Pertanyaan 14</h3>
            <p>${questions[14].text}</p>
            <div class="form-group">
                <textarea id="answer" rows="6" placeholder="Tulis cerita..."></textarea>
            </div>
            <div id="error" class="error"></div>
            <button class="btn" id="nextBtn">Lanjut</button>
        </div>
    `;
}

// ==================== ATTACH EVENTS ====================
function attachLoginEvents() {
    const kodeInput = document.getElementById('kode');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    if (kodeInput) {
        kodeInput.addEventListener('input', (e) => loginKode = e.target.value);
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => loginPassword = e.target.value);
    }

    loginBtn.addEventListener('click', async () => {
        if (loginStep === 1) {
            if (!loginKode) {
                errorMessage = 'Masukkan kode akses';
                render();
                return;
            }
            loginStep = 2;
            errorMessage = '';
            render();
        } else {
            if (!loginKode || !loginPassword) {
                errorMessage = 'Masukkan kode dan password';
                render();
                return;
            }
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kode: loginKode, password: loginPassword }),
                    credentials: 'include'
                });
                if (res.status === 401) {
                    const data = await res.json();
                    errorMessage = data.error || 'Login gagal';
                    render();
                    return;
                }
                const data = await res.json();
                if (res.ok) {
                    user = { name: data.name, kode: loginKode };
                    currentPage = 'notif';
                    loginStep = 1;
                    loginKode = '';
                    loginPassword = '';
                    errorMessage = '';
                    render();
                } else {
                    errorMessage = data.error || 'Login gagal';
                    render();
                }
            } catch (err) {
                errorMessage = 'Terjadi kesalahan';
                render();
            }
        }
    });
}

function attachNotifEvents() {
    document.getElementById('lanjutBtn').addEventListener('click', () => {
        currentPage = 'q1';
        render();
    });
}

function attachSecretEvents() {
    document.getElementById('lanjutBtn').addEventListener('click', () => {
        currentPage = 'q14';
        render();
    });
}

function attachThanksEvents() {
    // nothing
}

function attachQuestionEvents(page) {
    const qNum = parseInt(page.substring(1));
    const q = questions[qNum];
    const nextBtn = document.getElementById('nextBtn');
    const errorDiv = document.getElementById('error');

    // Untuk pertanyaan 6: outline merah real-time
    if (qNum === 6) {
        const input = document.getElementById('answer');
        if (input) {
            input.addEventListener('input', (e) => {
                if (e.target.value.length > 6) {
                    e.target.classList.add('error-outline');
                } else {
                    e.target.classList.remove('error-outline');
                }
            });
        }
    }

    nextBtn.addEventListener('click', async () => {
        let value = '';
        if (q.type === 'radio' || q.type === 'radio-with-other') {
            const selected = document.querySelector(`input[name="q${qNum}"]:checked`);
            if (!selected) {
                errorDiv.innerText = 'Pilih salah satu';
                return;
            }
            value = selected.value;
            if (q.type === 'radio-with-other' && value === 'C. Lainnya') {
                const otherInput = document.getElementById('other-text');
                if (!otherInput || !otherInput.value.trim()) {
                    errorDiv.innerText = 'Isi keterangan lainnya';
                    return;
                }
                value = otherInput.value.trim();
            }
        } else if (q.type === 'text') {
            const textarea = document.getElementById('answer');
            value = textarea.value.trim();
        }

        // Validasi
        let error = null;
        if (q.validate) {
            error = q.validate(value);
        }
        if (error) {
            errorDiv.innerText = error;
            return;
        }

        // Kirim ke server
        try {
            const res = await fetch('/api/jawab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomor: qNum, jawaban: value }),
                credentials: 'include'
            });
            if (res.status === 401) {
                currentPage = 'login';
                errorMessage = 'Sesi habis, silakan login ulang';
                render();
                return;
            }
            if (!res.ok) {
                const data = await res.json();
                errorDiv.innerText = data.error || 'Gagal mengirim';
                return;
            }
            answers[qNum] = value;
            // Tentukan halaman selanjutnya
            let nextPage = '';
            if (qNum === 11) {
                nextPage = (value === 'A. Iya') ? 'q12a' : 'q12b';
            } else if (qNum === 14) {
                nextPage = 'thanks';
            } else {
                nextPage = 'q' + (qNum + 1);
            }
            currentPage = nextPage;
            render();
        } catch (err) {
            errorDiv.innerText = 'Gagal mengirim jawaban';
        }
    });

    // Untuk radio-with-other: tampilkan input lainnya
    if (q.type === 'radio-with-other') {
        const radios = document.querySelectorAll(`input[name="q${qNum}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const otherContainer = document.getElementById('other-input-container');
                if (e.target.value === 'C. Lainnya') {
                    otherContainer.style.display = 'block';
                } else {
                    otherContainer.style.display = 'none';
                }
            });
        });
    }
}

function attachQuestion12Events() {
    const nextBtn = document.getElementById('nextBtn');
    const errorDiv = document.getElementById('error');
    nextBtn.addEventListener('click', async () => {
        const value = document.getElementById('answer').value.trim();
        if (value.length < 20) {
            errorDiv.innerText = 'Minimal 20 huruf';
            return;
        }
        if (value.length > 50) {
            errorDiv.innerText = 'Maksimal 50 huruf';
            return;
        }
        try {
            const res = await fetch('/api/jawab', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nomor: 12, jawaban: value }),
                credentials: 'include'
            });
            if (res.status === 401) {
                currentPage = 'login';
                errorMessage = 'Sesi habis, silakan login ulang';
                render();
                return;
            }
            if (!res.ok) {
                const data = await res.json();
                errorDiv.innerText = data.error || 'Gagal mengirim';
                return;
            }
            answers[12] = value;
            currentPage = 'q13';
            render();
        } catch (err) {
            errorDiv.innerText = 'Gagal mengirim jawaban';
        }
    });
}

function attachQ13E
