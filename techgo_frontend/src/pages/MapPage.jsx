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
  Sun,
  Wifi,
  Terminal
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { FALLBACK_COUNTRIES } from '../data/fallbackCountries';

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

// Helper function to render cute Lucide icons dynamically based on their database-saved filenames
const renderInnovationIcon = (iconName, size = 32) => {
  if (!iconName) return <Cpu size={size} className="text-brandNavy" />;
  try {
    const name = iconName.toLowerCase();
    if (name.includes('iot')) return <Sprout size={size} className="text-brandTeal" />;
    if (name.includes('train')) return <Train size={size} className="text-brandBlue" />;
    if (name.includes('5g')) return <Cpu size={size} className="text-brandOrange" />;
    if (name.includes('industry')) return <Settings size={size} className="text-brandNavy" />;
    if (name.includes('plane')) return <Plane size={size} className="text-brandBlue" />;
    if (name.includes('pi')) return <Laptop size={size} className="text-brandNavy" />;
    if (name.includes('rocket')) return <Rocket size={size} className="text-brandRose" />;
    if (name.includes('biofuel')) return <Leaf size={size} className="text-brandTeal" />;
    if (name.includes('money')) return <Smartphone size={size} className="text-brandTeal" />;
    if (name.includes('solar')) return <Sun size={size} className="text-brandOrange" />;
    if (name.includes('wifi')) return <Wifi size={size} className="text-brandTeal" />;
    if (name.includes('linux')) return <Terminal size={size} className="text-brandOrange" />;
  } catch (e) {
    console.error('Error in renderInnovationIcon:', e);
  }
  return <Cpu size={size} className="text-brandNavy" />;
};

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
          // Mulai dengan semua FALLBACK_COUNTRIES sebagai salinan dasar
          // agar jika ada negara baru (seperti Australia/Finlandia) yang belum masuk ke database lokal user,
          // negara tersebut tetap dirender dari fallback lokal.
          const mergedData = FALLBACK_COUNTRIES.map((localCountry) => {
            const dbCountry = json.data.find(
              (c) => c.country_code === localCountry.country_code
            );
            if (dbCountry) {
              return {
                ...dbCountry,
                latitude: localCountry.latitude,
                longitude: localCountry.longitude,
              };
            }
            return localCountry;
          });

          // Tambahkan negara lain dari database jika ada yang tidak terdaftar di fallback
          json.data.forEach((dbCountry) => {
            const exists = mergedData.some((c) => c.country_code === dbCountry.country_code);
            if (!exists) {
              mergedData.push(dbCountry);
            }
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
    try {
      setSelectedCountry(country);
      setActiveTab(0); // Reset ke inovasi pertama
      
      if (globeRef.current) {
        // Pindahkan kamera dengan transisi halus ke koordinat landmark negara dengan zoom sangat dekat
        globeRef.current.pointOfView({
          lat: country?.latitude || 0,
          lng: country?.longitude || 0,
          altitude: 0.3
        }, 1200);
      }
    } catch (err) {
      console.error('Error in handleCountryClick:', err);
    }
  };


  // 6. Fungsi Keluar / Logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper untuk merender ikon inovasi berdasarkan kata kunci di nama ikon
  const renderInnovationIcon = (iconName, size = 32) => {
    if (!iconName) return <GlobeIcon size={size} className="text-brandBlue" />;
    const name = iconName.toLowerCase();
    if (name.includes('iot')) return <Sprout size={size} className="text-brandTeal" />;
    if (name.includes('train')) return <Train size={size} className="text-brandBlue" />;
    if (name.includes('5g')) return <Cpu size={size} className="text-brandOrange" />;
    if (name.includes('industry')) return <Settings size={size} className="text-brandNavy" />;
    if (name.includes('plane')) return <Plane size={size} className="text-brandBlue" />;
    if (name.includes('pi')) return <Laptop size={size} className="text-brandNavy" />;
    if (name.includes('rocket')) return <Rocket size={size} className="text-brandRose" />;
    if (name.includes('biofuel')) return <Leaf size={size} className="text-brandTeal" />;
    if (name.includes('money')) return <Smartphone size={size} className="text-brandTeal" />;
    if (name.includes('solar')) return <Sun size={size} className="text-brandOrange" />;
    if (name.includes('wifi')) return <Wifi size={size} className="text-brandTeal" />;
    if (name.includes('linux')) return <Terminal size={size} className="text-brandOrange" />;
    return <Rocket size={size} className="text-brandRose" />; // default fallback
  };

  // 7. Handler klik globe untuk menyalin koordinat latitude & longitude (Dinonaktifkan demi kebersihan UI)
  const handleGlobeClick = ({ lat, lng }) => {
    // setDebugCoords({ lat, lng });
    // const coordText = `latitude: ${lat.toFixed(6)},\nlongitude: ${lng.toFixed(6)},`;
    // navigator.clipboard.writeText(coordText)
    //   .then(() => {
    //     console.log('Koordinat disalin ke clipboard:\n', coordText);
    //   })
    //   .catch((err) => {
    //     console.error('Gagal menyalin koordinat:', err);
    //   });
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

        // --- KONFIGURASI TALAAN HALUS MODEL (FINE-TUNING) PER NEGARA ---
        let scaleMultiplier = 1.0;
        let modelRotY = 0;       // Rotasi pada poros vertikal model (heading/arah hadap)
        let pivotRotX = Math.PI / 2; // Rotasi untuk menegakkan model di globe (Y-up ke Z-out)

        if (c.country_code === 'FIN') {
          // Finlandia (Helsinki Cathedral) diperkecil agar tidak raksasa karena bentuknya yang melebar
          scaleMultiplier = 0.45;
        } else if (c.country_code === 'AUS') {
          // Australia (Sydney Opera House) diperkecil dan diputar agar tidak terbalik/salah arah
          scaleMultiplier = 0.65;
          modelRotY = 0;
          pivotRotX = Math.PI / 2; // Kembali ke positif 90 derajat agar tidak tenggelam/terbalik
        }

        const targetSize = 10 * scaleMultiplier;
        const scale = targetSize / (maxDim || 1);
        model.scale.set(scale, scale, scale);
        
        // Pusatkan model secara horizontal dan sejajarkan bagian bawah (bottom) model di y=0
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        scaledBox.getCenter(center);
        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -scaledBox.min.y;
        
        // Atur rotasi hadap model pada poros vertikalnya sebelum ditegakkan di permukaan bumi
        model.rotation.y = modelRotY;

        // Bungkus dalam pivot group dan putar agar berdiri tegak lurus (Y-up ke Z-out)
        const pivot = new THREE.Group();
        pivot.add(model);
        pivot.rotation.x = pivotRotX;
        
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
      
      // Sejajarkan arah atas objek tegak lurus keluar dari permukaan bumi secara stabil (North-aligned basis)
      const zAxis = new THREE.Vector3(coords.x, coords.y, coords.z).normalize(); // Outward normal (Up di permukaan globe)
      const worldUp = new THREE.Vector3(0, 1, 0); // Arah kutub utara
      
      // Hitung sumbu X (Timur) yang tegak lurus terhadap sumbu Z dan Up dunia
      const xAxis = new THREE.Vector3().crossVectors(worldUp, zAxis).normalize();
      
      // Hitung sumbu Y (Utara lokal di permukaan globe)
      const yAxis = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();
      
      // Buat matriks rotasi basis orthogonal
      const matrix = new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis);
      obj.quaternion.setFromRotationMatrix(matrix);
      
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
      <div className="flex flex-col lg:flex-row relative z-10 w-full overflow-hidden main-map-area">
        
        {/* KONTENER KIRI: GLOBE 3D (Tinggi diatur eksplisit dan selalu memosisikan bola dunia di tengah) */}
        <div 
          ref={containerRef} 
          className="flex-1 min-w-0 w-full h-[50vh] lg:h-full flex items-center justify-center bg-brandCream relative cursor-grab active:cursor-grabbing"
        >
          {/* Debugging HUD Koordinat (Dinonaktifkan demi kebersihan UI)
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
          */}

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
              onPolygonClick={(polygon, event) => {
                try {
                  if (!polygon) return;
                  const props = polygon.properties || {};
                  const countryCode = (props.ISO_A3 || props.ADM0_A3 || props.SOV_A3 || '').toUpperCase();
                  const countryName = (props.ADMIN || props.NAME || '').toLowerCase();
                  
                  const found = countries.find(c => 
                    c.country_code.toUpperCase() === countryCode || 
                    c.country_name_en.toLowerCase() === countryName ||
                    (c.country_code === 'USA' && (countryCode === 'US' || countryName.includes('united states') || countryName.includes('america'))) ||
                    (c.country_code === 'GBR' && (countryCode === 'GB' || countryName.includes('united kingdom') || countryName.includes('britain')))
                  );
                  if (found) {
                    handleCountryClick(found);
                  }
                } catch (err) {
                  console.error('Error in onPolygonClick:', err);
                }
              }}
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
          w-full lg:w-[450px] panel-detail-area overflow-hidden bg-white border-t-8 lg:border-t-0 lg:border-l-8 border-brandBlue/20 
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
 
                {/* Daftar Inovasi Vertikal (Scrollable Accordion Cards) */}
                <div className="flex flex-col gap-3 mb-6">
                  {selectedCountry.innovations && selectedCountry.innovations.length > 0 ? (
                    selectedCountry.innovations.map((inv, idx) => {
                      const isOpen = activeTab === idx;
                      const skillLevel = localStorage.getItem(`techgo_skill_${inv.id}`) || 'Beginner';
                      
                      // Terjemahan level untuk anak-anak
                      let levelLabel = 'Beginner 🌟';
                      let levelColor = 'bg-brandTeal/10 text-brandTeal border-brandTeal/20';
                      if (skillLevel === 'Intermediate') {
                        levelLabel = 'Intermediate 🚀';
                        levelColor = 'bg-brandBlue/10 text-brandBlue border-brandBlue/20';
                      } else if (skillLevel === 'Expert') {
                        levelLabel = 'Expert 🏆';
                        levelColor = 'bg-brandOrange/10 text-brandOrange border-brandOrange/20';
                      }

                      return (
                        <div
                          key={inv.id}
                          className={`border-4 rounded-3xl transition-all duration-300 overflow-hidden cursor-pointer ${
                            isOpen 
                              ? 'bg-brandCream/40 border-brandBlue/30 shadow-md' 
                              : 'bg-white border-brandBlue/10 hover:border-brandBlue/20 hover:bg-brandCream/10'
                          }`}
                          onClick={() => setActiveTab(idx)}
                        >
                          {/* Header Kartu (Selalu Terlihat) */}
                          <div className="p-4 flex items-center justify-between gap-3 select-none">
                            <div className="flex items-center gap-3">
                              {/* Ikon Lucu */}
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-brandBlue/10 ${
                                isOpen ? 'bg-white animate-bounce-slow' : 'bg-brandCream/30'
                              }`}>
                                {renderInnovationIcon(inv.icon_name, 24)}
                              </div>
                              
                              {/* Judul & Level */}
                              <div className="flex flex-col">
                                <span className="font-fredoka text-xs text-brandBlue font-bold uppercase tracking-wider">
                                  {language === 'id' ? `Penemuan ${idx + 1}` : `Discovery ${idx + 1}`}
                                </span>
                                <h3 className="text-base text-brandNavy font-fredoka leading-snug line-clamp-1">
                                  {language === 'id' ? inv.title_id : inv.title_en}
                                </h3>
                              </div>
                            </div>

                            {/* Level Badge & Panah */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-fredoka font-bold border ${levelColor}`}>
                                {levelLabel}
                              </span>
                              <span className={`text-brandNavy/30 transition-transform duration-300 font-bold ${
                                isOpen ? 'rotate-180 text-brandBlue' : ''
                              }`}>
                                ▼
                              </span>
                            </div>
                          </div>

                          {/* Konten yang Diperluas (Hanya Muncul jika Aktif) */}
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? 'max-h-[800px] border-t-2 border-brandBlue/10 p-5 bg-brandCream/20' : 'max-h-0'
                          }`}>
                            {/* Deskripsi Inovasi */}
                            <p className="text-brandNavy/80 font-quicksand font-medium text-sm sm:text-base leading-relaxed mb-4">
                              {language === 'id' ? inv.description_id : inv.description_en}
                            </p>

                            {/* Tombol Mulai Kuis untuk Inovasi Ini */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Mencegah memicu toggle accordion kembali
                                navigate('/quiz', {
                                  state: {
                                    innovationId: inv.id,
                                    innovationTitle: language === 'id' ? inv.title_id : inv.title_en
                                  }
                                });
                              }}
                              className="flex items-center justify-center gap-2 w-full py-3 bg-brandTeal hover:bg-brandTeal/90 text-white rounded-2xl font-fredoka text-sm transition-playful shadow-md border-b-4 border-brandTeal/70 hover:scale-[1.01] active:scale-95 cursor-pointer"
                            >
                              <BookOpen size={16} />
                              <span>{language === 'id' ? 'Mulai Kuis Adaptif AI' : 'Start AI Adaptive Quiz'}</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 font-medium text-sm">Tidak ada inovasi terdaftar.</p>
                  )}
                </div>

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
