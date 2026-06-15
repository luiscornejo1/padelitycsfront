import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Clock, Calendar, Check, X, User } from 'lucide-react';

interface ClassSession {
  id: string;
  day: number; // 0-6 (Mon-Sun)
  hour: string;
  courtId: string;
  level: string;
  coach: string;
  enrolled: number;
  capacity: number;
}

const HOURS = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];
const COURTS = [
  { id: 'c1', name: 'Cancha 1 (Panorámica)' },
  { id: 'c2', name: 'Cancha 2 (Panorámica)' },
  { id: 'c3', name: 'Cancha 3 (Estándar)' },
  { id: 'c4', name: 'Cancha 4 (Estándar)' },
];

const MOCK_CLASSES: ClassSession[] = [
  { id: '1', day: 1, hour: '17:00', courtId: 'c1', level: 'Intermedio', coach: 'Carlos R.', enrolled: 4, capacity: 4 },
  { id: '2', day: 1, hour: '18:00', courtId: 'c2', level: 'Avanzado', coach: 'Martín S.', enrolled: 2, capacity: 4 },
  { id: '3', day: 1, hour: '19:00', courtId: 'c1', level: 'Principiante', coach: 'Ana L.', enrolled: 4, capacity: 4 },
  { id: '4', day: 1, hour: '19:00', courtId: 'c3', level: 'Intermedio', coach: 'Carlos R.', enrolled: 1, capacity: 4 },
];

export default function AcademyMatrixView() {
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Martes for mock
  const [classes, setClasses] = useState<ClassSession[]>(MOCK_CLASSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ hour: string, courtId: string } | null>(null);

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const getClassForSlot = (hour: string, courtId: string) => {
    return classes.find(c => c.day === selectedDay && c.hour === hour && c.courtId === courtId);
  };

  const handleSlotClick = (hour: string, courtId: string) => {
    const existingClass = getClassForSlot(hour, courtId);
    if (!existingClass) {
      setSelectedSlot({ hour, courtId });
      setIsModalOpen(true);
    } else {
      // In a real app, open edit modal
      alert(`Clase seleccionada: ${existingClass.level} con ${existingClass.coach}`);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-[#060c19] min-h-full text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Matriz de Academia
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Vista de control aéreo. Gestiona clases, profesores y cupos rápidamente.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {daysOfWeek.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedDay === index
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row (Courts) */}
            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] bg-slate-900 border-b border-slate-800">
              <div className="p-4 flex items-center justify-center border-r border-slate-800">
                <Clock className="w-5 h-5 text-slate-500" />
              </div>
              {COURTS.map(court => (
                <div key={court.id} className="p-4 text-center border-r border-slate-800 last:border-0 font-bold text-slate-300">
                  {court.name}
                </div>
              ))}
            </div>

            {/* Matrix Body (Hours) */}
            <div className="divide-y divide-slate-800/50">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr]">
                  {/* Time Label */}
                  <div className="p-4 flex items-center justify-center font-bold text-slate-400 border-r border-slate-800 bg-slate-900/30">
                    {hour}
                  </div>

                  {/* Court Slots */}
                  {COURTS.map(court => {
                    const session = getClassForSlot(hour, court.id);
                    const isFull = session?.enrolled === session?.capacity;

                    return (
                      <div
                        key={`${hour}-${court.id}`}
                        onClick={() => handleSlotClick(hour, court.id)}
                        className={`p-2 border-r border-slate-800/50 last:border-0 min-h-[100px] cursor-pointer transition-all ${!session ? 'hover:bg-slate-800/50' : ''
                          }`}
                      >
                        {session ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`h-full rounded-xl p-3 border shadow-sm flex flex-col justify-between ${isFull
                                ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/60'
                                : 'bg-brand-green/10 border-brand-green/30 hover:border-brand-green/60'
                              }`}
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-orange-500/20 text-orange-400' : 'bg-brand-green/20 text-brand-green'
                                  }`}>
                                  {session.level}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-slate-300">
                                <User className="w-3.5 h-3.5 text-slate-500" />
                                {session.coach}
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-3">
                              <div className="flex gap-0.5">
                                {[...Array(session.capacity)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-4 rounded-sm ${i < session.enrolled
                                        ? (isFull ? 'bg-orange-500' : 'bg-brand-green')
                                        : 'bg-slate-700'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-slate-400">
                                {session.enrolled}/{session.capacity}
                              </span>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                              <Plus className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-6 items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-green shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          <span className="text-sm text-slate-300 font-medium">Clase con Cupos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
          <span className="text-sm text-slate-300 font-medium">Clase Llena</span>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {isModalOpen && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0A101D] border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  Nueva Clase
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-1">Día</span>
                    <span className="text-white font-medium">{daysOfWeek[selectedDay]}</span>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-1">Hora</span>
                    <span className="text-white font-medium">{selectedSlot.hour}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-2 ml-1">Nivel</label>
                  <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors">
                    <option>Principiante</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                    <option>Niños</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-2 ml-1">Profesor</label>
                  <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:border-emerald-500 transition-colors">
                    <option>Carlos R.</option>
                    <option>Martín S.</option>
                    <option>Ana L.</option>
                    <option>Por asignar</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500 rounded bg-slate-900 border-slate-700" />
                    <div>
                      <span className="block text-white font-medium text-sm">Clase Recurrente</span>
                      <span className="block text-slate-400 text-xs">Repetir cada {daysOfWeek[selectedDay]} a las {selectedSlot.hour}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all border border-slate-700 hover:border-slate-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Mock save
                    setClasses([...classes, {
                      id: Math.random().toString(),
                      day: selectedDay,
                      hour: selectedSlot.hour,
                      courtId: selectedSlot.courtId,
                      level: 'Nuevo Nivel',
                      coach: 'Carlos R.',
                      enrolled: 0,
                      capacity: 4
                    }]);
                    setIsModalOpen(false);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex justify-center items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Crear Clase
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
