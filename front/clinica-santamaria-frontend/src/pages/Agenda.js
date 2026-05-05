// ─────────────────────────────────────────────
// pages/Agenda.js
// ─────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function diasDaSemana(dataReferencia) {
  const ref = new Date(dataReferencia + 'T00:00:00');
  const diaDaSemana = ref.getDay(); 
  const diffParaSeg = diaDaSemana === 0 ? -6 : 1 - diaDaSemana;
  const seg = new Date(ref);
  seg.setDate(ref.getDate() + diffParaSeg);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export default function Agenda() {

  const navigate = useNavigate();

  const hoje = toDateStr(new Date());
  const [semanaBase, setSemanaBase] = useState(hoje);
  const diasSemanaVisiveis = diasDaSemana(semanaBase);

  const [consultasPorDia, setConsultasPorDia] = useState({});
  const [loadingSemana, setLoadingSemana] = useState(true);

  const [dataNasc, setDataNasc] = useState('');
  const [resultados, setResultados] = useState(null);
  const [loadingBusca, setLoadingBusca] = useState(false);

  const [toast, setToast] = useState('');

  useEffect(() => {
    carregarSemana(diasSemanaVisiveis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaBase]);

  async function carregarSemana(dias) {
    setLoadingSemana(true);
    try {
      const respostas = await Promise.all(
        dias.map(dia =>
          consultaApi.buscarPorData(dia)
            .then(r => ({ dia, consultas: r.data ?? [] }))
            .catch(() => ({ dia, consultas: [] }))
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

  function remarcarConsulta(c) {
    navigate('/cadastro', { state: { consultaParaRemarcar: c } });
  }

  async function buscarPaciente() {
    if (!dataNasc) return;
    setLoadingBusca(true);
    setResultados(null);
    try {
      const r = await pacienteApi.buscarPorData(dataNasc);
      setResultados(r.data ?? []);
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

  const totalSemana = Object.values(consultasPorDia)
    .reduce((acc, lista) => acc + lista.length, 0);

  const labelSemana = `${fmt(diasSemanaVisiveis[0])} – ${fmt(diasSemanaVisiveis[6])}`;

  return (
    <div className="page">

      {/* BUSCA POR DATA DE NASCIMENTO */}
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

        {resultados !== null && (
          <div style={{ margin: '0 20px 16px' }}>
            {resultados.length === 0 && (
              <div className="alert alert-danger">Paciente não cadastrado</div>
            )}

            {resultados.map(paciente => (
              <div key={paciente.pacienteID} style={{ border: '1px solid #e0e0e0', borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
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

                <div className="form-grid form-grid-3" style={{ padding: '12px 16px 0' }}>
                  <div><label>CPF</label><p style={{ fontSize: 13 }}>{paciente.cpf || '—'}</p></div>
                  <div><label>Celular</label><p style={{ fontSize: 13 }}>{paciente.celular || '—'}</p></div>
                  <div><label>Profissão</label><p style={{ fontSize: 13 }}>{paciente.profissao || '—'}</p></div>
                </div>

                <div style={{ padding: '10px 16px 14px' }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', display: 'block', marginBottom: 8 }}>
                    Consultas agendadas
                  </label>
                  {(!paciente.consultaSimplificado || paciente.consultaSimplificado.length === 0) ? (
                    <div className="alert alert-danger" style={{ marginBottom: 0 }}>Paciente não possui consulta</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {paciente.consultaSimplificado.map(c => (
                        <div key={c.consultaId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f0f7ff', borderRadius: 5, border: '1px solid #d6e4f0' }}>
                          <span style={{ fontWeight: 700, color: '#1e3a5f', fontSize: 13, minWidth: 90 }}>{fmt(c.dataConsulta)}</span>
                          {c.horario && <span style={{ fontSize: 12, color: '#555' }}>⏰ {c.horario}</span>}
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

      {/* AGENDA SEMANAL */}
      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <span>📅 Agenda Semanal</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <button onClick={semanaAnterior} className="btn-nav">‹</button>
            <span style={{ fontSize: 13, fontWeight: 500, minWidth: 180, textAlign: 'center' }}>{labelSemana}</span>
            <button onClick={proximaSemana} className="btn-nav">›</button>
            {semanaBase !== hoje && <button onClick={semanaAtual} className="btn-hoje">Hoje</button>}
          </div>
        </div>

        <div className="agenda-info">
          {loadingSemana ? 'Carregando...' : `${totalSemana} consulta(s) nesta semana`}
        </div>

        {loadingSemana ? (
          <div className="loading">Carregando agenda...</div>
        ) : (
          diasSemanaVisiveis.map(dia => {
            const consultas = consultasPorDia[dia] ?? [];
            const ehHoje = dia === hoje;

            return (
              <div key={dia}>
                {/* Cabeçalho do dia */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 15,
                  padding: '12px 20px',
                  background: ehHoje ? '#eff6ff' : '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                }}>
                  <div style={{
                    width: 45, height: 45, borderRadius: '50%',
                    background: ehHoje ? '#1e3a5f' : '#fff',
                    border: ehHoje ? 'none' : '2px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: ehHoje ? '#fff' : '#64748b' }}>{diaSemana(dia).toUpperCase()}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: ehHoje ? '#fff' : '#1e3a5f' }}>{new Date(dia + 'T00:00:00').getDate()}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f' }}>
                      {fmt(dia)} {ehHoje && <span className="badge-hoje">HOJE</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{consultas.length === 0 ? 'Sem compromissos' : `${consultas.length} consulta(s)`}</div>
                  </div>
                </div>

                {/* Consultas do dia */}
                {consultas.map(c => (
                  <div className="agenda-row" key={c.consultaID} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 20px', 
                    borderBottom: '1px solid #f1f5f9',
                    gap: 15 
                  }}>
                    {/* 1. Horário (Tamanho fixo) */}
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', width: '60px', flexShrink: 0 }}>
                      {c.horario ? c.horario.substring(0, 5) : '—'}
                    </div>

                    {/* 2. Info Paciente (Cresce para empurrar os botões) */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.pacienteSimplificado?.nome ?? 'Paciente'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {c.consultaPreNatal ? '🤰 Pré-natal' : 'Consulta comum'}
                        {c.retorno && ` · Retorno ${c.retorno}`}
                      </div>
                    </div>

                    {/* 3. Ações (Não encolhe e fica à direita) */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => remarcarConsulta(c)}
                      >
                        Remarcar
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => deletarConsulta(c.consultaID, dia)}
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}

      <style dangerouslySetInnerHTML={{ __html: `
        .badge-hoje {
          background: #1e3a5f; color: white; padding: 2px 8px; border-radius: 12px; font-size: 9px; margin-left: 5px; vertical-align: middle;
        }
        .btn-nav {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-size: 18px; transition: 0.2s;
        }
        .btn-nav:hover { background: rgba(255,255,255,0.25); }
        .btn-hoje {
          background: #fff; color: #1e3a5f; border: none; border-radius: 4px; padding: 4px 12px; cursor: pointer; font-size: 11px; font-weight: 700; margin-left: 5px;
        }
      `}} />
    </div>
  );
}