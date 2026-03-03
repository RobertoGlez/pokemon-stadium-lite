import { useEffect, useState } from 'react';
import { apiClient } from './infrastructure/http/axios.client';

function App() {
  const [healthStatus, setHealthStatus] = useState<string>("Obteniendo estado...");

  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        console.log(`[App] Verificando conexión backend en: ${apiClient.defaults.baseURL}`);
        const response = await apiClient.get('/api/health');

        console.log('[App] Conexión Exitosa. Respuesta del Backend:', response.data);
        setHealthStatus(`Conectado a Backend: ${response.data.status || 'OK'}`);
      } catch (error) {
        console.error('[App] Error conectando al Backend:', error);
        setHealthStatus("Fallo en la conexión al Backend. Verifica la URL.");
      }
    };

    checkServerHealth();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Pokémon Stadium Lite</h1>
      <p><strong>Estado del Servidor:</strong> {healthStatus}</p>
    </div>
  );
}

export default App;
