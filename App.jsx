import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import './App.css';

export default function EcoColeta() {
  const [tipoResiduo, setTipoResiduo] = useState('Plástico');
  const [ponto, setPonto] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const registrarPonto = async () => {
    try {
      setCarregando(true);
      setMensagem('Obtendo localização GPS...');
      setPonto(null);

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });

      const novoPonto = {
        tipo: tipoResiduo,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        data: new Date().toISOString()
      };

      setPonto(novoPonto);
      setMensagem('Ponto de coleta registrado com sucesso!');
      console.log('JSON para o banco:', JSON.stringify(novoPonto, null, 2));
    } catch (erro) {
      console.error('Erro ao capturar GPS:', erro);
      setMensagem('Não foi possível capturar a localização. Verifique o GPS e as permissões.');
    } finally {
      setCarregando(false);
    }
  };

  const abrirGoogleMaps = () => {
    if (!ponto) return;
    const url = `https://www.google.com/maps?q=${ponto.lat},${ponto.lng}`;
    window.open(url, '_system');
  };

  return (
    <main className="container">
      <header className="header">
        <div className="logo">♻️</div>
        <h1>EcoColeta</h1>
        <p>Conectando pessoas a um futuro mais sustentável.</p>
      </header>

      <section className="card">
        <h2>Registrar ponto de coleta</h2>

        <label htmlFor="residuo">Selecione o tipo de resíduo:</label>
        <select
          id="residuo"
          value={tipoResiduo}
          onChange={(e) => setTipoResiduo(e.target.value)}
        >
          <option value="Plástico">Plástico</option>
          <option value="Vidro">Vidro</option>
          <option value="Orgânico">Orgânico</option>
          <option value="Metal">Metal</option>
          <option value="Eletrônicos">Eletrônicos</option>
        </select>

        <button
          className="btn-registrar"
          onClick={registrarPonto}
          disabled={carregando}
        >
          {carregando ? 'Capturando GPS...' : '📍 Registrar ponto de coleta'}
        </button>

        {mensagem && <p className="mensagem">{mensagem}</p>}

        {ponto && (
          <div className="resultado">
            <h3>✅ Ponto registrado!</h3>
            <p><strong>Resíduo:</strong> {ponto.tipo}</p>
            <p><strong>Latitude:</strong> {ponto.lat}</p>
            <p><strong>Longitude:</strong> {ponto.lng}</p>
            <p><strong>Data:</strong> {new Date(ponto.data).toLocaleString('pt-BR')}</p>

            <button className="btn-maps" onClick={abrirGoogleMaps}>
              🌎 Ver localização no Google Maps
            </button>

            <h3>JSON gerado</h3>
            <pre>{JSON.stringify(ponto, null, 2)}</pre>
          </div>
        )}
      </section>

      <footer>
        <p>EcoColeta © 2026 - Descarte consciente, cidade sustentável.</p>
      </footer>
    </main>
  );
}
