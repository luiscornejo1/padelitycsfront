# Padelitycs - Agent Documentation (PadelAgent.md)

Este documento es mantenido por el Asistente AI (Antigravity) para llevar un registro de la arquitectura, funcionalidades actuales y el historial de cambios del proyecto **Padelitycs**.

## 1. Análisis y Estado Actual del Proyecto

### Descripción General
**Padelitycs** es una aplicación frontend (SPA - Single Page Application) desarrollada en React para la gestión de torneos de pádel, visualización de rankings y administración de jugadores. Actualmente, la aplicación maneja el estado de forma local y se encuentra en fase de transición hacia una arquitectura "Headless ERP" utilizando Odoo como backend.

### Stack Tecnológico
- **Frontend Core**: React 19, TypeScript
- **Estilos y UI**: Tailwind CSS v4, Lucide React (Iconos)
- **Animaciones**: Framer Motion
- **Build Tool**: Vite
- **Backend Actual**: Ninguno (Estado Local). Planeado: Odoo (Headless).

### Funcionalidades Implementadas
La estructura del proyecto revela las siguientes funcionalidades clave:

#### Interfaz Pública
- **Landing Page**: Componentes principales como `HeroSection`, `Navbar` y `Footer`.
- **Noticias y Rankings**: Visualización de novedades (`NewsSection`) y clasificación de los jugadores (`RankingsSection`).
- **Onboarding**: Flujo paso a paso para la interacción de nuevos usuarios (`OnboardingWizard`).
- **Llaves de Torneos**: Generador de cuadros y cruces (`BracketGenerator`).

#### Modos de Juego y Visualización
- **Modo Americano**: Gestión y vista en vivo de torneos en formato "Americano" (`AmericanoLiveView`, `AmericanoSection`).
- **Mic Padel League**: Gestión avanzada de torneos de 5 jugadores con reglas estrictas de rotación, intercalación de parejas y tabla de posiciones animada con reglas complejas de desempate (`MicPadelLeagueView`).

#### Panel de Administración (Admin)
- **Control Central**: Autenticación y panel de control (`AdminDashboard`, `AdminLogin`).
- **Control Academia (Matriz)**: Tablero visual de alta densidad para gestión eficiente de clases, profesores y canchas simulando un panel de control aéreo (`AcademyMatrixView`).
- **Generador de Torneos Simples**: Creación y configuración rápida de torneos (`AdminTournamentGenerator`).
- **Gestión de Torneos Mayores**: Administración avanzada para torneos multi-categoría, con generación de Fase de Grupos y Cuadro Principal (`MajorTournamentView`).
- **Gestión de Inscripciones**: Control de registros manuales y listas de jugadores inscritos (`InscriptionsView`, `ManualRegistrationView`).

---

## 2. Registro de Cambios y Documentación (Log)

| Fecha | Descripción de la Tarea / Cambio | Notas |
| :--- | :--- | :--- |
| **2026-06-13** | Implementación Roles Coordinador Deportivo. | Se añadieron `AcademyMatrixView` y `MajorTournamentView` integrados en el dashboard principal para cubrir gestión de academia y torneos grandes. |
| **2026-06-13** | Creación de `PadelAgent.md` y análisis del proyecto. | Inventario de componentes y stack tecnológico en React. |
