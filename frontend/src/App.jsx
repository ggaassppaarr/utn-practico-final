import React, { useState, useEffect } from 'react';
import './index.css';
import {
  Upload,
  Download,
  Save,
  Trash2,
  Database,
  FileSpreadsheet,
  Edit3,
  RefreshCw,
} from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/data');
      const json = await res.json();
      setRows(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('http://localhost:3001/upload', { method: 'POST', body: formData });
      setFile(null);
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error subiendo el archivo. ¿Está corriendo el backend en :3001?');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async () => {
    if (Object.keys(newRow).length === 0) return;
    try {
      await fetch('http://localhost:3001/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow),
      });
      setNewRow({});
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error agregando el registro.');
    }
  };

  const handleUpdate = async (i, row) => {
    try {
      await fetch(`http://localhost:3001/data/${i}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error guardando el registro.');
    }
  };

  const handleDelete = async (i) => {
    try {
      await fetch(`http://localhost:3001/data/${i}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Error eliminando el registro.');
    }
  };

  const downloadCSV = () => {
    try {
      window.location.href = 'http://localhost:3001/export';
    } catch (e) {
      console.error(e);
      alert('No se pudo descargar el CSV.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md border-gray-200/50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text">
                  CSV Manager
                </h1>
                <p className="text-sm text-gray-500">Carga, edición y exportación de registros</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center px-4 py-2 space-x-2 text-gray-600 transition-all duration-200 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
          <div className="p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-3xl font-bold text-gray-900">{rows.length}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Columnas</p>
                <p className="text-3xl font-bold text-gray-900">{rows[0] ? Object.keys(rows[0]).length : 0}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
                <Edit3 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exportable</p>
                <p className="text-3xl font-bold text-gray-900">Sí</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          {/* Upload */}
          <div className="p-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl">
            <div className="flex items-center mb-6 space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Cargar archivo</h2>
            </div>

            <div className="space-y-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:cursor-pointer file:transition-all file:duration-200"
              />

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="flex items-center justify-center w-full px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Subir archivo CSV</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Export */}
          <div className="p-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl">
            <div className="flex items-center mb-6 space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Exportar datos</h2>
            </div>
            <p className="mb-4 text-gray-600">Descargá todos los registros actuales en formato CSV.</p>
            <button
              onClick={downloadCSV}
              className="flex items-center justify-center w-full px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* New Record */}
        <div className="p-8 mb-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl">
          <div className="flex items-center mb-6 space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl">
              <Edit3 className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Agregar nuevo registro</h2>
          </div>

          {rows[0] ? (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.keys(rows[0]).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key.replace('_', ' ')}</label>
                    <input
                      type="text"
                      placeholder={key}
                      value={newRow[key] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [key]: e.target.value })}
                      className="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleAdd}
                className="inline-flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Añadir registro</span>
              </button>
            </>
          ) : (
            <p className="text-gray-500">Cargá un CSV para poder agregar registros.</p>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-hidden transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2 className="text-xl font-semibold text-gray-900">Registros</h2>
            <button
              onClick={downloadCSV}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center">
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500">No hay registros disponibles</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gray-50/50">
                  <tr>
                    {Object.keys(rows[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase"
                      >
                        {key.replace('_', ' ')}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/30">
                  {rows.map((row, i) => (
                    <tr key={i} className="transition-colors duration-150 hover:bg-gray-50/50">
                      {Object.keys(row).map((key) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap">
                          <input
                            value={row[key]}
                            onChange={(e) => {
                              const updated = [...rows];
                              updated[i][key] = e.target.value;
                              setRows(updated);
                            }}
                            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUpdate(i, row)}
                            className="inline-flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors duration-150"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Guardar
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors duration-150"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
