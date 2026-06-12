import { useState, useEffect, useRef, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  ArrowRight, 
  BookOpen, 
  AlertCircle, 
  Menu, 
  X, 
  Rocket, 
  Globe as GlobeIcon, 
  Pin,  
  Brain, 
  User, 
  MapPin, 
  Sprout, 
  Train, 
  Cpu, 
  Settings, 
  Plane, 
  Laptop, 
  Leaf, 
  Smartphone, 
  Sun 
} from 'lucide-react';
import logoImg from '../assets/logo.png';

// Data fallback lokal untuk pengujian frontend jika API backend/database belum tersambung
const FALLBACK_COUNTRIES = [
  {
    id: 1,
    country_code: 'IDN',
    country_name_id: 'Indonesia',
    country_name_en: 'Indonesia',
    continent: 'Asia',
    latitude: -7.052457,
    longitude: 108.256638,
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
    latitude: 36.001670,
    longitude: 138.576247,
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
    latitude: 36.067083,
    longitude: 127.906735,
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
    latitude: 51.668798,
    longitude: 9.733546,
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
    latitude: 45.848573,
    longitude: 2.280187,
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
    latitude: 52.620117,
    longitude: -2.414026,
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
    latitude: 39.528976,
    longitude: -99.211269,
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
    latitude: -10.447299,
    longitude: -52.401329,
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
    latitude: -1.047682,
    longitude: 39.245191,
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
    latitude: 27.491489,
    longitude: 29.296290,
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

// Menghasilkan data URL gambar laut Sky Blue (#5CC2F2) secara dinamis agar samudra tidak berwarna merah
const createPastelOceanImage = () => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#5CC2F2';
  ctx.fillRect(0, 0, 1, 1);
  return canvas.toDataURL();
};
const PASTEL_OCEAN_IMAGE = typeof document !== 'undefined' ? createPastelOceanImage() : '';

export default function MapPage() {
  const { language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State untuk data negara
  const [countries, setCountries] = useState(FALLBACK_COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Indeks inovasi aktif di panel detail
  const [showTutorial, setShowTutorial] = useState(true);
  const [debugCoords, setDebugCoords] = useState(null);
  
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
          // Menyelaraskan koordinat dari FALLBACK_COUNTRIES agar perubahan koordinat lokal di frontend langsung diterapkan
          const mergedData = json.data.map((dbCountry) => {
            const localCountry = FALLBACK_COUNTRIES.find(
              (c) => c.country_code === dbCountry.country_code
            );
            if (localCountry) {
              return {
                ...dbCountry,
                latitude: localCountry.latitude,
                longitude: localCountry.longitude,
              };
            }
            return dbCountry;
          });
          setCountries(mergedData);
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

  // 3. Menangani perubahan ukuran layar (Responsive Globe) secara dinamis
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
    
    // Gunakan timeout kecil agar transisi css flex selesai sebelum ukuran diukur
    const timer = setTimeout(handleResize, 350);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [selectedCountry]);

  // 5. Otomatis posisikan kamera globe ke negara yang diklik
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

  // 6. Fungsi Keluar / Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 7. Handler klik globe untuk menyalin koordinat latitude & longitude
  const handleGlobeClick = ({ lat, lng }) => {
    setDebugCoords({ lat, lng });
    const coordText = `latitude: ${lat.toFixed(6)},\nlongitude: ${lng.toFixed(6)},`;
    navigator.clipboard.writeText(coordText)
      .then(() => {
        console.log('Koordinat disalin ke clipboard:\n', coordText);
      })
      .catch((err) => {
        console.error('Gagal menyalin koordinat:', err);
      });
  };

  // Memoisasi pembuatan objek 3D untuk mencegah render ulang/flicker dan pemuatan ulang berkas GLB saat MapPage dirender ulang
  const handleCustomThreeObject = useCallback((c) => {
    const g = new THREE.Group();
    
    // Fallback pastel cylinder sebagai penanda sementara saat proses loading
    const fallbackGeometry = new THREE.CylinderGeometry(0.8, 0.8, 6, 16);
    const fallbackMaterial = new THREE.MeshBasicMaterial({ color: '#FF6B9B' });
    const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
    fallbackMesh.position.z = 3;
    fallbackMesh.rotation.x = Math.PI / 2;
    g.add(fallbackMesh);
    
    // Pemuatan model GLTF/GLB secara asinkron dari folder public
    const loader = new GLTFLoader();
    const modelName = c.country_name_en.toLowerCase().replace(/\s+/g, '_');
    loader.load(`/assets/models/${modelName}.glb`, 
      (gltf) => {
        // Hapus fallback silinder setelah model GLB berhasil dimuat
        g.remove(fallbackMesh);
        const model = gltf.scene;
        
        // Optimasi Auto-Scaling: Hitung bounding box agar tinggi model seragam (~10 unit)
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 10;
        const scale = targetSize / (maxDim || 1);
        model.scale.set(scale, scale, scale);
        
        // Pusatkan model secara horizontal dan sejajarkan bagian bawah (bottom) model di y=0
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -scaledBox.min.y;
        
        // Bungkus dalam pivot group dan putar 90 derajat (Y-up ke Z-out) agar berdiri tegak lurus
        const pivot = new THREE.Group();
        pivot.add(model);
        pivot.rotation.x = Math.PI / 2;
        
        g.add(pivot);
      },
      undefined,
      (err) => {
        console.warn(`Info: Berkas model 3D /assets/models/${modelName}.glb belum ada atau gagal dimuat, menggunakan fallback silinder.`, err.message);
      }
    );
    
    return g;
  }, []);

  // Memoisasi penanganan pembaruan posisi/rotasi objek 3D
  const handleCustomThreeObjectUpdate = useCallback((obj, c) => {
    if (globeRef.current) {
      const coords = globeRef.current.getCoords(c.latitude, c.longitude, 0.01);
      Object.assign(obj.position, coords);
      
      // Sejajarkan arah atas objek tegak lurus keluar dari permukaan bumi
      const dir = new THREE.Vector3(coords.x, coords.y, coords.z).normalize();
      obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      
      // Rotasi putaran lambat pada porosnya sendiri agar terlihat menarik (seperti collectible)
      const spinAngle = (Date.now() * 0.0008) % (Math.PI * 2);
      obj.rotateOnAxis(new THREE.Vector3(0, 0, 1), spinAngle);
    }
  }, []);

  return (
    <div className="min-h-screen bg-brandCream font-quicksand flex flex-col justify-between select-none overflow-hidden">
      
      {/* HEADER NAVIGASI */}
      <header className="w-full px-6 py-2 md:py-3 flex justify-between items-center bg-white/70 backdrop-blur-md border-b-4 border-brandBlue/10 z-20">
        
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoImg} alt="TechGo Logo" className="h-12 w-auto hover:scale-105 transition-playful" />
        </div>

        {/* Menu Navigasi dengan Burger Icon */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 text-brandNavy bg-white border-4 border-brandBlue/30 hover:border-brandBlue rounded-2xl shadow-md transition-playful cursor-pointer flex items-center justify-center"
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Dropdown Menu (Burger Dropdown) */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border-4 border-brandBlue/25 p-5 shadow-2xl z-50 flex flex-col gap-4 animate-float">
              {/* Nama Pengguna */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-brandCream rounded-2xl border-2 border-brandBlue/10">
                <User size={18} className="text-brandNavy/60" />
                <span className="font-fredoka text-sm text-brandNavy font-bold">
                  {user?.username || 'Petualang'}
                </span>
              </div>

              {/* Pilihan Ganti Bahasa */}
              <div className="flex flex-col gap-1.5">
                <span className="font-fredoka text-xs text-brandNavy/60 px-1 font-extrabold uppercase tracking-wide">
                  {language === 'en' ? 'Language' : 'Bahasa'}
                </span>
                <div className="bg-brandNavy/5 p-1 rounded-xl flex border-2 border-brandNavy/10">
                  <button 
                    onClick={() => { changeLanguage('id'); setIsMenuOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg font-fredoka text-xs transition-playful cursor-pointer ${
                      language === 'id' 
                        ? 'bg-brandBlue text-white shadow-sm font-bold' 
                        : 'text-brandNavy hover:bg-brandNavy/10'
                    }`}
                  >
                    ID
                  </button>
                  <button 
                    onClick={() => { changeLanguage('en'); setIsMenuOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg font-fredoka text-xs transition-playful cursor-pointer ${
                      language === 'en' 
                        ? 'bg-brandBlue text-white shadow-sm font-bold' 
                        : 'text-brandNavy hover:bg-brandNavy/10'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              {/* Tombol Profilku */}
              <button 
                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brandOrange hover:bg-brandOrange/90 text-white rounded-2xl font-fredoka text-sm shadow-md border-b-4 border-brandOrange/70 transition-playful cursor-pointer font-bold"
              >
                <User size={16} />
                <span>{language === 'en' ? 'My Profile' : 'Profilku'}</span>
              </button>

              {/* Tombol Panduan / Tutorial */}
              <button 
                onClick={() => { setShowTutorial(true); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-brandBlue hover:bg-brandBlue/90 text-white rounded-2xl font-fredoka text-sm shadow-md border-b-4 border-brandBlue/70 transition-playful cursor-pointer font-bold mb-1"
              >
                <BookOpen size={16} />
                <span>{language === 'en' ? 'Show Guide' : 'Lihat Panduan'}</span>
              </button>

              <hr className="border-brandNavy/10 my-1" />

              {/* Tombol Keluar (Logout) */}
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brandRose hover:bg-brandRose/90 text-white rounded-2xl font-fredoka text-sm shadow-md border-b-4 border-brandRose/70 transition-playful cursor-pointer font-bold"
              >
                <LogOut size={16} />
                <span>{language === 'en' ? 'Logout' : 'Keluar'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* AREA UTAMA MAP (FLEX LAYOUT DENGAN CENTERING MEGAH) */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full overflow-hidden h-[calc(100vh-80px)]">
        
        {/* KONTENER KIRI: GLOBE 3D (Tinggi diatur eksplisit dan selalu memosisikan bola dunia di tengah) */}
        <div 
          ref={containerRef} 
          className="flex-1 w-full h-[50vh] lg:h-[calc(100vh-80px)] flex items-center justify-center bg-brandCream relative cursor-grab active:cursor-grabbing"
        >
          {/* Debugging HUD Koordinat */}
          {debugCoords && (
            <div className="absolute top-4 left-4 z-30 bg-white/85 backdrop-blur-md border-4 border-brandBlue/35 p-4 rounded-3xl shadow-2xl font-fredoka text-xs text-brandNavy flex flex-col gap-1.5 select-text max-w-xs animate-scale-up">
              <div className="flex justify-between items-center gap-4">
                <span className="font-bold text-brandOrange">🛠️ KOORDINAT DISALIN!</span>
                <button 
                  onClick={() => setDebugCoords(null)} 
                  className="text-brandRose hover:scale-110 transition-playful cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="font-mono mt-1 text-[10px] bg-brandCream p-2.5 rounded-2xl border border-brandNavy/10 leading-relaxed">
                latitude: {debugCoords.lat.toFixed(6)},<br />
                longitude: {debugCoords.lng.toFixed(6)},
              </p>
              <span className="text-[9px] text-brandNavy/60 font-semibold">Format siap paste ke source code!</span>
            </div>
          )}

          {/* Banner Bantuan Petunjuk Sederhana yang kini lebih bersih */}

          {geoJsonData ? (
            <Globe
              ref={globeRef}
              width={globeSize.width}
              height={globeSize.height}
              
              // Tekstur Air (Biru Pastel Langit #5CC2F2)
              globeImageUrl={PASTEL_OCEAN_IMAGE}
              
              // Latar Belakang Transparan
              backgroundColor="rgba(0,0,0,0)"
              
              // Poligon Negara (GeoJSON) - Warna Daratan Pastel Hijau Sage (#2EC4B6)
              polygonsData={geoJsonData}
              polygonCapColor={() => 'rgba(46, 196, 182, 0.95)'}
              polygonSideColor={() => '#1E3A5F'}
              
              // Batas negara dibuat tipis dan transparan agar tidak semrawut (Clean Layout)
              polygonStrokeColor={() => 'rgba(255, 252, 232, 0.25)'}
              polygonLabel={({ properties: d }) => `
                <div style="background: white; color: #1E3A5F; padding: 6px 10px; border-radius: 12px; font-family: 'Fredoka', sans-serif; font-weight: bold; border: 3px solid #5CC2F2; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  🗺️ ${d.ADMIN || d.NAME}
                </div>
              `}
              
              // Efek Atmosfer Lucu
              showAtmosphere={true}
              atmosphereColor="#5CC2F2"
              atmosphereRadiusScale={0.12}

              // Menampilkan Landmark 3D Khas Negara secara Asinkronus (GLTF/GLB)
              customLayerData={countries}
              customThreeObject={handleCustomThreeObject}
              customThreeObjectUpdate={handleCustomThreeObjectUpdate}
              customLayerLabel={(c) => `
                <div style="background: #FFFCE8; color: #1E3A5F; padding: 8px 12px; border-radius: 16px; font-family: 'Fredoka', sans-serif; border: 4px solid #FFB347; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                  📌 <span style="font-weight: bold; color:#FF6B9B;">${language === 'id' ? c.country_name_id : c.country_name_en}</span>
                  <div style="font-size:11px; margin-top:3px; color:#1E3A5F; opacity:0.8;">Klik untuk lihat teknologi canggih!</div>
                </div>
              `}
              onCustomLayerClick={(c) => handleCountryClick(c)}
              onGlobeClick={handleGlobeClick}
              onPolygonClick={(polygon, event, { lat, lng }) => handleGlobeClick({ lat, lng })}
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
          p-6 flex flex-col justify-between transition-all duration-300 z-15 shadow-2xl
          ${selectedCountry 
            ? 'relative translate-y-0 lg:translate-x-0' 
            : 'absolute translate-y-full lg:translate-y-0 lg:translate-x-full bottom-0 lg:right-0 opacity-0 pointer-events-none'
          }
        `}>
          
          {selectedCountry ? (
            <>
              {/* Bagian Konten Detail */}
              <div className="flex-1 overflow-y-auto pr-1">
                
                {/* Tombol Tutup Panel di Kanan Atas */}
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="absolute top-4 right-4 text-brandNavy/40 hover:text-brandRose transition-playful text-xl font-bold bg-brandCream w-8 h-8 rounded-full flex items-center justify-center border-2 border-brandNavy/10 cursor-pointer"
                >
                  ✕
                </button>
 
                {/* Info Wilayah Negara */}
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={18} className="text-brandOrange" />
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
                        className={`px-3 py-1.5 rounded-xl font-fredoka text-xs transition-playful whitespace-nowrap cursor-pointer ${
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
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md border-2 border-brandBlue/10 mb-4 animate-bounce-slow">
                      {/* Ikon Lucide Dinamis */}
                      {selectedCountry.innovations[activeTab].icon_name.includes('iot') && <Sprout size={32} className="text-brandTeal" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('train') && <Train size={32} className="text-brandBlue" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('5g') && <Cpu size={32} className="text-brandOrange" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('industry') && <Settings size={32} className="text-brandNavy" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('plane') && <Plane size={32} className="text-brandBlue" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('pi') && <Laptop size={32} className="text-brandNavy" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('rocket') && <Rocket size={32} className="text-brandRose" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('biofuel') && <Leaf size={32} className="text-brandTeal" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('money') && <Smartphone size={32} className="text-brandTeal" />}
                      {selectedCountry.innovations[activeTab].icon_name.includes('solar') && <Sun size={32} className="text-brandOrange" />}
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
                  className="flex items-center justify-center gap-2 w-full py-4 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-3xl font-fredoka text-lg transition-playful shadow-md border-b-6 border-brandTeal/70 hover:scale-[1.02] active:scale-95 cursor-pointer"
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
              <div className="animate-pulse mb-4 text-brandBlue/60">
                <GlobeIcon size={48} strokeWidth={1.5} />
              </div>
              <p className="font-fredoka text-lg">
                {language === 'en' 
                  ? 'Select one of the pins on the globe to explore its technology innovation!' 
                  : 'Pilih salah satu pin negara di bola dunia untuk mempelajari inovasi teknologinya!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. MODAL TUTORIAL / PANDUAN PETUALANG (PLAYFUL & CHILD-FRIENDLY) */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay Gelap Transparan Belakang */}
          <div 
            className="absolute inset-0 bg-brandNavy/45 backdrop-blur-md transition-opacity"
            onClick={() => setShowTutorial(false)}
          ></div>
          
          {/* Kotak Konten Modal (Spring Entrance: animate-scale-up) */}
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full z-20 shadow-[0_20px_50px_rgba(30,58,95,0.15)] relative border-4 border-brandBlue/10 opacity-0 animate-scale-up">
            
            {/* Header Tutorial */}
            <div className="text-center mb-6 pt-4">
              <h2 className="text-2xl sm:text-3xl text-brandNavy font-fredoka font-bold">
                {language === 'en' ? 'Adventure Guide!' : 'Panduan Petualang!'}
              </h2>
            </div>

            {/* List Petunjuk (Minimalist transparent list rows with staggered slide-up) */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Langkah 1 */}
              <div 
                className="flex items-start gap-4 py-2 opacity-0 animate-slide-up group"
                style={{ animationDelay: '0ms' }}
              >
                <div className="p-2.5 bg-brandBlue/10 rounded-2xl text-brandBlue transition-transform duration-300 ease-out group-hover:scale-125 group-hover:rotate-12 select-none">
                  <GlobeIcon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-fredoka text-sm text-brandNavy font-bold">
                    {language === 'en' ? '1. Rotate the Earth' : '1. Putar Bumi'}
                  </h4>
                  <p className="font-quicksand text-xs sm:text-sm text-brandNavy/80 mt-0.5 leading-snug font-medium">
                    {language === 'en' 
                      ? 'Drag the 3D globe to search for interesting countries!' 
                      : 'Geser bola dunia 3D untuk mencari negara-negara seru!'}
                  </p>
                </div>
              </div>

              {/* Langkah 2 */}
              <div 
                className="flex items-start gap-4 py-2 opacity-0 animate-slide-up group"
                style={{ animationDelay: '150ms' }}
              >
                <div className="p-2.5 bg-brandRose/10 rounded-2xl text-brandRose transition-transform duration-300 ease-out group-hover:scale-125 group-hover:animate-bounce select-none">
                  <Pin size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-fredoka text-sm text-brandNavy font-bold">
                    {language === 'en' ? '2. Tap Pink PIN' : '2. Ketuk PIN Pink'}
                  </h4>
                  <p className="font-quicksand text-xs sm:text-sm text-brandNavy/80 mt-0.5 leading-snug font-medium">
                    {language === 'en' 
                      ? 'Click the pulsing pink pins to unlock advanced technology!' 
                      : 'Klik pin merah muda yang berdenyut untuk membuka teknologi canggih!'}
                  </p>
                </div>
              </div>

              {/* Langkah 3 */}
              <div 
                className="flex items-start gap-4 py-2 opacity-0 animate-slide-up group"
                style={{ animationDelay: '300ms' }}
              >
                <div className="p-2.5 bg-brandOrange/10 rounded-2xl text-brandOrange transition-transform duration-300 ease-out group-hover:scale-125 group-hover:-rotate-12 select-none">
                  <Brain size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="font-fredoka text-sm text-brandNavy font-bold">
                    {language === 'en' ? '3. Gemini AI Quiz' : '3. Kuis AI Gemini'}
                  </h4>
                  <p className="font-quicksand text-xs sm:text-sm text-brandNavy/80 mt-0.5 leading-snug font-medium">
                    {language === 'en' 
                      ? 'Complete the adaptive quizzes to level up and earn badges!' 
                      : 'Selesaikan kuis adaptif untuk meningkatkan level dan kumpulkan lencana!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol Tutup Tutorial (Sage Green #2EC4B6 with custom pulse glow) */}
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full py-3.5 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-full font-fredoka text-lg transition-playful shadow-md border-b-4 border-brandTeal/70 text-center cursor-pointer font-bold hover:scale-[1.02] active:scale-95 animate-pulse-glow"
            >
              {language === 'en' ? "Ready, Let's Go!" : 'Siap, Ayo Mulai!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
