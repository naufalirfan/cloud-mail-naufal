# Cloud Mail Flare - Developer & Agent Guide

> Aplikasi webmail & email routing pribadi berbasis SvelteKit + Cloudflare Workers + D1.

## 🎨 Design Direction
- **Primary Design System**: [DESIGN.md](file:///d:/Naufal/AI/cloud-mail-naufalputra.myid/DESIGN.md) (Superhuman-inspired aesthetic).
- **Aesthetic Profile**: Fast-email productivity, deep indigo-navy (`#1b1938`, `#0e0c1f`) di mode gelap, warm-grey & soft white canvas (`#fafaf8`) di mode terang.
- **Design Dials**: `ENERGY 1` (Tenang, tanpa distraksi) / `RHYTHM 2` (Hierarki tabel & inbox jelas) / `MOTION 1` (Micro-interaction cepat 100-150ms).
- **Component Geometry**: Tight rounded rectangles (6px - 8px), hairline 1px borders, high-density data scan.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read `antislop.md` (core) and then the skill for the task:
- UI / visual: `skills/antislop-ui/SKILL.md`
- Copy & text: `skills/antislop-copywriting/SKILL.md`
- People: `skills/antislop-human/SKILL.md`
- Mobile / responsive: `skills/antislop-layoutmobile/SKILL.md`
- Code comments: `skills/antislop-code/SKILL.md`
Before starting, ask the user when antislop applies: during the work, or after it is done.
<!-- antislop:end -->

## 🛡️ Aturan Pengerjaan Antarmuka (antislop Hard Gates)
1. **R-02 (Copywriting)**: Dilarang menggunakan karakter em dash (`—`) di teks UI. Gunakan koma, titik, atau tanda kurung.
2. **R-03 (Mobile Responsiveness)**: Seluruh layout harus bebas horizontal overflow, tombol memenuhi tap target min. 44px.
3. **R-25 (Contrast WCAG AA)**: Rasio kontras teks minimal 4.5:1 untuk normal text dan 3:1 untuk large text.
4. **R-26 & R-32 (Aksesibilitas & Keyboard)**: Semua elemen interaktif dapat diakses via keyboard (`Tab`, `Enter`, `Escape`), dan memiliki `focus-visible` ring yang kontras.
5. **R-27 (UI States)**: Semua komponen data harus memiliki empty state, loading state, dan error state.
