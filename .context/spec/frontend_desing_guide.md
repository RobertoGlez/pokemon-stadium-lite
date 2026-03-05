# Pokémon Stadium Lite — Minimal Design Guide

Guía de diseño **minimalista** basada en el logo proporcionado y en los requerimientos del proyecto.
Optimizada para implementación rápida en **Flutter + React**.

---

# 1. Design Principles

El diseño debe seguir estos principios:

* Minimal UI
* Pocos colores
* Mucho espacio negativo
* Componentes simples
* Jerarquía visual clara
* Alta legibilidad

Inspiración:

* Apple UI
* Linear.app
* Minimal dashboards
* Interfaces limpias de videojuegos

La prioridad del diseño es **claridad durante la batalla**.

---

# 2. Color Palette

Basado en el logo proporcionado.

## Primary

Arena Blue

```css
#2563EB
```

Uso:

* Botones principales
* Links
* Elementos activos
* Indicadores de acción

---

## Background

Background principal

```css
#0B0F1A
```

Panel / Cards

```css
#111827
```

---

## Borders

```css
#1F2937
```

---

## Text

Primary Text

```css
#F9FAFB
```

Secondary Text

```css
#9CA3AF
```

---

## Status Colors

Success

```css
#22C55E
```

Warning

```css
#F59E0B
```

Danger

```css
#EF4444
```

Uso principal: **barras de HP**.

---

# 3. Typography

Fuente recomendada:

## Primary Font

```
Inter
```

Ventajas:

* Excelente legibilidad
* Optimizada para UI
* Funciona perfecto en Flutter y Web
* Muy ligera

Google Fonts:

https://fonts.google.com/specimen/Inter

---

# 4. Typography Scale

```
H1
28px
Bold

H2
22px
SemiBold

H3
18px
Medium

Body
16px
Regular

Small
14px

Caption
12px
```

---

# 5. Spacing System

Usar sistema basado en múltiplos de **8px**.

```
4px
8px
16px
24px
32px
40px
48px
```

Esto garantiza consistencia en todos los layouts.

---

# 6. Border Radius

Radios suaves para mantener estética minimalista.

```
Inputs
10px

Cards
14px

Buttons
12px
```

---

# 7. Components

## Buttons

Primary Button

Background

```
#2563EB
```

Text

```
#FFFFFF
```

Height

```
48px
```

Radius

```
12px
```

---

Secondary Button

Border

```
1px solid #2563EB
```

Background

```
transparent
```

---

# Inputs

Background

```
#111827
```

Border

```
#1F2937
```

Focus

```
#2563EB
```

Height

```
48px
```

Radius

```
10px
```

---

# Cards / Panels

Background

```
#111827
```

Border

```
#1F2937
```

Radius

```
14px
```

Padding

```
16px
```

---
