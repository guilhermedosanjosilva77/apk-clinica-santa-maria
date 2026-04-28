// ─────────────────────────────────────────────
// pages/Agenda.js
// Tela inicial — agenda do dia + busca de paciente
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { pacienteApi, consultaApi } from '../api/api';

// Formata data "2026-01-15" → "15/01/2026"
function fmt(date) {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}

export default function Agenda() {

  // ── Estados ──────────────────────────────────
  const [consultas, setConsultas] = useState([]);   // lista da agenda
  const [paciente, setPaciente]   = useState(null); // paciente encontrado
  const [notFound, setNotFound]   = useState(false);// paciente não existe
  const [searchId, setSearchId]   = useState('');   // campo de busca
  const [loading, setLoading]     = useState(true); // carregando agenda
  const [toast, setToast]         = useState('');   // notificação

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { carregarAgenda(); }, []);

  // ── Notificação temporária ────────────────────
  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  // ── GET /consulta ─────────────────────────────
  async function carregarAgenda() {
    try {
      const r = await consultaApi.listar();
      setConsultas(r.data);
    } catch {
      mostrarToast('Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  }

  // ── DELETE /consulta/{id} ─────────────────────
  async function deletarConsulta(id) {
    if (!window.confirm('Remover consulta?')) return;
    try {
      await consultaApi.deletar(id);
      setConsultas(prev => prev.filter(c => c.consultaID !== id));
      mostrarToast('✓ Consulta removida');
    } catch {
      mostrarToast('Erro ao remover consulta');
    }
  }

  // ── GET /paciente/{id} ────────────────────────
  async function buscarPaciente() {
    if (!searchId.trim()) return;
    setPaciente(null);
    setNotFound(false);
    try {
      const r = await pacienteApi.buscarPorId(searchId);
      setPaciente(r.data);
    } catch (e) {
      if (e.response?.status === 404) setNotFound(true);
      else mostrarToast('Erro ao buscar paciente');
    }
  }

  // ─────────────────────────────────────────────
  // TELA
  // ─────────────────────────────────────────────
  return (
    <div className="page">

      {/* ══════════════════════════
          BUSCA DE PACIENTE
      ══════════════════════════ */}
      <div className="card">
        <div className="card-header">🔍 Buscar Paciente</div>

        <div className="form-grid form-grid-2" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>ID do Paciente</label>
            <input
              type="number"
              placeholder="Ex.: 1"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarPaciente()}
            />
          </div>
          <button className="btn btn-primary" onClick={buscarPaciente}>
            Buscar
          </button>
        </div>

        {/* Paciente não encontrado */}
        {notFound && (
          <div className="alert alert-danger" style={{ margin: '0 20px 16px' }}>
            ! Paciente não encontrado
          </div>
        )}

        {/* Perfil do paciente encontrado */}
        {paciente && (
          <div style={{ margin: '0 20px 16px', border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden' }}>

            <div className="profile-header">
              <div className="profile-avatar">{paciente.nome?.[0]}</div>
              <div>
                <div className="profile-name">{paciente.nome}</div>
                <div className="profile-meta">Prontuário Nº {paciente.numeroProntuario}</div>
              </div>
              <span className="tag tag-green" style={{ marginLeft: 'auto' }}>Encontrado</span>
            </div>

            <div className="form-grid form-grid-3" style={{ padding: 16 }}>
              <div><label>Nascimento</label><p>{fmt(paciente.dataNascimento)}</p></div>
              <div><label>CPF</label><p>{paciente.cpf || '—'}</p></div>
              <div><label>Estado Civil</label><p>{paciente.estadoCivil || '—'}</p></div>
              <div><label>Profissão</label><p>{paciente.profissao || '—'}</p></div>
              <div><label>Celular</label><p>{paciente.celular || '—'}</p></div>
              <div><label>Email</label><p>{paciente.email || '—'}</p></div>
            </div>

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setPaciente(null)}>Fechar</button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════
          AGENDA DO DIA
      ══════════════════════════ */}
      <div className="card">
        <div className="card-header">📅 Agenda do Dia</div>

        <div className="agenda-info">
          {consultas.length} consulta(s) cadastrada(s)
        </div>

        {/* Carregando */}
        {loading && <div className="loading">Carregando...</div>}

        {/* Sem consultas */}
        {!loading && consultas.length === 0 && (
          <div className="empty">Nenhuma consulta agendada.</div>
        )}

        {/* Lista de consultas */}
        {!loading && consultas.map(c => (
          <div className="agenda-row" key={c.consultaID}>

            {/* Data */}
            <div className="agenda-time">{fmt(c.dataConsulta)}</div>

            {/* Paciente + tipo */}
            <div>
              <div className="patient-name">
                {c.pacienteSimplificado?.nome ?? 'Paciente'}
              </div>
              <div className="patient-meta">
                {c.horario && `⏰ ${c.horario} · `}
                {c.consultaPreNatal ? '🤰 Pré-natal' : 'Consulta comum'}
                {c.retorno && ` · Retorno ${c.retorno}`}
              </div>
            </div>

            {/* Deletar */}
            <button className="btn btn-danger" onClick={() => deletarConsulta(c.consultaID)}>
              Deletar
            </button>

          </div>
        ))}
      </div>

      {/* Notificação */}
      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}
