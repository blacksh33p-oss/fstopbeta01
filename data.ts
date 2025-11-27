import { Preset } from './types';

export const compositions = ["None","Rule of Thirds","Centered","Leading Lines","Over-the-shoulder","Wide Establishing","Tight Close-up","Low Angle Hero","Top-down Flat Lay","Candid Snapshot","Asymmetric Framing","Peek-through","Symmetrical Arch","Layered Depth"];

export const cameras = [
  "None",
  "Sony Alpha 1","Canon EOS R3","Nikon Z9","Sony A7 IV","Sony A7R V","Canon EOS R5 II","Nikon Z5 II","Fujifilm X-T5","Fujifilm GFX 100S II","Hasselblad X2D 100C","Phase One XF IQ4","Leica SL3","iPhone 16 Pro","Hasselblad H6D","Nikon D850","Canon EOS 5D Mark IV","DJI Mavic 3",
  "Arri Alexa 35","Arri Alexa LF","Red V-Raptor","Arri Alexa 65",
  "Leica M3", "Leica M6", "Nikon F3", "Nikon F5", "Nikon F6", "Canon EOS 1v", "Contax T2", "Ricoh GR21", "Canon Rangefinder",
  "Rolleiflex 2.8F", "Hasselblad 500C/M", "Pentax 67", "Pentax 645", "Mamiya RZ67",
  "Speed Graphic 4x5", "Deardorff 8x10", "Large Format 4x5", "Large Format 8x10", "Voigtländer Bergheil", "Graflex Series D",
  "Arriflex 35 BL", "Arricam ST", "Panavision PSR", "Mitchell BNC", "Technicolor 3-Strip Camera", "IMAX 15/65",
  "Polaroid SX-70", "Sony VX1000", "Contact Print"
];

export const lensesByGenre: Record<string, string[]> = {
  portrait: ["35mm env", "50mm prime", "85mm prime", "105mm prime", "135mm prime", "70-200mm zoom", "35mm prime", "80mm prime", "116mm prime", "120mm macro", "150mm prime", "300mm prime", "360mm prime"],
  street: ["24mm prime", "28mm prime", "35mm prime", "50mm prime", "24-70mm zoom", "38mm prime", "45-85mm zoom", "80mm prime", "90mm tele", "105mm prime", "127mm Ektar"],
  landscape: ["14-24mm wide", "16-35mm wide", "24mm prime", "24-70mm zoom", "70-200mm tele", "50mm prime", "150mm prime", "300mm prime", "300mm prime (8x10 eq)"],
  product: ["50mm prime", "85mm prime", "60mm macro", "100mm macro", "90mm tilt-shift", "80mm prime", "90mm prime", "120mm macro", "150mm prime", "210mm prime"],
  cinematic: ["24mm prime", "35mm prime", "50mm prime", "85mm prime", "40mm anamorphic", "75mm anamorphic", "14mm prime", "18mm prime", "32mm prime", "45mm wide", "55mm wide", "35mm anamorphic", "50mm anamorphic", "80mm prime", "300mm tele"],
  night: ["24mm prime", "35mm prime", "50mm prime", "85mm prime", "35mm anamorphic", "105mm prime", "127mm Ektar"],
  sports: ["70-200mm zoom", "100-400mm tele", "300mm prime", "400mm prime", "24-70mm zoom", "80mm prime", "200mm prime", "300mm tele", "600mm prime"],
  wildlife: ["100-400mm tele", "200-600mm super-tele", "400mm prime", "600mm prime", "16mm fisheye", "16-35mm wide", "24-70mm zoom", "100mm macro", "105mm prime", "105mm macro"],
  architecture: ["14-24mm wide", "16-35mm wide", "24mm tilt-shift", "17mm tilt-shift", "24-70mm zoom", "28mm wide", "45mm tilt-shift", "50mm wide", "90mm wide", "90mm wide (8x10 eq)", "150mm prime"],
  experimental: ["8mm fisheye", "50mm prime", "45mm tilt-shift", "None"]
};

