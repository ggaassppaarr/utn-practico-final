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
  Moon,
  Sun,
  X,
  User,
} from 'lucide-react';

import LoginModal from './LoginModal';

function App() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  // const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Persistencia en localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved) setDarkMode(saved === 'true');
  }, []);
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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
    } catch {
      alert('No se pudo descargar el CSV.');
    }
  };

  const handleLogin = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }), // <-- CAMBIA username por email
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setLoginOpen(false);
      } else {
        setLoginError(data.message || 'Credenciales incorrectas');
      }
    } catch {
      setLoginError('Error de red');
    } finally {
      setLoginLoading(false);
    }
  };

  function isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  function getUserEmail() {
    // Decodifica el token JWT para obtener el email
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || '';
    } catch {
      return '';
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  return (
    <div className={darkMode
      ? "min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 text-gray-100"
      : "min-h-screen bg-gradient-to-br from-blue-100 via-indigo-200 to-indigo-400"
    }>
      {/* Top Nav */}
      <nav className={darkMode
        ? "sticky top-0 z-40 border-b bg-gray-900/80 backdrop-blur-md border-gray-700/50"
        : "sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md border-gray-200/50"
      }>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className={
                darkMode
                  ? "flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-xl"
                  : "flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl"
              }>
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="hidden min-[500px]:block">
                <h1 className={
                  darkMode
                    ? "text-xl font-bold text-transparent bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text"
                    : "text-xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text"
                }>
                  CSV Manager
                </h1>
                <p className={
                  (darkMode ? "text-sm text-gray-400" : "text-sm text-gray-500") +
                  " hidden sm:block"
                }>
                  Carga, edición y exportación de registros
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Botones de login/logout */}
              {isLoggedIn() ? (
                <div className="flex items-center space-x-3">
                  <span className={darkMode ? "text-sm text-gray-300" : "text-sm text-gray-700"}>
                    {getUserEmail()}
                  </span>
                  <button
                    onClick={handleLogout}
                    className={darkMode
                      ? "flex items-center px-2 py-2 space-x-2 text-red-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-red-800"
                      : "flex items-center px-2 py-2 space-x-2 text-red-600 transition-all duration-200 rounded-lg hover:text-white hover:bg-red-600"
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginOpen(true)}
                  className={darkMode
                    ? "flex items-center px-4 py-2 space-x-2 text-gray-300 transition-all duration-200 rounded-lg hover:text-white hover:bg-gray-800"
                    : "flex items-center px-4 py-2 space-x-2 text-gray-600 transition-all duration-200 rounded-lg hover:text-gray-900 hover:bg-gray-100"
                  }
                >
                  <span className="hidden sm:inline">Login</span>
                  <User className="w-4 h-4" />
                </button>
              )}
              {/* Toggle dark/light theme aquí, alineado a la derecha */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode
                  ? "flex items-center px-2 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-yellow-300 ml-2"
                  : "flex items-center px-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-indigo-600 ml-2"
                }
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Botón Actualizar centrado debajo del header */}
      <div className="flex justify-center px-4 py-4 mx-auto max-w-7xl">
  <button
    onClick={fetchData}
    className={
      darkMode
        ? "flex items-center px-6 py-3 space-x-2 font-semibold text-gray-200 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 hover:text-white transition-all duration-200"
        : "flex items-center px-6 py-3 space-x-2 font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all duration-200"
    }
  >
    <RefreshCw className="w-5 h-5 mr-2" />
    <span>Actualizar</span>
  </button>
