import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Globe as GlobeIcon, LogOut, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

// Data fallback lokal untuk pengujian frontend jika API backend/database belum tersambung
const FALLBACK_COUNTRIES = [
  {
    id: 1,
    country_code: 'IDN',
    country_name_id: 'Indonesia',
    country_name_en: 'Indonesia',
    continent: 'Asia',
    latitude: -0.789275,
    longitude: 113.921327,
    innovations: [{
      id: 1,
      title_id: 'Sensor Pertanian Pintar IoT',
      title_en: 'Smart Agriculture IoT Sensors',
      description_id: 'Teknologi sensor nirkabel berbasis IoT yang dipasang di sawah untuk memantau kelembaban tanah, suhu udara, dan kesehatan padi secara langsung melalui handphone petani agar hasil panen meningkat.',
      description_en: 'IoT-based wireless sensor technology installed in rice fields to monitor soil moisture, air temperature, and crop health directly via mobile devices to boost crop yields.',
      icon_name: 'icon_asia_iot.png'
    }]
  },
  {
    id: 2,
    country_code: 'JPN',
    country_name_id: 'Jepang',
    country_name_en: 'Japan',
    continent: 'Asia',
    latitude: 36.204824,
    longitude: 138.252924,
    innovations: [{
      id: 2,
      title_id: 'Kereta Cepat Magnetik Shinkansen',
      title_en: 'Shinkansen Magnetic Bullet Train',
      description_id: 'Kereta peluru Shinkansen menggunakan gaya magnet super kuat untuk melayang di atas rel dan meluncur sangat cepat tanpa gesekan, mencapai kecepatan lebih dari 320 km/jam.',
      description_en: 'Shinkansen bullet trains utilize powerful magnetic forces to hover above the tracks and glide smoothly without friction, achieving speeds of over 320 km/h.',
      icon_name: 'icon_asia_train.png'
    }]
  },
  {
    id: 3,
    country_code: 'KOR',
    country_name_id: 'Korea Selatan',
    country_name_en: 'South Korea',
    continent: 'Asia',
    latitude: 35.907757,
    longitude: 127.766922,
    innovations: [{
      id: 3,
      title_id: 'Jaringan Robotik & Kota Pintar 5G',
      title_en: '5G Robotic Smart City Network',
      description_id: 'Sistem jaringan internet 5G ultra cepat yang menghubungkan robot pembersih otomatis, lampu jalan pintar, dan mobil kemudi otomatis untuk kehidupan hemat energi.',
      description_en: 'An ultra-fast 5G internet network connecting autonomous cleaning robots, smart streetlights, and self-driving cars to support energy-efficient living.',
      icon_name: 'icon_asia_5g.png'
    }]
  },
  {
    id: 4,
    country_code: 'DEU',
    country_name_id: 'Jerman',
    country_name_en: 'Germany',
    continent: 'Europe',
    latitude: 51.165691,
    longitude: 10.451526,
    innovations: [{
      id: 4,
      title_id: 'Otomasi Industri Robotik 4.0',
      title_en: 'Industry 4.0 Robotic Automation',
      description_id: 'Pabrik pintar yang menggunakan lengan robot cerdas dan sensor kecerdasan buatan untuk merakit mobil listrik secara otomatis, cepat, dan presisi tinggi.',
      description_en: 'Smart factories using intelligent robotic arms and artificial intelligence sensors to assemble electric vehicles automatically, quickly, and with high precision.',
      icon_name: 'icon_europe_industry.png'
    }]
  },
  {
    id: 5,
    country_code: 'FRA',
    country_name_id: 'Prancis',
    country_name_en: 'France',
    continent: 'Europe',
    latitude: 46.227638,
    longitude: 2.213749,
    innovations: [{
      id: 5,
      title_id: 'Pesawat Terbang Bertenaga Surya Bersih',
      title_en: 'Clean Solar-Powered Aircraft',
      description_id: 'Pesawat eksperimental berukuran raksasa yang seluruh sayapnya ditutupi panel surya tipis, mampu terbang tinggi menembus awan tanpa bahan bakar minyak bumi.',
      description_en: 'A giant experimental airplane covered in ultra-thin solar panels on its wings, capable of flying high above the clouds without consuming any fossil fuel.',
      icon_name: 'icon_europe_plane.png'
    }]
  },
  {
    id: 6,
    country_code: 'GBR',
    country_name_id: 'Inggris',
    country_name_en: 'United Kingdom',
    continent: 'Europe',
    latitude: 55.378051,
    longitude: -3.435973,
    innovations: [{
      id: 6,
      title_id: 'Komputer Mikro Edukasi Raspberry Pi',
      title_en: 'Raspberry Pi Educational Micro-Computer',
      description_id: 'Komputer mungil seukuran kartu saku yang dibuat khusus untuk membantu anak-anak belajar dasar coding, robotika, dan eksperimen teknologi.',
      description_en: 'A pocket-sized credit-card microcomputer designed specifically to help children learn basic coding, robotics, and build digital technology experiments.',
      icon_name: 'icon_europe_pi.png'
    }]
  },
  {
    id: 7,
    country_code: 'USA',
    country_name_id: 'Amerika Serikat',
    country_name_en: 'United States',
    continent: 'America',
    latitude: 37.090240,
    longitude: -95.712891,
    innovations: [{
      id: 7,
      title_id: 'Roket Reusable SpaceX Falcon 9',
      title_en: 'SpaceX Falcon 9 Reusable Rocket',
      description_id: 'Roket luar angkasa pertama yang dapat terbang kembali ke bumi dan mendarat tegak lurus secara otomatis, membuat perjalanan ke luar angkasa jauh lebih murah.',
      description_en: 'The first orbital rocket capable of returning to Earth and landing upright automatically on an ocean drone ship, making space travel far cheaper.',
      icon_name: 'icon_america_rocket.png'
    }]
  },
  {
    id: 8,
    country_code: 'BRA',
    country_name_id: 'Brasil',
    country_name_en: 'Brazil',
    continent: 'America',
    latitude: -14.235004,
    longitude: -51.925280,
    innovations: [{
      id: 8,
      title_id: 'Bahan Bakar Bersih Bioetanol Tebu',
      title_en: 'Clean Sugarcane Bioethanol Fuel',
      description_id: 'Teknologi pengolahan tanaman tebu menjadi bahan bakar cair ramah lingkungan (bioetanol) untuk mengurangi polusi asap udara di kota-kota besar Brasil.',
      description_en: 'An environmentally friendly technology processing sugarcane crops into liquid bioethanol fuel, significantly reducing air pollution in major Brazilian cities.',
      icon_name: 'icon_america_biofuel.png'
    }]
  },
  {
    id: 9,
    country_code: 'KEN',
    country_name_id: 'Kenya',
    country_name_en: 'Kenya',
    continent: 'Africa',
    latitude: -1.292066,
    longitude: 36.821946,
    innovations: [{
      id: 9,
      title_id: 'Sistem Uang Elektronik Seluler M-Pesa',
      title_en: 'M-Pesa Mobile Money Network',
      description_id: 'Layanan keuangan seluler pertama di dunia yang memungkinkan jutaan orang mengirim uang secara aman hanya menggunakan SMS di handphone jadul.',
      description_en: 'The world’s first mobile financial service that allows millions of unbanked citizens to safely send and receive money using basic SMS text messaging.',
      icon_name: 'icon_africa_money.png'
    }]
  },
  {
    id: 10,
    country_code: 'EGY',
    country_name_id: 'Mesir',
    country_name_en: 'Egypt',
    continent: 'Africa',
    latitude: 26.820553,
    longitude: 30.802498,
    innovations: [{
      id: 10,
      title_id: 'Mega Proyek Surya Gurun Benban',
      title_en: 'Benban Desert Mega Solar Grid',
      description_id: 'Pembangkit listrik tenaga surya terbesar di benua Afrika yang memproduksi listrik bersih dari matahari untuk menerangi jutaan rumah warga.',
      description_en: 'The largest solar power plant in Africa built in the middle of the Egyptian desert, producing clean electricity from the sun to power millions of homes.',
      icon_name: 'icon_africa_solar.png'
    }]
  }
];

