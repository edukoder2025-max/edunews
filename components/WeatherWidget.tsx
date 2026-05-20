"use client";

import { useEffect, useState, useRef } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudDrizzle, CloudSun, Loader2, MapPin, Search, X } from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  code: number;
  lat: number;
  lon: number;
}

interface CitySuggestion {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar clima inicial (desde localStorage o IP)
  useEffect(() => {
    async function loadInitialWeather() {
      try {
        const savedCity = localStorage.getItem('weather_city');
        const savedLat = localStorage.getItem('weather_lat');
        const savedLon = localStorage.getItem('weather_lon');

        if (savedCity && savedLat && savedLon) {
          // Si el usuario ya guardó una ciudad, usar esa
          await fetchWeatherForCoords(savedCity, parseFloat(savedLat), parseFloat(savedLon));
        } else {
          // Si no, intentar geolocalizar por IP
          await fetchWeatherByIP();
        }
      } catch (e) {
        console.error("Error cargando clima inicial:", e);
        fallbackToDefault();
      } finally {
        setLoading(false);
      }
    }

    loadInitialWeather();
  }, []);

  // Cerrar el dropdown de búsqueda al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEditing(false);
        setSuggestions([]);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para obtener clima usando geolocalización por IP
  async function fetchWeatherByIP() {
    let city = "Buenos Aires";
    let lat = -34.6118;
    let lon = -58.4173;

    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        if (ipData.city && ipData.latitude && ipData.longitude) {
          city = ipData.city;
          lat = ipData.latitude;
          lon = ipData.longitude;
        }
      } else {
        const ipinfoResponse = await fetch('https://ipinfo.io/json');
        if (ipinfoResponse.ok) {
          const ipinfoData = await ipinfoResponse.json();
          if (ipinfoData.city && ipinfoData.loc) {
            city = ipinfoData.city;
            const [latStr, lonStr] = ipinfoData.loc.split(',');
            lat = parseFloat(latStr);
            lon = parseFloat(lonStr);
          }
        }
      }
    } catch (ipError) {
      console.warn("Error de geolocalización por IP, usando Buenos Aires por defecto:", ipError);
    }

    await fetchWeatherForCoords(city, lat, lon);
  }

  // Obtener clima de Open-Meteo para coordenadas específicas
  async function fetchWeatherForCoords(city: string, lat: number, lon: number) {
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    
    if (weatherResponse.ok) {
      const weatherData = await weatherResponse.json();
      if (weatherData.current_weather) {
        setWeather({
          city: city,
          temp: Math.round(weatherData.current_weather.temperature),
          code: weatherData.current_weather.weathercode,
          lat: lat,
          lon: lon
        });
      }
    } else {
      throw new Error("Error en la respuesta del clima");
    }
  }

  // Fallback seguro si todo falla
  function fallbackToDefault() {
    setWeather({
      city: "Buenos Aires",
      temp: 22,
      code: 0,
      lat: -34.6118,
      lon: -58.4173
    });
  }

  // Buscar ciudades dinámicamente usando el Geocoding API de Open-Meteo
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=es`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results) {
            setSuggestions(data.results);
          } else {
            setSuggestions([]);
          }
        }
      } catch (err) {
        console.error("Error buscando ciudades:", err);
      } finally {
        setSearching(false);
      }
    }, 400); // Debounce de 400ms para evitar saturar la API

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Manejar selección de nueva ciudad
  async function handleSelectCity(selected: CitySuggestion) {
    setLoading(true);
    setIsEditing(false);
    setSearchQuery("");
    setSuggestions([]);
    
    try {
      const displayName = selected.name;
      await fetchWeatherForCoords(displayName, selected.latitude, selected.longitude);
      
      // Guardar en localStorage para visitas futuras
      localStorage.setItem('weather_city', displayName);
      localStorage.setItem('weather_lat', selected.latitude.toString());
      localStorage.setItem('weather_lon', selected.longitude.toString());
    } catch (err) {
      console.error("Error al cambiar ciudad:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !weather) {
    return (
      <div className="flex items-center gap-2 text-slate-400 font-medium animate-pulse text-[11px] md:text-xs">
        <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
        <span>Sintonizando clima...</span>
      </div>
    );
  }

  if (!weather) return null;

  // Seleccionar ícono según código meteorológico
  const getWeatherIcon = (code: number) => {
    const iconClass = "h-4 w-4 text-primary animate-pulse-subtle";
    if (code === 0) return <Sun className="h-4 w-4 text-amber-400" />;
    if (code >= 1 && code <= 3) return <CloudSun className={iconClass} />;
    if (code === 45 || code === 48) return <CloudFog className="h-4 w-4 text-slate-400" />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className="h-4 w-4 text-blue-300" />;
    if (code >= 61 && code <= 65) return <CloudRain className="h-4 w-4 text-blue-400" />;
    if (code >= 71 && code <= 75) return <CloudSnow className="h-4 w-4 text-sky-200" />;
    if (code >= 80 && code <= 82) return <CloudRain className="h-4 w-4 text-blue-400" />;
    if (code >= 95) return <CloudLightning className="h-4 w-4 text-yellow-400" />;
    return <CloudSun className={iconClass} />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Principal del Widget */}
      <button 
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-300 group cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5 hover:border-white/10 text-xs font-semibold"
        title="Haz clic para cambiar de ciudad"
      >
        {getWeatherIcon(weather.code)}
        <span className="tracking-wide flex items-center gap-1">
          {weather.city} 
          <span className="text-primary font-black group-hover:scale-105 inline-block transition-transform">{weather.temp}°C</span>
        </span>
        <MapPin className="h-3 w-3 text-slate-500 group-hover:text-primary transition-colors ml-1" />
      </button>

      {/* Popover de Búsqueda de Ciudad */}
      {isEditing && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Cambiar de Ciudad
            </h4>
            <button 
              onClick={() => { setIsEditing(false); setSuggestions([]); setSearchQuery(""); }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar ciudad... (ej: Madrid)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
              autoFocus
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            {searching && (
              <Loader2 className="absolute right-2.5 top-2 h-3.5 w-3.5 animate-spin text-primary" />
            )}
          </div>

          {/* Sugerencias de ciudades */}
          {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
            <p className="text-[10px] text-slate-500 mt-2 text-center">Escribe al menos 3 caracteres...</p>
          )}

          {suggestions.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto divide-y divide-white/5 border border-white/5 rounded-xl bg-slate-900/50">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCity(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-primary/20 text-slate-200 hover:text-white transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-bold">{item.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchQuery.trim().length >= 3 && suggestions.length === 0 && !searching && (
            <p className="text-[10px] text-slate-500 mt-2 text-center">No se encontraron ciudades.</p>
          )}

          {/* Botón para geolocalizar de nuevo por IP */}
          <button
            onClick={() => {
              setLoading(true);
              setIsEditing(false);
              localStorage.removeItem('weather_city');
              localStorage.removeItem('weather_lat');
              localStorage.removeItem('weather_lon');
              fetchWeatherByIP().finally(() => setLoading(false));
            }}
            className="w-full mt-3 bg-white/5 hover:bg-primary hover:text-white border border-white/10 hover:border-primary text-[10px] font-bold uppercase tracking-wider py-2 rounded-xl text-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <MapPin className="h-3 w-3" /> Usar mi ubicación por IP
          </button>
        </div>
      )}
    </div>
  );
}
