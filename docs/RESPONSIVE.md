# Responsive Design Guidelines

Diese Dokumentation beschreibt die Responsive-Design-Prinzipien und -Konventionen für das Prooved-Projekt.

## 📱 Breakpoints

Wir verwenden Tailwind CSS Breakpoints mit folgenden Bildschirmgrößen:

| Breakpoint | Breite | Geräte |
|------------|--------|--------|
| `sm` | 640px | Large phones, Small tablets |
| `md` | 768px | Tablets, Small laptops |
| `lg` | 1024px | Laptops, Desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

## 🎯 Design-Prinzipien

### 1. Mobile-First Approach
- Beginne mit dem Design für mobile Geräte
- Erweitere mit `md:`, `lg:`, `xl:` Prefixen für größere Bildschirme
- Verwende `min-width` Medienabfragen (Standard bei Tailwind)

### 2. Fluid Typography
- Verwende dynamische Schriftgrößen mit Viewport-Einheiten wo sinnvoll
- Nutze `clamp()` für flexible Übergänge zwischen Größen
- Beispiel: `text-3xl md:text-5xl lg:text-7xl`

### 3. Content-First Spacing
- Verwende proportionale Abstände statt feste Pixelwerte
- Nutze Tailwind's Spacing-Skala: `p-4`, `p-6`, `p-8`, `p-12`, `p-16`, `p-24`

### 4. Touch-Friendly Targets
- Minimale Touch-Target-Größe: 44px (iOS) / 48px (Android)
- Buttons und interaktive Elemente sollten mind. `h-11` oder `h-12` haben
- Ausreichend Abstand zwischen klickbaren Elementen: `gap-4` minimum

## 🧩 Wiederverwendbare Layout-Komponenten

### Container
```tsx
<Container size="sm|md|lg|xl|max">...</Container>
```
- Zentriert Content mit maximaler Breite
- Horizontales Padding für Sicherheit an Bildschirmrändern

### Section
```tsx
<Section variant="default|gradient|pattern">...</Section>
```
- Vollständige Section mit vertikalem Padding
- Optional mit Hintergrund-Effekten

### Grid
```tsx
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap="sm|md|lg">...</Grid>
```
- Responsive Grid-Layouts
- Automatische Spalten-Anpassung

## 📐 Responsive Patterns

### Text-Größen
```tsx
// Überschriften
<h1 className="text-4xl md:text-5xl lg:text-6xl font-black">...</h1>

// Fließtext
<p className="text-base md:text-lg">...</p>
```

### Flex-Layouts
```tsx
// Responsive Flex mit Umbruch
<div className="flex flex-col md:flex-row gap-4">...</div>

// Zentrierung
<div className="flex flex-col items-center text-center">...</div>
```

### Grids
```tsx
// Adaptives Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">...</div>
```

### Sichtbarkeit
```tsx
// Nur auf Mobile
<div className="md:hidden">...</div>

// Nur auf Desktop
<div className="hidden md:block">...</div>
```

## 🔧 Best Practices

### 1. Horizontales Padding
```tsx
// Mindestens px-4 für mobile
<section className="px-4 md:px-6 lg:px-8">...</section>
```

### 2. Maximale Breiten
```tsx
// Für bessere Lesbarkeit
<p className="max-w-2xl mx-auto">...</p>
```

### 3. Bilder
```tsx
// Responsive Bilder
<img 
  className="w-full h-auto max-w-md" 
  srcSet="..." 
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 4. Navigation
```tsx
// Mobile Navigation
<nav className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto">
```

## 🧪 Testing

Teste auf folgenden Geräten/Bildschirmgrößen:
- Mobile: 320px - 480px
- Tablet: 481px - 1024px
- Desktop: 1025px+
- Large Desktop: 1440px+

### Browser DevTools
- Chrome: DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
- Firefox: DevTools → Responsive Design Mode (Ctrl+Shift+M)

## 📁 Dateistruktur

Responsive Komponenten befinden sich in:
```
src/shared/components/ui/
├── Container.tsx
├── Section.tsx
├── Grid.tsx
└── ...
```

## ✅ Checkliste

Vor dem Deployment prüfe:
- [ ] Kein horizontaler Scroll auf mobilen Geräten
- [ ] Alle Touch-Targets mind. 44px
- [ ] Texte lesbar ohne Zoom
- [ ] Bilder laden performant (lazy loading)
- [ ] Keine overflow-Probleme auf kleinen Bildschirmen
- [ ] Navigation funktioniert auf allen Geräten
- [ ] Formulare nutzbar auf Mobile

---

Siehe auch:
- [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md)
- [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)
