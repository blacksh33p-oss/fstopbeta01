import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Camera, Aperture, Settings, Save, Clock, MapPin, 
  Trash2, Copy, History, Download, ChevronRight, Search, 
  X, Check, Coffee, Heart, Monitor, Zap, Image, Video 
} from 'lucide-react';
import html2canvas from 'html2canvas';

import { 
  basePresets, lensesByGenre, cameras, apertures, shutters, isos, 
  lightings, films, wbs, grains, lensChars, compositions, 
  productSubgenres, lightingSetupLibrary 
} from './data';

import { FormState, Preset, OutputState, ModelType, AspectRatio } from './types';

// --- Ambiance Manager (Custom Hook) ---
const useAmbiance = (lighting: string, film: string, iso: string, grain: string) => {
  useEffect(() => {
    const root = document.documentElement;
    let color = "#4f46e5"; // Default Indigo
    let accent = "#4f46e5";
    let textCol = "#ffffff";
    let isAnimated = false;
    let animationName = "";

    // 1. Color Logic
    if(film.includes("B&W") || film.includes("Tri-X") || film.includes("HP5")) {
      color = "#e5e5e5"; accent = "#a1a1aa"; textCol = "#000000";
    } else {
        switch(lighting) {
            case "Golden Hour": color = "#f59e0b"; accent = "#f59e0b"; textCol = "#000000"; break;
            case "Neon Practical": color = "linear-gradient(to right, #d946ef, #3b82f6)"; accent = "#d946ef"; break;
            case "Underwater Ambient": color = "#0ea5e9"; accent = "#06b6d4"; textCol = "#000000"; break;
            case "Candlelight": color = "#ea580c"; accent = "#f97316"; isAnimated = true; animationName = "flicker"; break;
            case "Soft Overcast": color = "#64748b"; accent = "#94a3b8"; break;
            case "High Key White Cyc": color = "#ffffff"; accent = "#cbd5e1"; textCol = "#000000"; break;
            case "Cinestill 800T": case "Tungsten": color = "#ef4444"; accent = "#ef4444"; break;
            default:
                if(film.includes("Portra")) { color = "#fbbf24"; accent = "#fbbf24"; textCol = "#000000"; } 
                else if(film.includes("Cinestill")) { color = "#ef4444"; accent = "#ef4444"; }
                else if(film.includes("Ektachrome")) { color = "#3b82f6"; accent = "#3b82f6"; }
        }
    }
    
    // Apply variables
    root.style.setProperty('--glow-color', color.includes('gradient') ? '#d946ef' : color);
    root.style.setProperty('--accent-color', accent);
    root.style.setProperty('--accent-text', textCol);

    // Apply Background Glow
    const glowEl = document.getElementById("ambientGlow");
    const outputGlow = document.getElementById("outputGlow");
    
    if (glowEl) {
        if(color.includes('gradient')) {
             glowEl.style.background = `radial-gradient(circle at 50% -20%, transparent 20%, transparent 100%), ${color}`;
             glowEl.style.opacity = "0.15";
        } else {
             glowEl.style.background = `radial-gradient(circle at 50% -20%, ${color}, transparent 70%)`;
             glowEl.style.opacity = (lighting === "High Key White Cyc") ? "0.1" : "0.25";
        }
        if(isAnimated) glowEl.style.animation = "flicker 3s infinite";
        else glowEl.style.animation = "none";
    }

    if(outputGlow) {
        outputGlow.style.background = color.includes('gradient') ? color : `linear-gradient(to right, ${accent}, transparent)`;
    }

    // Grain Logic
    const grainEl = document.getElementById("grain-overlay");
    if(grainEl) {
        let grainOpacity = 0;
        const isoNum = parseInt(iso) || 0;
        if (grain === "Heavy Grit") grainOpacity = 0.15;
        else if (grain === "Medium Texture") grainOpacity = 0.08;
        else if (grain === "Subtle Grain") grainOpacity = 0.04;
        
        if (isoNum >= 3200) grainOpacity = Math.max(grainOpacity, 0.12);
        else if (isoNum >= 800) grainOpacity = Math.max(grainOpacity, 0.07);
        if (film.includes("Tri-X")) grainOpacity = Math.max(grainOpacity, 0.1);
        
        grainEl.style.opacity = grainOpacity.toString();
    }

  }, [lighting, film, iso, grain]);
};

// --- Main App Component ---

