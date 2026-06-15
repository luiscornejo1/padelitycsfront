import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PackageOpen, Calculator, AlertCircle, CheckCircle2, DollarSign, Activity, X, Edit, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  initialStock: number;
  currentStock: number;
  minStock: number;
  category: string;
  image: string;
}

export default function InventoryPOSView() {
  const [products, setProducts] = useLocalStorage<Product[]>('padel_inventory_products', [
    { id: '1', name: 'Agua San Luis 625ml', price: 3, initialStock: 50, currentStock: 50, minStock: 10, category: 'Bebidas', image: '💧' },
    { id: '2', name: 'Gatorade Blue 500ml', price: 5, initialStock: 30, currentStock: 8, minStock: 10, category: 'Bebidas', image: '⚡' },
    { id: '3', name: 'Cerveza Corona 330ml', price: 8, initialStock: 24, currentStock: 24, minStock: 12, category: 'Cervezas', image: '🍺' },
    { id: '4', name: 'Cerveza Stella 330ml', price: 8, initialStock: 24, currentStock: 24, minStock: 12, category: 'Cervezas', image: '🍻' },
    { id: '5', name: 'Galletas Oreo', price: 2.5, initialStock: 20, currentStock: 20, minStock: 5, category: 'Snacks', image: '🍪' },
    { id: '6', name: 'Barra Energética', price: 6, initialStock: 15, currentStock: 3, minStock: 5, category: 'Snacks', image: '🍫' },
  ]);

  const [totalRevenue, setTotalRevenue] = useLocalStorage<number>('padel_total_revenue', 0);

  const [isClosingShift, setIsClosingShift] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [physicalCounts, setPhysicalCounts] = useState<Record<string, number>>({});
  const [closureResult, setClosureResult] = useState<{ totalExpected: number, details: any[] } | null>(null);

  const handlePhysicalCountChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setPhysicalCounts(prev => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num
    }));
  };

  const calculateClosure = () => {
    let totalExpected = 0;
    const details: any[] = [];

    products.forEach(p => {
      const physical = physicalCounts[p.id] ?? p.initialStock;
      const missing = p.initialStock - physical;
      const expectedRevenue = missing > 0 ? missing * p.price : 0;
      
      if (missing !== 0) {
        details.push({
          name: p.name,
          missing,
          revenue: expectedRevenue
        });
      }
      totalExpected += expectedRevenue;
    });

    setClosureResult({ totalExpected, details });
  };

  const finishClosure = () => {
    if (closureResult) {
      setTotalRevenue(prev => prev + closureResult.totalExpected);
      
      // Update actual stock
      const updatedProducts = products.map(p => {
        const physical = physicalCounts[p.id] ?? p.initialStock;
        return {
          ...p,
          initialStock: physical,
          currentStock: physical
        };
      });
      setProducts(updatedProducts);
    }
    
    setClosureResult(null);
    setIsClosingShift(false);
    setPhysicalCounts({});
  };

  const handleSaveProduct = (p: Product) => {
    if (products.find(prod => prod.id === p.id)) {
      setProducts(products.map(prod => prod.id === p.id ? p : prod));
    } else {
      setProducts([...products, { ...p, id: Math.random().toString(36).substr(2, 9) }]);
    }
    setEditingProduct(null);
  };

  return (
    <div className="p-4 md:p-8 bg-[#060c19] min-h-full text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <PackageOpen className="w-8 h-8 text-emerald-500" />
            Caja e Inventario (Pro-Shop)
          </h2>
          <p className="text-slate-400 mt-1">Control de stock en tiempo real y cuadre de turnos inteligente.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsManaging(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold transition-all flex items-center gap-2 text-slate-300"
          >
            <Edit className="w-4 h-4" />
            Gestionar Productos
          </button>
          <button 
            onClick={() => setIsClosingShift(true)}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-2 text-white"
          >
            <Calculator className="w-4 h-4" />
            Cierre de Turno
          </button>
        </div>
      </div>

      {/* Alertas de Stock */}
      {products.some(p => p.currentStock <= p.minStock) && (
        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-400 mb-1">Alertas de Bajo Stock</h4>
            <div className="flex flex-wrap gap-2">
              {products.filter(p => p.currentStock <= p.minStock).map(p => (
                <span key={p.id} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-md border border-red-500/20">
                  {p.name} (Quedan {p.currentStock})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {products.map(product => {
          const isLow = product.currentStock <= product.minStock;
          return (
            <div 
              key={product.id} 
              className={`bg-slate-900/50 rounded-2xl border p-4 flex flex-col items-center text-center relative overflow-hidden ${
                isLow ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-4xl mb-3">{product.image}</div>
              <h4 className="font-bold text-sm mb-1 leading-tight">{product.name}</h4>
              <span className="text-emerald-400 font-bold mb-3">S/ {product.price.toFixed(2)}</span>
              
              <div className="w-full mt-auto">
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isLow ? 'text-red-400' : 'text-slate-500'}`}>
                  Stock Actual
                </div>
                <div className={`text-2xl font-black ${isLow ? 'text-red-500' : 'text-white'}`}>
                  {product.currentStock}
                </div>
              </div>

              {isLow && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-red-500 flex items-center justify-center rounded-bl-xl">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cierre de Turno Modal */}
      <AnimatePresence>
        {isClosingShift && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060c19]/90 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-500" /> Cierre de Turno Inteligente
                </h3>
                <button onClick={() => { setIsClosingShift(false); setClosureResult(null); }} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {!closureResult ? (
                  <>
                    <p className="text-slate-400 mb-6">
                      Instrucciones: Simplemente ve a la refrigeradora/vitrina y anota cuántas unidades ves físicamente de cada producto. El sistema calculará el resto.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map(p => (
                        <div key={p.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{p.image}</span>
                            <div>
                              <div className="font-bold text-sm">{p.name}</div>
                              <div className="text-xs text-slate-500">Stock Inicial: {p.initialStock}</div>
                            </div>
                          </div>
                          <input
                            type="number"
                            min="0"
                            placeholder={p.initialStock.toString()}
                            value={physicalCounts[p.id] !== undefined ? physicalCounts[p.id] : ''}
                            onChange={(e) => handlePhysicalCountChange(p.id, e.target.value)}
                            className="w-16 h-12 bg-slate-900 border border-slate-600 rounded-lg text-center text-lg font-bold outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <DollarSign className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-300 mb-2">Cuadre de Caja Esperado</h2>
                    <div className="text-6xl font-black text-emerald-400 mb-8">
                      S/ {closureResult.totalExpected.toFixed(2)}
                    </div>

                    <div className="w-full max-w-2xl bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                      <h4 className="font-bold mb-4 border-b border-slate-700 pb-2">Detalle de Ventas Calculadas</h4>
                      {closureResult.details.length > 0 ? (
                        <div className="space-y-3">
                          {closureResult.details.map((d, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">{d.missing}x {d.name}</span>
                              <span className="font-bold text-emerald-400">+ S/ {d.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-4">No se registraron diferencias de stock (Cero ventas).</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/80 px-6 py-4 border-t border-slate-700 flex justify-end shrink-0">
                {!closureResult ? (
                  <button onClick={calculateClosure} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg shadow-emerald-500/20">
                    Calcular Cuadre
                  </button>
                ) : (
                  <button onClick={finishClosure} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Confirmar y Cerrar Turno
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de Gestión de Productos */}
        {isManaging && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060c19]/90 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-800/80 px-6 py-4 flex justify-between items-center border-b border-slate-700 shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <PackageOpen className="w-5 h-5 text-emerald-500" /> Gestión de Inventario
                </h3>
                <button onClick={() => { setIsManaging(false); setEditingProduct(null); }} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {editingProduct ? (
                  <div className="max-w-md mx-auto bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h4 className="font-bold mb-4">{editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 font-bold mb-1 block">Nombre</label>
                        <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 font-bold mb-1 block">Precio (S/)</label>
                          <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 font-bold mb-1 block">Emoji (Icono)</label>
                          <input type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 text-center" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 font-bold mb-1 block">Stock Actual</label>
                          <input type="number" value={editingProduct.currentStock} onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            setEditingProduct({...editingProduct, currentStock: val, initialStock: val});
                          }} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 font-bold mb-1 block">Stock Mínimo (Alerta)</label>
                          <input type="number" value={editingProduct.minStock} onChange={e => setEditingProduct({...editingProduct, minStock: parseInt(e.target.value) || 0})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <button onClick={() => setEditingProduct(null)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                        <button onClick={() => handleSaveProduct(editingProduct)} className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-400">
                          <Save className="w-4 h-4" /> Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-slate-400">Agrega o modifica los productos que se venden en tu club.</p>
                      <button 
                        onClick={() => setEditingProduct({ id: '', name: '', price: 0, initialStock: 0, currentStock: 0, minStock: 5, category: 'General', image: '📦' })}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700"
                      >
                        <Plus className="w-4 h-4" /> Nuevo Producto
                      </button>
                    </div>
                    
                    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/80 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">Precio</th>
                            <th className="px-4 py-3">Stock Actual</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-800/40">
                              <td className="px-4 py-3 flex items-center gap-3">
                                <span className="text-xl">{p.image}</span>
                                <span className="font-bold">{p.name}</span>
                              </td>
                              <td className="px-4 py-3 text-emerald-400 font-bold">S/ {p.price.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${p.currentStock <= p.minStock ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white'}`}>
                                  {p.currentStock} ud.
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => setEditingProduct(p)} className="text-emerald-500 hover:text-emerald-400 p-2 bg-emerald-500/10 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