export const apertures = ["None","f/0.7","f/1.2","f/1.4","f/1.8","f/2","f/2.8","f/4","f/4.5","f/5.6","f/8","f/11","f/16","f/22","f/32","f/45","f/64"];
export const shutters = ["None","Bulb","30s","15s","8s","4s","2s","1s","1/2s","1/4s","1/8s","1/15s","1/30s","1/48s","1/60s","1/125s","1/160s","1/200s","1/250s","1/320s","1/500s","1/1000s","1/1250s","1/2000s","1/4000s"];
export const isos = ["None","1","3","5","10","25","50","64","100","200","400","500","800","1600","3200","6400"];
export const lightings = ["None","Natural Light","Soft Overcast","Golden Hour","Studio Softbox","High Key White Cyc","Hard Strobe","Direct Flash","Neon Practical","Candlelight","Stadium Lights","Underwater Ambient"];
export const lensChars = ["None","Clinical Sharp","Vintage Softness","Dreamy Bloom","Gentle Halation","Heavy Vignette", "Swirly Bokeh", "Petzval Curvature"];
export const films = ["None","Kodak Portra 400","Kodak Portra 160","Fuji Pro 400H","Cinestill 800T","Kodak Tri-X B&W","Kodak Gold 400","Kodak Ektachrome","Ilford HP5","Kodak Vision3 500T", "Kodak Vision3 250D", "Kodak Vision3 200T", "Kodachrome 64", "Fujichrome Velvia", "Wet Plate Collodion", "Nitrate Film", "B&W Sheet Film", "Polaroid 600", "Polaroid Type 55", "Technicolor Three-Strip", "Autochrome Plate", "Kodak Aerochrome", "Digital Video Tape", "B&W Negative", "Digital"];
export const wbs = ["None","Daylight Balanced","Warm Tungsten","Cool Shade","Mixed Lighting"];
export const grains = ["None","Clean/No Grain","Subtle Grain","Medium Texture","Heavy Grit"];
export const productSubgenres = ["None","Ecommerce Packshot","Luxury Jewelry Macro","Watch Hero","Cosmetics Splash","Sneaker Floating","Tech Gadget Hero","Beverage Condensation","Food Editorial","Tabletop Styled"];

export const lightingSetupLibrary = [
  { label: "Softbox Key", phrase: "45 degree softbox key, white bounce fill" },
  { label: "Dual Softbox", phrase: "dual softbox symmetric lighting" },
  { label: "Top Scrim", phrase: "top down scrim, negative fill" },
  { label: "Rim Light", phrase: "strip rim light, edge definition" },
  { label: "Clamshell", phrase: "clamshell beauty lighting" },
  { label: "White Cyc", phrase: "high key white cyc, even wraparound light" },
  { label: "Cross Polarized", phrase: "cross-polarized lighting to control reflections" },
  { label: "Gradient Sweep", phrase: "gradient sweep background, tabletop product lighting" },
  { label: "Hard Flash", phrase: "hard direct flash, fast falloff shadows" },
  { label: "Window Side", phrase: "window side light, soft falloff" },
  { label: "Underwater", phrase: "underwater strobe fill, particle sparkle" },
  { label: "Backlit", phrase: "backlit translucent diffusion, soft halos" },
  { label: "Atmospheric", phrase: "atmospheric smoke and light shafts" },
  { label: "Neon Spill", phrase: "neon sign spill" },
  { label: "Stadium", phrase: "stadium top light, crisp action freeze" },
  { label: "Ring Light", phrase: "ring light fill" },
  { label: "Practical", phrase: "practical lighting" },
  { label: "High Contrast", phrase: "high contrast rim lighting" }
];

