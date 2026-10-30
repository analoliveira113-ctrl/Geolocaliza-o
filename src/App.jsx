import React, { useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import './App.css';

const tiposResiduo = ['Plástico', 'Vidro', 'Orgânico', 'Metal', 'Eletrônicos'];

export default function App() {
  const [tipoResiduo, setTipoResiduo] = useState('Plástico');
  const [registro, setRegistro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('info');

  const solicitarPermissao = async () => {
    const permissao = await Geolocation.requestPermissions();

    if (permissao.location !== 'granted') {
      throw new Error('Permissão de localização negada pelo usuário.');
    }
  };

  const registrarPonto = async () => {
    try {
      setCarregando(true);
      setMensagem('Solicitando acesso à localização do dispositivo...');
      setTipoMensagem('info');

      await solicitarPermissao();

      setMensagem('Capturando coordenadas GPS em alta precisão...');

      const posicao = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      });

      if (!posicao || !posicao.coords) {
        throw new Error('Resposta de localização inválida.');
      }

      const novoRegistro = {
        tipo: tipoResiduo,
        lat: Number(posicao.coords.latitude.toFixed(6)),
        lng: Number(posicao.coords.longitude.toFixed(6)),
        data: new Date().toISOString(),
      };

      setRegistro(novoRegistro);
      setMensagem('Ponto de coleta registrado com sucesso!');
      setTipoMensagem('success');
      console.log('JSON do ponto registrado:', JSON.stringify(novoRegistro, null, 2));
    } catch (erro) {
      console.error('Erro ao registrar ponto:', erro);
      setRegistro(null);
      setMensagem(
        erro?.message ||
          'Não foi possível capturar a localização. Verifique o GPS, as permissões e a conexão.'
      );
      setTipoMensagem('error');
    } finally {
      setCarregando(false);
    }
  };

  const abrirGoogleMaps = () => {
    if (!registro) return;
    const url = `https://www.google.com/maps?q=${registro.lat},${registro.lng}`;
    window.open(url, '_blank');
  };

  const formatarData = (valor) => {
    if (!valor) return '—';
    return new Date(valor).toLocaleString('pt-BR');
  };

  return (
    <main className="page-shell">
      <div className="app-container">
        <header className="topbar">
          <div className="brand-mark" aria-hidden="true">♻️</div>
          <div>
            <p className="eyebrow">Descarte seletivo</p>
            <h1>EcoColeta</h1>
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <span className="panel-badge">Sustentabilidade urbana</span>
            <h2>Registrar ponto de coleta</h2>
          </div>

          <label htmlFor="tipoResiduo" className="field-label">
            Tipo de resíduo
          </label>
          <select
            id="tipoResiduo"
            name="tipoResiduo"
            value={tipoResiduo}
            onChange={(event) => setTipoResiduo(event.target.value)}
            className="select-field"
          >
            {tiposResiduo.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="primary-button"
            onClick={registrarPonto}
            disabled={carregando}
          >
            {carregando ? 'Capturando GPS...' : 'Registrar Ponto de Coleta'}
          </button>

          {mensagem && (
            <div className={`feedback ${tipoMensagem}`} role="status" aria-live="polite">
              {mensagem}
            </div>
          )}

          {registro && (
            <div className="result-card">
              <div className="result-title-row">
                <span className="success-icon" aria-hidden="true">✅</span>
                <h3>Ponto registrado</h3>
              </div>

              <div className="info-grid">
                <p>
                  <strong>Tipo:</strong> {registro.tipo}
                </p>
                <p>
                  <strong>Latitude:</strong> {registro.lat}
                </p>
                <p>
                  <strong>Longitude:</strong> {registro.lng}
                </p>
                <p>
                  <strong>Data:</strong> {formatarData(registro.data)}
                </p>
              </div>

              <button type="button" className="maps-button" onClick={abrirGoogleMaps}>
                Ver no Google Maps
              </button>

              <div className="json-block">
                <h4>JSON gerado</h4>
                <pre>{JSON.stringify(registro, null, 2)}</pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
