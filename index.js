const playerElement = document.getElementById("soundcloudPlayer");
const tombol = document.getElementById("tombolMusik");
const player = SC.Widget(playerElement);

// Daftar lagu (semua pengunjung dengar lagu yang sama).
// Mau nambah atau ganti lagu: edit di sini, lalu upload ulang webnya.
const LAGU = [
    { url: "https://api.soundcloud.com/tracks/soundcloud%3Atracks%3A2049626188", title: "Everything U Are", cover: "album.jpeg" },
    { url: "https://soundcloud.com/dandi-dwie-lisadi/hindia-rumah-ke-rumah", title: "Rumah ke Rumah", cover: "house.jpeg" },
    { url: "https://soundcloud.com/godffangs/hindia-kids", title: "Kids", cover: "album.jpeg" },
    { url: "https://soundcloud.com/godffangs/hindia-kita-ke-sana", title: "Kita ke sana", cover: "images.jpeg" },
    { url: "https://soundcloud.com/muhammad-faza-938291781/hindia-secukupnyaa", title: "Secukupnya", cover: "house.jpeg" },
    { url: "https://soundcloud.com/maju-se-arah/harga-satu-pil-hindia", title: "Harga Satu Pil", cover: "album.jpeg" },
    { url: "https://soundcloud.com/user-650439525/hindia-cincin", title: "Cincin", cover: "images.jpeg" },
    { url: "https://soundcloud.com/user-225921661/evaluasi", title: "Evaluasi", cover: "house.jpeg" },
    { url: "https://soundcloud.com/xsya-kaaa/hindia-perseverance-in-the", title: "Perseverance (in the face of grief)", cover: "album.jpeg" },
    { url: "https://soundcloud.com/hindia-29894756/membasuh", title: "Membasuh", cover: "house.jpeg" }
    
];

let sekarang = 0;     // index lagu yang aktif
let durasi = 0;       // ms
let posisi = 0;       // ms
let siap = false;
let awal = true;
let memutar = false;

const $ = id => document.getElementById(id);

/* ---------- siluet cover di belakang card ---------- */
const bgs = [0, 1].map(() => {
    const d = document.createElement("div");
    d.className = "bg";
    document.body.prepend(d);
    return d;
});
let bgAktif = 0;
let bgUrl = "";

function latarBelakang() {
    const url = LAGU[sekarang].cover;
    if (url === bgUrl) return;
    bgUrl = url;
    const baru = bgs[1 - bgAktif];
    baru.style.backgroundImage = `url('${url}')`;
    baru.classList.add("on");
    bgs[bgAktif].classList.remove("on");
    bgAktif = 1 - bgAktif;
}

/* ---------- bangun tampilan sekali ---------- */
$("track").innerHTML = LAGU.map((l, i) =>
    `<div class="cv" data-i="${i}" style="background-image:url('${l.cover}')"
          role="button" tabindex="0" aria-label="Putar lagu ${i + 1}"></div>`).join("");

$("daftar").innerHTML = LAGU.map((l, i) =>
    `<li class="row" data-i="${i}" tabindex="0">
        <span class="no"></span><span class="jd">${l.title}</span>
    </li>`).join("");

function waktu(ms) {
    const d = Math.floor(ms / 1000);
    return Math.floor(d / 60) + ":" + String(d % 60).padStart(2, "0");
}

// perbarui semua yang berubah saat lagu ganti / play / pause
function tampil() {
    $("track").style.setProperty("--i", sekarang);
    latarBelakang();
    $("judul").textContent = LAGU[sekarang].title;
    $("meta").textContent = `Lagu ${sekarang + 1} dari ${LAGU.length}`;

    document.querySelectorAll(".cv").forEach((c, i) =>
        c.classList.toggle("on", i === sekarang));

    document.querySelectorAll(".row").forEach((r, i) => {
        r.classList.toggle("on", i === sekarang);
        if (i === sekarang) r.scrollIntoView({ block: "nearest", behavior: "smooth" });
        r.querySelector(".no").innerHTML = i === sekarang
            ? `<i class="bi bi-${memutar ? "pause" : "play"}-fill"></i>`
            : i + 1;
    });

    tombol.innerHTML = `<i class="bi bi-${memutar ? "pause" : "play"}-fill"></i>`;
    tombol.setAttribute("aria-label", memutar ? "Jeda" : "Putar");
}

/* ---------- kontrol lagu ---------- */
function pilih(i, langsungPutar) {
    sekarang = i;
    posisi = 0;
    durasi = 0;
    $("seek").value = 0;
    $("waktu").textContent = "0:00";
    $("durasi").textContent = "0:00";
    tampil();
    if (siap) player.load(LAGU[i].url, { auto_play: langsungPutar, show_artwork: false });
}

function berikutnya() {
    pilih((sekarang + 1) % LAGU.length, true);
}

function sebelumnya() {
    // kalau lagu sudah jalan lebih dari 3 detik, ulang dari awal dulu
    if (posisi > 3000) { player.seekTo(0); return; }
    pilih((sekarang - 1 + LAGU.length) % LAGU.length, true);
}

function klikLagu(e) {
    const el = e.target.closest("[data-i]");
    if (!el) return;
    const i = Number(el.dataset.i);
    if (i === sekarang) { if (siap) player.toggle(); }
    else pilih(i, true);
}

/* ---------- event SoundCloud ---------- */
player.bind(SC.Widget.Events.READY, function () {
    siap = true;
    if (awal) {
        awal = false;
        pilih(sekarang, false);   // muat lagu pertama
    } else {
        player.getDuration(d => { durasi = d; $("durasi").textContent = waktu(d); });
    }
});

player.bind(SC.Widget.Events.PLAY, () => { memutar = true; tampil(); });
player.bind(SC.Widget.Events.PAUSE, () => { memutar = false; tampil(); });
player.bind(SC.Widget.Events.FINISH, () => { memutar = false; berikutnya(); });
player.bind(SC.Widget.Events.PLAY_PROGRESS, e => {
    posisi = e.currentPosition;
    $("seek").value = e.relativePosition * 1000;
    $("waktu").textContent = waktu(e.currentPosition);
});

/* ---------- tombol ---------- */
tombol.addEventListener("click", () => { if (siap) player.toggle(); });
$("tombolNext").addEventListener("click", berikutnya);
$("tombolPrev").addEventListener("click", sebelumnya);
$("seek").addEventListener("input", e => {
    if (durasi) player.seekTo(e.target.value / 1000 * durasi);
});
$("strip").addEventListener("click", klikLagu);
$("daftar").addEventListener("click", klikLagu);
document.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.matches(".row,.cv")) e.target.click();
});

tampil();