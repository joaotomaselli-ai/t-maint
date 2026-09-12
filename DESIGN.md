# Design System: T-Maint & CNC Electronics

## 1. Visual Identity & Vibe
- **Core Aesthetic:** Industrial Tech, High Precision, Reliable, Linear/Vercel-grade.
- **Target Audience:** Factory Managers, Maintenance Directors, CNC Operators, Tech Labs, Field Technicians.
- **Fundamental Rule:** Avoid generic SaaS soft curves and bubbly layouts. Use sharp, precise, hyper-clean layouts inspired by high-end engineering interfaces.

---

## 2. Color Palette (Strict)
- **Background Main:** `#0B0F17` (Deep Industrial Navy / Graphite)
- **Background Card / Surface:** `#131A26` (Subtle elevation, translucent glassmorphism)
- **Background Card Hover:** `#182232`
- **Accent Primary (Laser Cyber Teal):** `#00F5D4` / `#06B6D4` (High-contrast alerts, active telemetry, CTAs)
- **Accent Secondary (Industrial Safety):** `#FF5A00` / `#F59E0B` (Warnings, urgency)
- **Accent Emerald (Success/Online):** `#10B981` (Active status LED, connected devices)
- **Borders & Grids:** `#1F293D` (Low contrast, sharp 1px structural lines)
- **Border Hover Glow:** `rgba(0, 245, 212, 0.3)`
- **Text Primary:** `#F3F4F6` (Crisp white/silver)
- **Text Secondary:** `#9CA3AF` (Technical neutral gray)
- **Text Muted:** `#64748B` (Metadata, timestamps)

---

## 3. Typography & Micro-Spacing
- **Headings Font:** Inter / Geist Sans (Tracking: `-0.025em` for a dense, high-end tech feel)
- **Monospace (Data / Telemetry):** Geist Mono / JetBrains Mono / `font-mono` (For serial numbers, O.S. codes, timestamps, coordinates, MTTR)
- **Borders & Radius:** `rounded-md` (6px) or `rounded-lg` (8px). Never use bubbly `rounded-2xl` or `rounded-3xl`.
- **Dividers:** Fine 1px borders (`border-slate-800/80` or `border-[#1F293D]`).

---

## 4. Anti-AI Pattern Protection
- 🚫 **No Floating 3D Blobs / Cartoon Illustrations:** Absolutely banned generic purple/pink gradients or floating cartoon characters.
- 🚫 **No Fake Charts:** Use real rendered data grids, interactive sparklines and crisp SVG metrics.
- ✅ **Real Engineering Elements:** 
  - Crisp Bento data grids with high information density.
  - Glowing telemetry status dots (`animate-pulse`).
  - Subtle dark noise / grid background pattern (`bg-grid-slate-800/[0.05]`).
  - Technical badges with precise borders (`border border-teal-500/30 bg-teal-500/10 text-teal-300`).

---

## 5. Bento Grid Layout Standards
- **Asymmetry with Purpose:** Primary features receive large span-2 cards with interactive preview cockpits; secondary features receive dense span-1 cards.
- **Glassmorphism:** Cards use `backdrop-blur-md bg-[#131A26]/80` with `border border-[#1F293D]` and smooth hover transitions.
