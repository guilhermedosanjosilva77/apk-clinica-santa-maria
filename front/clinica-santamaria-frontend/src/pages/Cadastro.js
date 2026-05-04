// ─────────────────────────────────────────────
// pages/Cadastro.js
// ─────────────────────────────────────────────
import { useState, useMemo, useEffect } from 'react';
import { pacienteApi, consultaApi } from '../api/api';

// ─────────────────────────────────────────────
// HORÁRIOS: 08:00 até 17:00, de 30 em 30 min
// ─────────────────────────────────────────────
const TODOS_HORARIOS = (() => {
  const lista = [];
  for (let h = 8; h <= 17; h++) {
    lista.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 17) lista.push(`${String(h).padStart(2, '0')}:30`);
  }
  return lista; // ["08:00","08:30","09:00",...,"17:00"]
})();

// ─────────────────────────────────────────────
// MÁSCARAS
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

// ─────────────────────────────────────────────
// VALIDAÇÕES
// ─────────────────────────────────────────────
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return 'CPF deve ter 11 dígitos';
  if (/^(\d)\1+$/.test(nums)) return 'CPF inválido';
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(nums[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(nums[9])) return 'CPF inválido';
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(nums[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(nums[10])) return 'CPF inválido';
  return '';
}

function validarCelular(celular) {
  if (!celular) return '';
  const regex = /^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}-[0-9]{4}$/;
  if (!regex.test(celular)) return 'Formato: (16) 99123-4567';
  return '';
}

function validarEmail(email) {
  if (!email) return '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
  return '';
}

// ─────────────────────────────────────────────
// VALORES INICIAIS
// ─────────────────────────────────────────────
const FORM_VAZIO = {
  nome: '', dataNascimento: '', cpf: '', numeroProntuario: '',
  email: '', endereco: '', estadoCivil: '', profissao: '',
  celular: '', dataCadastro: '', mensagem: '',
};

