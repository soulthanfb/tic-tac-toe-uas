# 🎮 Tic Tac Toe — Web & Desktop App

Game **Tic Tac Toe modern** dengan berbagai ukuran papan, mode bot pintar, animasi, sound effect, dan versi **aplikasi desktop (Electron)**.
Project ini dibuat sebagai **tugas / project pembelajaran** menggunakan HTML, CSS, JavaScript, dan Electron.

---

## ✨ Fitur Utama

* 🔢 **Ukuran papan dinamis**: 3×3, 6×6, 9×9, 11×11
* 🤖 **VS Bot** (Easy / Normal / Hard)
* 👥 **VS Human** (2 Player)
* 🏆 **Leaderboard lokal** (tersimpan di perangkat)
* 📊 **Statistik lengkap** (win, lose, draw, streak)
* 💎 **Sistem reward Emerald**
* 🎨 **Skin / Theme** (Neon, Retro, Candy, Classic)
* 🔊 **Sound effect + Volume + Mute**
* 📱 **Animasi & efek mobile feeling** (shake, pop X/O)
* 🖥️ **Fullscreen mode (F11 / tombol UI)**
* 🔄 **Auto Update (Electron + GitHub Releases)**
* 🚀 **Versi Web & Desktop App**

---

## 🖥️ Spesifikasi Minimum

### Laptop / PC

* OS: Windows 10 / 11
* RAM: **2 GB (minimum)**, **4 GB+ (rekomendasi)**
* Browser: Chrome / Edge / Firefox (versi terbaru)

### Mobile (Browser)

* Android / iOS
* RAM: 2–3 GB
* Browser modern (Chrome / Safari)

### Penyimpanan

* Web: ± **5–30 MB**
* Desktop App: ± **80–150 MB**
* Data lokal (statistik): **< 1 MB**

---

## 🛠️ Teknologi yang Digunakan

* **HTML5**
* **CSS3 (Modern UI + Animation)**
* **JavaScript (ES Module)**
* **Electron**
* **Electron Builder**
* **LocalStorage**
* **Git & GitHub**

---

## 📦 Struktur Project

```
tic-tac-toe/
├─ assets/            # gambar, icon, sound
├─ src/               # file JavaScript (logic & UI)
│  ├─ main.js
│  ├─ game.js
│  ├─ ui.js
│  └─ ...
├─ index.html
├─ style.css
├─ preload.js
├─ electron-main.js
├─ package.json
└─ README.md
```

---

## ▶️ Menjalankan Versi Web

Buka langsung:

```
index.html
```

atau gunakan **Live Server (VS Code)**.

---

## 🖥️ Menjalankan Versi Desktop (Electron)

### Install dependencies

```bash
npm install
```

### Jalankan aplikasi

```bash
npm start
```

---

## 📦 Build Aplikasi (Installer)

```bash
npm run dist
```

Hasil build akan ada di folder:

```
release/
```

---

## 🔄 Auto Update

* Menggunakan **electron-updater**
* Update diambil dari **GitHub Releases**
* Bisa dicek melalui menu **Check Update** di aplikasi

---

## 🧑‍💻 Developer

* **Nama**: Soulthan Fadhlillah Bagus
* **GitHub**: [https://github.com/soulthanfb](https://github.com/soulthanfb)

---

## 📜 Lisensi

Project ini dibuat untuk **keperluan pembelajaran & tugas**.
Silakan digunakan, dimodifikasi, dan dikembangkan lebih lanjut.

---

> 🎉 Terima kasih sudah mencoba Tic Tac Toe!
