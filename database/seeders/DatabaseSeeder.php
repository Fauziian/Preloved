<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Use placeholder images from picsum that look like fashion items
        $imgs = [
            'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80',
            'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80',
            'https://images.unsplash.com/photo-1594938298603-c8148c4b4dfc?w=400&q=80',
            'https://images.unsplash.com/photo-1551163943-3f7af44a2c7a?w=400&q=80',
            'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&q=80',
        ];

        $products = [
            ['Sweater Rajut Pink Oversize','Sweater rajut premium warna pink. Bahan lembut dan nyaman dipakai. Kondisi sangat terawat.','Sangat Baik','Unbranded','Fashion Wanita',85000,320000,'300g','Rajut Akrilik',['sweater','rajut','pink'],'Ukuran',['M','L'],$imgs[0]],
            ['Crop Top Stripe Monochrome','Crop top motif stripe hitam-putih trendi. Bahan stretch nyaman.','Baik','H&M','Fashion Wanita',65000,220000,'200g','Cotton Stretch',['crop top','stripe'],'Ukuran',['S','M'],$imgs[1]],
            ['Polo Crop Navy Premium','Polo shirt crop warna navy elegan. Bahan berkualitas, terasa adem.','Sangat Baik','Uniqlo','Fashion Wanita',75000,280000,'250g','Pique Cotton',['polo','crop','navy'],'Ukuran',['M'],$imgs[2]],
            ['Blouse Ruffle Putih Elegan','Blouse detail ruffle feminin dan elegan. Warna putih bersih, bahan ringan.','Sangat Baik','Zara','Fashion Wanita',110000,430000,'220g','Chiffon',['blouse','ruffle','elegan'],'Ukuran',['S','M'],$imgs[3]],
            ['Casual Blazer Cream','Blazer kasual warna cream netral. Sangat cocok untuk acara semi-formal maupun formal.','Sangat Baik','Mango','Fashion Wanita',145000,580000,'450g','Polyester Blend',['blazer','cream','casual'],'Ukuran',['M','L'],$imgs[4]],
            ['Denim Jacket Vintage Blue','Jaket denim tebal gaya vintage. Warna biru pudar alami, stylish untuk layering.','Baik','Levi\'s','Fashion Pria',175000,690000,'600g','100% Cotton Denim',['jacket','denim','vintage'],'Ukuran',['L','XL'],$imgs[0]],
            ['Pleated Skirt Olive Green','Rok plisket warna hijau olive yang estetik. Karet pinggang nyaman stretch.','Sangat Baik','Unbranded','Fashion Wanita',90000,350000,'280g','Premium Pleated Crepe',['skirt','pleated','olive'],'Ukuran',['All Size'],$imgs[1]],
            ['Floral Summer Dress','Dress motif bunga-bunga cantik untuk musim panas. Bahan adem dan jatuh di badan.','Sangat Baik','Pull & Bear','Fashion Wanita',125000,450000,'240g','Rayon Viscose',['dress','floral','summer'],'Ukuran',['S','M'],$imgs[2]],
            ['Black Linen Trousers','Celana panjang bahan linen warna hitam. Sejuk dipakai seharian, gaya kasual santai.','Baik','Uniqlo','Fashion Wanita',105000,399000,'320g','Linen Blend',['trousers','linen','black'],'Ukuran',['M','L'],$imgs[3]],
            ['Knit Cardigan Soft Yellow','Cardigan rajut warna kuning pastel lembut. Lucu untuk outfit OOTD harian.','Sangat Baik','Cotton On','Fashion Wanita',95000,380000,'290g','Acrylic Knit',['cardigan','knit','yellow'],'Ukuran',['M'],$imgs[4]],
            ['Handbag Leather Coffee','Tas tangan bahan kulit imitasi warna cokelat kopi. Muat banyak barang dan terlihat vintage.','Sangat Baik','Charles & Keith','Tas',220000,890000,'500g','PU Leather',['handbag','leather','brown'],'Warna',['Coffee Brown'],$imgs[0]],
            ['Canvas Sneaker White','Sepatu sneakers kanvas warna putih bersih. Klasik dan selalu cocok dengan segala gaya.','Baik','Converse','Sepatu',180000,750000,'700g','Canvas & Rubber',['sneaker','canvas','white'],'Ukuran',['38','39','40'],$imgs[1]],
            ['Sunglasses Retro Brown','Kacamata hitam frame cokelat retro bergaya klasik tahun 90-an.','Sangat Baik','Unbranded','Aksesoris',45000,180000,'50g','Polycarbonate',['sunglasses','retro','brown'],'Warna',['Brown Tint'],$imgs[2]],
            ['Wool Beret Hat Mustard','Topi baret bahan wool warna kuning mustard hangat dan fashionable.','Sangat Baik','Unbranded','Aksesoris',50000,195000,'100g','100% Wool',['hat','beret','wool'],'Ukuran',['All Size'],$imgs[3]],
            ['Gold Chain Necklace','Kalung rantai warna emas minimalis. Tahan karat dan cocok untuk daily wear.','Sangat Baik','H&M','Aksesoris',70000,290000,'30g','Stainless Steel Gold Plated',['necklace','gold','minimalist'],'Panjang',['45cm'],$imgs[4]],
            ['Oversized Flannel Red-Navy','Kemeja flanel kotak-kotak merah navy oversize. Bahan tebal hangat.','Baik','Uniqlo','Fashion Pria',95000,380000,'350g','Flannel Cotton',['flannel','shirt','red'],'Ukuran',['L','XL'],$imgs[0]],
            ['Leather Loafers Classic','Sepatu loafers kulit warna hitam. Cocok untuk ngantor atau hangout formal.','Sangat Baik','Pedro','Sepatu',250000,1100000,'800g','Genuine Leather',['loafers','leather','black'],'Ukuran',['41','42'],$imgs[1]],
            ['Tote Bag Canvas Aesthetic','Tote bag kanvas tebal dengan sablon estetik minimalis. Cocok untuk kuliah.','Sangat Baik','Unbranded','Tas',35000,120000,'150g','Canvas Premium',['totebag','canvas','aesthetic'],'Ukuran',['35x40cm'],$imgs[2]],
            ['Vintage Watch Gold Strap','Jam tangan vintage dengan strap rantai lapis emas. Mewah dan berfungsi normal.','Sangat Baik','Casio','Aksesoris',350000,1500000,'120g','Stainless Steel',['watch','vintage','gold'],'Warna',['Gold'],$imgs[3]],
            ['Silk Scarf Floral Pattern','Syal sutra lembut dengan corak bunga-bunga pastel yang mewah.','Sangat Baik','Zara','Aksesoris',60000,240000,'80g','Silk',['scarf','silk','floral'],'Ukuran',['Standard'],$imgs[4]],
        ];

        foreach ($products as $idx => $p) {
            Product::updateOrCreate(
                ['id' => (string) ($idx + 1)],
                [
                    'id'             => (string) ($idx + 1),
                    'name'           => $p[0],
                    'description'    => $p[1],
                    'condition'      => $p[2],
                    'brand'          => $p[3],
                    'category'       => $p[4],
                    'price'          => $p[5],
                    'original_price' => $p[6],
                    'weight'         => $p[7],
                    'material'       => $p[8],
                    'tags'           => $p[9],
                    'status'         => 'published',
                    'shopee_link'    => 'https://s.shopee.co.id/gOm3vwsWI?share_channel_code=1',
                    'photos'         => [$p[12]],
                    'variants'       => [['name' => $p[10], 'options' => $p[11]]],
                    'stock'          => 1,
                ]
            );
        }
    }
}
