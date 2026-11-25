[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/onlybountyy-hub/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/onlybountyy-hub/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# Warung Kilat

Game masak 2D top-down: kamu koki di sebuah warung kaki lima Indonesia yang
sibuk. Pesanan pelanggan muncul di papan pesanan dengan timer masing-masing.
Ambil bahan di counter, potong di talenan, masak di kompor, rakit hidangan di
meja peracik, lalu antar ke jendela saji sebelum timer habis. Pesanan benar
dan cepat memberi poin dan kombo; tekanan naik seiring hari berjalan —
pesanan datang lebih cepat dan lebih banyak bersamaan.

## Cara main

- **WASD / tombol panah** — gerakkan koki, atau **klik** untuk berjalan ke stasiun
- **E / Spasi** — ambil, potong, masak, rakit, sajikan
- **Q** — kosongkan piring di meja peracik
- **M** — musik nyala/mati, **Enter** — mulai / hari berikutnya

Menu: Nasi Goreng, Mie Goreng, Sate Ayam, Es Teh, Telur Balado — tiap hidangan
punya urutan olah sendiri (potong dulu baru masak, atau langsung diracik).

## Jalankan

```sh
node serve.ts
```

Buka http://localhost:8080. Tanpa build step, tanpa network — semua file
statis di bawah `game/`, semua gambar digambar dengan kode dan semua suara
disintesis dengan WebAudio.