// Truncated list for brevity, but includes key presets for functionality
export const basePresets: Preset[] = [
  { id:"none", title:"None", desc:"Manual mode", category:"Core", data:{} },
  { id:"leiter-street", title:"Saul Leiter", category:"Street", desc:"Reflections, layered color panes.", data:{ genre:"street", camera:"Leica M3", lens:"90mm tele", focal:90, aperture:"f/4", shutter:"1/60s", iso:"100", lighting:"Natural Light", composition:"Candid Snapshot", lightingSetups:["window side light, soft falloff"], vibe:"Saul Leiter style, shooting through windows and rain-specked glass, stacked reflections, soft focus edges, muted reds and ambers, street scenes as abstract color blocks with a human silhouette implied.", lensChar:"Vintage Softness", film:"Kodachrome 64", wb:"Daylight Balanced", grain:"Subtle Grain" } },
  { id:"maier-doc", title:"Vivian Maier", category:"Street", desc:"Observational candid, sharp moments.", data:{ genre:"street", camera:"Rolleiflex 2.8F", lens:"80mm prime", focal:80, aperture:"f/8", shutter:"1/250s", iso:"100", lighting:"Soft Overcast", composition:"Rule of Thirds", vibe:"Vivian Maier style, candid pedestrian life, clean geometry, mirror and shadow play, decisive everyday moments, waist-level perspective.", lensChar:"Clinical Sharp", film:"Kodak Tri-X B&W", wb:"Daylight Balanced", grain:"Medium Texture" } },
  { id:"deakins-cine", title:"Roger Deakins", category:"Cinematic", desc:"Naturalistic film precision.", data:{ genre:"cinematic", camera:"Arri Alexa 35", lens:"32mm prime", focal:32, aperture:"f/2.8", shutter:"1/48s", iso:"800", lighting:"Neon Practical", composition:"Leading Lines", lightingSetups:["window side light, soft falloff"], vibe:"Roger Deakins style, grounded cinematic realism, subtle contrast, motivated practical light, careful negative fill, clean compositions, atmospheric depth without exaggeration.", lensChar:"Clinical Sharp", film:"Kodak Vision3 500T", wb:"Mixed Lighting", grain:"Subtle Grain" } },
  { id:"wes-anderson", title:"Wes Anderson", category:"Cinematic", desc:"Symmetrical, pastel, flat.", data:{ genre:"cinematic", camera:"Arricam ST", lens:"40mm anamorphic", focal:40, aperture:"f/5.6", shutter:"1/48s", iso:"200", lighting:"Soft Overcast", composition:"Symmetrical Arch", lightingSetups:["high key white cyc, even wraparound light"], vibe:"Wes Anderson style, perfectly symmetrical composition, flat planar staging, pastel color palette, whimsical attention to detail, soft even lighting.", lensChar:"Clinical Sharp", film:"Kodak Vision3 200T", wb:"Daylight Balanced", grain:"Clean/No Grain" } },
  { id:"cyberpunk-neon", title:"Cyberpunk / Neo-Noir", category:"Genre Cinema", desc:"Rain, neon, high tech, low life.", data:{ genre:"night", camera:"Arri Alexa LF", lens:"35mm anamorphic", focal:35, aperture:"f/2", shutter:"1/48s", iso:"1600", lighting:"Neon Practical", composition:"Leading Lines", lightingSetups:["neon sign spill","atmospheric smoke and light shafts"], vibe:"Cyberpunk Neo-Noir aesthetic, rain-slicked streets reflecting pink and blue neon, high contrast, wet texture, steam and smoke, futuristic urban decay, anamorphic lens flares.", lensChar:"Clinical Sharp", film:"Kodak Vision3 500T", wb:"Mixed Lighting", grain:"Medium Texture" } },
  { id:"adams-bw", title:"Ansel Adams", category:"Landscape", desc:"Epic B&W mountains.", data:{ genre:"landscape", camera:"Deardorff 8x10", lens:"300mm prime (8x10 eq)", focal:300, aperture:"f/64", shutter:"1s", iso:"25", lighting:"Natural Light", composition:"Leading Lines", vibe:"Ansel Adams style, dramatic black and white landscapes, Zone System tonal separation, crisp detail, large format clarity.", lensChar:"Clinical Sharp", film:"Kodak Tri-X B&W", wb:"Daylight Balanced", grain:"Clean/No Grain" } },
  { id:"belanger-minimal", title:"Peter Belanger", category:"Product", desc:"Clean Apple-like minimal.", data:{ genre:"product", camera:"Canon EOS R5 II", lens:"100mm macro",focal:100,aperture:"f/11",shutter:"1/160s",iso:"100",lighting:"High Key White Cyc",composition:"Centered",productSubgenre:"Tech Gadget Hero",lightingSetups:["high key white cyc, even wraparound light","softbox key plus bounce"],vibe:"Peter Belanger style, ultra-clean minimal product hero shots, soft controlled wrap light, seamless backgrounds, Apple advertising aesthetic.",lensChar:"Clinical Sharp",film:"Digital",wb:"Daylight Balanced",grain:"Clean/No Grain" } }
];
