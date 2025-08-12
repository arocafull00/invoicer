## KokonutUI: Recomendaciones de integración

—

## Recomendaciones priorizadas


### 2) Botones de acción (CTAs) modernos
- Componentes propuestos: Particle Button (CTA principal), Gradient Button (secundarios)
- Dónde usar: `src/dashboard/components/DashboardHeader.tsx` ("Nueva Factura"), `src/dashboard/components/QuickActions.tsx`
- Instalación:
```bash
npx shadcn@latest add https://kokonutui.com/r/particle-button
npx shadcn@latest add https://kokonutui.com/r/gradient-button
```
- Ejemplo de uso:
```tsx
import ParticleButton from "@/components/kokonutui/particle-button";

<ParticleButton onClick={() => navigate("/invoices/new")}>Nueva Factura</ParticleButton>
```


### 4) Búsqueda y atajos
- Componentes propuestos: Action Search Bar (buscador global), Command Button (abrir buscador con ⌘K/CTRL+K)
- Dónde usar: parte superior de `src/invoices/index.tsx` o layout del Dashboard
- Instalación:
```bash
npx shadcn@latest add https://kokonutui.com/r/action-search-bar
npx shadcn@latest add https://kokonutui.com/r/command-button
```

### 5) Dashboard más visual
- Componentes propuestos: Bento Grid (layout), Apple Activity Card (cards de métricas)
- Dónde usar: reemplazar la disposición de `src/dashboard/components/StatsGrid.tsx` y el contenido de `StatCard.tsx`
- Instalación:
```bash
npx shadcn@latest add https://kokonutui.com/r/bento-grid
npx shadcn@latest add https://kokonutui.com/r/apple-activity-card
```

### 6) Segmentación de estados/orden
- Componente propuesto: Smooth Tab (switch entre filtros predefinidos)
- Dónde usar: encima de la tabla en `src/invoices/index.tsx` o junto a `InvoicesFilters`
- Instalación:
```bash
npx shadcn@latest add https://kokonutui.com/r/smooth-tab
```

### 7) Estados de carga y feedback
- Componentes propuestos: AI State Loading, AI Text Loading
- Dónde usar:
  - `src/dashboard/components/PDFButton.tsx` (mientras genera/descarga PDF)
  - `src/invoices/components/InvoiceTable.tsx` (carga de datos)
- Instalación:
```bash
npx shadcn@latest add https://kokonutui.com/r/ai-state-loading
npx shadcn@latest add https://kokonutui.com/r/ai-text-loading
```

—

## Notas de compatibilidad
- El proyecto ya usa Tailwind v4 y `lucide-react`, por lo que la integración es directa
- Prefiere instalación por CLI (trae utilidades y estilos auxiliares automáticamente)
- Revisa requisitos adicionales en cada componente (dependencias opcionales)


## Referencia
- Documentación principal: [KokonutUI Docs](https://kokonutui.com/docs)


