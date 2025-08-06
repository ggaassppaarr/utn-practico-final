

import { useState, useEffect } from 'react';
import './App.css';

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
    const formData = new FormData();
    formData.append('file', file);
    await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
    });
    fetchData();
  };

  const handleAdd = async () => {
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
    await fetch(`http://localhost:3001/data/${i}`, {
      method: 'DELETE',
    });
    fetchData();
  };

  const downloadCSV = () => {
    window.location.href = 'http://localhost:3001/export';
  };

  return (
    <div>
      <h1>Gestión de CSV</h1>
      <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Cargar CSV</button>

      <h2>Nuevo registro</h2>
      {rows[0] && Object.keys(rows[0]).map(key => (
        <input
          key={key}
          placeholder={key}
          value={newRow[key] || ''}
          onChange={e => setNewRow({ ...newRow, [key]: e.target.value })}
        />
      ))}
      <button onClick={handleAdd}>Agregar</button>

      <h2>Registros</h2>
      <table border="1">
        <thead>
          <tr>
            {rows[0] && Object.keys(rows[0]).map(key => <th key={key}>{key}</th>)}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {Object.keys(row).map(key => (
                <td key={key}>
                  <input
                    value={row[key]}
                    onChange={e => {
                      const newRows = [...rows];
                      newRows[i][key] = e.target.value;
                      setRows(newRows);
                    }}
                  />
                </td>
              ))}
              <td>
                <button onClick={() => handleUpdate(i, row)}>Guardar</button>
                <button onClick={() => handleDelete(i)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={downloadCSV}>Exportar CSV</button>
    </div>
  );
};