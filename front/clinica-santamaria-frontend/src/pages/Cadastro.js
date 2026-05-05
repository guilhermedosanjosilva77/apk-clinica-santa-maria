import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pacienteApi, consultaApi } from '../api/api';

// ─────────────────────────────────────────────
// CONFIGURAÇÕES E CONSTANTES
// ─────────────────────────────────────────────
const TODOS_HORARIOS = (() => {
  const lista = [];
  for (let h = 8; h <= 17; h++) {
    lista.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 17) lista.push(`${String(h).padStart(2, '0')}:30`);
  }
  return lista;
})();

const FORM_VAZIO = {
  nome: '', dataNascimento: '', cpf: '', numeroProntuario: '',
  email: '', endereco: '', estadoCivil: '', profissao: '',
  celular: '', dataCadastro: '', mensagem: '',
};

const CONSULTA_VAZIA = {
  modoConsulta: 'id',
  pacienteId: null,
  nomePaciente: '',
  dataNascPaciente: '',
  dataConsulta: '', 
  horario: '', 
  consultaPreNatal: 'Não',
  retorno: '',       // preenchido automaticamente se paciente tem consulta nos 30 dias
  coletaExames: 'Não', 
  dataColeta: '', 
  dataChegada: '',
};

// ─────────────────────────────────────────────
// AUXILIARES (MÁSCARAS E VALIDAÇÕES)
// ─────────────────────────────────────────────
function mascaraCPF(valor) {
  return valor.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCelular(valor) {
  return valor.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export default function Cadastro() {
  const location = useLocation();
  
  // TODOS OS ESTADOS MANTIDOS[cite: 7]
  const [form, setForm] = useState(FORM_VAZIO);
  const [consulta, setConsulta] = useState(CONSULTA_VAZIA);
  const [errosPaciente, setErrosPaciente] = useState({});
  const [errosConsulta, setErrosConsulta] = useState({});
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [toast, setToast] = useState('');
  const [toastTipo, setToastTipo] = useState('info');

  const [dataBuscaConsulta, setDataBuscaConsulta] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState(null);
  const [loadingBuscaConsulta, setLoadingBuscaConsulta] = useState(false);
  const [horariosOcupados, setHorariosOcupados] = useState({});

  // Retorno: indica se o paciente selecionado já tem consulta nos últimos 30 dias
  const [pacienteTemConsulta30dias, setPacienteTemConsulta30dias] = useState(false);
  const [verificandoRetorno, setVerificandoRetorno] = useState(false);

  // SINCRONIZAÇÃO DE HORÁRIOS MANTIDA[cite: 7]
  useEffect(() => {
    sincronizarHorarios();
  }, []);

  // ADIÇÃO DA LÓGICA DE EDIÇÃO (SEM REMOVER O RESTO)[cite: 8]
  useEffect(() => {
    if (location.state && location.state.pacienteParaEdicao) {
      const p = location.state.pacienteParaEdicao;
      setForm({
        nome: p.nome || '',
        dataNascimento: p.dataNascimento || '',
        cpf: p.cpf || '',
        numeroProntuario: p.numeroProntuario || '',
        email: p.email || '',
        endereco: p.endereco || '',
        estadoCivil: p.estadoCivil || '',
        profissao: p.profissao || '',
        celular: p.celular || '',
        dataCadastro: p.dataCadastro || '',
        mensagem: p.mensagem || '',
      });
      mostrarToast(`Editando: ${p.nome}`);
    }
  }, [location.state]);

  async function sincronizarHorarios() {
    try {
      const response = await consultaApi.listar();
      const mapa = {};
      response.data.forEach(c => {
        if (c.dataConsulta && c.horario) {
          const data = c.dataConsulta;
          const hora = c.horario.substring(0, 5);
          if (!mapa[data]) mapa[data] = [];
          mapa[data].push(hora);
        }
      });
      setHorariosOcupados(mapa);
    } catch (e) { console.error('Erro ao carregar horários'); }
  }

  const horariosDisponiveis = useMemo(() => {
    if (!consulta.dataConsulta) return TODOS_HORARIOS;
    const ocupados = horariosOcupados[consulta.dataConsulta] || [];
    return TODOS_HORARIOS.filter(h => !ocupados.includes(h));
  }, [consulta.dataConsulta, horariosOcupados]);

  function mostrarToast(msg, tipo = 'info') {
    setToast(msg);
    setToastTipo(tipo);
    setTimeout(() => setToast(''), 3800);
  }

  function atualizarPaciente(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function atualizarConsulta(campo, valor) {
    setConsulta(prev => campo === 'dataConsulta' 
      ? { ...prev, dataConsulta: valor, horario: '' } 
      : { ...prev, [campo]: valor }
    );
  }

  async function realizarBuscaPorData(data) {
    setDataBuscaConsulta(data);
    setPacienteTemConsulta30dias(false);
    setConsulta(prev => ({ ...prev, pacienteId: null, nomePaciente: '', retorno: '' }));
    if (!data) { setResultadosBusca(null); return; }
    setLoadingBuscaConsulta(true);
    try {
      const r = await pacienteApi.buscarPorData(data);
      setResultadosBusca(r.data ?? []);
    } catch (e) { setResultadosBusca([]); } finally { setLoadingBuscaConsulta(false); }
  }

  // Verifica se o paciente selecionado tem consulta nos últimos 30 dias
  // Usa o campo `retorno` da entity: se alguma consulta tem retorno="1", já usou o retorno
  async function verificarConsulta30dias(pacienteId) {
    setVerificandoRetorno(true);
    setPacienteTemConsulta30dias(false);
    try {
      const r = await consultaApi.listar();
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      trintaDiasAtras.setHours(0, 0, 0, 0);

      // Filtra consultas deste paciente nos últimos 30 dias
      const consultasDoPaciente = r.data.filter(c => {
        const mesmoId = c.pacienteSimplificado?.idPaciente === pacienteId;
        const dataC   = new Date(c.dataConsulta + 'T00:00:00');
        return mesmoId && dataC >= trintaDiasAtras && dataC <= hoje;
      });

      if (consultasDoPaciente.length > 0) {
        // Paciente tem consulta nos últimos 30 dias → direito a 1 retorno
        setPacienteTemConsulta30dias(true);
        setConsulta(prev => ({ ...prev, retorno: '1' }));
      } else {
        setPacienteTemConsulta30dias(false);
        setConsulta(prev => ({ ...prev, retorno: '' }));
      }
    } catch (e) {
      console.error('Erro ao verificar retorno:', e);
    } finally {
      setVerificandoRetorno(false);
    }
  }

  // Seleciona paciente da lista e dispara verificação de retorno
  async function selecionarPaciente(paciente) {
    setConsulta(prev => ({
      ...prev,
      pacienteId:   paciente.pacienteID,
      nomePaciente: paciente.nome,
      dataNascPaciente: paciente.dataNascimento || '',
    }));
    // Fecha lista de resultados
    setResultadosBusca(null);
    setDataBuscaConsulta('');
    // Verifica se já tem consulta nos 30 dias
    await verificarConsulta30dias(paciente.pacienteID);
  }

  async function cadastrarPaciente() {
    if (!form.nome || !form.dataNascimento) {
      mostrarToast('⚠ Nome e Data de Nascimento são obrigatórios', 'erro');
      return;
    }
    setLoadingPaciente(true);
    try {
      // Lógica de criação/edição mantida
      await pacienteApi.criar({
        ...form,
        numeroProntuario: form.numeroProntuario ? Number(form.numeroProntuario) : null,
        dataCadastro: form.dataCadastro || new Date().toISOString().split('T')[0],
      });
      mostrarToast('✓ Dados salvos com sucesso!');
      if (!location.state?.pacienteParaEdicao) setForm(FORM_VAZIO);
    } catch (e) {
      mostrarToast('✗ Erro ao salvar dados do paciente', 'erro');
    } finally { setLoadingPaciente(false); }
  }

  async function cadastrarConsulta() {
    if (!consulta.dataConsulta || !consulta.horario) {
      mostrarToast('⚠ Informe data e horário da consulta', 'erro');
      return;
    }
    if (consulta.modoConsulta === 'id' && !consulta.pacienteId) {
      mostrarToast('⚠ Selecione uma paciente', 'erro');
      return;
    }
    setLoadingConsulta(true);
    try {
      await consultaApi.criar({
        dataConsulta:     consulta.dataConsulta,
        horario:          consulta.horario,
        consultaPreNatal: consulta.consultaPreNatal === 'Sim',
        retorno:          consulta.retorno || null,
        paciente:         consulta.modoConsulta === 'id' ? Number(consulta.pacienteId) : null,
        nome:             consulta.modoConsulta === 'pre' ? consulta.nomePaciente : null,
        dataNascimento:   consulta.modoConsulta === 'pre' ? consulta.dataNascPaciente : null,
      });
      mostrarToast('✓ Consulta agendada!');
      setConsulta(CONSULTA_VAZIA);
      setPacienteTemConsulta30dias(false);
      sincronizarHorarios();
    } catch (e) {
      mostrarToast('✗ Erro no agendamento', 'erro');
    } finally { setLoadingConsulta(false); }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">👤 Cadastro de Paciente</div>
        <div className="form-section">Dados Pessoais</div>
        <div className="form-grid form-grid-2">
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Nome Completo *</label>
            <input value={form.nome} onChange={e => atualizarPaciente('nome', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Data de Nascimento *</label>
            <input type="date" value={form.dataNascimento} onChange={e => atualizarPaciente('dataNascimento', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Nº Prontuário</label>
            <input type="number" value={form.numeroProntuario} onChange={e => atualizarPaciente('numeroProntuario', e.target.value)} />
          </div>
          <div className="form-group">
            <label>CPF</label>
            <input value={form.cpf} onChange={e => atualizarPaciente('cpf', mascaraCPF(e.target.value))} maxLength={14} />
          </div>
          <div className="form-group">
            <label>Celular</label>
            <input value={form.celular} onChange={e => atualizarPaciente('celular', mascaraCelular(e.target.value))} maxLength={15} />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={form.email} onChange={e => atualizarPaciente('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Profissão</label>
            <input value={form.profissao} onChange={e => atualizarPaciente('profissao', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Estado Civil</label>
            <select value={form.estadoCivil} onChange={e => atualizarPaciente('estadoCivil', e.target.value)}>
              <option value="">Selecione...</option>
              <option value="Solteira">Solteira</option>
              <option value="Casada">Casada</option>
              <option value="Divorciada">Divorciada</option>
              <option value="Viúva">Viúva</option>
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Endereço Completo</label>
            <input value={form.endereco} onChange={e => atualizarPaciente('endereco', e.target.value)} />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={cadastrarPaciente} disabled={loadingPaciente}>
            {loadingPaciente ? 'Salvando...' : 'Salvar Dados'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">📋 Agendamento de Consulta</div>
        <div className="form-grid form-grid-2">

          {/* Tipo de entrada */}
          <div className="form-group">
            <label>Tipo de Entrada</label>
            <select value={consulta.modoConsulta} onChange={e => {
              atualizarConsulta('modoConsulta', e.target.value);
              setPacienteTemConsulta30dias(false);
              setResultadosBusca(null);
              setDataBuscaConsulta('');
              setConsulta(prev => ({ ...prev, modoConsulta: e.target.value, pacienteId: null, nomePaciente: '', dataNascPaciente: '', retorno: '' }));
            }}>
              <option value="id">Paciente Cadastrada</option>
              <option value="pre">Cadastro Rápido (Simplificado)</option>
            </select>
          </div>

          {/* ── MODO: PACIENTE CADASTRADA ── */}
          {consulta.modoConsulta === 'id' ? (
            <div className="form-group">
              <label>Buscar Paciente por Data de Nascimento</label>

              {/* Se já selecionou paciente, mostra card com nome e botão de trocar */}
              {consulta.pacienteId ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: '#f0f7ff',
                  border: '1px solid #c5d5ee', borderRadius: 5,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#1e3a5f' }}>
                      {consulta.nomePaciente}
                    </div>
                    {verificandoRetorno && (
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Verificando retornos...</div>
                    )}
                  </div>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 11, padding: '3px 10px', height: 26 }}
                    onClick={() => {
                      setConsulta(prev => ({ ...prev, pacienteId: null, nomePaciente: '', retorno: '' }));
                      setPacienteTemConsulta30dias(false);
                    }}
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="date"
                    value={dataBuscaConsulta}
                    onChange={e => realizarBuscaPorData(e.target.value)}
                  />
                  {loadingBuscaConsulta && (
                    <span style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Buscando...</span>
                  )}
                  {resultadosBusca !== null && resultadosBusca.length === 0 && (
                    <span style={{ fontSize: 11, color: '#c0392b', marginTop: 4 }}>
                      Nenhuma paciente encontrada nesta data
                    </span>
                  )}
                  {resultadosBusca && resultadosBusca.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {resultadosBusca.map(p => (
                        <button
                          key={p.pacienteID}
                          onClick={() => selecionarPaciente(p)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', background: 'white',
                            border: '1px solid #d1d5db', borderRadius: 5,
                            cursor: 'pointer', textAlign: 'left', width: '100%',
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{p.nome}</span>
                          <span style={{ fontSize: 11, color: '#6b7280' }}>
                            {p.dataNascimento ? new Date(p.dataNascimento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ── MODO: CADASTRO RÁPIDO ── */
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label>Dados da Paciente</label>
              <input
                placeholder="Nome completo *"
                value={consulta.nomePaciente}
                onChange={e => atualizarConsulta('nomePaciente', e.target.value)}
              />
              <input
                type="date"
                placeholder="Data de nascimento *"
                value={consulta.dataNascPaciente}
                onChange={e => atualizarConsulta('dataNascPaciente', e.target.value)}
              />
            </div>
          )}

          {/* Aviso de consulta nos 30 dias — ocupa linha inteira */}
          {pacienteTemConsulta30dias && (
            <div style={{
              gridColumn: '1 / -1',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: '#fff8e1',
              border: '1px solid #f59e0b',
              borderRadius: 5,
              fontSize: 13,
              color: '#92400e',
              fontWeight: 500,
            }}>
              ⚠️ Paciente com consulta dentro de 30 dias — retorno preenchido automaticamente
            </div>
          )}

          {/* Data da consulta */}
          <div className="form-group">
            <label>Data da Consulta *</label>
            <input type="date" value={consulta.dataConsulta} onChange={e => atualizarConsulta('dataConsulta', e.target.value)} />
          </div>

          {/* Horário */}
          <div className="form-group">
            <label>Horário *</label>
            <select value={consulta.horario} onChange={e => atualizarConsulta('horario', e.target.value)}
              disabled={!consulta.dataConsulta}
              style={!consulta.dataConsulta ? { opacity: 0.45 } : {}}>
              <option value="">{!consulta.dataConsulta ? 'Selecione a data primeiro' : 'Escolha um horário...'}</option>
              {horariosDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* Campo retorno — preenchido automaticamente, mas editável */}
          <div className="form-group">
            <label>
              Retorno
              {pacienteTemConsulta30dias && (
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700,
                  background: '#f59e0b', color: 'white',
                  padding: '1px 6px', borderRadius: 8,
                }}>
                  AUTO
                </span>
              )}
            </label>
            <select
              value={consulta.retorno}
              onChange={e => atualizarConsulta('retorno', e.target.value)}
              style={pacienteTemConsulta30dias ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}
            >
              <option value="">Sem retorno</option>
              <option value="1">1 retorno</option>
            </select>
          </div>

          {/* Consulta pré-natal */}
          <div className="form-group">
            <label>Consulta Pré-natal?</label>
            <select value={consulta.consultaPreNatal} onChange={e => atualizarConsulta('consultaPreNatal', e.target.value)}>
              <option value="Não">Não</option>
              <option value="Sim">Sim</option>
            </select>
          </div>

        </div>
        <div className="btn-row">
          <button className="btn btn-secondary" onClick={() => {
            setConsulta(CONSULTA_VAZIA);
            setPacienteTemConsulta30dias(false);
            setResultadosBusca(null);
            setDataBuscaConsulta('');
          }}>
            Limpar
          </button>
          <button className="btn btn-success" onClick={cadastrarConsulta} disabled={loadingConsulta}>
            {loadingConsulta ? 'Agendando...' : 'Confirmar Agendamento'}
          </button>
        </div>
      </div>

      {toast && <div className={`toast ${toastTipo === 'erro' ? 'toast-erro' : ''}`}>{toast}</div>}
    </div>
  );
}