const App = () => {
  // --- State ---
  const [form, setForm] = useState<FormState>({
    scene: "",
    location: "",
    datetime: "",
    genre: "portrait",
    composition: "None",
    productSubgenre: "None",
    camera: "None",
    lens: "50mm prime",
    lockCamera: false,
    lockLens: false,
    lockLighting: false,
    focal: 50,
    aperture: "None",
    shutter: "None",
    iso: "None",
    film: "None",
    wb: "None",
    grain: "None",
    lensChar: "None",
    lighting: "None",
    activeLightingSetups: new Set(),
    activeAR: "16:9",
    photographerStyle: "None",
    vibe: ""
  });

  const [activeModel, setActiveModel] = useState<ModelType>("midjourney");
  const [output, setOutput] = useState<OutputState>({ main: "", cine: "", grit: "", prod: "" });
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [presetSearch, setPresetSearch] = useState("");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [customPresetName, setCustomPresetName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const presetContainerRef = useRef<HTMLDivElement>(null);
  const recipeCardRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  
  // Load LocalStorage
  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem("customPresets");
      if (savedPresets) setCustomPresets(JSON.parse(savedPresets));
      
      const savedHistory = localStorage.getItem("promptHistory");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.warn("Storage unavailable");
    }
  }, []);

  // Ambiance Effect
  useAmbiance(form.lighting, form.film, form.iso, form.grain);

  // --- Helpers ---

  const getAllPresets = useMemo(() => [...basePresets, ...customPresets], [customPresets]);

  const filteredPresets = useMemo(() => {
    const term = presetSearch.toLowerCase();
    return getAllPresets.filter(p => 
      p.id !== "none" && (p.title.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
    );
  }, [getAllPresets, presetSearch]);

  const updateForm = (key: keyof FormState, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleLightingSetup = (phrase: string) => {
    const newSet = new Set(form.activeLightingSetups);
    if (newSet.has(phrase)) newSet.delete(phrase);
    else newSet.add(phrase);
    updateForm("activeLightingSetups", newSet);
  };

  const applyPreset = (preset: Preset) => {
    const d = preset.data;
    const newState = { ...form };
    
    // Always update these
    newState.photographerStyle = preset.title;
    newState.vibe = d.vibe || "";
    setPresetSearch(preset.title);

    if (d.genre) newState.genre = d.genre;
    if (!form.lockCamera && d.camera) newState.camera = d.camera;
    if (!form.lockLens && d.lens) newState.lens = d.lens;
    if (d.focal) newState.focal = d.focal;
    if (d.aperture) newState.aperture = d.aperture!;
    if (d.shutter) newState.shutter = d.shutter!;
    if (d.iso) newState.iso = d.iso!;
    if (!form.lockLighting && d.lighting) newState.lighting = d.lighting;
    if (d.composition) newState.composition = d.composition;
    if (d.lensChar) newState.lensChar = d.lensChar;
    if (d.film) newState.film = d.film!;
    if (d.wb) newState.wb = d.wb!;
    if (d.grain) newState.grain = d.grain!;
    if (d.productSubgenre) newState.productSubgenre = d.productSubgenre;
    
    if (d.lightingSetups) {
      newState.activeLightingSetups = new Set(d.lightingSetups);
    } else {
      newState.activeLightingSetups = new Set();
    }

    setForm(newState);
    setShowPresetDropdown(false);
  };

  const saveCustomPreset = () => {
    if(!customPresetName) return;
    const newPreset: Preset = {
      id: "custom-" + Date.now(),
      title: customPresetName,
      desc: "User custom preset",
      category: "Custom",
      data: {
        genre: form.genre,
        camera: form.camera,
        lens: form.lens,
        focal: form.focal,
        aperture: form.aperture,
        shutter: form.shutter,
        iso: form.iso,
        lighting: form.lighting,
        composition: form.composition,
        film: form.film,
        wb: form.wb,
        grain: form.grain,
        lensChar: form.lensChar,
        productSubgenre: form.productSubgenre,
        lightingSetups: Array.from(form.activeLightingSetups),
        vibe: form.vibe
      }
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try { localStorage.setItem("customPresets", JSON.stringify(updated)); } catch(e) {}
    setSaveStatus("Saved!");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const generatePrompt = () => {
    setIsGenerating(true);
    
    // Formatting
    const locationPart = form.location ? ` at ${form.location}` : "";
    let datetimePart = "";
    if (form.datetime) {
      const dateObj = new Date(form.datetime);
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      datetimePart = ` on ${date} at ${time}`;
    }

    const cam = form.camera === "None" ? "professional camera" : form.camera;
    const lens = form.lens === "None" ? "suitable lens" : form.lens;
    const focalStr = form.focal ? `${form.focal}mm` : "";
    
    let techParts = [];
    if(form.aperture !== "None") techParts.push(form.aperture);
    if(form.shutter !== "None") techParts.push(form.shutter);
    if(form.iso !== "None") techParts.push("ISO " + form.iso);
    const techString = techParts.join(", ");

    let moodParts = [];
    if(form.film !== "None") moodParts.push(form.film);
    if(form.wb !== "None") moodParts.push(form.wb);
    if(form.grain !== "None") moodParts.push(form.grain);
    if(form.lensChar !== "None") moodParts.push(form.lensChar);
    const moodString = moodParts.join(", ");
    
    const lightingNotes = Array.from(form.activeLightingSetups).join(", ");
    
    // Ar String
    const getARText = (ar: AspectRatio) => {
       if(ar === "16:9") return "wide cinematic landscape (16:9)";
       if(ar === "9:16") return "tall vertical portrait (9:16)";
       if(ar === "1:1") return "square (1:1)";
       if(ar === "4:3") return "standard photographic aspect ratio (4:3)";
       if(ar === "21:9") return "ultra-wide anamorphic aspect ratio (21:9)";
       return "standard aspect ratio";
    };

    let pMain = "", pCine = "", pGrit = "", pProd = "";
    const sceneText = form.scene.trim() || "a compelling photography scene";

    if (activeModel === "midjourney") {
        let blocks = [];
        blocks.push(`${sceneText}${locationPart}${datetimePart}, ${form.genre} photography`);
        blocks.push(`Shot on ${cam}, ${lens} ${focalStr}${techString ? `, ${techString}` : ""}`);
        
        let styleBlock = [];
        if(form.lighting !== "None") styleBlock.push(form.lighting);
        if(lightingNotes) styleBlock.push(lightingNotes);
        if(form.composition !== "None") styleBlock.push(form.composition);
        if(moodString) styleBlock.push(moodString);
        if(form.vibe) styleBlock.push(form.vibe);
        if(form.genre === "product" && form.productSubgenre !== "None") styleBlock.push(form.productSubgenre);
        if(styleBlock.length > 0) blocks.push(styleBlock.join(", "));

        let coreText = blocks.join(".\n\n");
        const arSuffix = " --ar " + form.activeAR;
        
        pMain = coreText + "\n\n--style raw --s 250" + arSuffix;
        pCine = coreText + "\n\n--style raw --s 250" + arSuffix;
        pGrit = coreText + ", high contrast, gritty texture\n\n--style raw" + arSuffix; 
        pProd = coreText + ", commercial lighting, hyper-detailed, 8k\n\n" + arSuffix;

    } else if (activeModel === "flux") {
        let p1 = `${sceneText}${locationPart}${datetimePart}.`;
        let p2 = `This is a ${form.genre} photograph shot on a ${cam} with a ${lens} lens ${focalStr ? `at ${focalStr}` : ""}.`;
        if(techString) p2 += ` Camera settings: ${techString}.`;
        
        let p3 = [];
        if(form.lighting !== "None") p3.push(`The lighting is ${form.lighting}${lightingNotes ? ` featuring ${lightingNotes}` : ""}.`);
        if(form.composition !== "None") p3.push(`Composition utilizes ${form.composition}.`);
        if(moodString) p3.push(`The image has the look of ${moodString}.`);
        if(form.vibe) p3.push(`Overall vibe: ${form.vibe}.`);
        if(form.genre === "product" && form.productSubgenre !== "None") p3.push(`Style: ${form.productSubgenre}.`);
        let p3Text = p3.join(" ");
        let p4 = `Aspect ratio is ${getARText(form.activeAR)}.`;
        
        let core = [p1, p2, p3Text, p4].filter(x => x.trim().length > 0).join("\n\n");
        pMain = core;
        pCine = core + "\n\nThe style is cinematic and realistic.";
        pGrit = core + "\n\nThe image has high contrast and gritty texture.";
        pProd = core + "\n\nThe lighting is clean and commercial with hyper-detail.";

    } else {
        // DALL-E
        let p1 = `Please generate a photorealistic image of: ${sceneText}${locationPart}${datetimePart}.`;
        let p2 = `Simulate the physics of a ${form.genre} photo taken with ${cam} using a ${lens} lens ${focalStr ? `at ${focalStr}` : ""}.`;
        if(techString) p2 += ` Configure camera settings to: ${techString}.`;
        let p3 = [];
        if(form.lighting !== "None") p3.push(`Set lighting to ${form.lighting}${lightingNotes ? ` combined with ${lightingNotes}` : ""}.`);
        if(form.composition !== "None") p3.push(`Frame the shot using ${form.composition}.`);
        if(moodString) p3.push(`Grade the colors and texture to mimic ${moodString}.`);
        if(form.vibe) p3.push(`Capture this specific mood: ${form.vibe}.`);
        let p3Text = p3.join(" ");
        let p4 = `Ensure the image is strictly photorealistic with no text overlays or graphics. The final output should be a ${getARText(form.activeAR)}.`;
        
        let core = [p1, p2, p3Text, p4].filter(x => x.trim().length > 0).join("\n\n");
        pMain = core;
        pCine = core + "\n\nPrioritize a dramatic, cinematic look.";
        pGrit = core + "\n\nEmphasize raw textures and high contrast.";
        pProd = core + "\n\nEnsure perfect, clean commercial lighting.";
    }

    setOutput({ main: pMain, cine: pCine, grit: pGrit, prod: pProd });
    
    // Save to History
    const newHistory = [pMain, ...history].slice(0, 20);
    setHistory(newHistory);
    try { localStorage.setItem("promptHistory", JSON.stringify(newHistory)); } catch(e) {}

    // Simulate Processing Time
    setTimeout(() => {
        setIsGenerating(false);
    }, 400);
  };

  const exportRecipe = () => {
    if (recipeCardRef.current) {
        html2canvas(recipeCardRef.current, { backgroundColor: "#000000", scale: 2 })
        .then(canvas => {
            const link = document.createElement('a');
            link.download = `f-stop-recipe-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // --- Render Sub-Components (Inline for simplicity given scope) ---
  
  const Select = ({ value, onChange, options, className = "" }: any) => (
    <div className="relative w-full">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full hardware-screen rounded-sm text-xs text-white p-2.5 focus:border-indigo-500 outline-none placeholder-studio-700 bg-studio-950 border border-studio-700 ${className}`}
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* Background FX */}
      <div id="grain-overlay" className="fixed inset-0 pointer-events-none z-[9998] opacity-0 transition-opacity duration-500 mix-blend-overlay bg-repeat" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div id="ambientGlow" className="fixed inset-0 z-[-1] pointer-events-none opacity-20 transition-all duration-1000"></div>
      <div id="topBar" className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 sticky top-0 z-50 opacity-50"></div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 md:p-8 flex-grow">
        
        {/* Header */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-studio-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-tally shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
               <span className="text-[10px] font-mono text-studio-500 uppercase tracking-widest">System Online</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-white flex items-center gap-3">
              <Aperture className="w-8 h-8 text-[var(--accent-color)] transition-colors duration-500" />
              <span className="font-mono">f-stop<span style={{ color: 'var(--accent-color)' }} className="transition-colors duration-500">.ai</span></span>
            </h1>
          </div>

          <div className="flex bg-[#9ea792] text-[#18181b] border-2 border-studio-600 rounded-sm p-2 px-3 gap-4 md:gap-6 items-center font-lcd select-none shadow-lg transform opacity-90 w-full lg:w-auto justify-between lg:justify-start overflow-x-auto relative overflow-hidden">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/30 to-transparent pointer-events-none"></div>
              {[
                { l: "SHUTTER", v: form.shutter },
                { l: "APERTURE", v: form.aperture },
                { l: "ISO", v: form.iso },
                { l: "FOCAL", v: form.focal ? form.focal : "--" }
              ].map((item, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center min-w-[40px] z-10">
                      <span className="text-[8px] font-bold tracking-widest opacity-60">{item.l}</span>
                      <span className="text-lg font-bold leading-none">{item.v === "None" ? "--" : item.v}</span>
                  </div>
                  {i < 3 && <div className="w-px h-6 bg-black/20 z-10"></div>}
                </React.Fragment>
              ))}
              <div className="ml-2 flex flex-col gap-0.5 z-10">
                  <div className="text-[8px] font-bold bg-black/80 text-[#9ea792] px-1 rounded-[1px]">RAW</div>
                  <div className="text-[8px] font-bold text-black/60">[999]</div>
              </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowHistory(true)} className="flex items-center gap-2 px-4 py-2 rounded-sm bg-studio-900 border border-studio-700 hover:border-studio-500 text-[10px] uppercase tracking-wider font-bold text-studio-400 hover:text-white transition">
              <History size={12} /> History
            </button>
            <div className="text-[10px] font-mono text-studio-500 border border-studio-800 rounded-sm px-2 py-1 bg-studio-950">v9.0</div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <div className="space-y-4">
              <div className="relative group">
                <textarea 
                  value={form.scene}
                  onChange={(e) => updateForm('scene', e.target.value)}
                  rows={3} 
                  className="w-full bg-[#050505] border border-studio-700 rounded-sm text-white placeholder-studio-600 p-4 focus:border-indigo-500 outline-none text-sm font-mono resize-none shadow-inner" 
                  placeholder="INPUT SCENE DATA..." 
                />
                <button 
                  onClick={() => updateForm('scene', '')}
                  className="absolute top-2 right-2 text-[9px] uppercase font-bold text-studio-500 hover:text-white bg-studio-900/90 border border-studio-700 rounded-sm px-2 py-1 transition-all opacity-0 group-hover:opacity-100"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Location</label>
                  <input type="text" value={form.location} onChange={(e) => updateForm('location', e.target.value)} className="w-full hardware-screen bg-[#050505] border border-studio-700 rounded-sm text-xs text-white p-2.5 focus:border-indigo-500 outline-none placeholder-studio-700" placeholder="e.g., Cairo, Egypt" />
                </div>
                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Date & Time</label>
                  <input type="datetime-local" value={form.datetime} onChange={(e) => updateForm('datetime', e.target.value)} className="w-full hardware-screen bg-[#050505] border border-studio-700 rounded-sm text-xs text-white p-2.5 focus:border-indigo-500 outline-none placeholder-studio-700" />
                </div>
              </div>
            </div>

            {/* Presets Panel */}
            <div className="hardware-panel rounded-md p-5 relative z-30 border border-studio-700 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500">Style Engine</label>
                <button 
                  onClick={() => {
                    const valid = getAllPresets.filter(p => p.id !== "none");
                    applyPreset(valid[Math.floor(Math.random() * valid.length)]);
                  }}
                  className="text-[10px] uppercase tracking-wider hover:text-white transition flex items-center gap-1 font-bold" style={{ color: 'var(--accent-color)' }}
                >
                  Randomize
                </button>
              </div>
              
              <div ref={presetContainerRef} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1 group min-w-0">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-studio-500" />
                    <input 
                      type="text" 
                      value={presetSearch}
                      onChange={(e) => { setPresetSearch(e.target.value); setShowPresetDropdown(true); }}
                      onFocus={() => setShowPresetDropdown(true)}
                      className="w-full bg-[#050505] border border-studio-700 rounded-sm pl-9 pr-4 py-2.5 text-xs text-white transition truncate placeholder-studio-700 focus:border-indigo-500 outline-none" 
                      placeholder="SEARCH PRESETS..." 
                      autoComplete="off" 
                    />
                  </div>
                  <button onClick={() => setShowPresetDropdown(!showPresetDropdown)} className="shrink-0 px-4 rounded-sm bg-studio-800 hover:bg-studio-700 text-[10px] uppercase font-bold text-studio-400 border border-studio-700 transition">Browse</button>
                  <button 
                    onClick={() => { setPresetSearch(""); applyPreset(basePresets[0]); }}
                    className="shrink-0 px-4 rounded-sm bg-studio-800 hover:bg-studio-700 text-[10px] uppercase font-bold text-studio-400 border border-studio-700 transition"
                  >
                    Clear
                  </button>
                </div>
                
                {showPresetDropdown && (
                  <div className="absolute z-[60] mt-2 w-full max-h-80 overflow-auto rounded-sm border border-studio-700 bg-studio-900 shadow-2xl custom-scrollbar">
                    {filteredPresets.length === 0 ? (
                      <div className="p-3 text-xs text-studio-500">No matches found.</div>
                    ) : (
                      // Group by Category Logic would go here, simplified for list
                      filteredPresets.map(p => (
                        <button 
                          key={p.id}
                          onClick={() => applyPreset(p)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-studio-800 transition border-b border-studio-800 last:border-0 group"
                        >
                          <div className="font-bold text-xs uppercase text-studio-200 group-hover:text-white tracking-wide">{p.title}</div>
                          <div className="text-[11px] text-studio-400 group-hover:text-studio-300 truncate font-mono">{p.desc}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {form.photographerStyle !== "None" && (
                <div className="mt-3 p-3 rounded-sm bg-black/20 border border-white/5 text-xs font-mono text-studio-300 leading-relaxed">
                   <strong className="text-white uppercase tracking-wider">{form.photographerStyle}</strong> <span className="text-studio-500">//</span> {form.vibe}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-studio-800">
                <details className="group">
                  <summary className="cursor-pointer text-[9px] uppercase tracking-widest font-bold text-studio-500 hover:text-studio-300 list-none flex items-center gap-2 select-none">
                    SAVE CONFIG <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-3 pl-2 space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={customPresetName}
                        onChange={(e) => setCustomPresetName(e.target.value)}
                        className="flex-1 bg-[#050505] border border-studio-700 rounded-sm p-2 text-[10px] text-white outline-none focus:border-indigo-500" 
                        placeholder="PRESET NAME" 
                      />
                      <button onClick={saveCustomPreset} className="rounded-sm text-white px-4 py-2 text-[10px] uppercase font-bold opacity-90 hover:opacity-100" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--accent-text)' }}>Save</button>
                    </div>
                    {saveStatus && <div className="text-[10px] text-green-500 h-4 font-mono">{saveStatus}</div>}
                  </div>
                </details>
              </div>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Composition</label>
                  <div className="space-y-2">
                    <Select value={form.genre} onChange={(v:string) => { updateForm('genre', v); updateForm('lens', lensesByGenre[v]?.[0] || "None"); }} options={["portrait","street","landscape","product","cinematic","night","sports","wildlife","architecture","experimental"]} />
                    <Select value={form.composition} onChange={(v:string) => updateForm('composition', v)} options={compositions} />
                    {form.genre === 'product' && (
                        <Select value={form.productSubgenre} onChange={(v:string) => updateForm('productSubgenre', v)} options={productSubgenres} />
                    )}
                  </div>
                </div>
                
                <div className="hardware-panel rounded-md p-4 border border-studio-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-studio-500">Camera & Lens</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1 min-w-0">
                         <Select value={form.camera} onChange={(v:string) => updateForm('camera', v)} options={cameras} />
                      </div>
                      <button onClick={() => updateForm('lockCamera', !form.lockCamera)} className={`w-8 h-8 rounded-sm border ${form.lockCamera ? 'bg-green-600 border-green-500 text-black' : 'border-studio-700 bg-studio-800 text-studio-500'} flex items-center justify-center transition`}>
                          {form.lockCamera ? <Check size={12} /> : <div className="w-2 h-2 rounded-full border border-current"></div>}
                      </button>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1 min-w-0">
                         <Select value={form.lens} onChange={(v:string) => updateForm('lens', v)} options={["None", ...(lensesByGenre[form.genre] || [])]} />
                      </div>
                      <button onClick={() => updateForm('lockLens', !form.lockLens)} className={`w-8 h-8 rounded-sm border ${form.lockLens ? 'bg-green-600 border-green-500 text-black' : 'border-studio-700 bg-studio-800 text-studio-500'} flex items-center justify-center transition`}>
                          {form.lockLens ? <Check size={12} /> : <div className="w-2 h-2 rounded-full border border-current"></div>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Exposure Triangle</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                        <span className="text-[9px] text-studio-600 font-bold uppercase block mb-1 pl-1">Focal</span>
                        <input type="number" value={form.focal} onChange={(e) => updateForm('focal', parseInt(e.target.value))} className="w-full bg-studio-950 border border-studio-700 rounded-sm text-xs text-white p-2 text-center focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                        <span className="text-[9px] text-studio-600 font-bold uppercase block mb-1 pl-1">Aperture</span>
                        <Select value={form.aperture} onChange={(v:string) => updateForm('aperture', v)} options={apertures} className="p-2" />
                    </div>
                    <div>
                        <span className="text-[9px] text-studio-600 font-bold uppercase block mb-1 pl-1">Shutter</span>
                        <Select value={form.shutter} onChange={(v:string) => updateForm('shutter', v)} options={shutters} className="p-2" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] text-studio-600 font-bold uppercase block mb-1 pl-1">ISO</span>
                    <Select value={form.iso} onChange={(v:string) => updateForm('iso', v)} options={isos} className="p-2" />
                  </div>
                </div>

                <div>
                   <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Film & Atmosphere</label>
                   <div className="space-y-2">
                     <Select value={form.film} onChange={(v:string) => updateForm('film', v)} options={films} />
                     <div className="grid grid-cols-2 gap-2">
                        <Select value={form.wb} onChange={(v:string) => updateForm('wb', v)} options={wbs} />
                        <Select value={form.grain} onChange={(v:string) => updateForm('grain', v)} options={grains} />
                     </div>
                     <Select value={form.lensChar} onChange={(v:string) => updateForm('lensChar', v)} options={lensChars} />
                   </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-bold text-studio-500 block mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                        { val: "1:1", icon: "w-3 h-3" },
                        { val: "16:9", icon: "w-5 h-3" },
                        { val: "9:16", icon: "w-3 h-5" },
                        { val: "4:3", icon: "w-4 h-3" },
                        { val: "21:9", icon: "w-6 h-2" }
                    ].map((ar) => (
                        <button 
                          key={ar.val}
                          onClick={() => updateForm('activeAR', ar.val)}
                          className={`px-1 py-2 rounded-sm border transition flex flex-col items-center justify-center gap-1 ${form.activeAR === ar.val 
                             ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--accent-text)] shadow-[0_0_10px_-2px_var(--accent-color)]' 
                             : 'border-studio-700 bg-studio-900 hover:border-studio-500'}`}
                        >
                            <div className={`${ar.icon} border border-current`}></div>
                            <span className="text-[9px] font-bold">{ar.val}</span>
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lighting */}
            <div className="hardware-panel rounded-md p-4 border border-studio-700">
               <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-studio-500">Lighting</span>
                  <button onClick={() => updateForm('lockLighting', !form.lockLighting)} className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-studio-500 select-none">
                     Lock 
                     <div className={`w-6 h-3 rounded-full border flex items-center px-0.5 transition-colors ${form.lockLighting ? 'border-green-500' : 'border-studio-600'}`}>
                        <div className={`w-2 h-2 rounded-full transition-transform ${form.lockLighting ? 'translate-x-3 bg-green-500' : 'bg-studio-600'}`}></div>
                     </div>
                  </button>
               </div>
               <Select value={form.lighting} onChange={(v:string) => updateForm('lighting', v)} options={lightings} className="mb-3 text-sm" />
               <div className="flex flex-wrap gap-1.5">
                  {lightingSetupLibrary.map(ls => (
                      <button
                        key={ls.phrase}
                        onClick={() => toggleLightingSetup(ls.phrase)}
                        className={`px-3 py-1.5 rounded-sm border text-[9px] font-bold uppercase transition ${
                            form.activeLightingSetups.has(ls.phrase)
                            ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-[var(--accent-text)]'
                            : 'border-studio-700 bg-studio-900 text-studio-500 hover:text-white'
                        }`}
                      >
                          {ls.label}
                      </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={generatePrompt}
              disabled={isGenerating}
              className="w-full rounded-sm bg-white text-black py-4 text-xs font-black hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.1)] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-black/30 border-t-black rounded-full"></div> : <Zap size={16} fill="black" />}
              {isGenerating ? "PROCESSING..." : "GENERATE & SAVE TO HISTORY"}
            </button>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <a href="#" className="rounded-sm border border-studio-700 bg-studio-900 hover:border-yellow-500/50 hover:text-yellow-500 text-studio-400 text-[10px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition group">
                <Coffee size={14} className="opacity-70 group-hover:opacity-100" /> Buy Coffee
              </a>
              <a href="#" className="rounded-sm border border-studio-700 bg-studio-900 hover:border-[var(--accent-color)] hover:text-white text-studio-400 text-[10px] font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition group">
                <Heart size={14} className="opacity-70 group-hover:opacity-100 group-hover:fill-current" /> Become Member
              </a>
            </div>
          </section>

          {/* Right Column: Output */}
          <section className="lg:col-span-5 space-y-6">
            <div className="sticky top-6 space-y-4">
              <div className="flex justify-center mb-2">
                 <div className="flex bg-studio-900 border border-studio-700 rounded-sm p-1 gap-1">
                    {['midjourney', 'flux', 'dalle'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setActiveModel(m as ModelType)}
                          className={`px-3 py-1 text-[9px] font-bold uppercase rounded-sm transition ${activeModel === m ? 'bg-[var(--accent-color)] text-[var(--accent-text)]' : 'text-studio-400 hover:text-white'}`}
                        >
                            {m === 'dalle' ? 'DALL-E 3' : m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                 </div>
              </div>

              <div className="flex items-center gap-2 text-studio-500 mb-2">
                  <div className="h-px flex-1 bg-studio-800"></div>
                  <span className="text-[9px] uppercase tracking-widest font-bold">Outputs</span>
                  <div className="h-px flex-1 bg-studio-800"></div>
              </div>
              
              <div className="relative backdrop-blur-xl bg-black/40 border border-studio-800 rounded-md overflow-hidden shadow-2xl">
                <div id="outputGlow" className="absolute -inset-0.5 opacity-0 transition duration-500 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                
                <div className="relative border-b border-studio-800 p-1 bg-black/20">
                  <div className="flex items-center justify-between px-3 py-2">
                     <h2 className="text-[9px] uppercase tracking-widest font-bold text-studio-300">Master</h2>
                     <div className="flex gap-2">
                        <button onClick={exportRecipe} className="text-[9px] font-bold bg-studio-900 hover:bg-studio-700 text-studio-400 px-2 py-1 rounded-sm border border-studio-800 transition flex items-center gap-1">
                            <Image size={10} /> RECIPE
                        </button>
                        <button onClick={() => copyToClipboard(output.main)} className="text-[9px] font-bold bg-studio-900 hover:bg-studio-700 text-studio-400 px-2 py-1 rounded-sm border border-studio-800 transition">COPY</button>
                     </div>
                  </div>
                  <textarea value={output.main} readOnly rows={5} className="w-full bg-transparent border-0 text-studio-100 p-3 text-xs font-mono focus:ring-0 resize-none leading-relaxed outline-none" />
                </div>

                <div className="grid grid-rows-3 divide-y divide-studio-800/50">
                    {[
                        { label: "Cinematic", val: output.cine },
                        { label: "Grit / Doc", val: output.grit },
                        { label: "Commercial", val: output.prod }
                    ].map(item => (
                        <div key={item.label} className="relative bg-black/10">
                           <div className="flex items-center justify-between px-3 py-2">
                               <h3 className="text-[9px] uppercase tracking-widest font-bold text-studio-500">{item.label}</h3>
                               <button onClick={() => copyToClipboard(item.val)} className="text-[9px] font-bold text-studio-500 hover:text-white transition">COPY</button>
                            </div>
                           <textarea value={item.val} readOnly rows={3} className="w-full bg-transparent border-0 text-studio-400 p-3 text-[10px] font-mono focus:ring-0 resize-none outline-none" />
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#09090b] border border-studio-700 w-full max-w-lg rounded-md p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b border-studio-800 pb-2">
                   <h3 className="text-[9px] uppercase tracking-widest font-bold text-white">Prompt History</h3>
                   <button onClick={() => setShowHistory(false)} className="text-studio-500 hover:text-white transition"><X size={16} /></button>
                </div>
                <div className="space-y-2 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                    {history.length === 0 && <div className="text-center text-studio-500 text-xs py-4">No history yet.</div>}
                    {history.map((h, i) => (
                        <div key={i} onClick={() => copyToClipboard(h)} className="p-3 bg-black/30 border border-studio-700 rounded-lg text-xs text-studio-300 cursor-pointer hover:border-indigo-500 hover:text-white transition">
                            {h}
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-studio-800 text-[10px] text-studio-500 flex justify-between">
                    <span>Local storage (20 max).</span>
                    <button onClick={() => { setHistory([]); localStorage.setItem("promptHistory", "[]"); }} className="text-red-900 hover:text-red-500 transition">Clear</button>
                </div>
            </div>
        </div>
      )}

      {/* Hidden Recipe Card for Export */}
      <div className="fixed left-[-9999px] top-0">
          <div ref={recipeCardRef} className="w-[600px] bg-black border border-studio-700 p-8 font-sans text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent-color)] rounded-full opacity-20 blur-[80px]"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white rounded-full opacity-5 blur-[80px]"></div>
              <div className="flex justify-between items-end mb-6 border-b border-studio-800 pb-4 relative z-10">
                  <div>
                      <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-2">
                          <span className="font-mono">f-stop<span style={{ color: 'var(--accent-color)' }}>.ai</span></span>
                      </h1>
                      <p className="text-xs text-studio-500 mt-1 font-mono uppercase tracking-widest">Visual Recipe Card</p>
                  </div>
                  <div className="text-right">
                      <div className="text-[10px] text-studio-500">Date</div>
                      <div className="text-xs font-mono text-studio-300">{new Date().toLocaleDateString()}</div>
                  </div>
              </div>
              <div className="mb-8 relative z-10">
                  <div className="text-[10px] font-bold text-studio-500 uppercase mb-2">Master Prompt</div>
                  <div className="text-sm font-mono text-studio-100 leading-relaxed p-4 bg-studio-900/50 border border-studio-800 rounded-lg">{output.main || "No prompt generated yet."}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  <div className="p-3 rounded-lg bg-studio-900 border border-studio-800">
                      <div className="text-[9px] font-bold text-studio-500 uppercase mb-1">Camera & Lens</div>
                      <div className="text-sm font-medium text-white">{form.camera}</div>
                      <div className="text-xs text-studio-400">{form.lens} {form.focal ? `(${form.focal}mm)` : ""}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-900 border border-studio-800">
                      <div className="text-[9px] font-bold text-studio-500 uppercase mb-1">Film Stock</div>
                      <div className="text-sm font-medium text-white">{form.film}</div>
                      <div className="text-xs text-studio-400">ISO {form.iso} • {form.aperture} • {form.shutter}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-900 border border-studio-800">
                      <div className="text-[9px] font-bold text-studio-500 uppercase mb-1">Lighting</div>
                      <div className="text-sm font-medium text-white">{form.lighting}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-900 border border-studio-800">
                      <div className="text-[9px] font-bold text-studio-500 uppercase mb-1">Style / Vibe</div>
                      <div className="text-xs text-studio-300 leading-tight">{form.photographerStyle !== "None" ? form.photographerStyle : `${form.genre} ${form.composition}`}</div>
                  </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-studio-800 text-[10px] text-studio-600 relative z-10">
                  <div className="font-mono">f-stop.ai // pro studio</div>
                  <div>Generated with AI</div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default App;
