const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const innovations = [
  {
    id: 7,
    country_id: 7,
    title_id: 'Roket Reusable SpaceX Falcon 9',
    title_en: 'SpaceX Falcon 9 Reusable Rocket',
    description_id: 'Peluncuran roket Falcon 9 menandai babak baru penjelajahan luar angkasa sebagai roket orbital pertama yang dapat kembali ke bumi dan mendarat tegak lurus secara mandiri. Teknologi pendaratan otomatis ini memangkas biaya penerbangan antariksa secara signifikan karena roket dapat dipakai berulang kali.',
    description_en: 'The Falcon 9 represents a breakthrough in space exploration as the first orbital rocket capable of returning to Earth and landing upright. This automated landing technology dramatically lowers the cost of space travel by enabling rocket reuse.',
    icon_name: 'icon_america_rocket.png'
  },
  {
    id: 13,
    country_id: 7,
    title_id: 'Telepon Kabel Pertama',
    title_en: 'The First Telephone',
    description_id: 'Dulu, kalau mau menyapa sahabat yang rumahnya jauh, orang harus berjalan kaki berjam-jam atau kirim surat yang sampainya berhari-hari. Kesulitan ini berubah saat telepon ditemukan pada tahun 1876 oleh Alexander Graham Bell. Alat ini memindahkan suara obrolan kita menjadi sinyal listrik lewat kabel panjang, lalu mengubahnya balik jadi suara di ujung satunya. Manusia pun bisa mengobrol jarak jauh secara instan!',
    description_en: 'Before smartphones, people wrote letters that took days to arrive. In 1876, Alexander Graham Bell changed communication with the telephone. It turned spoken voices into electrical signals, sent them through long wires, and turned them back into sound. This is the ancestor of our phone calls and voice chats!',
    icon_name: 'icon_america_telephone_iot.png'
  },
  {
    id: 14,
    country_id: 7,
    title_id: 'Alat Perekam Suara (Phonograph)',
    title_en: 'Phonograph Sound Recorder',
    description_id: 'Sebelum ada aplikasi pemutar musik atau fitur voice note di ponsel, suara manusia yang diucapkan akan langsung hilang ditiup angin tanpa bisa disimpan. Pada tahun 1877, Thomas Edison membuat mesin bernama Phonograph. Alat ini memakai silinder berputar dan jarum kecil untuk mengukir getaran suara di atas lembaran logam tipis. Saat mesinnya diputar ulang, suara yang tersimpan pun terdengar lagi, memulai sejarah perekaman lagu dan podcast.',
    description_en: 'In a world where music could only be heard live, Thomas Edison created the phonograph in 1877. This machine used a tiny needle to carve sound vibrations onto a spinning cylinder. Playing it back let people hear the recorded voice, starting the history of music recordings and podcasts.',
    icon_name: 'icon_america_phonograph_pi.png'
  },
  {
    id: 15,
    country_id: 7,
    title_id: 'Mesin Pencuci Piring Otomatis',
    title_en: 'Automatic Dishwasher',
    description_id: 'Apalagi kalau bukan urusan cuci piring kotor yang menumpuk di wastafel dapur setelah makan malam. Rasa malas mencuci piring ini membuat Josephine Cochrane mendesain kotak besi berisi rak piring pada tahun 1886. Kotak ini bisa menyemprotkan air sabun bertekanan tinggi secara otomatis, membuat piring kotor bersih berkilau tanpa perlu dikucek dengan tangan. Mesin ini menjadi cikal bakal asisten rumah tangga pintar modern.',
    description_en: 'Washing dishes after a meal is a chore that Josephine Cochrane solved in 1886 by inventing the mechanical dishwasher. It used high-pressure water and a rack system to wash plates clean. This machine paved the way for modern smart kitchens and home robots.',
    icon_name: 'icon_america_dishwasher_industry.png'
  },
  {
    id: 16,
    country_id: 7,
    title_id: 'Mobil Listrik Pertama',
    title_en: 'The First Electric Car',
    description_id: 'Mobil listrik ramah lingkungan sering kali dikira sebagai penemuan baru abad ini. Padahal, sebelum bensin populer, William Morrison sudah membuat mobil listrik pertama yang sukses di Amerika Serikat pada tahun 1889. Dijalankan dengan baterai berukuran besar dan motor listrik, mobil ini melaju tenang tanpa polusi asap. Penemuan ini menjadi jembatan sejarah penting bagi perkembangan kendaraan listrik ramah lingkungan saat ini.',
    description_en: 'Electric vehicles are older than most people think. In 1889, William Morrison built one of the first successful electric cars. Running quietly on batteries and an electric motor instead of gasoline, this car became a historic bridge to the green electric vehicles of today.',
    icon_name: 'icon_america_electric_car_solar.png'
  },
  {
    id: 17,
    country_id: 7,
    title_id: 'Pesawat Terbang Bermesin Pertama',
    title_en: 'The First Powered Airplane',
    description_id: 'Impian manusia untuk terbang bebas di langit seperti burung akhirnya terwujud melalui kerja keras Wilbur dan Orville Wright (Wright Brothers) pada tahun 1903. Mereka merakit pesawat kayu bernama Wright Flyer yang digerakkan oleh mesin bertenaga bensin dan memiliki sayap yang bisa dikendalikan. Uji coba terbang pertama mereka berlangsung selama 12 detik, membuktikan bahwa mesin yang lebih berat dari udara bisa melayang dan menjadi cikal bakal transportasi udara modern.',
    description_en: 'Orville and Wilbur Wright turned the dream of flight into reality in 1903. They built the Wright Flyer, an airplane with a gasoline engine and steerable wings. Their first flight lasted 12 seconds, proving that heavy flying machines could work and changing global travel forever.',
    icon_name: 'icon_america_airplane_plane.png'
  },
  {
    id: 18,
    country_id: 7,
    title_id: 'Jalur Perakitan Mobil Berjalan',
    title_en: 'Moving Assembly Line',
    description_id: 'Merakit mobil secara manual dari awal sampai akhir di satu tempat dulunya memakan waktu sangat lama dan memicu harga mobil melambung tinggi. Henry Ford memecahkan masalah ini pada tahun 1913 dengan memperkenalkan jalur perakitan berjalan. Rangka mobil digerakkan di atas rel berjalan melewati para mekanik yang bertugas memasang bagian tertentu. Metode ini memangkas waktu produksi secara drastis dan menginspirasi sistem pabrik otomatis modern.',
    description_en: 'Building cars used to be slow because workers built them in one spot. In 1913, Henry Ford introduced the moving assembly line. Rigs moved on conveyor belts past stationary workers, making manufacturing fast and affordable. This pioneered today\'s automated factories.',
    icon_name: 'icon_america_assembly_line_industry.png'
  },
  {
    id: 19,
    country_id: 7,
    title_id: 'Pemanggang Gelombang Mikro (Microwave)',
    title_en: 'Microwave Oven',
    description_id: 'Alat penghangat makanan instan di dapur ini lahir dari ketidaksengajaan. Ketika Percy Spencer sedang meneliti radar militer pada tahun 1945, sebatang cokelat di saku celananya meleleh karena pancaran alat tersebut. Kejadian ini mengungkap fakta bahwa gelombang radio mikro dapat menggetarkan partikel air dalam makanan dengan sangat cepat hingga menghasilkan panas. Penemuan ini memicu terciptanya oven microwave untuk mematangkan makanan dalam hitungan menit.',
    description_en: 'The kitchen microwave was created by accident. In 1945, Percy Spencer noticed a chocolate bar in his pocket melted while he worked on military radars. He discovered that invisible micro waves wiggle water particles inside food to create heat, leading to the fast ovens we use today.',
    icon_name: 'icon_america_microwave_solar.png'
  },
  {
    id: 20,
    country_id: 7,
    title_id: 'Komputer Elektronik ENIAC',
    title_en: 'ENIAC Giant Computer',
    description_id: 'Komputer pertama di dunia itu nggak bisa dipindah-pindah karena gedenya minta ampun, sampai harus pakai satu ruangan kelas penuh hanya untuk naruh mesinnya! Bernama ENIAC dan dibangun pada tahun 1943, komputer raksasa ini memiliki berat 27 ton serta dipenuhi ribuan kabel meliuk-liuk. Mesin ini membuktikan bahwa sistem elektronik mampu menghitung operasi matematika rumit jauh lebih cepat dibanding kecepatan otak manusia.',
    description_en: 'While computers today are small, the first computer, ENIAC, was as large as a classroom. Built in 1943, this 27-ton machine was filled with vacuum tubes and cables. It proved that electronic circuits could calculate math problems thousands of times faster than humans.',
    icon_name: 'icon_america_eniac_pi.png'
  },
  {
    id: 21,
    country_id: 7,
    title_id: 'Saklar Elektronik Transistor',
    title_en: 'The Transistor',
    description_id: 'Komponen kecil penyusun gadget modern ini bekerja layaknya saklar lampu otomatis yang menyalurkan aliran listrik di dalam sirkuit. Diciptakan di Laboratorium Bell pada tahun 1947, transistor berhasil menggantikan tabung kaca besar yang membuat komputer kuno berukuran raksasa dan cepat panas. Penemuan transistor memungkinkan sirkuit komputer menyusut hingga miliaran di antaranya bisa masuk ke dalam ponsel pintar saat ini.',
    description_en: 'A transistor is a tiny component that acts like a micro light switch turning electrical currents on and off. Developed in 1947, it replaced hot glass tubes, letting computers become small, fast, and fit into modern mobile phones.',
    icon_name: 'icon_america_transistor_pi.png'
  },
  {
    id: 22,
    country_id: 7,
    title_id: 'Otak Mikro (Microchip)',
    title_en: 'Microchip / Integrated Circuit',
    description_id: 'Papan sirkuit mikro seukuran kuku jari ini menyatukan jutaan sirkuit kecil di atas kepingan silikon tipis. Dibuat oleh Jack Kilby dan Robert Noyce pada tahun 1958, microchip bertindak sebagai pusat pemrosesan terpadu yang memadatkan ruang kelistrikan. Kehadiran microchip menjadi fondasi penting bagi pembuatan konsol game, laptop, hingga telepon pintar modern.',
    description_en: 'A microchip fits millions of sirkuit switches onto a silicon piece the size of a fingernail. Developed in 1958, this chip allows electronics to work together in small spaces, making modern laptops and smartphones possible.',
    icon_name: 'icon_america_microchip_pi.png'
  },
  {
    id: 23,
    country_id: 7,
    title_id: 'Tetikus Komputer (Mouse)',
    title_en: 'Computer Mouse',
    description_id: 'Mengoperasikan komputer sebelum mouse ditemukan mewajibkan penggunanya mengetik baris teks perintah yang rumit hanya untuk menggeser kursor. Douglas Engelbart memecahkan kendala ini pada tahun 1964 dengan merakit kotak kayu kecil berperekat kabel di bagian belakang yang tampak seperti ekor tikus. Penemuan ini mempermudah manusia menunjuk, menggeser, dan mengeklik berbagai objek di layar secara langsung.',
    description_en: 'Before the computer mouse, users typed text codes to move around screens. In 1964, Douglas Engelbart built a wooden box with a wire resembling a mouse tail. It allowed users to click and navigate screens, simplifying how we interact with computers.',
    icon_name: 'icon_america_mouse_pi.png'
  },
  {
    id: 24,
    country_id: 7,
    title_id: 'Protokol Bahasa Internet (TCP/IP)',
    title_en: 'TCP/IP Internet Protocol',
    description_id: 'Pertukaran pesan teks dan game multipemain antarkomputer memerlukan jalur komunikasi teratur agar data tidak tersesat di tengah jalan. Protokol TCP/IP yang dirilis pada tahun 1974 menetapkan aturan bahasa universal yang menyatukan seluruh jaringan komputer di dunia. Berkat tata tertib transfer data ini, informasi dikirim dalam bentuk paket-paket kecil secara aman dan melahirkan internet global.',
    description_en: 'Computers and networks communicate without confusion using TCP/IP. Developed in 1974, TCP/IP is a universal rulebook for routing data packages across networks safely. It forms the core foundation of our global Internet.',
    icon_name: 'icon_america_tcpip_wifi.png'
  },
  {
    id: 25,
    country_id: 7,
    title_id: 'Peta Satelit Global (GPS)',
    title_en: 'Global Positioning System (GPS)',
    description_id: 'Aplikasi peta digital dan layanan ojek online dapat melacak posisi penjemputan dengan akurat berkat keberadaan GPS (Global Positioning System). Dirancang mulai tahun 1973, sistem navigasi ini menggunakan konstelasi puluhan satelit di ruang angkasa untuk memancarkan sinyal penentu koordinat. Sinyal tersebut diterima oleh gawai di bumi untuk menghitung letak lintang dan bujur secara waktu nyata.',
    description_en: 'Maps and delivery apps find locations using GPS. Developed starting in 1973, this navigation system uses satellites orbiting Earth to beam coordinates. This helps phones and vehicles calculate their exact position anywhere on the planet.',
    icon_name: 'icon_america_gps_rocket.png'
  },
  {
    id: 26,
    country_id: 7,
    title_id: 'Telepon Genggam Pertama',
    title_en: 'Handheld Mobile Phone',
    description_id: 'Ponsel genggam pertama di dunia memiliki bentuk tebal seberat batu bata dengan daya tahan baterai yang sangat singkat. Dibuat oleh Martin Cooper dari Motorola pada tahun 1973, alat komunikasi ini awalnya dijual dengan harga yang sangat tinggi. Meskipun berat dan berukuran besar, penemuan ini membuktikan bahwa percakapan suara dapat dilakukan sambil berjalan bebas tanpa hambatan kabel.',
    description_en: 'The first mobile phone, built by Martin Cooper in 1973, was as heavy as a brick and had short battery life. Despite its size and high cost, it proved that people could make phone calls on the move without cables.',
    icon_name: 'icon_america_mobile_phone_iot.png'
  },
  {
    id: 27,
    country_id: 7,
    title_id: 'Kamera Digital Pertama',
    title_en: 'The First Digital Camera',
    description_id: 'Pembuatan foto di masa lampau mengandalkan kamera berisi gulungan pita film sensitif cahaya yang rentan rusak jika terpapar sinar secara tidak sengaja. Steven Sasson merancang kamera digital pertama pada tahun 1975 di laboratorium Kodak. Kamera ini menangkap pantulan cahaya dan menyimpannya dalam bentuk data biner elektronik pada pita kaset, melahirkan cikal bakal sensor kamera yang dipasang di ponsel pintar.',
    description_en: 'Before digital photography, cameras used rolls of film that took days to develop. In 1975, Steven Sasson built the first digital camera. It converted light into binary data stored on cassette tape, pioneering the cameras in our smartphones today.',
    icon_name: 'icon_america_digital_camera_pi.png'
  },
  {
    id: 28,
    country_id: 7,
    title_id: 'Komputer Portabel IBM 5100',
    title_en: 'IBM 5100 Portable Computer',
    description_id: 'Saat komputer di tahun 1970-an masih berukuran sebesar meja makan dan tidak dapat dipindahkan, IBM meluncurkan seri IBM 5100 pada tahun 1975 sebagai komputer portabel pertama. Meskipun berbobot 22 kilogram, perangkat ini menyatukan layar monitor berukuran kecil, papan ketik, dan pembaca data pita dalam satu wadah ringkas. Inovasi ini memicu pengembangan komputer jinjing dan laptop.',
    description_en: 'While 1970s computers were giant machines, IBM launched the portable IBM 5100 in 1975. Weighing 22 kilograms, it put a screen, keyboard, and drive in a single unit, proving that computers could travel and leading to laptops.',
    icon_name: 'icon_america_ibm5100_pi.png'
  },
  {
    id: 29,
    country_id: 7,
    title_id: 'Era Baru Smartphone (iPhone)',
    title_en: 'iPhone Smartphone Milestone',
    description_id: 'Peluncuran iPhone pada tahun 2007 oleh Steve Jobs mengubah arah perkembangan perangkat telekomunikasi secara global. Ponsel di masa itu umumnya mengandalkan tombol plastik fisik yang kaku untuk mengetik teks. iPhone merombak desain tersebut dengan menggabungkan pemutar musik, penjelajah web, dan telepon ke dalam satu layar kaca sentuh kapasitif utuh tanpa tombol mekanis, memicu lahirnya era aplikasi seluler modern.',
    description_en: 'The launch of the iPhone in 2007 changed smartphones forever. Steve Jobs replaced physical buttons with a responsive multi-touch screen, combining a music player, phone, and internet browser. This started the modern app-driven ecosystem we use daily.',
    icon_name: 'icon_america_iphone_iot.png'
  },
  {
    id: 30,
    country_id: 7,
    title_id: 'Toko Aplikasi Ponsel (App Store)',
    title_en: 'Mobile App Store',
    description_id: 'Keberadaan pasar digital App Store sejak tahun 2008 mempermudah pemilik ponsel pintar mengunduh berbagai program buatan pengembang independen di seluruh dunia. Tanpa wadah terpusat ini, penyebaran game, media sosial, dan platform edukasi digital akan berjalan lambat dan berisiko. Layanan ini memungkinkan sirkulasi aplikasi dilakukan secara aman lewat satu ketukan layar.',
    description_en: 'The launch of the App Store in 2008 created a central, secure platform for developers to distribute software. It allowed users to download gaming, social, and educational tools safely, starting the mobile app revolution.',
    icon_name: 'icon_america_appstore_iot.png'
  },
  {
    id: 31,
    country_id: 7,
    title_id: 'Penyejuk Udara Modern (AC)',
    title_en: 'Modern Air Conditioning (AC)',
    description_id: 'Willis Carrier menciptakan mesin penyejuk udara modern pertama pada tahun 1902 untuk mengatur kelembapan dan temperatur ruangan di pabrik cetak. Mesin AC bekerja dengan menyedot udara hangat, melewatkannya ke sirkuit pendingin, menyaring partikel debu, lalu mengembuskannya kembali menjadi udara sejuk. Penemuan ini membuat gedung perkantoran, rumah tinggal, serta ruang server komputer tetap dingin dan nyaman.',
    description_en: 'In 1902, Willis Carrier designed the first modern air conditioner to regulate humidity and temperature. The system cooled indoor air and filtered dust, making homes comfortable and keeping industrial equipment or server rooms from overheating.',
    icon_name: 'icon_america_ac_industry.png'
  },
  {
    id: 32,
    country_id: 7,
    title_id: 'Televisi Elektronik Pertama',
    title_en: 'Electronic Television',
    description_id: 'Philo Farnsworth merancang sistem televisi elektronik pertama pada tahun 1927, menggantikan TV mekanik kuno yang menggunakan piringan berputar dengan gambar buram. Sistem baru ini memakai tabung pemancar berkas elektron untuk menggambar garis-garis gambar di layar kaca berkecepatan tinggi. Teknologi pemancaran sinyal gambar ini menjadi basis bagi pengembangan siaran televisi jernih dan streaming video saat ini.',
    description_en: 'Philo Farnsworth developed the first fully electronic television system in 1927. It used electron beams to paint sharp, moving images on a screen, replacing blurry mechanical spinning discs and laying the foundation for modern television broadcasting.',
    icon_name: 'icon_america_tv_pi.png'
  },
  {
    id: 33,
    country_id: 7,
    title_id: 'Pesawat Tanpa Pilot (Drone)',
    title_en: 'Drone / UAV Development',
    description_id: 'Pesawat tanpa awak atau UAV (Uncrewed Aerial Vehicle), yang kini populer disebut drone, mulai dirintis perkembangannya sejak pertengahan abad ke-20 untuk keperluan pemantauan jarak jauh. Drone memanfaatkan sirkuit giroskop digital dan motor listrik multi-baling-baling agar dapat melayang stabil di udara tanpa kemudi fisik di kabin. Penggunaan drone kini meluas untuk fotografi udara, pemantauan lahan pertanian, hingga pengiriman logistik darurat.',
    description_en: 'Uncrewed Aerial Vehicles (UAVs), known as drones, were developed mid-20th century for surveillance. Drones use digital gyroscopes and electric motors to hover steadily without an onboard pilot. Today, they are widely used for aerial photography, monitoring crops, and emergency deliveries.',
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
