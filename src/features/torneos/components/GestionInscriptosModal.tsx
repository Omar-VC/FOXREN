// src/features/torneos/components/GestionInscriptosModal.tsx

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { obtenerInscriptosPorTorneo, cambiarEstadoInscripcion } from '../../../infrastructure/repositories/torneosRepository';

interface Props {
  torneo: any;
  onClose: () => void;
}

export const GestionInscriptosModal = ({ torneo, onClose }: Props) => {
  const [inscriptos, setInscriptos] = useState<any[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [loading, setLoading] = useState<boolean>(true);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const data = await obtenerInscriptosPorTorneo(torneo.id);
      setInscriptos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (torneo?.id) cargarDatos();
  }, [torneo]);

  const handleCambiarEstado = async (id: string, estado: string) => {
    await cambiarEstadoInscripcion(id, estado);
    cargarDatos();
  };

  const inscriptosFiltrados = categoriaFiltro === 'TODAS'
    ? inscriptos
    : inscriptos.filter(i => i.categoria === categoriaFiltro);

  const totalParejas = inscriptos.length;
  const precioBase = torneo.precioInscripcionBase || torneo.precioInscripcion || torneo.precioBase || 0;
  const feeFoxren = torneo.feeFoxrenPorPareja || torneo.feeFoxren || 0;

  const recaudadoOrganizador = totalParejas * precioBase;
  const recaudadoFoxren = totalParejas * feeFoxren;

  // Parser exhaustivo para obtener el nombre del jugador sin importar el nombre exacto de la propiedad en la BD
  const obtenerNombreJugador = (item: any, num: 1 | 2) => {
    const j = num === 1 ? item.jugador1 : item.jugador2;
    
    const nombre = 
      j?.nombre || 
      item[`nombreJugador${num}`] || 
      item[`jugador${num}Nombre`] || 
      item[`nombreJ${num}`] || 
      item[`j${num}Nombre`] || 
      item[`nombre${num}`] || 
      '';

    const apellido = 
      j?.apellido || 
      item[`apellidoJugador${num}`] || 
      item[`jugador${num}Apellido`] || 
      item[`apellidoJ${num}`] || 
      item[`j${num}Apellido`] || 
      item[`apellido${num}`] || 
      '';

    const nombreCompletoDirecto = item[`nombreJugador${num}Completo`] || item[`jugador${num}Completo`];

    if (nombreCompletoDirecto) return nombreCompletoDirecto;
    if (nombre || apellido) return `${nombre} ${apellido}`.trim();
    return `Jugador ${num}`;
  };

  // Parser para obtener el DNI
  const obtenerDniJugador = (item: any, num: 1 | 2) => {
    const j = num === 1 ? item.jugador1 : item.jugador2;
    return (
      j?.dni || 
      item[`dniJugador${num}`] || 
      item[`jugador${num}Dni`] || 
      item[`dniJ${num}`] || 
      item[`dni${num}`] || 
      'S/D'
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-hidden">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col relative">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Panel de Gestión: {torneo.nombre}</h2>
            <p className="text-xs text-gray-400">Administración de Parejas e Liquidación</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-lg p-1 cursor-pointer">✕</button>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 shrink-0">
          <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg">
            <span className="text-xs text-gray-400 block">Total Parejas</span>
            <span className="text-lg font-bold text-white">{totalParejas}</span>
          </div>
          <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg">
            <span className="text-xs text-gray-400 block">Recaudado Organizador</span>
            <span className="text-lg font-bold text-green-400">${recaudadoOrganizador.toLocaleString()}</span>
          </div>
          <div className="bg-gray-950 border border-gray-800 p-3 rounded-lg">
            <span className="text-xs text-gray-400 block">Canon / Fee FOXREN</span>
            <span className="text-lg font-bold text-amber-400">${recaudadoFoxren.toLocaleString()}</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-3 shrink-0">
          <label className="text-xs text-gray-400">Filtrar por Categoría:</label>
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-700 focus:outline-none"
          >
            <option value="TODAS">Todas las categorías</option>
            {torneo.categoriasValidas?.map((cat: string) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tabla de Inscriptos con Scroll */}
        <div className="overflow-y-auto pr-1 flex-1">
          {loading ? (
            <p className="text-center text-xs text-gray-400 py-8">Cargando parejas inscriptas...</p>
          ) : inscriptosFiltrados.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-8">No hay parejas inscriptas en esta categoría.</p>
          ) : (
            <table className="w-full text-left text-xs text-gray-300 border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500">
                  <th className="py-2">Pareja / Jugadores</th>
                  <th className="py-2">Categoría</th>
                  <th className="py-2">Estado Pago</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {inscriptosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30">
                    <td className="py-2.5">
                      <div className="font-semibold text-white">
                        {obtenerNombreJugador(item, 1)} / {obtenerNombreJugador(item, 2)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        DNI: {obtenerDniJugador(item, 1)} - {obtenerDniJugador(item, 2)}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] border border-gray-700">
                        {item.categoria || 'S/C'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.estadoPago === 'pagado' ? 'bg-green-950 text-green-400 border border-green-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {item.estadoPago?.toUpperCase() || 'PENDIENTE'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      {item.estadoPago !== 'pagado' ? (
                        <button
                          onClick={() => handleCambiarEstado(item.id, 'pagado')}
                          className="bg-green-600 hover:bg-green-500 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                        >
                          Marcar Pagado
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCambiarEstado(item.id, 'pendiente')}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-2 py-1 rounded text-[10px] cursor-pointer"
                        >
                          Deshacer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
};