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
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(hoje.getDate() - 30);

      const recentes = response.data.filter(c => {
        const dataConsulta = new Date(c.dataConsulta);
        return dataConsulta >= trintaDiasAtras && dataConsulta <= hoje;
      });

      setPacientesRecentes(recentes);
    } catch (e) {
      console.error("Erro ao carregar recentes:", e);
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
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                  <th style={{ padding: '10px' }}>Paciente</th>
                  <th>Data Nascimento</th>
                  <th>Data Consulta</th>
                  <th>Horário</th>
                  <th>Retornos</th>
                </tr>
              </thead>
              <tbody>
                {pacientesRecentes.map((c, index) => {
                  // Lógica para garantir que o nome e data apareçam independente do tipo de cadastro[cite: 8]
                  const nomeExibicao = c.paciente?.nome || c.nome || "Não informado";
                  const dataNascExibicao = c.paciente?.dataNascimento || c.dataNascimento || "---";
                  const temRetorno = (c.paciente?.retornosAtivos || 0) > 0;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid #f2f2f2' }}>
                      <td style={{ padding: '10px' }}>
                        <strong>{nomeExibicao}</strong>
                      </td>
                      <td>{dataNascExibicao}</td>
                      <td>{c.dataConsulta}</td>
                      <td>{c.horario?.substring(0, 5)}</td>
                      <td>
                        <span className="badge-retorno" style={{
                          // Cor verde sólida se houver retornos, cinza se for zero
                          background: temRetorno ? '#27ae60' : '#f1f5f9',
                          color: temRetorno ? '#ffffff' : '#64748b',
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: temRetorno ? 'bold' : 'normal'
                        }}>
                          {c.paciente?.retornosAtivos || 0} Ativos
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p>Nenhuma consulta realizada nos últimos 30 dias.</p>
          )}
        </div>
      </div>
    </div>
  );
}