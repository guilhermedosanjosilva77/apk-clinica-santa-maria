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
    if (!data) { setResultadosBusca(null); return; }
    setLoadingBuscaConsulta(true);
    try {
      const r = await pacienteApi.buscarPorData(data);
      setResultadosBusca(r.data ?? []);
    } catch (e) { setResultadosBusca([]); } finally { setLoadingBuscaConsulta(false); }
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
    setLoadingConsulta(true);
    try {
      await consultaApi.criar({
        ...consulta,
        paciente: consulta.modoConsulta === 'id' ? Number(consulta.pacienteId) : null,
        nome: consulta.modoConsulta === 'pre' ? consulta.nomePaciente : null,
        dataNascimento: consulta.modoConsulta === 'pre' ? consulta.dataNascPaciente : null,
      });
      mostrarToast('✓ Consulta agendada!');
      setConsulta(CONSULTA_VAZIA);
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
          <div className="form-group">
            <label>Tipo de Entrada</label>
            <select value={consulta.modoConsulta} onChange={e => atualizarConsulta('modoConsulta', e.target.value)}>
              <option value="id">Paciente Cadastrada</option>
              <option value="pre">Cadastro Rápido (Simplificado)</option>
            </select>
          </div>

          {consulta.modoConsulta === 'id' ? (
            <div className="form-group">
              <label>Buscar Paciente (Nascimento)</label>
              <input type="date" value={dataBuscaConsulta} onChange={e => realizarBuscaPorData(e.target.value)} />
              {resultadosBusca && (
                <select style={{ marginTop: '8px' }} onChange={e => {
                  const p = JSON.parse(e.target.value);
                  setConsulta(c => ({...c, pacienteId: p.pacienteID, nomePaciente: p.nome}));
                }} defaultValue="">
                  <option value="" disabled>Selecione na lista...</option>
                  {resultadosBusca.map(p => <option key={p.pacienteID} value={JSON.stringify(p)}>{p.nome}</option>)}
                </select>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label>Nome da Paciente</label>
              <input value={consulta.nomePaciente} onChange={e => atualizarConsulta('nomePaciente', e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label>Data da Consulta *</label>
            <input type="date" value={consulta.dataConsulta} onChange={e => atualizarConsulta('dataConsulta', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Horário *</label>
            <select value={consulta.horario} onChange={e => atualizarConsulta('horario', e.target.value)}>
              <option value="">Escolha um horário...</option>
              {horariosDisponiveis.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-success" onClick={cadastrarConsulta} disabled={loadingConsulta}>Confirmar Agendamento</button>
        </div>
      </div>

      {toast && <div className={`toast ${toastTipo === 'erro' ? 'toast-erro' : ''}`}>{toast}</div>}
    </div>
  );
}