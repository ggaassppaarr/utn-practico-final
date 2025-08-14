import { useState, useEffect } from 'react';
import './index.css';

export const App = () => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({});

  const fetchData = async () => {
    const res = await fetch('http://localhost:3001/data');
    const json = await res.json();
    setRows(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await fetch('http://localhost:3001/upload', { method: 'POST', body: formData });
    fetchData();
  };

  const handleAdd = async () => {
    if (Object.keys(newRow).length === 0) return;
    await fetch('http://localhost:3001/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRow),
    });
    setNewRow({});
    fetchData();
  };

  const handleUpdate = async (i, row) => {
    await fetch(`http://localhost:3001/data/${i}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    fetchData();
  };

  const handleDelete = async (i) => {
    await fetch(`http://localhost:3001/data/${i}`, { method: 'DELETE' });
    fetchData();
  };

  const downloadCSV = () => {
    window.location.href = 'http://localhost:3001/export';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">

        {/* Header */}
        <header className="text-center">
          <h1 className="text-5xl font-extrabold text-indigo-600">CSV Manager</h1>
          <p className="mt-2 text-gray-600">Carga, edita y exporta tus registros de manera fácil</p>
        </header>

        {/* Upload Section */}
        <section className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={e => setFile(e.target.files[0])}
              className="w-full md:w-auto text-sm text-gray-500 file:mr-4 file:px-4 file:py-2
                file:rounded-lg file:border-0 file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <button
            onClick={handleUpload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg
              shadow transition-transform transform hover:scale-105"
          >
            Subir archivo
          </button>
        </section>

        {/* New Record Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Agregar nuevo registro</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows[0] && Object.keys(rows[0]).map(key => (
              <input
                key={key}
                type="text"
                placeholder={key}
                value={newRow[key] || ''}
                onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2
                  focus:ring-indigo-300"
              />
            ))}
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg
                shadow transition-transform transform hover:scale-105"
            >
              Añadir registro
            </button>
          </div>
        </section>

        {/* Data Table Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Registros</h2>
            <button
              onClick={downloadCSV}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-1 px-4 rounded-lg
                shadow-sm transition-transform transform hover:scale-105"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {rows[0] && Object.keys(rows[0]).map(key => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase"
                    >
                      {key}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-sm font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {Object.keys(row).map(key => (
                      <td key={key} className="px-4 py-2">
                        <input
                          value={row[key]}
                          onChange={e => {
                            const updated = [...rows];
                            updated[i][key] = e.target.value;
                            setRows(updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdate(i, row)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded-lg
                          text-sm transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => handleDelete(i)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg
                          text-sm transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};
