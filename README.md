# metamorphosis | Automated Employee ID Card Generator

> **"Driving business transformation"**  
> An automated, production-ready, pixel-perfect CR80 Employee ID Card Generator web application with dual-layer AI photo processing, Adobe Illustrator vector export, 300-DPI high-res print export, and MongoDB Atlas cloud storage.

---

## 🌟 Key Features

### 1. 100% Pixel-Perfect CR80 Template & Vector Design
- **Standard CR80 Canvas Ratio:** `638px × 1012px` (3.375″ × 2.125″ physical card ratio at 300 DPI).
- **Vibrant Brand Header:** Filled with signature Vibrant Orange (`#EA6A2A`) with the abstract ribbon 'M' logo, `"metamorphosis"` bold title, and `"Driving business transformation"` tagline.
- **Asymmetric Cloud-Wave Curve:** Exact custom SVG vector curve transitioning smoothly into the Pure White (`#FFFFFF`) card body.
- **Interactive Circular Portrait Frame:** `border-radius: 50%` with smooth real-time Zoom (`0.5x` to `3.0x`) and X/Y coordinate pan sliders (`-150px` to `+150px`).
- **Typography:** Set in Google Fonts *Plus Jakarta Sans* & *Outfit* with 5 centered lines:
  1. Full Name (Bold Black)
  2. Designation / Role
  3. National ID (NID)
  4. Blood Group
  5. Contact Phone Number
- **Footer:** Crisp brand domain `"metamorphosis.com.bd"`.

### 2. Dual-Layer AI Studio White Background Engine
- **Layer 1 (Cloud AI):** Google Gemini Nano Banana (`gemini-2.5-flash-image`) serverless endpoint (`/api/process-photo`) with strict passport-matte prompt preserving 100% of the subject's face, posture, clothing, and hair.
- **Layer 2 (Client-Side Real AI Fallback):** Real-time subject segmentation via `@imgly/background-removal` running on WebAssembly & ONNX in the browser, instantly compositing onto pure studio white (`#FFFFFF`) without altering clothing colors or white shirts.

### 3. Action Buttons Sequence (Mandatory Order)
1. **Download High-Res PNG (300 DPI):** Crystal-clear PNG output via `html-to-image` at `pixelRatio: 3` for digital archival and printing.
2. **Download Print-Ready PDF:** Standard CR80 vector PDF layout (`53.98mm × 85.60mm`) via `jspdf` ready for dye-sublimation and retransfer card printers.
3. **Download Adobe Illustrator .ai:** Direct download as `metamorphosis-id-card-<name>.ai`, containing a clean vector SVG specification with live and outlined typography for lossless vector editing in Adobe Illustrator.
4. **Save Employee Record:** Saves full card configuration to MongoDB Atlas (with automatic local storage fallback for offline use).

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Rendering & Export:** `html-to-image`, `jspdf`, Vector SVG
- **AI Background Removal:** `@google/genai` (`gemini-2.5-flash-image`) & `@imgly/background-removal` (WASM / ONNX)
- **Backend & Database:** Node.js, Express, MongoDB Atlas / Mongoose
- **Deployment:** Vercel Serverless Functions (`vercel.json`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/srijvee27/ID_Card_Metamorphosis.git
cd ID_Card_Metamorphosis
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys in `.env`:
```env
# Google AI Studio Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Atlas URI (Optional - local fallback automatically activates if omitted)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/metamorphosis?retryWrites=true&w=majority

PORT=5000
```

### Running Locally
```bash
# Start both Vite Frontend (port 3000) and Express Backend (port 5000) concurrently
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

The application is pre-configured with `vercel.json` for seamless 1-click deployment on Vercel:
1. Push to your GitHub repository.
2. Import repository into Vercel.
3. Add `GEMINI_API_KEY` and `MONGODB_URI` under **Settings > Environment Variables**.
4. Deploy!

---

## 📄 License
MIT License. Developed for metamorphosis.