// Tekstur laut biru langit pastel cerah menggunakan single pixel Base64 PNG
const PASTEL_OCEAN_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export default function MapPage() {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State untuk data negara
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Indeks inovasi aktif di panel detail
  
  // State untuk GeoJSON daratan
  const [geoJsonData, setGeoJsonData] = useState(null);

  // Referensi & State dimensi responsif Globe
  const globeRef = useRef();
  const containerRef = useRef();
  const [globeSize, setGlobeSize] = useState({ width: 600, height: 500 });

  // 1. Ambil data negara & inovasi dari backend Express API
  useEffect(() => {
    fetch('http://localhost:5000/api/countries')
      .then((res) => {
        if (!res.ok) throw new Error('API gagal merespons');
        return res.json();
      })
      .then((json) => {
        if (json.status === 'success' && json.data.length > 0) {
          setCountries(json.data);
        }
      })
      .catch((err) => {
        console.warn('API error, menggunakan data fallback lokal:', err.message);
        setCountries(FALLBACK_COUNTRIES);
      });
  }, []);

  // 2. Ambil data GeoJSON ringan untuk mewarnai daratan bumi
  useEffect(() => {
    fetch('https://vasturiano.github.io/react-globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((data) => {
        setGeoJsonData(data.features);
      })
      .catch((err) => console.error('Gagal mengambil data GeoJSON:', err));
  }, []);

  // 3. Menangani perubahan ukuran layar (Responsive Globe)
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setGlobeSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 500
        });
      }
    };
    
    // Inisialisasi awal dan tambahkan listener resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 4. Otomatis posisikan kamera globe ke negara yang diklik
  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    setActiveTab(0); // Reset ke inovasi pertama
    
    if (globeRef.current) {
      // Pindahkan kamera dengan transisi halus
      globeRef.current.pointOfView({
        lat: country.latitude,
        lng: country.longitude,
        altitude: 1.5
      }, 1200);
    }
  };

  // 5. Fungsi Keluar / Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-brandCream font-quicksand flex flex-col justify-between select-none">
      
      {/* HEADER NAVIGASI */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md border-b-4 border-brandBlue/10 z-20">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-brandBlue rounded-xl flex items-center justify-center text-white shadow-md">
            <GlobeIcon size={20} className="animate-spin-slow" />
          </div>
          <span className="text-xl font-fredoka font-bold text-brandNavy">
            Tech<span className="text-brandRose">Go</span>
          </span>
        </div>

        {/* Info Pengguna & Toggle Bahasa */}
        <div className="flex items-center gap-4">
          
          {/* Tag Welcome User */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 border-2 border-brandBlue/20 rounded-2xl shadow-sm">
            <span className="text-base">👤</span>
            <span className="font-fredoka text-sm text-brandNavy font-semibold">
              {user?.username || 'Petualang'}
            </span>
          </div>

          {/* Toggle Bahasa */}
          <div className="bg-brandNavy/5 p-0.5 rounded-xl flex border-2 border-brandNavy/10">
            <button 
              onClick={() => changeLanguage('id')}
              className={`px-2.5 py-0.5 rounded-lg font-fredoka text-xs transition-playful ${
                language === 'id' ? 'bg-brandBlue text-white shadow-sm' : 'text-brandNavy'
              }`}
            >
              ID
            </button>
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-0.5 rounded-lg font-fredoka text-xs transition-playful ${
                language === 'en' ? 'bg-brandBlue text-white shadow-sm' : 'text-brandNavy'
              }`}
            >
              EN
            </button>
          </div>

          {/* Tombol Logout */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 px-4 py-2 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl font-fredoka text-sm shadow-sm transition-playful"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{t('navbar.logout') || 'Keluar'}</span>
          </button>
        </div>
      </header>

      {/* AREA UTAMA MAP (GRID LAYOUT RESPONSIVE) */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full overflow-hidden">
        
        {/* KONTENER KIRI: GLOBE 3D */}
        <div 
          ref={containerRef} 
          className="flex-1 w-full h-[55vh] lg:h-auto flex items-center justify-center bg-brandCream relative cursor-grab active:cursor-grabbing"
        >
          
          {/* Petunjuk Aksi Bantuan */}
          <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-md px-4 py-2 border-2 border-brandBlue/25 rounded-2xl text-xs font-bold text-brandNavy shadow-sm z-15 pointer-events-none">
            🌍 Tarik untuk memutar • Ketuk PIN untuk belajar!
          </div>

          {geoJsonData ? (
            <Globe
              ref={globeRef}
              width={globeSize.width}
              height={globeSize.height}
              
              // Tekstur Air (Biru Pastel Langit)
              globeImageUrl={PASTEL_OCEAN_IMAGE}
              
              // Latar Belakang Transparan agar mengikuti background page
              backgroundColor="rgba(0,0,0,0)"
              
              // Poligon Negara (GeoJSON) - Warna Daratan Pastel Hijau (#2EC4B6)
              polygonsData={geoJsonData}
              polygonCapColor={() => 'rgba(46, 196, 182, 0.9)'}
              polygonSideColor={() => '#1e3a5f'}
              polygonStrokeColor={() => '#FFFCE8'}
              polygonLabel={({ properties: d }) => `
                <div style="background: white; color: #1E3A5F; padding: 6px 10px; border-radius: 12px; font-family: 'Fredoka', sans-serif; font-weight: bold; border: 3px solid #5CC2F2; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  🗺️ ${d.ADMIN || d.NAME}
                </div>
              `}
              
              // Efek Atmosfer Lucu
              showAtmosphere={true}
              atmosphereColor="#5CC2F2"
              atmosphereRadiusScale={0.12}

              // Data Pin/Titik Negara Inovasi
              pointsData={countries}
              pointLat="latitude"
              pointLng="longitude"
              pointColor={() => '#FF6B9B'} // Pin Berwarna Rose/Pink Pastel
              pointRadius={0.7}
              pointAltitude={0.05}
              pointsMerge={false}
              pointLabel={(c) => `
                <div style="background: #FFFCE8; color: #1E3A5F; padding: 8px 12px; border-radius: 16px; font-family: 'Fredoka', sans-serif; border: 4px solid #FFB347; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                  📌 <span style="font-weight: bold; color:#FF6B9B;">${language === 'id' ? c.country_name_id : c.country_name_en}</span>
                  <div style="font-size:11px; margin-top:3px; color:#1E3A5F; opacity:0.8;">Klik untuk lihat teknologi canggih!</div>
                </div>
              `}
              onPointClick={(c) => handleCountryClick(c)}
            />
          ) : (
            // Spinner Loading Imut sebelum Globe terpasang
            <div className="flex flex-col items-center gap-4 text-brandNavy">
              <div className="w-16 h-16 border-8 border-brandBlue border-t-brandRose rounded-full animate-spin"></div>
              <p className="font-fredoka text-lg animate-pulse">Menyiapkan Bola Dunia TechGo...</p>
            </div>
          )}
        </div>

        {/* KONTENER KANAN / BAWAH: PANEL DETAIL INOVASI */}
        <div className={`
          w-full lg:w-[450px] bg-white border-t-8 lg:border-t-0 lg:border-l-8 border-brandBlue/20 
          p-6 flex flex-col justify-between transition-playful z-15 shadow-2xl relative
          ${selectedCountry ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full absolute bottom-0 lg:right-0 opacity-0 pointer-events-none'}
        `}>
          
          {selectedCountry ? (
            <>
              {/* Bagian Konten Detail */}
              <div className="flex-1 overflow-y-auto pr-1">
                
                {/* Tombol Tutup Panel di Kanan Atas */}
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="absolute top-4 right-4 text-brandNavy/40 hover:text-brandRose transition-playful text-xl font-bold bg-brandCream w-8 h-8 rounded-full flex items-center justify-center border-2 border-brandNavy/10"
                >
                  ✕
                </button>

                {/* Info Wilayah Negara */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📍</span>
                  <span className="font-fredoka text-brandOrange font-bold tracking-wide text-sm uppercase">
                    {selectedCountry.continent}
                  </span>
                </div>

                {/* Nama Negara */}
                <h2 className="text-3xl text-brandNavy font-fredoka mb-4">
                  {language === 'id' ? selectedCountry.country_name_id : selectedCountry.country_name_en}
                </h2>

                {/* Tab Inovasi (Jika memiliki lebih dari 1 inovasi) */}
                {selectedCountry.innovations.length > 1 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {selectedCountry.innovations.map((inv, idx) => (
                      <button
                        key={inv.id}
                        onClick={() => setActiveTab(idx)}
                        className={`px-3 py-1.5 rounded-xl font-fredoka text-xs transition-playful whitespace-nowrap ${
                          activeTab === idx 
                            ? 'bg-brandBlue text-white shadow-sm' 
                            : 'bg-brandCream text-brandNavy hover:bg-brandBlue/10'
                        }`}
                      >
                        Tech {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Detail Inovasi Terpilih */}
                {selectedCountry.innovations[activeTab] ? (
                  <div className="bg-brandCream/40 border-4 border-brandBlue/20 p-5 rounded-3xl mb-6">
                    
                    {/* Visual Ikon Lucu */}
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-brandBlue/10 mb-4 animate-bounce-slow">
                      {/* Placeholder Ikon menggunakan Emoji relevan */}
                      {selectedCountry.innovations[activeTab].icon_name.includes('iot') && '🌾'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('train') && '🚄'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('5g') && '🤖'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('industry') && '⚙️'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('plane') && '✈️'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('pi') && '💻'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('rocket') && '🚀'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('biofuel') && '🍃'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('money') && '📱'}
                      {selectedCountry.innovations[activeTab].icon_name.includes('solar') && '☀️'}
                    </div>

                    {/* Judul Inovasi */}
                    <h3 className="text-xl text-brandNavy font-fredoka mb-2">
                      {language === 'id' 
                        ? selectedCountry.innovations[activeTab].title_id 
                        : selectedCountry.innovations[activeTab].title_en
                      }
                    </h3>

                    {/* Deskripsi Inovasi */}
                    <p className="text-brandNavy/80 font-quicksand font-medium text-sm sm:text-base leading-relaxed">
                      {language === 'id' 
                        ? selectedCountry.innovations[activeTab].description_id 
                        : selectedCountry.innovations[activeTab].description_en
                      }
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium text-sm">Tidak ada inovasi terdaftar.</p>
                )}

                {/* Banner Peringatan untuk Pengguna Tamu (Guest) */}
                {user?.isGuest && (
                  <div className="bg-brandOrange/15 border-2 border-brandOrange/30 text-brandNavy p-4 rounded-2xl mb-4 flex gap-2 items-start text-xs sm:text-sm font-bold">
                    <AlertCircle size={18} className="text-brandOrange shrink-0 mt-0.5" />
                    <div>
                      <span className="text-brandOrange font-fredoka block mb-0.5">Mode Tamu Aktif 📢</span>
                      Yuk masuk akun agar progres belajarmu dan hasil kuis seru nanti bisa disimpan permanen!
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Kuis di bagian Bawah */}
              <div className="pt-4 border-t-4 border-brandBlue/10 bg-white">
                <button
                  onClick={() => navigate('/quiz', {
                    state: {
                      innovationId: selectedCountry.innovations[activeTab]?.id || 1,
                      innovationTitle: language === 'id' 
                        ? selectedCountry.innovations[activeTab]?.title_id 
                        : selectedCountry.innovations[activeTab]?.title_en
                    }
                  })}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-3xl font-fredoka text-lg transition-playful shadow-md border-b-6 border-brandTeal/70 hover:scale-[1.02] active:scale-95"
                >
                  <BookOpen size={20} />
                  <span>Mulai Kuis Adaptif AI</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            // Tampilan Panduan jika belum memilih Negara
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-brandNavy/60">
              <span className="text-5xl animate-pulse mb-4">🌍</span>
              <p className="font-fredoka text-lg">Pilih salah satu pin negara di bola dunia untuk mempelajari inovasi teknologinya!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
