# Especulación Funcional: Agregando Funcionalidad Puntos Padelytics

Este documento define la especificación funcional detallada para la nueva característica **Padel-Cash y Gamificación** en la plataforma **Padelitycs**. Funciona como la única fuente de verdad técnica y comercial sobre lo que se construirá, cómo funcionará y cómo se verificará su éxito.

---

## 1. Objective (Objetivo)
Resolver la fricción y las colas en la recepción de los clubes deportivos incentivando el pago anticipado de reservas a través de un ecosistema digital integrado. 

### Historias de Usuario / Criterios de Aceptación:
- **Como Cliente**:
  - Quiero ver una diferencia de precios clara al reservar: `Precio Normal (Pago en Club)` vs. `Precio Padel-Cash (Pago Anticipado con un 10% de descuento)`.
  - Quiero poder subir mi captura de comprobante de pago de Yape directamente en la App al reservar.
  - Quiero ganar **10 puntos de lealtad** por cada reserva pagada por adelantado.
  - Quiero ver mi rango de nivel permanente (Bronce, Plata, Oro) según mi historial total de reservas completadas:
    - **Bronce (0-9 reservas)**: 0% de descuento adicional.
    - **Plata (10-24 reservas)**: 5% de descuento fijo adicional automático.
    - **Oro (25+ reservas)**: 10% de descuento fijo adicional automático.
  - Al acumular **100 puntos**, quiero recibir de forma automática un **cupón de descuento de $50** aplicable a mi próxima reserva.
  - Si cancelo una reserva pagada por adelantado, quiero que se me devuelva el saldo automáticamente en forma de un **Crédito/Cupón Virtual** para mi próxima reserva (descontándose los 10 puntos sumados).

- **Como Administrador**:
  - Quiero ver una cola visual con las capturas de pantalla de Yape subidas por los clientes.
  - Quiero poder aprobar o rechazar el pago con un solo clic.
  - Quiero que, al aprobar el pago, el sistema de forma transparente actualice el saldo de puntos, el nivel de fidelización y confirme la reserva del cliente.
  - Quiero poder ver y buscar a los socios del club en una tabla, controlando sus puntos y cupones de crédito virtual generados.

---

## 2. Tech Stack (Stack Tecnológico)
- **Frontend Core**: React 19 (Hooks de estado, Context API).
- **Estilos**: Tailwind CSS v4, Lucide React (Iconos).
- **Animaciones**: Framer Motion (Transiciones de barra de progreso y tarjetas de fidelidad).
- **Persistencia y Tiempo Real**: LocalStorage a través del hook `useLocalStorage` para pruebas sin base de datos en tiempo real. 

### Propuesta de Sincronización en Tiempo Real entre Pestañas:
Para que las acciones del Administrador (aprobar/rechazar) se reflejen de inmediato en la pantalla del Jugador/Cliente sin necesidad de un backend o WebSockets, implementaremos sincronización cruzada usando el **evento `storage` de HTML5**.
*   Cada vez que el Admin cambia el estado de un pago o reserva en `localStorage`, la pestaña del Jugador detecta el evento y sincroniza el estado en tiempo real.
*   Implementaremos un hook `useLocalStorageSync` o añadiremos un listener global en `TournamentContext` que escuche cambios en las llaves del localStorage y recargue el estado del React Context al instante.

---

## 3. Commands (Comandos Ejecutables)
- **Desarrollo Local**: `npm run dev`
- **Construcción para Producción**: `npm run build`
- **Verificación Lint**: `npm run lint`

---

## 4. Project Structure (Estructura del Proyecto)
```text
src/
├── types/
│   └── padelCashTypes.ts              → Definiciones de TypeScript para Padel-Cash [NUEVO]
├── context/
│   └── TournamentContext.tsx          → Estado de persistencia para usuarios y pagos [MODIFICADO]
├── components/
│   ├── Navbar.tsx                     → Enlace de navegación hacia el Portal [MODIFICADO]
│   ├── PadelCashPortal.tsx            → Interfaz del cliente (Dashboard de fidelidad y Simulador de reserva con Yape) [NUEVO]
│   └── admin/
│       ├── AdminDashboard.tsx         → Integración de la sección administrativa [MODIFICADO]
│       └── PadelCashAdminView.tsx     → Panel de control de validación de Yape y gestión de socios [NUEVO]
```

---

## 5. Code Style (Estilo de Código)
Seguiremos la convención de TypeScript estricto con componentes funcionales de React estilizados con Tailwind CSS v4 y Framer Motion para respuestas táctiles rápidas.

Ejemplo de definición y renderizado de Niveles:
```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface LevelBadgeProps {
  level: 'bronce' | 'plata' | 'oro';
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
  const config = {
    bronce: { color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', label: 'Bronce' },
    plata: { color: 'text-slate-300 bg-slate-400/10 border-slate-400/20', label: 'Plata' },
    oro: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', label: 'Oro' }
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${config[level].color}`}>
      <Award className="w-3.5 h-3.5" />
      {config[level].label}
    </div>
  );
};
```

---

## 6. Testing Strategy (Estrategia de Pruebas)
- **Pruebas de Sincronización**: Se abrirán dos pestañas del navegador en paralelo (una en el Dashboard de Admin y otra en el Portal de Cliente de Padel-Cash). Al confirmar un pago en Admin, el saldo del cliente en la otra pestaña debe incrementarse instantáneamente sin refrescar la página.
- **Validación de Persistencia**: Recargar la ventana del navegador debe mantener intacto el progreso de niveles, puntos y solicitudes pendientes de aprobación del comprobante Yape.

---

## 7. Boundaries (Límites y Reglas de Control)
- **Siempre hacer**:
  - Validar que las imágenes cargadas por el usuario se muestren correctamente antes de enviarlas al panel del administrador.
  - Asegurar la deducción correcta de puntos al momento de hacer devoluciones virtuales.
- **Consultar primero**:
  - Cambio en la lógica de umbral de puntos (100 puntos = cupón de $50) si los costos de la cancha cambian drásticamente.
- **Nunca hacer**:
  - Almacenar contraseñas o datos reales sensibles en el localStorage de texto plano.
  - Permitir duplicación de reservas o consumos de cupones ya utilizados.

---

## 8. Success Criteria (Criterios de Éxito)
- [ ] El sistema calcula y muestra el precio con 10% de descuento al elegir la opción "Pago Anticipado".
- [ ] El cliente puede cargar una imagen del comprobante de Yape y su estado queda marcado en "Validación Pendiente".
- [ ] El administrador recibe la solicitud, puede ver la previsualización del comprobante y confirmar o rechazar el pago.
- [ ] Al confirmar el pago, el usuario recibe automáticamente 10 puntos de lealtad y su contador de reservas sube en 1.
- [ ] Al alcanzar 10 reservas, el rango del usuario se convierte automáticamente en "Plata" y se le aplica un 5% de descuento adicional. Al llegar a 25 reservas, sube a "Oro" y se le aplica un 10% adicional.
- [ ] Al acumular 100 puntos, se genera un cupón virtual de $50 y se reduce el saldo de puntos del cliente.
- [ ] Al cancelar un turno pagado, se genera un cupón del mismo valor y se restan los 10 puntos ganados.
