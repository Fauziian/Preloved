Ubah dan refactor seluruh website yang sudah ada menjadi website katalog preloved premium (single seller), bukan marketplace. Website ini hanya berfungsi sebagai media katalog produk preloved dan branding toko, sedangkan seluruh proses pembelian dilakukan melalui Shopee.

Seluruh sistem lama seperti login user, register user, checkout, keranjang, payment gateway, transaksi, order, tracking, COD, transfer bank, QRIS, maupun fitur marketplace lainnya harus dihapus sepenuhnya.

Konsep Website

Website ini merupakan Official Preloved Store yang hanya memiliki 1 admin sebagai pengelola produk.

Tidak ada fitur multi seller.

Tidak ada fitur user menjual barang.

Tidak ada akun pembeli.

Tidak ada login user.

Pengunjung cukup membuka website, melihat produk, membaca deskripsi, kemudian apabila tertarik langsung diarahkan ke Shopee melalui tombol "Beli di Shopee".

Website difokuskan pada:

Branding toko
Menampilkan katalog preloved
Memberikan informasi produk secara lengkap
Mengarahkan pembeli ke Shopee

Website harus terasa eksklusif, premium, modern, cepat, elegan, dan nyaman digunakan.

Hapus Seluruh Sistem Lama

Hapus seluruh fitur berikut beserta backend, API, route, middleware, database, dan UI yang berkaitan:

Login User
Register User
Forgot Password
Profile User
Dashboard User
Session User
Authentication User
Authorization User
Keranjang
Wishlist (jika ada)
Checkout
Payment Gateway
Midtrans
Xendit
Transfer Bank
QRIS
COD
Invoice
Order
Tracking Pesanan
Status Pembayaran
Riwayat Pembelian
Ongkir
Pilihan Kurir
Alamat Pengiriman
Konfirmasi Pembayaran
Webhook Payment
Sistem Transaksi

Website menjadi website katalog murni.

Admin

Website hanya memiliki satu Admin.

Admin dapat login melalui halaman admin yang terpisah.

Panel admin tidak boleh dapat diakses oleh publik.

Admin dapat:

Dashboard

Dashboard modern yang menampilkan:

Total Produk
Produk Aktif
Produk Draft
Total Kategori
Statistik Produk Terbaru
Produk Terlaris (opsional)
Grafik sederhana jumlah produk
Manajemen Produk

Admin dapat:

Tambah Produk

Edit Produk

Hapus Produk

Publish

Draft

Informasi Produk

Setiap produk memiliki:

Nama Produk
Harga
Harga Coret (opsional)
Deskripsi Lengkap
Kondisi Barang
Brand
Kategori
Stok
Berat
Material
Tag Produk
Status Produk
Upload Foto

Upload multi gambar.

Minimal:

Cover
Gallery 1
Gallery 2
Gallery 3
Gallery 4
Gallery 5

Fitur:

Drag & Drop
Preview
Reorder
Hapus Foto
Variasi Produk Dinamis

Admin bebas membuat variasi sendiri.

Contoh:

Ukuran

XS
S
M
L
XL

atau

20–22
22–24
24–26

atau variasi lainnya.

Warna

Pink
Cream
Black
White
Blue
Custom

Size

36
37
38
39
Custom

Variasi dibuat dinamis sehingga tidak dibatasi.

Link Shopee

Setiap produk memiliki field:

Link Shopee

Contoh:

https://shopee.co.id/xxxxxxxx

Pada halaman detail produk akan muncul tombol besar:

Beli di Shopee

yang membuka tab baru menuju halaman Shopee.

Apabila link belum diisi, tombol tidak ditampilkan.

Tampilan User

Website tidak memiliki login.

Semua pengunjung langsung dapat melihat katalog.

Website dibuat seperti landing page premium.

Hero Section

Hero harus terlihat sangat premium.

Berisi:

Headline besar

Contoh:

Temukan Preloved Berkualitas dengan Harga Terbaik

Subheadline

"Barang pilihan, kondisi terawat, foto asli, dan langsung bisa dibeli melalui Shopee."