</div>

      <div className="px-4 pt-0 pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats */}
        <div className={
          darkMode
            ? "grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3"
            : "grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3"
        }>
          <div className={
            darkMode
              ? "p-6 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-lg"
              : "p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg"
          }>
            <div className="flex items-center justify-between">
              <div>
                <p className={darkMode ? "text-sm font-medium text-gray-400" : "text-sm font-medium text-gray-600"}>Total Registros</p>
                <p className={darkMode ? "text-3xl font-bold text-gray-100" : "text-3xl font-bold text-gray-900"}>{rows.length}</p>
              </div>
              <div className={
                darkMode
                  ? "flex items-center justify-center w-12 h-12 bg-indigo-900 rounded-xl"
                  : "flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl"
              }>
                <FileSpreadsheet className={darkMode ? "w-6 h-6 text-indigo-300" : "w-6 h-6 text-blue-600"} />
              </div>
            </div>
          </div>
          <div className={
            darkMode
              ? "p-6 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-lg"
              : "p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg"
          }>
            <div className="flex items-center justify-between">
              <div>
                <p className={darkMode ? "text-sm font-medium text-gray-400" : "text-sm font-medium text-gray-600"}>Columnas</p>
                <p className={darkMode ? "text-3xl font-bold text-gray-100" : "text-3xl font-bold text-gray-900"}>{rows[0] ? Object.keys(rows[0]).length : 0}</p>
              </div>
              <div className={
                darkMode
                  ? "flex items-center justify-center w-12 h-12 bg-green-900 rounded-xl"
                  : "flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl"
              }>
                <Edit3 className={darkMode ? "w-6 h-6 text-green-300" : "w-6 h-6 text-green-600"} />
              </div>
            </div>
          </div>
          <div className={
            darkMode
              ? "p-6 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-lg"
              : "p-6 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-lg"
          }>
            <div className="flex items-center justify-between">
              <div>
                <p className={darkMode ? "text-sm font-medium text-gray-400" : "text-sm font-medium text-gray-600"}>Exportable</p>
                <p className={darkMode ? "text-3xl font-bold text-gray-100" : "text-3xl font-bold text-gray-900"}>Sí</p>
              </div>
              <div className={
                darkMode
                  ? "flex items-center justify-center w-12 h-12 bg-purple-900 rounded-xl"
                  : "flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl"
              }>
                <Download className={darkMode ? "w-6 h-6 text-purple-300" : "w-6 h-6 text-purple-600"} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          {/* Upload */}
          <div className={darkMode
  ? "p-8 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-xl flex flex-col justify-between h-full"
  : "p-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl flex flex-col justify-between h-full"
}>
  <div>
    <div className="flex items-center mb-6 space-x-3">
      <div className={darkMode
        ? "flex items-center justify-center w-10 h-10 bg-indigo-900 rounded-xl"
        : "flex items-center justify-center w-10 h-10 bg-blue-100 rounded-xl"
      }>
        <Upload className={darkMode ? "w-5 h-5 text-indigo-300" : "w-5 h-5 text-blue-600"} />
      </div>
      <h2 className={darkMode ? "text-xl font-semibold text-gray-100" : "text-xl font-semibold text-gray-900"}>Cargar archivo</h2>
    </div>
    <div className="space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className={darkMode
          ? "block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-950 file:to-indigo-900 file:text-indigo-200 hover:file:from-indigo-900 hover:file:to-indigo-800 file:cursor-pointer file:transition-all file:duration-200"
          : "block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-50 file:to-indigo-50 file:text-blue-700 hover:file:from-blue-100 hover:file:to-indigo-100 file:cursor-pointer file:transition-all file:duration-200"
        }
      />
    </div>
  </div>
  <div className="flex items-center justify-end mt-6 sm:justify-end">
    <button
      onClick={handleUpload}
      disabled={!file || isUploading}
      className={darkMode
        ? "flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-indigo-800 to-indigo-600 hover:from-indigo-900 hover:to-indigo-700 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        : "flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      }
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
          <div className={darkMode
  ? "p-8 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-xl flex flex-col justify-between h-full"
  : "p-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl flex flex-col justify-between h-full"
}>
  <div>
    <div className="flex items-center mb-6 space-x-3">
      <div className={darkMode
        ? "flex items-center justify-center w-10 h-10 bg-green-900 rounded-xl"
        : "flex items-center justify-center w-10 h-10 bg-green-100 rounded-xl"
      }>
        <Download className={darkMode ? "w-5 h-5 text-green-300" : "w-5 h-5 text-green-600"} />
      </div>
      <h2 className={darkMode ? "text-xl font-semibold text-gray-100" : "text-xl font-semibold text-gray-900"}>Exportar datos</h2>
    </div>
    <p className={darkMode ? "mb-4 text-gray-400" : "mb-4 text-gray-600"}>Descargá todos los registros actuales en formato CSV.</p>
  </div>
  <div className="flex items-center justify-end mt-6 sm:justify-end">
    <button
      onClick={downloadCSV}
      className={darkMode
        ? "flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-900 hover:to-emerald-900 rounded-xl hover:scale-105"
        : "flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl hover:scale-105"
      }
    >
      <Download className="w-4 h-4" />
      <span>Exportar CSV</span>
    </button>
  </div>
