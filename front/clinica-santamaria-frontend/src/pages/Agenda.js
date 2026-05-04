// ─────────────────────────────────────────────
// pages/Agenda.js
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { pacienteApi, consultaApi } from '../api/api';

// ─────────────────────────────────────────────
// HELPERS DE DATA
// ─────────────────────────────────────────────

// "2026-05-04" → "04/05/2026"
function fmt(date) {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
}

// "2026-05-04" → "Seg", "Ter", ...
function diaSemana(dateStr) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return dias[new Date(dateStr + 'T00:00:00').getDay()];
}

// Retorna array com os 7 dias da semana atual (Dom→Sáb ou Seg→Dom)
// começando pela segunda-feira da semana corrente
function diasDaSemana(dataReferencia) {
  const ref = new Date(dataReferencia + 'T00:00:00');
  // Encontra a segunda-feira da semana
  const diaDaSemana = ref.getDay(); // 0=Dom,1=Seg,...,6=Sáb
  const diffParaSeg = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
  const seg = new Date(ref);
  seg.setDate(ref.getDate() + diffParaSeg);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    return d.toISOString().split('T')[0]; // "2026-05-04"
  });
}

// "2026-05-04" string a partir de um Date
function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export default function Agenda() {

  // ── Semana atual (baseada em hoje) ────────────
  const hoje = toDateStr(new Date());
  const [semanaBase, setSemanaBase] = useState(hoje);
  const diasSemana = diasDaSemana(semanaBase);

  // ── Consultas: mapa { "2026-05-04": [ConsultaResponse, ...] }
  const [consultasPorDia, setConsultasPorDia] = useState({});
  const [loadingSemana,   setLoadingSemana]   = useState(true);

  // ── Busca de paciente por data de nascimento ──
  const [dataNasc,    setDataNasc]    = useState('');
  const [resultados,  setResultados]  = useState(null); // null = não buscou ainda
  const [loadingBusca, setLoadingBusca] = useState(false);

  const [toast, setToast] = useState('');

  // ─────────────────────────────────────────────
  // Carrega consultas dos 7 dias da semana visível
  // ─────────────────────────────────────────────
  useEffect(() => {
    carregarSemana(diasSemana);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaBase]);

  async function carregarSemana(dias) {
    setLoadingSemana(true);
    try {
      // Faz 7 requisições em paralelo, uma por dia
      const respostas = await Promise.all(
        dias.map(dia =>
          consultaApi.buscarPorData(dia)
            .then(r => ({ dia, consultas: r.data ?? [] }))
            .catch(() => ({ dia, consultas: [] })) // dia sem consultas não quebra
        )
      );

      const mapa = {};
      respostas.forEach(({ dia, consultas }) => {
        mapa[dia] = consultas;
      });
      setConsultasPorDia(mapa);
    } catch (e) {
      mostrarToast('Erro ao carregar agenda da semana');
    } finally {
      setLoadingSemana(false);
    }
  }

  // ─────────────────────────────────────────────
  // Navega entre semanas
  // ─────────────────────────────────────────────
  function semanaAnterior() {
    const ref = new Date(semanaBase + 'T00:00:00');
    ref.setDate(ref.getDate() - 7);
    setSemanaBase(toDateStr(ref));
  }

  function proximaSemana() {
    const ref = new Date(semanaBase + 'T00:00:00');
    ref.setDate(ref.getDate() + 7);
    setSemanaBase(toDateStr(ref));
  }

  function semanaAtual() {
    setSemanaBase(hoje);
  }

  // ─────────────────────────────────────────────
  // Deletar consulta
  // ─────────────────────────────────────────────
  async function deletarConsulta(id, dia) {
    if (!window.confirm('Remover esta consulta?')) return;
    try {
      await consultaApi.deletar(id);
      setConsultasPorDia(prev => ({
        ...prev,
        [dia]: prev[dia].filter(c => c.consultaID !== id),
      }));
      mostrarToast('✓ Consulta removida');
    } catch {
      mostrarToast('Erro ao remover consulta');
    }
  }

  // ─────────────────────────────────────────────
  // Busca paciente por data de nascimento
  // ─────────────────────────────────────────────
  async function buscarPaciente() {
    if (!dataNasc) return;
    setLoadingBusca(true);
    setResultados(null);
    try {
      const r = await pacienteApi.buscarPorData(dataNasc);
      const lista = r.data ?? [];
      setResultados(lista);
    } catch (e) {
      if (e.response?.status === 404) {
        setResultados([]);
      } else {
        mostrarToast('Erro ao buscar paciente');
      }
    } finally {
      setLoadingBusca(false);
    }
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  }

  // ─────────────────────────────────────────────
  // Total de consultas na semana visível
  // ─────────────────────────────────────────────
  const totalSemana = Object.values(consultasPorDia)
    .reduce((acc, lista) => acc + lista.length, 0);

  // Label do intervalo da semana: "05/05/2026 – 11/05/2026"
  const labelSemana = `${fmt(diasSemana[0])} – ${fmt(diasSemana[6])}`;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="page">

      {/* ══════════════════════════
          BUSCA POR DATA DE NASCIMENTO
      ══════════════════════════ */}
      <div className="card">
        <div className="card-header">🔍 Buscar Paciente</div>

        <div className="form-grid form-grid-2" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input
              type="date"
              value={dataNasc}
              onChange={e => { setDataNasc(e.target.value); setResultados(null); }}
              onKeyDown={e => e.key === 'Enter' && buscarPaciente()}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={buscarPaciente}
            disabled={!dataNasc || loadingBusca}
          >
            {loadingBusca ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* ── Resultados da busca ── */}
        {resultados !== null && (
          <div style={{ margin: '0 20px 16px' }}>

            {/* Nenhum paciente com essa data */}
            {resultados.length === 0 && (
              <div className="alert alert-danger">
                Paciente não cadastrado
              </div>
            )}

            {/* Pacientes encontrados */}
            {resultados.map(paciente => (
              <div
                key={paciente.pacienteID}
                style={{ border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}
              >
                {/* Cabeçalho do paciente */}
                <div className="profile-header">
                  <div className="profile-avatar">{paciente.nome?.[0]}</div>
                  <div>
                    <div className="profile-name">{paciente.nome}</div>
                    <div className="profile-meta">
                      Nascimento: {fmt(paciente.dataNascimento)}
                      {paciente.numeroProntuario && ` · Prontuário Nº ${paciente.numeroProntuario}`}
                    </div>
                  </div>
                  <span className="tag tag-green" style={{ marginLeft: 'auto' }}>Encontrado</span>
                </div>

                {/* Informações básicas */}
                <div className="form-grid form-grid-3" style={{ padding: '12px 16px 0' }}>
                  <div><label>CPF</label><p style={{ fontSize: 13 }}>{paciente.cpf || '—'}</p></div>
                  <div><label>Celular</label><p style={{ fontSize: 13 }}>{paciente.celular || '—'}</p></div>
                  <div><label>Profissão</label><p style={{ fontSize: 13 }}>{paciente.profissao || '—'}</p></div>
                </div>

                {/* Consultas do paciente */}
                <div style={{ padding: '10px 16px 14px' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', display: 'block', marginBottom: 8 }}>
                    Consultas agendadas
                  </label>

                  {/* Sem consultas */}
                  {(!paciente.consultaSimplificado || paciente.consultaSimplificado.length === 0) ? (
                    <div className="alert alert-danger" style={{ marginBottom: 0 }}>
                      Paciente não possui consulta
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {paciente.consultaSimplificado.map(c => (
                        <div
                          key={c.consultaId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '8px 12px',
                            background: '#f0f7ff',
                            borderRadius: 5,
                            border: '1px solid #d6e4f0',
                          }}
                        >
                          <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13, minWidth: 90 }}>
                            {fmt(c.dataConsulta)}
                          </span>
                          {c.horario && (
                            <span style={{ fontSize: 12, color: '#555' }}>
                              ⏰ {c.horario}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}

          </div>
        )}
      </div>

      {/* ══════════════════════════
          AGENDA SEMANAL
      ══════════════════════════ */}
      <div className="card">

        {/* ── Cabeçalho com navegação ── */}
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span>📅 Agenda Semanal</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={semanaAnterior}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                borderRadius: 4,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
              }}
            >‹</button>

            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 180, textAlign: 'center' }}>
              {labelSemana}
            </span>

            <button
              onClick={proximaSemana}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.4)',
                color: 'white',
                borderRadius: 4,
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
              }}
            >›</button>

            {semanaBase !== hoje && (
              <button
                onClick={semanaAtual}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  borderRadius: 4,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Hoje
              </button>
            )}
          </div>
        </div>

        {/* Contagem total */}
        <div className="agenda-info">
          {loadingSemana
            ? 'Carregando...'
            : `${totalSemana} consulta(s) nesta semana`}
        </div>

        {/* ── Dias da semana ── */}
        {loadingSemana ? (
          <div className="loading">Carregando agenda...</div>
        ) : (
          diasSemana.map(dia => {
            const consultas = consultasPorDia[dia] ?? [];
            const ehHoje    = dia === hoje;

            return (
              <div key={dia}>

                {/* Cabeçalho do dia */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  background: ehHoje ? '#dbeafe' : '#f7f9fc',
                  borderTop: '1px solid #e8edf2',
                  borderBottom: consultas.length > 0 ? 'none' : '1px solid #e8edf2',
                }}>
                  {/* Indicador de hoje */}
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: ehHoje ? '#1e3a5f' : 'transparent',
                    border: ehHoje ? 'none' : '2px solid #d1d5db',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: ehHoje ? 'white' : '#6b7280',
                      lineHeight: 1,
                      textTransform: 'uppercase',
                    }}>
                      {diaSemana(dia)}
                    </span>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: ehHoje ? 'white' : '#1e3a5f',
                      lineHeight: 1.3,
                    }}>
                      {new Date(dia + 'T00:00:00').getDate()}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ehHoje ? '#1e3a5f' : '#374151' }}>
                      {fmt(dia)}
                      {ehHoje && (
                        <span style={{
                          marginLeft: 8,
                          fontSize: 10,
                          background: '#1e3a5f',
                          color: 'white',
                          padding: '2px 7px',
                          borderRadius: 10,
                          fontWeight: 700,
                          verticalAlign: 'middle',
                        }}>
                          HOJE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {consultas.length === 0
                        ? 'Sem consultas'
                        : `${consultas.length} consulta(s)`}
                    </div>
                  </div>
                </div>

                {/* Consultas do dia */}
                {consultas.map(c => (
                  <div className="agenda-row" key={c.consultaID}>

                    <div className="agenda-time" style={{ fontSize: 13 }}>
                      {c.horario ? c.horario.substring(0, 5) : '—'}
                    </div>

                    <div>
                      <div className="patient-name">
                        {c.pacienteSimplificado?.nome ?? 'Paciente'}
                      </div>
                      <div className="patient-meta">
                        {c.consultaPreNatal ? '🤰 Pré-natal' : 'Consulta comum'}
                        {c.retorno && ` · Retorno ${c.retorno}`}
                      </div>
                    </div>

                    <button
                      className="btn btn-danger"
                      onClick={() => deletarConsulta(c.consultaID, dia)}
                    >
                      Deletar
                    </button>

                  </div>
                ))}

              </div>
            );
          })
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}