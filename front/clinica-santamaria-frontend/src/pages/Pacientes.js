import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pacienteApi, consultaApi } from '../api/api';

export default function Pacientes() {
  const navigate = useNavigate();
  
  // Estados para a lista de recentes
  const [pacientesRecentes, setPacientesRecentes] = useState([]);
  const [loadingRecentes, setLoadingRecentes] = useState(true);

  // Estados para a busca por data
  const [dataBusca, setDataBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState(null);
  const [loadingBusca, setLoadingBusca] = useState(false);

  useEffect(() => {
    carregarPacientesRecentes();
  }, []);

  async function carregarPacientesRecentes() {
    setLoadingRecentes(true);
    try {
      const response = await consultaApi.listar();

      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      trintaDiasAtras.setHours(0, 0, 0, 0);

      // Filtra consultas dos últimos 30 dias
      const recentes = response.data.filter(c => {
        const dataConsulta = new Date(c.dataConsulta + 'T00:00:00');
        return dataConsulta >= trintaDiasAtras && dataConsulta <= hoje;
      });

      // Agrupa por paciente e soma retornos
      // Estrutura: { [pacienteID]: { nome, dataNascimento, totalRetornos, consultas[] } }
      const mapaRetornos = {};
      recentes.forEach(c => {
        const id   = c.pacienteSimplificado?.idPaciente ?? `sem-id-${c.consultaID}`;
        const nome = c.pacienteSimplificado?.nome          || 'Não informado';
        const nasc = c.pacienteSimplificado?.dataNascimento || null;

        if (!mapaRetornos[id]) {
          mapaRetornos[id] = { nome, dataNascimento: nasc, totalRetornos: 0, consultas: [] };
        }

        // retorno vem como String ("0", "1") ou null — soma apenas valores numéricos
        const retornoNum = parseInt(c.retorno);
        if (!isNaN(retornoNum)) {
          mapaRetornos[id].totalRetornos += retornoNum;
        }

        mapaRetornos[id].consultas.push({
          consultaID:       c.consultaID,
          dataConsulta:     c.dataConsulta,
          horario:          c.horario,
          consultaPreNatal: c.consultaPreNatal,
        });
      });

      // Converte para array ordenado por nome
      const lista = Object.values(mapaRetornos).sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );

      setPacientesRecentes(lista);
    } catch (e) {
      console.error('Erro ao carregar recentes:', e);
    } finally {
      setLoadingRecentes(false);
    }
  }

  async function buscarPorData(data) {
    setDataBusca(data);
    if (!data) {
      setResultadosBusca(null);
      return;
    }
    setLoadingBusca(true);
    try {
      const r = await pacienteApi.buscarPorData(data);
      setResultadosBusca(r.data ?? []);
    } catch (e) {
      setResultadosBusca([]);
    } finally {
      setLoadingBusca(false);
    }
  }

  function handleEditar(paciente) {
    navigate('/cadastro', { state: { pacienteParaEdicao: paciente } });
  }

  return (
    <div className="page">
      {/* SEÇÃO DE BUSCA PARA EDIÇÃO */}
      <div className="card">
        <div className="card-header">🔍 Localizar Paciente para Edição</div>
        <div className="form-group" style={{ padding: '20px' }}>
          <label>Buscar por Data de Nascimento</label>
          <input 
            type="date" 
            value={dataBusca} 
            onChange={e => buscarPorData(e.target.value)} 
          />

          {loadingBusca && <p>Buscando...</p>}

          {resultadosBusca && (
            <div className="resultados-lista" style={{ marginTop: '15px' }}>
              {resultadosBusca.length > 0 ? (
                resultadosBusca.map(p => (
                  <div key={p.pacienteID} className="item-resultado" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px', borderBottom: '1px solid #eee', background: '#f9f9f9', borderRadius: '4px', marginBottom: '5px'
                  }}>
                    <div>
                      <strong>{p.nome}</strong> <br/>
                      <small>Nascimento: {p.dataNascimento} | CPF: {p.cpf || 'N/A'}</small>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleEditar(p)} style={{ padding: '5px 15px' }}>
                      Editar
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ color: '#c0392b' }}>Não existem pacientes cadastrados na data {dataBusca}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* TABELA DE CONSULTAS RECENTES */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">📅 Consultas nos Últimos 30 Dias</div>
        <div style={{ padding: '20px' }}>
          {loadingRecentes ? (
            <p>Carregando histórico...</p>
          ) : pacientesRecentes.length > 0 ? (
            <table className="tabela-pacientes" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f4f8', textAlign: 'left', borderBottom: '2px solid #d1d5db' }}>
                  <th style={{ padding: '10px 12px', fontSize: 13 }}>Paciente</th>
                  <th style={{ padding: '10px 12px', fontSize: 13 }}>Data de Nascimento</th>
                  <th style={{ padding: '10px 12px', fontSize: 13 }}>Consultas no Período</th>
                  <th style={{ padding: '10px 12px', fontSize: 13 }}>Retornos</th>
                </tr>
              </thead>
              <tbody>
                {pacientesRecentes.map((p, index) => {
                  const temRetorno = p.totalRetornos > 0;
                  // Formata data "2026-01-15" → "15/01/2026"
                  const dataNasc = p.dataNascimento
                    ? new Date(p.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—';

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>

                      {/* Nome */}
                      <td style={{ padding: '12px 12px' }}>
                        <strong style={{ fontSize: 13 }}>{p.nome}</strong>
                      </td>

                      {/* Data de nascimento */}
                      <td style={{ padding: '12px 12px', fontSize: 13, color: '#374151' }}>
                        {dataNasc}
                      </td>

                      {/* Quantidade de consultas no período */}
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ fontSize: 13, color: '#374151' }}>
                          {p.consultas.length} consulta{p.consultas.length !== 1 ? 's' : ''}
                        </span>
                        {/* Lista de datas das consultas */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {p.consultas.map(c => (
                            <span key={c.consultaID} style={{
                              fontSize: 11,
                              background: c.consultaPreNatal ? '#e8f7ef' : '#e8f0fa',
                              color:      c.consultaPreNatal ? '#1a7a4a' : '#1e3a5f',
                              padding: '2px 7px',
                              borderRadius: 10,
                              border: `1px solid ${c.consultaPreNatal ? '#b7dfcb' : '#c5d5ee'}`,
                            }}>
                              {new Date(c.dataConsulta + 'T00:00:00').toLocaleDateString('pt-BR')}
                              {c.horario ? ` · ${c.horario.substring(0, 5)}` : ''}
                              {c.consultaPreNatal ? ' 🤰' : ''}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Badge de retornos */}
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{
                          background:  temRetorno ? '#1a7a4a' : '#f1f5f9',
                          color:       temRetorno ? '#ffffff' : '#64748b',
                          padding: '5px 12px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: temRetorno ? 700 : 400,
                          whiteSpace: 'nowrap',
                        }}>
                          {p.totalRetornos} {p.totalRetornos === 1 ? 'retorno' : 'retornos'}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Nenhuma consulta realizada nos últimos 30 dias.</p>
          )}
        </div>
      </div>
    </div>
  );
}