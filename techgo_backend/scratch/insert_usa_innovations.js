const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  {
    id: 7,
    country_id: 7,
    title_id: 'Roket Reusable SpaceX Falcon 9',
    title_en: 'SpaceX Falcon 9 Reusable Rocket',
    description_id: 'Roket luar angkasa pertama yang dapat terbang kembali ke bumi dan mendarat tegak lurus secara otomatis di atas kapal laut setelah mengantar satelit, membuat perjalanan ke luar angkasa jauh lebih murah.',
    description_en: 'The first orbital rocket capable of returning to Earth and landing upright automatically on an ocean drone ship after launching satellites, making space travel far cheaper.',
    icon_name: 'icon_america_rocket.png'
  },
  {
    id: 13,
    country_id: 7,
    title_id: 'Telepon Kabel Pertama',
    title_en: 'The First Telephone',
    description_id: 'Bayangkan kamu mau mengobrol dengan sahabatmu yang rumahnya jauh, tapi kamu harus berjalan kaki berjam-jam dulu hanya untuk menyapa mereka. Melelahkan, kan? Nah, di tahun 1876, Om Alexander Graham Bell menciptakan alat ajaib bernama Telepon! Alat ini bertugas mengubah suara obrolan kita menjadi sinyal listrik yang mengalir lewat kabel panjang, lalu mengubahnya kembali menjadi suara di ujung sana. Berkat telepon kabel pertama ini, manusia akhirnya bisa saling berbicara secara instan dari jarak yang sangat jauh!',
    description_en: 'How did people talk to each other before smartphones? They had to write letters that took days to arrive! In 1876, Alexander Graham Bell changed everything by inventing the telephone. This smart machine turned spoken words into electrical signals, sent them through copper wires, and turned them back into sounds on the other side. It is the amazing ancestor of all the phone calls and voice chats we use today!',
    icon_name: 'icon_america_telephone_iot.png'
  },
  {
    id: 14,
    country_id: 7,
    title_id: 'Alat Perekam Suara (Phonograph)',
    title_en: 'Phonograph Sound Recorder',
    description_id: 'Sebelum ada Spotify, YouTube Music, atau fitur voice note di HP-mu, suara manusia tidak pernah bisa direkam lho! Sekali kamu berbicara atau bernyanyi, suaramu akan hilang ditiup angin. Untungnya pada tahun 1877, Om Thomas Edison yang jenius menciptakan Phonograph. Alat ini menggunakan silinder berputar dan jarum kecil untuk mengukir getaran suaramu di atas logam tipis. Begitu mesinnya diputar kembali, suaramu bisa terdengar lagi! Inilah awal mula manusia bisa merekam lagu, membuat podcast, dan menyimpan suara favorit mereka.',
    description_en: 'Imagine a world where music could only be heard live, and no one could ever record their voice! In 1877, Thomas Edison invented the phonograph. This clever machine used a tiny needle to carve sound vibrations onto a spinning cylinder. When you spun it again, your recorded voice played back! This invention started the whole history of record players, podcasts, and digital music.',
    icon_name: 'icon_america_phonograph_pi.png'
  },
  {
    id: 15,
    country_id: 7,
    title_id: 'Mesin Pencuci Piring Otomatis',
    title_en: 'Automatic Dishwasher',
    description_id: 'Selesai makan malam, pekerjaan apa yang paling bikin malas? Yup, mencuci tumpukan piring kotor! Masalah ini juga dirasakan oleh Tante Josephine Cochrane pada tahun 1886. Bedanya, Tante Josephine tidak tinggal diam. Beliau mendesain sebuah kotak besi dengan rak piring di dalamnya yang bisa menyemprotkan air sabun bertekanan tinggi secara otomatis. Piring-piring kotor pun langsung bersih berkilau tanpa perlu dikucek pakai tangan. Mesin inilah yang menjadi pelopor asisten rumah tangga pintar di masa depan!',
    description_en: 'Doing the dishes after a delicious meal can be pretty tiring. Back in 1886, Josephine Cochrane decided to build a smart solution! She invented the first mechanical dishwasher. It used high-pressure water and a special rack system to wash plates clean and shiny. This helpful machine paved the way for modern smart kitchens and home robots!',
    icon_name: 'icon_america_dishwasher_industry.png'
  },
  {
    id: 16,
    country_id: 7,
    title_id: 'Mobil Listrik Pertama',
    title_en: 'The First Electric Car',
    description_id: 'Kamu mungkin berpikir kalau mobil listrik ramah lingkungan seperti Tesla baru saja ditemukan beberapa tahun lalu. Wah, ternyata salah besar! Jauh sebelum bensin populer, seorang penemu bernama Om William Morrison sudah berhasil membuat mobil listrik pertama yang sukses di Amerika Serikat pada tahun 1889. Mobil imut ini bertenaga baterai raksasa dan motor listrik tanpa perlu mengeluarkan asap polusi sama sekali. Keren banget, kan? Penemuan ini adalah jembatan sejarah menuju mobil masa depan yang bebas polusi!',
    description_en: 'Think electric vehicles like Teslas are brand-new inventions? Think again! Back in 1889, William Morrison built one of the very first successful electric cars. Instead of loud, smoky engines, his car ran quietly on large batteries and electric motors. It is the historic bridge to the green, pollution-free electric cars we see on the roads today!',
    icon_name: 'icon_america_electric_car_solar.png'
  },
  {
    id: 17,
    country_id: 7,
    title_id: 'Pesawat Terbang Bermesin Pertama',
    title_en: 'The First Powered Airplane',
    description_id: 'Sejak zaman purba, manusia selalu bermimpi ingin terbang bebas di langit seperti burung. Mimpi indah itu akhirnya diwujudkan oleh dua bersaudara yang pantang menyerah, yaitu Wilbur dan Orville Wright (Wright Brothers) pada tahun 1903! Mereka menciptakan pesawat kayu bernama Wright Flyer yang dilengkapi mesin bertenaga bensin dan sayap yang bisa dikendalikan. Penerbangan pertama mereka memang hanya berlangsung selama 12 detik, tapi keberhasilan itu langsung mengubah cara manusia bepergian melintasi benua dan samudra!',
    description_en: 'For thousands of years, humans dreamed of flying like birds. In 1903, two brothers named Wilbur and Orville Wright made that dream a reality! They built the Wright Flyer, the first airplane with a working engine and steerable wings. Their first flight lasted only 12 seconds, but it proved that machines heavier than air could fly! This changed global travel forever.',
    icon_name: 'icon_america_airplane_plane.png'
  },
  {
    id: 18,
    country_id: 7,
    title_id: 'Jalur Perakitan Mobil Berjalan',
    title_en: 'Moving Assembly Line',
    description_id: 'Dulu, untuk membuat satu buah mobil, sekelompok mekanik harus merakitnya di satu tempat dari awal sampai akhir secara manual. Proses ini sangat lama dan membuat harga mobil menjadi sangat mahal. Nah, pada tahun 1913, Om Henry Ford membuat ide gokil! Alih-alih mekanik yang berjalan memutari mobil, mobilnyalah yang berjalan di atas rel berjalan melewati para mekanik yang berbaris rapi. Cara ini membuat pembuatan mobil menjadi super cepat, murah, dan menjadi awal lahirnya pabrik robotik otomatis di seluruh dunia!',
    description_en: 'Long ago, building a car took a very long time because workers had to build it in one spot from scratch. In 1913, Henry Ford introduced a brilliant idea: the moving assembly line! Instead of workers walking around the car, the car moved on a conveyor belt past different workers. This made manufacturing lightning-fast and cheap, paving the way for today\'s automated smart factories!',
    icon_name: 'icon_america_assembly_line_industry.png'
  },
  {
    id: 19,
    country_id: 7,
    title_id: 'Pemanggang Gelombang Mikro (Microwave)',
    title_en: 'Microwave Oven',
    description_id: 'Tahukah kamu kalau penghangat makanan instan di dapurmu ini ditemukan secara tidak sengaja? Saat Om Percy Spencer sedang meneliti radar militer di tahun 1945, dia heran karena cokelat di dalam saku celananya tiba-tiba meleleh! Dari sana, dia sadar kalau gelombang radio tak terlihat (mikro) bisa membuat molekul air di dalam makanan bergerak sangat cepat dan menghasilkan panas secara instan. Penemuan ini bikin kita bisa menghangatkan pizza dingin atau memasak popcorn hanya dalam waktu semenit!',
    description_en: 'Did you know your kitchen microwave was invented by accident? In 1945, while Percy Spencer was working on military radars, he noticed a chocolate bar in his pocket had suddenly melted! He realized that invisible radio waves could make water particles inside food wiggle super fast, creating instant heat. That is how we got the quick microwave oven to pop our popcorn in seconds!',
    icon_name: 'icon_america_microwave_solar.png'
  },
  {
    id: 20,
    country_id: 7,
    title_id: 'Komputer Elektronik ENIAC',
    title_en: 'ENIAC Giant Computer',
    description_id: 'Komputer pertamamu di rumah mungkin berupa laptop tipis yang muat masuk tas sekolah. Tapi tahukah kamu kalau komputer elektronik digital pertama di dunia yang bernama ENIAC ukurannya sebesar ruang kelas sekolahmu? Dibuat pada tahun 1943, komputer raksasa ini beratnya mencapai 27 ton dan dipenuhi ribuan kabel serta saklar lampu raksasa. Meskipun sangat besar, ENIAC adalah pahlawan yang membuktikan bahwa mesin elektronik bisa menghitung angka rumit ribuan kali lebih cepat daripada manusia!',
    description_en: 'Your computer today might be a slim laptop, but the world\'s first general-purpose electronic computer, ENIAC, was as big as a whole classroom! Built in 1943, this 27-ton giant was filled with messy cables and glowing tubes. Even though it was massive, ENIAC proved that electronic machines could calculate math problems thousands of times faster than humans!',
    icon_name: 'icon_america_eniac_pi.png'
  },
  {
    id: 21,
    country_id: 7,
    title_id: 'Saklar Elektronik Transistor',
    title_en: 'The Transistor',
    description_id: 'Pahlawan tanpa tanda jasa di dalam dunia gadget! Transistor adalah komponen elektronik super kecil yang diciptakan di lab Bell pada tahun 1947. Fungsinya mirip seperti saklar lampu otomatis yang mengatur aliran listrik di dalam mesin. Sebelum ada transistor, komputer berukuran raksasa dan gampang panas. Berkat transistor, komputer bisa menyusut menjadi kecil, dingin, cepat, dan membuat miliaran saklar pintar bisa masuk ke dalam smartphone kecil yang ada di genggaman tanganmu sekarang!',
    description_en: 'The ultimate tiny hero inside all of our gadgets! Invented in 1947, a transistor acts like a microscopic light switch that turns electrical signals on and off. Before transistors, computers were giant and got hot quickly. Because of this tiny invention, computers shrank, became incredibly fast, and allowed billions of smart switches to fit inside your phone!',
    icon_name: 'icon_america_transistor_pi.png'
  },
  {
    id: 22,
    country_id: 7,
    title_id: 'Otak Mikro (Microchip)',
    title_en: 'Microchip / Integrated Circuit',
    description_id: 'Jika transistor adalah saklar lampunya, maka Microchip adalah tumpukan miliaran saklar yang disatukan di atas sekeping papan silikon seukuran kuku jarimu! Ditemukan oleh Om Jack Kilby dan Robert Noyce pada tahun 1958, otak mikro ini membuat miliaran komponen elektronik bisa mengobrol dan bekerja sama di ruang yang sangat sempit. Tanpa adanya penemuan microchip ini, game console seperti Nintendo Switch, PS5, laptop, dan smartphone tidak akan pernah bisa dibuat!',
    description_en: 'If transistors are tiny switches, a microchip is a city of billions of those switches packed onto a silicon board the size of your fingernail! Co-invented in 1958, the microchip allowed complex electronics to work together in a tiny space. Without this brainy chip, high-tech devices like the Nintendo Switch, PS5, and smartphones wouldn\'t exist!',
    icon_name: 'icon_america_microchip_pi.png'
  },
  {
    id: 23,
    country_id: 7,
    title_id: 'Tetikus Komputer (Mouse)',
    title_en: 'Computer Mouse',
    description_id: 'Bayangkan kamu sedang mabar game Minecraft atau Roblox, tapi kamu dilarang menyentuh layar dan tidak punya mouse. Ribet banget, kan? Dulu, sebelum ada mouse, orang-orang terpaksa mengetik barisan teks perintah kaku hanya untuk memindahkan sesuatu di layar komputer. Om Douglas Engelbart memecahkan masalah ini pada tahun 1964 dengan membuat boks kayu kecil dengan kabel menjulur di belakangnya yang mirip ekor tikus. Kita jadi bisa menunjuk dan mengeklik layar dengan sangat seru!',
    description_en: 'Imagine playing Minecraft without a mouse—you would have to type boring text codes just to look around! In 1964, Douglas Engelbart built the first computer mouse out of wood, with a wire sticking out the back that looked like a mouse\'s tail. It allowed users to point, click, and navigate on screens easily, changing how we play and work forever!',
    icon_name: 'icon_america_mouse_pi.png'
  },
  {
    id: 24,
    country_id: 7,
    title_id: 'Protokol Bahasa Internet (TCP/IP)',
    title_en: 'TCP/IP Internet Protocol',
    description_id: 'Ketika kamu mengirim chat ke temanmu atau mabar game online, bagaimana komputer-komputer itu bisa saling mengirim data tanpa tertukar atau hilang di jalan? Nah, semua itu karena TCP/IP yang diciptakan pada tahun 1974. TCP/IP adalah \'buku aturan\' bahasa universal yang menyatukan seluruh komputer di bumi agar bisa saling bertukar paket data secara tertib dan aman tanpa tersesat. Inilah aturan rahasia yang melahirkan jaringan Internet global!',
    description_en: 'How do computers, phones, and game consoles all over the world talk to each other without getting confused? They use TCP/IP! Created in 1974, TCP/IP is like a universal rulebook that guides internet data packets. It makes sure your game commands or messages travel across networks safely and arrive at the right place without getting lost. It is the backbone of the Internet!',
    icon_name: 'icon_america_tcpip_wifi.png'
  },
  {
    id: 25,
    country_id: 7,
    title_id: 'Peta Satelit Global (GPS)',
    title_en: 'Global Positioning System (GPS)',
    description_id: 'Bagaimana bisa Gojek, Grab, atau Google Maps tahu di mana posisi jemputanmu secara akurat? Jawabannya adalah GPS! Sistem navigasi luar biasa ini memanfaatkan bantuan 24 satelit canggih yang berputar di atas langit bumi untuk memantulkan sinyal koordinat. Berkat GPS yang diluncurkan pada tahun 1973 ini, semua HP, mobil, pesawat, kapal laut, hingga drone di seluruh dunia bisa tahu persis di mana posisi mereka berada agar tidak tersesat!',
    description_en: 'Ever wondered how food delivery drivers or online maps find your house? They use GPS! This amazing navigation system uses a constellation of satellites orbiting the Earth to beam coordinate signals. Launched in 1973, GPS helps smartphones, cars, planes, and drones calculate exactly where they are on our planet so they can navigate anywhere!',
    icon_name: 'icon_america_gps_rocket.png'
  },
  {
    id: 26,
    country_id: 7,
    title_id: 'Telepon Genggam Pertama',
    title_en: 'Handheld Mobile Phone',
    description_id: 'Temui \'kakek buyut\' legendaris dari smartphone tipismu! Diciptakan oleh Om Martin Cooper dari Motorola pada tahun 1973, HP pertama di dunia ini bentuknya sangat bongsor, seberat batu bata, dan baterainya sangat cepat habis. Harganya pun setara harga motor baru! Meskipun sangat besar dan kaku, penemuan ini adalah pahlawan yang berhasil membuktikan kepada dunia kalau manusia bisa menelepon sambil berjalan-jalan bebas tanpa kabel!',
    description_en: 'Meet the legendary grandfather of your modern smartphone! Invented in 1973 by Martin Cooper at Motorola, the first mobile phone was as big and heavy as a clay brick. It had no color screen and could only be used for calling. However, it was a heroic step that proved humans could talk on the go without being plugged into a wall!',
    icon_name: 'icon_america_mobile_phone_iot.png'
  },
  {
    id: 27,
    country_id: 7,
    title_id: 'Kamera Digital Pertama',
    title_en: 'The First Digital Camera',
    description_id: 'Anak zaman dulu kalau berfoto harus menggunakan kamera berisi gulungan pita film hitam yang sangat sensitif. Jika salah pencet, fotonya bisa rusak dan hangus! Pada tahun 1975, Om Steven Sasson dari Kodak mengubah hal itu dengan menciptakan kamera digital pertama di dunia. Kamera ini menangkap gambar lalu mengubahnya menjadi kode biner 0 dan 1 untuk disimpan secara elektronik di memori kaset. Inilah awal mula lahirnya kamera HP modern tempat kamu berswafoto!',
    description_en: 'Long ago, cameras used rolls of plastic film to take photos, and you had to wait days to print them. In 1975, Steven Sasson at Kodak built the first digital camera. It captured light and turned images into electronic data (0s and 1s) stored on a cassette tape. This smart invention laid the foundation for the digital cameras and selfie cameras inside our phones!',
    icon_name: 'icon_america_digital_camera_pi.png'
  },
  {
    id: 28,
    country_id: 7,
    title_id: 'Komputer Portabel IBM 5100',
    title_en: 'IBM 5100 Portable Computer',
    description_id: 'Pada tahun 1975, sebuah komputer biasanya berukuran sebesar meja makan raksasa yang tidak bisa digeser. Tapi, perusahaan IBM membuat gebrakan dengan meluncurkan IBM 5100, komputer portabel pertama di dunia! Meskipun beratnya mencapai 22 kilogram (hampir seberat satu karung beras!), komputer ini sudah dilengkapi layar monitor kecil, keyboard, dan pembaca data terintegrasi. Komputer ini membuktikan kalau komputer masa depan bisa dilipat dan dibawa bepergian ke mana saja!',
    description_en: 'In 1975, computers were massive machines locked in offices. But IBM changed that by introducing the IBM 5100, the first portable personal computer! Even though it weighed 22 kilograms—as heavy as a big bag of rice!—it had a built-in screen, keyboard, and tape reader. It proved that computers could become transportable, leading to modern laptops!',
    icon_name: 'icon_america_ibm5100_pi.png'
  },
  {
    id: 29,
    country_id: 7,
    title_id: 'Era Baru Smartphone (iPhone)',
    title_en: 'iPhone Smartphone Milestone',
    description_id: 'Pada tahun 2007, Om Steve Jobs naik ke atas panggung dan memamerkan sebuah kotak kaca tipis ajaib yang mengubah sejarah dunia gadget selamanya: iPhone! Sebelum ada iPhone, HP lama biasanya memiliki banyak tombol plastik kecil yang kaku. iPhone menggabungkan pemutar musik, browser internet, telepon, dan layar sentuh kapasitif penuh tanpa tombol fisik. Benda di saku celanamu ini adalah awal mula lahirnya aplikasi-aplikasi modern di dunia!',
    description_en: 'In 2007, Steve Jobs introduced a sleek glass device that changed the world forever: the iPhone! Before the iPhone, phones had clunky plastic buttons. The iPhone combined a phone, an iPod music player, and internet browser into one device with a brilliant multi-touch screen. It popularized the modern smartphone style that we use every single day!',
    icon_name: 'icon_america_iphone_iot.png'
  },
  {
    id: 30,
    country_id: 7,
    title_id: 'Toko Aplikasi Ponsel (App Store)',
    title_en: 'Mobile App Store',
    description_id: 'Pikirkan HP-mu tanpa ada aplikasi game, peta, chat, atau aplikasi edukasi TechGo ini. Pasti sangat sepi dan membosankan, kan? Nah, di tahun 2008, diluncurkanlah App Store, sebuah pasar digital raksasa tempat berkumpulnya ratusan aplikasi canggih buatan para developer kreatif di seluruh dunia. Berkat App Store, kita bisa mengunduh game, media sosial, hingga aplikasi belajar sekolah secara aman dan mudah hanya dengan satu ketukan jari!',
    description_en: 'What is a smartphone without games, chat tools, or learning apps? Just a boring phone! In 2008, Apple launched the App Store, a safe digital marketplace where anyone could download software made by creative developers. It started a massive global wave of mobile learning, mobile gaming, and digital tools we love today!',
    icon_name: 'icon_america_appstore_iot.png'
  },
  {
    id: 31,
    country_id: 7,
    title_id: 'Penyejuk Udara Modern (AC)',
    title_en: 'Modern Air Conditioning (AC)',
    description_id: 'Saat hari sedang panas terik di luar rumah dan kamu ingin mabar game dengan sejuk di dalam kamar, pahlawan penyelamatmu adalah AC! Mesin penyejuk udara modern pertama di dunia ini diciptakan oleh Om Willis Carrier pada tahun 1902. AC bertugas menarik udara panas yang pengap, menyaring debu kotor, menurunkan kelembapan, lalu menyemburkan kembali udara dingin yang sangat bersih dan nyaman untuk pernapasan manusia serta menjaga mesin komputer agar tidak kepanasan!',
    description_en: 'On hot, sweaty days, nothing feels better than stepping into a cool, air-conditioned room! In 1902, Willis Carrier invented the first modern air conditioner. Instead of just blowing air, it controlled temperature and humidity, making rooms comfortable for people and keeping giant factory machines or computers cool enough to work safely!',
    icon_name: 'icon_america_ac_industry.png'
  },
  {
    id: 32,
    country_id: 7,
    title_id: 'Televisi Elektronik Pertama',
    title_en: 'Electronic Television',
    description_id: 'Dulu, televisi awal bekerja menggunakan piringan kayu berputar mekanik yang gambarnya sangat buram dan berkedip kasar. Pada tahun 1927, seorang anak muda jenius bernama Kak Philo Farnsworth berhasil menciptakan sistem TV elektronik murni. TV ini menggunakan tabung pemancar khusus untuk menembakkan berkas elektron ke layar kaca dengan kecepatan tinggi, menghasilkan gambar bergerak yang sangat jernih. Inilah awal mula lahirnya Smart TV, Netflix, dan layar video streaming di HP-mu!',
    description_en: 'Early TVs used spinning mechanical wheels that made blurry, flickering pictures. In 1927, a young genius named Philo Farnsworth changed entertainment by creating the first all-electronic television. It used a special tube to shoot beams of electrons at a glass screen, creating sharp, moving images. This paved the way for color TVs, smart TVs, and video streaming!',
    icon_name: 'icon_america_tv_pi.png'
  },
  {
    id: 33,
    country_id: 7,
    title_id: 'Pesawat Tanpa Pilot (Drone)',
    title_en: 'Drone / UAV Development',
    description_id: 'Bayangkan ada sebuah helikopter mini terbang di atas langit kamarmu sambil merekam video indah secara langsung tanpa ada pilot di dalamnya! Benda itu namanya Drone atau UAV (Uncrewed Aerial Vehicle). Teknologi ini mulai dirintis sejak tahun 1950-an untuk kebutuhan patroli pemantauan wilayah bahaya. Sekarang, berkat drone, kita bisa mengambil foto pemandangan sinematik yang megah dari langit, menyiram pupuk tanaman sawah secara otomatis, hingga mengantar paket belanjaan dengan cepat!',
    description_en: 'Imagine a mini helicopter flying outside your window, filming beautiful videos, with no pilot sitting inside! That is a drone or UAV (Uncrewed Aerial Vehicle). Developed starting in the 1950s for remote surveillance, drones today are used for taking cinematic videos from the sky, monitoring forests, spraying crops, and even delivering packages!',
    icon_name: 'icon_america_drone_plane.png'
  }
];

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'techgo_db'
  });

  console.log('Menghubungkan ke database untuk memasukkan 22 inovasi Amerika Serikat...');
  
  try {
    // 1. Hapus data inovasi USA lama
    const [delResult] = await pool.query('DELETE FROM innovations WHERE country_id = 7');
    console.log(`Berhasil menghapus ${delResult.affectedRows} data inovasi lama USA.`);
    
    // 2. Insert data baru
    for (const inv of innovations) {
      await pool.query(
        `INSERT INTO innovations (id, country_id, title_id, title_en, description_id, description_en, icon_name) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [inv.id, inv.country_id, inv.title_id, inv.title_en, inv.description_id, inv.description_en, inv.icon_name]
      );
      console.log(`Inserted ID ${inv.id}: ${inv.title_id}`);
    }
    console.log('Semua 22 data inovasi USA berhasil dimasukkan ke database!');
  } catch (error) {
    console.error('Gagal memasukkan data inovasi USA:', error.message);
  } finally {
    await pool.end();
  }
}

main();
