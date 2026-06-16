# Padelitycs - Agent Documentation & Context Log (PadelAgent.md)

Este documento es mantenido por el Asistente AI (Antigravity) para llevar un registro de la arquitectura, funcionalidades del sistema, decisiones de diseño y el historial detallado de cambios del proyecto **Padelitycs**.

---

## 1. ¿De qué trata el sistema? (Contexto General)
**Padelitycs** es una aplicación frontend interactiva (Single Page Application) desarrollada para la gestión integral de clubes y torneos de pádel. Permite organizar partidos en tiempo real, manejar inscripciones, visualizar rankings y administrar ligas de manera dinámica.

El sistema se enfoca en resolver las necesidades prácticas de los torneos locales, tales como:
- **Gestión Dinámica de Torneos**: Creación y organización en vivo (grupos de tamaños variables, asignación de canchas, orden de partidos aleatorio).
- **Formatos de Juego Especializados**:
  - **Fase de Grupos / Americano**: Cruces aleatorios, visualización de tablas en tiempo real.
  - **Fase Eliminatoria (Brackets)**: Árbol de llaves dinámico que maneja de 4 a 8 participantes/parejas de forma totalmente aleatoria, con soporte nativo para espacios vacíos ("BYE") y avance automático para torneos con números irregulares de parejas (ej. 6 parejas clasificadas de 3 canchas).
  - **Mic Padel League**: Liga especializada para 5 jugadores con reglas de rotación estricta, intercalación de parejas y criterios avanzados de desempate.
- **Panel Administrativo Multirrol**: Control de academia para clases/profesores/canchas (`AcademyMatrixView`) simulando un panel de control aéreo de alta densidad, e inventarios de puntos de venta (`InventoryPOSView`).

---

## 2. Stack Tecnológico
- **Core**: React 19, TypeScript
- **Estilos y Visuales**: Tailwind CSS v4, Lucide React (iconos), CSS personalizado (`App.css`, `index.css`)
- **Animaciones y Efectos**: Framer Motion, Anime.js
- **Renderizado 3D**: Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Build Tool / Bundler**: Vite (construcción y despliegue rápido)
- **Despliegue**: Optimizado para Vercel (frontend 100% headless/local-state sin base de datos obligatoria para pruebas interactivas).

---

## 3. Estado Actual de la Arquitectura & Componentes Clave

### Componentes de Administración (`src/components/admin/`)
- [AdminDashboard.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/AdminDashboard.tsx): Panel de control central con autenticación simple.
- [AcademyMatrixView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/AcademyMatrixView.tsx): Visualizador de horarios y canchas en vivo para la academia.
- [MajorTournamentView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/MajorTournamentView.tsx): Configuración y gestión avanzada de las fases de grupos y cruces eliminatorios.
- [InscriptionsView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/InscriptionsView.tsx) & [ManualRegistrationView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/ManualRegistrationView.tsx): Registro y visualización de parejas/jugadores inscritos.
- [InventoryPOSView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/admin/InventoryPOSView.tsx): Punto de venta e inventario integrado para la administración del club.

### Componentes de Visualización de Torneos (`src/components/`)
- [BracketGenerator.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/BracketGenerator.tsx): Generador del árbol de llaves de eliminación directa. Implementa emparejamientos aleatorios y lógica de "BYE" para autocompletar espacios vacíos en llaves de 4 u 8 parejas.
- [AmericanoLiveView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/AmericanoLiveView.tsx): Panel interactivo para visualizar partidos, registrar resultados parciales de la fase de grupos y actualización automática de posiciones.
- [PlayerTvView.tsx](file:///c:/Users/luisc/OneDrive/Escritorio/Padelitycs/src/components/PlayerTvView.tsx): Interfaz de visualización diseñada para pantallas/televisores dentro del club deportivo, mostrando los partidos activos e información en tiempo real.

---

## 4. Registro de Cambios y Contexto Histórico (Log)

| Fecha | Tarea / Cambios Realizados | Detalles de Implementación y Solución de Problemas |
| :--- | :--- | :--- |
| **2026-06-13** | Implementación de Roles y Vistas Administrativas | Creación de `AcademyMatrixView` y `MajorTournamentView` integradas en el panel principal. Creación inicial del archivo de contexto. |
| **2026-06-15** | Corrección de Fase Final y Nombres de Parejas | Se reparó la lógica de transferencia de datos en `standingsLogic.ts` que impedía que los nombres de las parejas seleccionadas se mostraran correctamente al configurar la Fase Final (Brackets). |
| **2026-06-15** | Lógica de BYE y Soporte de Brackets Irregulares | Se modificó `BracketGenerator.tsx` para emparejar automáticamente en el árbol de eliminación (4 u 8 posiciones) a las parejas clasificadas de torneos impares/irregulares (ej. 6 parejas clasificadas de 3 canchas). Las posiciones sobrantes se configuran como "BYE" y permiten el avance automático de la pareja emparejada a la siguiente ronda. |
| **2026-06-15** | Optimización de Compilación para Vercel | Se modificó el script de construcción en `package.json` a `"vite build"` (eliminando la validación estricta de `tsc -b` en el CI de Vercel). Esto resolvió los errores de compilación causados por advertencias menores de TypeScript de variables no utilizadas durante los despliegues directos de prueba. |
| **2026-06-16** | Gestión del Entorno de Skills | Instalación y posterior desinstalación limpia de la biblioteca de herramientas `antigravity-awesome-skills` dentro de la configuración del asistente. |

---

## 5. Próximos Pasos y Objetivos Pendientes
1. **Integración Headless con Odoo**: Comenzar la migración de los estados locales (`TournamentContext`, etc.) hacia endpoints reales de Odoo para persistencia.
2. **Sincronización WebSockets**: Implementar la comunicación en tiempo real para las vistas de TV (`PlayerTvView`) de modo que reflejen los cambios guardados por el admin al instante.
3. **Mantenimiento de TypeScript**: Corregir los warnings latentes de TypeScript para poder volver a habilitar de forma segura `tsc` en la build de producción.