const CONSULTA_VAZIA = {
  modoConsulta: 'id',
  pacienteId: '', nomePaciente: '', dataNascPaciente: '',
  dataConsulta: '', horario: '', consultaPreNatal: 'Não',
  coletaExames: 'Não', dataColeta: '', dataChegada: '',
};

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export default function Cadastro() {
  const [form,     setForm]     = useState(FORM_VAZIO);
  const [consulta, setConsulta] = useState(CONSULTA_VAZIA);
  const [errosPaciente,  setErrosPaciente]  = useState({});
  const [errosConsulta,  setErrosConsulta]  = useState({});
  const [loadingPaciente, setLoadingPaciente] = useState(false);
  const [loadingConsulta, setLoadingConsulta] = useState(false);
  const [toast, setToast]   = useState('');
  const [toastTipo, setToastTipo] = useState('info'); // 'info' | 'erro'

  // Mapa de horários ocupados por dia, carregado do banco
  // Estrutura: { "2026-05-02": ["08:00", "09:30"], "2026-05-09": ["17:00"] }
  const [horariosOcupados, setHorariosOcupados] = useState({});
  const [carregandoHorarios, setCarregandoHorarios] = useState(true);

  // ─────────────────────────────────────────────
  // 1. Ao montar a página: carrega TODAS as consultas do banco
  //    e monta o mapa de horários ocupados por dia
  // ─────────────────────────────────────────────
  useEffect(() => {
    sincronizarHorarios();
  }, []);

  async function sincronizarHorarios() {
    setCarregandoHorarios(true);
    try {
      const response = await consultaApi.listar();
      const mapa = {};
      response.data.forEach(c => {
        if (!c.dataConsulta || !c.horario) return;
        const data = c.dataConsulta;              // "2026-05-02"
        const hora = c.horario.substring(0, 5);  // "08:00" (corta segundos se vier "08:00:00")
        if (!mapa[data]) mapa[data] = [];
        if (!mapa[data].includes(hora)) mapa[data].push(hora);
      });
      setHorariosOcupados(mapa);
    } catch (e) {
      console.error('Erro ao carregar horários do banco:', e);
    } finally {
      setCarregandoHorarios(false);
    }
  }

  // ─────────────────────────────────────────────
  // 2. Filtra horários disponíveis para a data selecionada
  // ─────────────────────────────────────────────
  const horariosDisponiveis = useMemo(() => {
    if (!consulta.dataConsulta) return TODOS_HORARIOS;
    const ocupadosNaData = horariosOcupados[consulta.dataConsulta] || [];
    return TODOS_HORARIOS.filter(h => !ocupadosNaData.includes(h));
  }, [consulta.dataConsulta, horariosOcupados]);

  const horarioValido = horariosDisponiveis.includes(consulta.horario);

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────
  function mostrarToast(msg, tipo = 'info') {
    setToast(msg);
    setToastTipo(tipo);
    setTimeout(() => setToast(''), 3800);
  }

  function atualizarPaciente(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    if (errosPaciente[campo]) setErrosPaciente(prev => ({ ...prev, [campo]: '' }));
  }

  function atualizarConsulta(campo, valor) {
    // Ao trocar a data, limpa o horário para forçar nova escolha
    if (campo === 'dataConsulta') {
      setConsulta(prev => ({ ...prev, dataConsulta: valor, horario: '' }));
    } else {
      setConsulta(prev => ({ ...prev, [campo]: valor }));
    }
    if (errosConsulta[campo]) setErrosConsulta(prev => ({ ...prev, [campo]: '' }));
  }

  // Marca o horário como ocupado localmente após salvar com sucesso
  function ocuparHorarioLocal(data, horario) {
    setHorariosOcupados(prev => ({
      ...prev,
      [data]: [...(prev[data] || []), horario],
    }));
  }

  // ─────────────────────────────────────────────
  // VALIDAÇÕES DE FORMULÁRIO
  // ─────────────────────────────────────────────
  function validarFormularioPaciente() {
    const erros = {};
    if (!form.nome.trim())    erros.nome = 'Nome é obrigatório';
    if (!form.dataNascimento) erros.dataNascimento = 'Data de nascimento é obrigatória';
    const erroCPF = validarCPF(form.cpf);
    if (form.cpf && erroCPF)  erros.cpf = erroCPF;
    const erroCelular = validarCelular(form.celular);
    if (erroCelular)          erros.celular = erroCelular;
    const erroEmail = validarEmail(form.email);
    if (erroEmail)            erros.email = erroEmail;
    setErrosPaciente(erros);
    return Object.keys(erros).length === 0;
  }

  function validarFormularioConsulta() {
    const erros = {};
    if (!consulta.dataConsulta) erros.dataConsulta = 'Data da consulta é obrigatória';
    if (!consulta.horario)      erros.horario = 'Selecione um horário';
    if (consulta.modoConsulta === 'id') {
      if (!consulta.pacienteId.trim()) erros.pacienteId = 'Informe o ID da paciente';
      else if (isNaN(Number(consulta.pacienteId)) || Number(consulta.pacienteId) <= 0)
        erros.pacienteId = 'ID inválido';
    } else {
      if (!consulta.nomePaciente.trim()) erros.nomePaciente = 'Nome é obrigatório';
      if (!consulta.dataNascPaciente)    erros.dataNascPaciente = 'Data é obrigatória';
    }
    setErrosConsulta(erros);
    return Object.keys(erros).length === 0;
  }

  // ─────────────────────────────────────────────
  // 3. VERIFICAÇÃO EM TEMPO REAL NO BACK-END
  //    Chama GET /consulta/buscarHorario?horario=HH:MM
  //    e filtra os resultados pelo dia escolhido.
  //    Retorna true se o horário ESTÁ LIVRE, false se ocupado.
  // ─────────────────────────────────────────────
  async function verificarDisponibilidadeNoBanco(data, horario) {
    try {
      const response = await consultaApi.buscarPorHorario(horario);
      const consultasNoHorario = response.data; // lista de ConsultaResponse

      // Verifica se alguma consulta retornada é no mesmo DIA e mesmo HORÁRIO
      const conflito = consultasNoHorario.some(c => {
        const mesmoHorario = c.horario?.substring(0, 5) === horario;
        const mesmaData    = c.dataConsulta === data;
        return mesmoHorario && mesmaData;
      });

      return !conflito; // true = livre, false = ocupado
    } catch (e) {
      console.error('Erro ao verificar disponibilidade:', e);
      // Em caso de falha na verificação, deixa passar
      // (o back-end também pode bloquear se necessário)
      return true;
    }
  }

  // ─────────────────────────────────────────────
  // SUBMIT PACIENTE
  // ─────────────────────────────────────────────
  async function cadastrarPaciente() {
    if (!validarFormularioPaciente()) {
      mostrarToast('⚠ Corrija os campos em vermelho', 'erro');
      return;
    }
    setLoadingPaciente(true);
    try {
      await pacienteApi.criar({
        nome:             form.nome,
        dataNascimento:   form.dataNascimento,
        cpf:              form.cpf || null,
        numeroProntuario: form.numeroProntuario ? Number(form.numeroProntuario) : null,
        email:            form.email || null,
        endereco:         form.endereco || null,
        estadoCivil:      form.estadoCivil || null,
        profissao:        form.profissao || null,
        celular:          form.celular || null,
        dataCadastro:     form.dataCadastro || new Date().toISOString().split('T')[0],
        mensagem:         form.mensagem || null,
      });
      mostrarToast('✓ Paciente cadastrada com sucesso!');
      setErrosPaciente({});
      setForm(FORM_VAZIO);
    } catch (e) {
      mostrarToast('✗ ' + (e.response?.data?.mensagem || 'Erro ao cadastrar paciente'), 'erro');
    } finally {
      setLoadingPaciente(false);
    }
  }

  // ─────────────────────────────────────────────
  // SUBMIT CONSULTA
  // ─────────────────────────────────────────────
  async function cadastrarConsulta() {
    // 1. Valida campos locais
    if (!validarFormularioConsulta()) {
      mostrarToast('⚠ Corrija os campos da consulta', 'erro');
      return;
    }

    setLoadingConsulta(true);

    try {
      // 2. ── VERIFICAÇÃO EM TEMPO REAL ────────────────
      //    Antes de salvar, consulta o back-end para garantir
      //    que ninguém já marcou esse dia+horário
      const disponivel = await verificarDisponibilidadeNoBanco(
        consulta.dataConsulta,
        consulta.horario
      );

      if (!disponivel) {
        // Horário já ocupado — bloqueia e avisa, sem fazer o POST
        mostrarToast('🚫 Horário Indisponível', 'erro');

        // Atualiza o mapa local para remover o horário da lista visível
        ocuparHorarioLocal(consulta.dataConsulta, consulta.horario);

        // Limpa o horário selecionado para forçar nova escolha
        setConsulta(prev => ({ ...prev, horario: '' }));
        setErrosConsulta(prev => ({ ...prev, horario: 'Este horário já está ocupado nesta data' }));
        return;
      }

      // 3. ── HORÁRIO LIVRE — salva a consulta ─────────
      await consultaApi.criar({
        dataConsulta:     consulta.dataConsulta,
        horario:          consulta.horario,
        consultaPreNatal: consulta.consultaPreNatal === 'Sim',
        paciente:         consulta.modoConsulta === 'id' ? Number(consulta.pacienteId) : null,
        nome:             consulta.modoConsulta === 'pre' ? consulta.nomePaciente : null,
        dataNascimento:   consulta.modoConsulta === 'pre' ? consulta.dataNascPaciente : null,
      });

      // 4. Marca localmente para atualizar a lista de disponíveis imediatamente
      ocuparHorarioLocal(consulta.dataConsulta, consulta.horario);

      mostrarToast('✓ Consulta agendada com sucesso!');
      setErrosConsulta({});
      setConsulta(CONSULTA_VAZIA);

    } catch (e) {
      mostrarToast('✗ ' + (e.response?.data?.mensagem || 'Erro ao agendar consulta'), 'erro');
    } finally {
      setLoadingConsulta(false);
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="page">

      {/* ══ CADASTRO DE PACIENTE ══ */}
      <div className="card">
        <div className="card-header">👤 Cadastro de Paciente</div>
        <div className="form-section">Dados do Paciente</div>

        <div className="form-grid form-grid-2">

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Nome Completo *</label>
            <input placeholder="Ex.: Maria da Silva" value={form.nome}
              onChange={e => atualizarPaciente('nome', e.target.value)}
              style={errosPaciente.nome ? { borderColor: '#c0392b' } : {}} />
            {errosPaciente.nome && <span className="erro-campo">{errosPaciente.nome}</span>}
          </div>

          <div className="form-group">
            <label>Data de Nascimento *</label>
            <input type="date" value={form.dataNascimento}
              onChange={e => atualizarPaciente('dataNascimento', e.target.value)}
              style={errosPaciente.dataNascimento ? { borderColor: '#c0392b' } : {}} />
            {errosPaciente.dataNascimento && <span className="erro-campo">{errosPaciente.dataNascimento}</span>}
          </div>

          <div className="form-group">
            <label>Nº Prontuário</label>
            <input type="number" placeholder="Ex.: 298" value={form.numeroProntuario}
              onChange={e => atualizarPaciente('numeroProntuario', e.target.value)} min="1" />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input placeholder="Ex.: 123.456.789-00" value={form.cpf}
              onChange={e => atualizarPaciente('cpf', mascaraCPF(e.target.value))}
              style={errosPaciente.cpf ? { borderColor: '#c0392b' } : {}} maxLength={14} />
            {errosPaciente.cpf && <span className="erro-campo">{errosPaciente.cpf}</span>}
          </div>

          <div className="form-group">
            <label>Celular</label>
            <input placeholder="(16) 99123-4567" value={form.celular}
              onChange={e => atualizarPaciente('celular', mascaraCelular(e.target.value))}
              style={errosPaciente.celular ? { borderColor: '#c0392b' } : {}} maxLength={15} />
            {errosPaciente.celular && <span className="erro-campo">{errosPaciente.celular}</span>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="email@exemplo.com" value={form.email}
              onChange={e => atualizarPaciente('email', e.target.value)}
              style={errosPaciente.email ? { borderColor: '#c0392b' } : {}} />
            {errosPaciente.email && <span className="erro-campo">{errosPaciente.email}</span>}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Endereço *</label>
            <input placeholder="Ex.: Rua das Flores, 133" value={form.endereco}
              onChange={e => atualizarPaciente('endereco', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Estado Civil</label>
            <select value={form.estadoCivil} onChange={e => atualizarPaciente('estadoCivil', e.target.value)}>
              <option value="">Selecione</option>
              <option value="Casada">Casada</option>
              <option value="Solteira">Solteira</option>
              <option value="Divorciada">Divorciada</option>
              <option value="Viuva">Viúva</option>
            </select>
          </div>

          <div className="form-group">
            <label>Profissão *</label>
            <input placeholder="Ex.: Enfermeira" value={form.profissao}
              onChange={e => atualizarPaciente('profissao', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Acompanhante</label>
            <input placeholder="Nome do acompanhante" value={form.mensagem}
              onChange={e => atualizarPaciente('mensagem', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Data de Cadastro</label>
            <input type="date" value={form.dataCadastro}
              onChange={e => atualizarPaciente('dataCadastro', e.target.value)} />
          </div>

        </div>

        <div className="btn-row">
          <button className="btn btn-secondary"
            onClick={() => { setForm(FORM_VAZIO); setErrosPaciente({}); }}>
            Limpar
          </button>
          <button className="btn btn-primary" onClick={cadastrarPaciente} disabled={loadingPaciente}>
            {loadingPaciente ? 'Salvando...' : 'Cadastrar Paciente'}
          </button>
        </div>
      </div>

      {/* ══ CADASTRO DE CONSULTA ══ */}
      <div className="card">
        <div className="card-header">📋 Cadastro de Consulta</div>

        <div className="consulta-grid">

          {/* ── Painel Esquerdo ── */}
          <div className="consulta-painel">
            <div className="form-section">Dados da Consulta</div>
            <div className="form-grid form-grid-1">

              {/* Paciente */}
              <div className="form-group">
                <label>Paciente *</label>
                {consulta.modoConsulta === 'id' ? (
                  <>
                    <select value="" onChange={e => {
                      if (e.target.value === '__pre__') atualizarConsulta('modoConsulta', 'pre');
                    }}>
                      <option value="">Selecione o paciente</option>
                      <option value="__pre__">+ Pré-cadastro rápido (nova paciente)</option>
                    </select>
                    <input type="number" placeholder="Digite o ID da paciente"
                      value={consulta.pacienteId}
                      onChange={e => atualizarConsulta('pacienteId', e.target.value)}
                      style={{ marginTop: 6, ...(errosConsulta.pacienteId ? { borderColor: '#c0392b' } : {}) }}
                      min="1" />
                    {errosConsulta.pacienteId && <span className="erro-campo">{errosConsulta.pacienteId}</span>}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input placeholder="Nome da paciente *" value={consulta.nomePaciente}
                      onChange={e => atualizarConsulta('nomePaciente', e.target.value)}
                      style={errosConsulta.nomePaciente ? { borderColor: '#c0392b' } : {}} />
                    {errosConsulta.nomePaciente && <span className="erro-campo">{errosConsulta.nomePaciente}</span>}
                    <input type="date" value={consulta.dataNascPaciente}
                      onChange={e => atualizarConsulta('dataNascPaciente', e.target.value)}
                      style={errosConsulta.dataNascPaciente ? { borderColor: '#c0392b' } : {}} />
                    {errosConsulta.dataNascPaciente && <span className="erro-campo">{errosConsulta.dataNascPaciente}</span>}
                    <button className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '4px 12px', height: 28, alignSelf: 'flex-start' }}
                      onClick={() => atualizarConsulta('modoConsulta', 'id')}>
                      ← Usar ID
                    </button>
                  </div>
                )}
              </div>

              {/* Data da Consulta */}
              <div className="form-group">
                <label>Data da Consulta *</label>
                <input type="date" value={consulta.dataConsulta}
                  onChange={e => atualizarConsulta('dataConsulta', e.target.value)}
                  style={errosConsulta.dataConsulta ? { borderColor: '#c0392b' } : {}} />
                {errosConsulta.dataConsulta && <span className="erro-campo">{errosConsulta.dataConsulta}</span>}
              </div>

              {/* Horário */}
              <div className="form-group">
                <label>
                  Horário *
                  {consulta.dataConsulta && !carregandoHorarios && (
                    <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6, fontSize: 11 }}>
                      ({horariosDisponiveis.length} disponíve{horariosDisponiveis.length === 1 ? 'l' : 'is'})
                    </span>
                  )}
                  {carregandoHorarios && (
                    <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 6, fontSize: 11 }}>
                      carregando...
                    </span>
                  )}
                </label>
                <select
                  value={horarioValido ? consulta.horario : ''}
                  onChange={e => atualizarConsulta('horario', e.target.value)}
                  disabled={!consulta.dataConsulta || carregandoHorarios}
                  style={{
                    ...(errosConsulta.horario ? { borderColor: '#c0392b' } : {}),
                    ...(!consulta.dataConsulta || carregandoHorarios ? { opacity: 0.45 } : {}),
                  }}
                >
                  <option value="">
                    {carregandoHorarios
                      ? 'Carregando horários...'
                      : !consulta.dataConsulta
                        ? 'Selecione a data primeiro'
                        : horariosDisponiveis.length === 0
                          ? 'Nenhum horário disponível nesta data'
                          : 'Selecione o horário'}
                  </option>
                  {horariosDisponiveis.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {errosConsulta.horario && (
                  <span className="erro-campo">{errosConsulta.horario}</span>
                )}
                {consulta.dataConsulta && !carregandoHorarios && horariosDisponiveis.length === 0 && (
                  <span style={{ fontSize: 11, color: '#c0392b', marginTop: 3 }}>
                    Todos os horários estão ocupados nesta data
                  </span>
                )}
              </div>

              {/* Consulta Pré-natal */}
              <div className="form-group">
                <label>Consulta Pré-natal?</label>
                <select value={consulta.consultaPreNatal}
                  onChange={e => atualizarConsulta('consultaPreNatal', e.target.value)}>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

            </div>
          </div>

          {/* ── Painel Direito ── */}
          <div className="consulta-painel">
            <div className="form-section-secondary">Dados de Exame</div>
            <div className="form-grid form-grid-1">

              <div className="form-group">
                <label>Coleta de Exames?</label>
                <select value={consulta.coletaExames}
                  onChange={e => atualizarConsulta('coletaExames', e.target.value)}>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              <div className="form-group">
                <label>Data da Coleta</label>
                <input type="date" value={consulta.dataColeta}
                  onChange={e => atualizarConsulta('dataColeta', e.target.value)}
                  disabled={consulta.coletaExames === 'Não'}
                  style={consulta.coletaExames === 'Não' ? { opacity: 0.4 } : {}} />
              </div>

              <div className="form-group">
                <label>Data de Chegada do Exame</label>
                <input type="date" value={consulta.dataChegada}
                  onChange={e => atualizarConsulta('dataChegada', e.target.value)}
                  disabled={consulta.coletaExames === 'Não'}
                  style={consulta.coletaExames === 'Não' ? { opacity: 0.4 } : {}} />
              </div>

            </div>
          </div>

        </div>

        <div className="btn-row">
          <button className="btn btn-secondary"
            onClick={() => { setConsulta(CONSULTA_VAZIA); setErrosConsulta({}); }}>
            Limpar
          </button>
          <button className="btn btn-success" onClick={cadastrarConsulta} disabled={loadingConsulta}>
            {loadingConsulta ? 'Verificando...' : 'Cadastrar Consulta'}
          </button>
        </div>
      </div>

      {/* Toast com cor diferente para erro */}
      {toast && (
        <div className="toast" style={
          toastTipo === 'erro'
            ? { backgroundColor: '#7b0d0d' }
            : {}
        }>
          {toast}
        </div>
      )}

    </div>
  );
}