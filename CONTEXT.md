# QUIS

QUIS analyzes questionnaire responses and uploaded facial videos to support anxiety prediction workflows.

## Language

**Prediksi Video**:
Satu proses dan hasil prediksi kecemasan untuk satu video yang diunggah pengguna. Memiliki status proses dan mencakup hasil final, frame, dan event. Pemutaran hasil memakai video yang sudah tersimpan di server agar link hasil dapat dibuka ulang, dapat ditampilkan sebelum proses prediksi selesai, dan tetap ditampilkan saat prediksi gagal bersama pesan error.
_Avoid_: Job, queue job, run, result, local-only object URL

**Jendela Frame**:
Rentang waktu pendek dari data frame Prediksi Video yang dimuat untuk mengikuti posisi video saat ini. Dipakai agar visualisasi frame tetap ringan tanpa memuat semua frame sekaligus. Jendela default berdurasi 10 detik dan dapat bergeser saat pengguna scrub video atau timeline; hover memberi pratinjau, sedangkan click atau release drag melakukan seek video.
_Avoid_: Full frame dump, offset-first pagination

**Panel Hasil Prediksi Video**:
Panel ringkasan di sisi kanan pemutar video yang menampilkan hasil final, frame saat ini, dan event aktif. Panel ini memberi konteks numerik untuk posisi video yang sedang dilihat.
_Avoid_: Full-width result cards only

**Akses Prediksi Video**:
Token anonim tunggal yang memberi akses baca ke satu Prediksi Video tanpa login. Admin tidak memerlukan token untuk melihat daftar dan detail Prediksi Video. Link hasil tersedia segera setelah Prediksi Video dibuat, meskipun proses prediksi masih berjalan; token dapat memiliki expiry, tetapi default-nya tidak kedaluwarsa. Akses publik dan akses admin memakai batas otorisasi terpisah, tanpa riwayat publik lintas prediksi.
_Avoid_: Login prediksi, public ID only, multiple access tokens, optional auth endpoint, public prediction history

**Manajemen Prediksi Video**:
Area admin untuk melihat daftar dan detail semua Prediksi Video. Terpisah dari manajemen respons kuesioner karena Prediksi Video tidak berasal dari pengisian kuesioner. Daftar admin menampilkan status, video, hasil final, ukuran hasil, model, dan ringkasan error; detail admin tidak memerlukan token akses publik dan menggabungkan viewer video dengan tabel detail virtual untuk frame dan event.
_Avoid_: Tab respons, dashboard-only list