Tombol:

Lihat Koleksi
Belanja di Shopee

Tambahkan ilustrasi premium, gradient lembut, serta animasi halus agar memberikan kesan modern.

Katalog Produk

Grid modern.

Card sangat elegan.

Menampilkan:

Foto
Nama Produk
Harga
Harga Coret
Badge Kondisi
Badge Brand
Badge Kategori
Tombol Detail

Hover card menggunakan animasi yang halus dan profesional.

Detail Produk

Halaman detail harus terlihat eksklusif.

Terdiri dari:

Gallery besar

Thumbnail slider

Nama Produk

Harga

Harga Coret

Kondisi Barang

Brand

Kategori

Deskripsi Lengkap

Variasi:

Ukuran
Warna
Size

Semua variasi ditampilkan dalam bentuk chip/button yang modern.

Di bagian bawah terdapat tombol utama:

Beli di Shopee

yang mengarahkan ke link Shopee produk.

Kategori

Tambahkan kategori seperti:

Fashion Wanita
Fashion Pria
Tas
Sepatu
Aksesoris
Elektronik
Koleksi
Beauty
Rumah Tangga
Lainnya

Kategori dapat ditambah oleh admin.

Fitur Pencarian

Search realtime.

Cari berdasarkan:

Nama
Brand
Kategori
Tag
Filter Produk

Filter modern:

Harga
Kondisi
Brand
Kategori

Gunakan panel filter yang rapi dan mudah digunakan.

Tentang Toko

Tambahkan halaman About.

Berisi:

Cerita toko
Visi
Misi
Keunggulan
Jaminan foto asli
Barang original (jika berlaku)
Barang preloved berkualitas
FAQ

Tambahkan FAQ modern.

Contoh:

Apakah barang original?

Apakah foto asli?

Bagaimana cara membeli?

Mengapa diarahkan ke Shopee?

Bagaimana pengiriman dilakukan?

Testimoni

Section testimoni dengan tampilan premium.

Gunakan card elegan.

Tambahkan rating bintang.

Footer

Footer profesional berisi:

Logo
Tentang
Navigasi
Shopee
Instagram
TikTok
WhatsApp
Copyright
UI/UX

Gunakan desain setara website startup atau e-commerce premium.

Inspirasi:

Apple
Nike
Zara
Tokopedia
Shopee
Pinterest

Gunakan:

Banyak whitespace
Rounded corner modern
Shadow lembut
Glassmorphism ringan
Gradient elegan
Hover animation
Smooth transition
Micro interaction
Skeleton loading
Lazy image loading

Website harus terasa sangat premium.

Warna

Dominan:

Putih
Soft Pink
Ungu Pastel
Biru Pastel

Contoh kombinasi:

Background:

#FFFFFF
#FFF7FB

Primary:

#EC4899

Secondary:

#8B5CF6

Accent:

#6366F1

Success:

#10B981

Gunakan gradasi pink–ungu–biru secara elegan, tidak berlebihan.

Tipografi

Gunakan font modern seperti:

Poppins
Plus Jakarta Sans
Inter

Heading tegas.

Body nyaman dibaca.

Spacing harus sangat rapi.

Responsif

Website wajib sempurna di:

Desktop
Laptop
Tablet
Mobile

Tidak boleh ada layout yang rusak.

Performa

Optimalkan performa:

Lazy Loading Image
Image Compression
Code Splitting
Minify Asset
SEO Friendly
Lighthouse Score tinggi
Loading sangat cepat
Hasil Akhir

Website harus memberikan kesan:

Premium
Elegan
Bersih
Modern
Feminin namun profesional
Memanjakan mata pengunjung
Mudah digunakan
Fokus pada pengalaman visual
Branding toko yang kuat
Mengarahkan seluruh transaksi ke Shopee melalui tombol "Beli di Shopee"

Target akhirnya adalah menghadirkan website katalog preloved yang kualitas UI/UX-nya setara dengan e-commerce modern, namun tetap sederhana karena seluruh proses pembelian dilakukan di Shopee, bukan di dalam website.