</div>
        </div>

        {/* New Record */}
        <div className={
          darkMode
            ? "p-8 mb-8 transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-xl"
            : "p-8 mb-8 transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl"
        }>
          <div className="flex items-center mb-6 space-x-3">
            <div className={
              darkMode
                ? "flex items-center justify-center w-10 h-10 bg-purple-900 rounded-xl"
                : "flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl"
            }>
              <Edit3 className={darkMode ? "w-5 h-5 text-purple-300" : "w-5 h-5 text-purple-600"} />
            </div>
            <h2 className={darkMode ? "text-xl font-semibold text-gray-100" : "text-xl font-semibold text-gray-900"}>Agregar nuevo registro</h2>
          </div>

          {rows[0] ? (
            <>
              <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3">
                {Object.keys(rows[0]).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className={darkMode ? "block text-sm font-medium text-gray-300 capitalize" : "block text-sm font-medium text-gray-700 capitalize"}>{key.replace('_', ' ')}</label>
                    <input
                      type="text"
                      placeholder={key}
                      value={newRow[key] || ''}
                      onChange={(e) => setNewRow({ ...newRow, [key]: e.target.value })}
                      className={
                        darkMode
                          ? "w-full px-3 py-2 sm:px-5 sm:py-3 transition-all duration-200 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 text-sm"
                          : "w-full px-3 py-2 sm:px-5 sm:py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAdd}
                  className={
                    darkMode
                      ? "inline-flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-purple-800 to-pink-800 hover:from-purple-900 hover:to-pink-900 rounded-xl hover:scale-105"
                      : "inline-flex items-center px-6 py-3 space-x-2 font-semibold text-white transition-all duration-200 transform bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl hover:scale-105"
                  }
                >
                  <Save className="w-4 h-4" />
                  <span>Añadir registro</span>
                </button>
              </div>
            </>
          ) : (
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Cargá un CSV para poder agregar registros.</p>
          )}
        </div>

        {/* Data Table */}
        <div className={
          darkMode
            ? "overflow-hidden transition-all duration-300 border bg-gray-900/70 backdrop-blur-sm rounded-2xl border-gray-700/50 hover:shadow-xl"
            : "overflow-hidden transition-all duration-300 border bg-white/70 backdrop-blur-sm rounded-2xl border-gray-200/50 hover:shadow-xl"
        }>
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <h2 className={darkMode ? "text-xl font-semibold text-gray-100" : "text-xl font-semibold text-gray-900"}>Registros</h2>
            <button
              onClick={downloadCSV}
              className={
                darkMode
                  ? "flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 bg-indigo-800 hover:bg-indigo-900 rounded-xl"
                  : "flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              }
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className={darkMode ? "w-8 h-8 text-indigo-300 animate-spin" : "w-8 h-8 text-blue-600 animate-spin"} />
              </div>
            ) : rows.length === 0 ? (
              <div className="py-12 text-center">
                <FileSpreadsheet className={darkMode ? "w-16 h-16 mx-auto mb-4 text-gray-700" : "w-16 h-16 mx-auto mb-4 text-gray-300"} />
                <p className={darkMode ? "text-lg text-gray-400" : "text-lg text-gray-500"}>No hay registros disponibles</p>
              </div>
            ) : (
              <table className={darkMode ? "min-w-full divide-y divide-gray-700/50" : "min-w-full divide-y divide-gray-200/50"}>
                <thead className={darkMode ? "bg-gray-900/50" : "bg-gray-50/50"}>
                  <tr>
                    {Object.keys(rows[0]).map((key) => (
                      <th
                        key={key}
                        className={darkMode
                          ? "px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-300 uppercase"
                          : "px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase"
                        }
                      >
                        {key.replace('_', ' ')}
                      </th>
                    ))}
                    <th className={darkMode
                      ? "px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-300 uppercase"
                      : "px-6 py-4 text-xs font-semibold tracking-wider text-right text-gray-600 uppercase"
                    }>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={darkMode ? "divide-y divide-gray-700/30" : "divide-y divide-gray-200/30"}>
                  {rows.map((row, i) => (
                    <tr key={i} className={darkMode ? "transition-colors duration-150 hover:bg-gray-900/50" : "transition-colors duration-150 hover:bg-gray-50/50"}>
                      {Object.keys(row).map((key) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap">
                          <input
                            value={row[key]}
                            onChange={(e) => {
                              const updated = [...rows];
                              updated[i][key] = e.target.value;
                              setRows(updated);
                            }}
                            onFocus={key === 'id' ? (e) => e.target.select() : undefined}
                            className={
                              key === 'id'
                                ? (
                                  darkMode
                                    ? "w-full min-w-[40px] px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 overflow-x-auto"
                                    : "w-full min-w-[40px] px-1 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-x-auto"
                                )
                                : (
                                  darkMode
                                    ? "w-full px-1 py-1 sm:px-3 sm:py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100"
                                    : "w-full px-1 py-1 sm:px-3 sm:py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                )
                            }
                            style={key === 'id' ? { fontFamily: 'monospace' } : undefined}
                          />
                        </td>
                      ))}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleUpdate(i, row)}
                            className={
                              darkMode
                                ? "inline-flex items-center px-3 py-1.5 bg-green-900 hover:bg-green-800 text-green-300 text-sm font-medium rounded-lg transition-colors duration-150"
                                : "inline-flex items-center px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-lg transition-colors duration-150"
                            }
                          >
                            <Save className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Guardar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(i)}
                            className={
                              darkMode
                                ? "inline-flex items-center px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-300 text-sm font-medium rounded-lg transition-colors duration-150"
                                : "inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors duration-150"
                            }
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Eliminar</span>
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

        {/* Login Modal */}
        <LoginModal
  open={loginOpen}
  onClose={() => setLoginOpen(false)}
  onLogin={handleLogin}
  loading={loginLoading}
  error={loginError}
/>
      </div>
    </div>
  );
}

export default App;