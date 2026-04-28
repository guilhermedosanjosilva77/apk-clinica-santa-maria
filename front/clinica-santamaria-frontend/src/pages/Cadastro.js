// ─────────────────────────────────────────────
// pages/Cadastro.js
// Tela de cadastro de paciente com validações e máscaras
// ─────────────────────────────────────────────
import { useState } from 'react';
import { pacienteApi } from '../api/api';

// ─────────────────────────────────────────────
// MÁSCARAS — formatam o texto enquanto o usuário digita
// ─────────────────────────────────────────────

// CPF: 111.444.777-35
function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')                          // remove tudo que não é número
    .slice(0, 11)                                // limita a 11 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2')             // coloca ponto após 3 dígitos
    .replace(/(\d{3})(\d)/, '$1.$2')             // coloca ponto após 6 dígitos
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');      // coloca hífen antes dos 2 últimos
}

// Celular: (16) 99123-4567
function mascaraCelular(valor) {
  return valor
    .replace(/\D/g, '')                          // remove tudo que não é número
    .slice(0, 11)                                // limita a 11 dígitos
    .replace(/(\d{2})(\d)/, '($1) $2')           // coloca parênteses no DDD
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');      // coloca hífen no meio
}

// ─────────────────────────────────────────────
// VALIDAÇÕES — retornam mensagem de erro ou ''
// ─────────────────────────────────────────────

// Valida CPF matematicamente (mesmo algoritmo do Java @CPF)
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return 'CPF deve ter 11 dígitos';
  if (/^(\d)\1+$/.test(nums)) return 'CPF inválido';

  // Valida primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(nums[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(nums[9])) return 'CPF inválido';

  // Valida segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(nums[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== Number(nums[10])) return 'CPF inválido';

  return ''; // CPF válido
}

// Valida celular — mesmo regex do back-end
function validarCelular(celular) {
  const regex = /^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}-[0-9]{4}$/;
  if (!celular) return ''; // celular é opcional
  if (!regex.test(celular)) return 'Formato: (16) 99123-4567';
  return '';
}

// Valida email básico
function validarEmail(email) {
  if (!email) return ''; // email é opcional
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
  return '';
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────
export default function Cadastro() {

  // ── Estado do formulário ──────────────────────
  const [form, setForm] = useState({
    nome:             '',
    dataNascimento:   '',
    cpf:              '',
    numeroProntuario: '',
    email:            '',
    endereco:         '',
    estadoCivil:      '',
    profissao:        '',
    celular:          '',
    dataCadastro:     '',
  });

  // ── Erros de validação por campo ─────────────
  const [erros, setErros] = useState({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');

  // ── Atualiza campo simples ────────────────────
  function atualizar(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: '' }));
  }

  // ── Atualiza CPF com máscara ──────────────────
  function atualizarCPF(valor) {
    const formatado = mascaraCPF(valor);
    setForm(prev => ({ ...prev, cpf: formatado }));
    setErros(prev => ({ ...prev, cpf: '' }));
  }

  // ── Atualiza celular com máscara ──────────────
  function atualizarCelular(valor) {
    const formatado = mascaraCelular(valor);
    setForm(prev => ({ ...prev, celular: formatado }));
    setErros(prev => ({ ...prev, celular: '' }));
  }

  // ── Notificação temporária ────────────────────
  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── Valida todos os campos antes de enviar ────
  function validarFormulario() {
    const novosErros = {};

    if (!form.nome.trim())          novosErros.nome = 'Nome é obrigatório';
    if (!form.dataNascimento)       novosErros.dataNascimento = 'Data de nascimento é obrigatória';

    const erroCPF = validarCPF(form.cpf);
    if (form.cpf && erroCPF)        novosErros.cpf = erroCPF;

    const erroCelular = validarCelular(form.celular);
    if (erroCelular)                novosErros.celular = erroCelular;

    const erroEmail = validarEmail(form.email);
    if (erroEmail)                  novosErros.email = erroEmail;

    setErros(novosErros);
    return Object.keys(novosErros).length === 0; // true = sem erros
  }

  // ── POST /paciente ────────────────────────────
  async function cadastrarPaciente() {
    if (!validarFormulario()) {
      mostrarToast('⚠ Corrija os campos em vermelho');
      return;
    }

    setLoading(true);
    try {
      await pacienteApi.criar({
        nome:             form.nome,
        dataNascimento:   form.dataNascimento,
        cpf:              form.cpf,
        numeroProntuario: form.numeroProntuario ? Number(form.numeroProntuario) : null,
        email:            form.email,
        endereco:         form.endereco,
        estadoCivil:      form.estadoCivil || null,
        profissao:        form.profissao,
        celular:          form.celular,
        dataCadastro:     form.dataCadastro || null,
      });

      mostrarToast('✓ Paciente cadastrada com sucesso!');
      setErros({});
      setForm({
        nome:'', dataNascimento:'', cpf:'', numeroProntuario:'',
        email:'', endereco:'', estadoCivil:'', profissao:'',
        celular:'', dataCadastro:'',
      });

    } catch (e) {
      const msg = e.response?.data?.message || 'Erro ao cadastrar paciente';
      mostrarToast('✗ ' + msg);
    } finally {
      setLoading(false);
    }
  }

  // ─────────────────────────────────────────────
  // TELA
  // ─────────────────────────────────────────────
  return (
    <div className="page">
      <div className="card">

        <div className="card-header">👤 Cadastro De Paciente</div>
        <div className="form-section">Dados do Paciente</div>

        <div className="form-grid form-grid-2">

          {/* Nome — obrigatório */}
          <div className="form-group">
            <label>Nome Completo: *</label>
            <input
              placeholder="Ex: Maria da Silva"
              value={form.nome}
              onChange={e => atualizar('nome', e.target.value)}
              style={erros.nome ? { borderColor: '#c0392b' } : {}}
            />
            {erros.nome && <span className="erro-campo">{erros.nome}</span>}
          </div>

          {/* CPF — com máscara e validação matemática */}
          <div className="form-group">
            <label>CPF:</label>
            <input
              placeholder="Ex: 111.444.777-35"
              value={form.cpf}
              onChange={e => atualizarCPF(e.target.value)}
              style={erros.cpf ? { borderColor: '#c0392b' } : {}}
              maxLength={14}
            />
            {erros.cpf && <span className="erro-campo">{erros.cpf}</span>}
          </div>

          {/* Data de Nascimento — obrigatório */}
          <div className="form-group">
            <label>Data de Nascimento: *</label>
            <input
              type="date"
              value={form.dataNascimento}
              onChange={e => atualizar('dataNascimento', e.target.value)}
              style={erros.dataNascimento ? { borderColor: '#c0392b' } : {}}
            />
            {erros.dataNascimento && <span className="erro-campo">{erros.dataNascimento}</span>}
          </div>

          {/* Nº Prontuário */}
          <div className="form-group">
            <label>Nº Prontuário:</label>
            <input
              type="number"
              placeholder="Ex: 5678"
              value={form.numeroProntuario}
              onChange={e => atualizar('numeroProntuario', e.target.value)}
              min="1"
            />
          </div>

          {/* Email — com validação */}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Ex: paciente@gmail.com"
              value={form.email}
              onChange={e => atualizar('email', e.target.value)}
              style={erros.email ? { borderColor: '#c0392b' } : {}}
            />
            {erros.email && <span className="erro-campo">{erros.email}</span>}
          </div>

          {/* Endereço */}
          <div className="form-group">
            <label>Endereço:</label>
            <input
              placeholder="Ex: Av. Brasil, 123"
              value={form.endereco}
              onChange={e => atualizar('endereco', e.target.value)}
            />
          </div>

          {/* Estado Civil */}
          <div className="form-group">
            <label>Estado Civil:</label>
            <select
              value={form.estadoCivil}
              onChange={e => atualizar('estadoCivil', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Casada">Casada</option>
              <option value="Solteira">Solteira</option>
              <option value="Divorciada">Divorciada</option>
              <option value="Viuva">Viúva</option>
            </select>
          </div>

          {/* Profissão */}
          <div className="form-group">
            <label>Profissão:</label>
            <input
              placeholder="Ex: Enfermeira"
              value={form.profissao}
              onChange={e => atualizar('profissao', e.target.value)}
            />
          </div>

          {/* Celular — com máscara e validação */}
          <div className="form-group">
            <label>Celular:</label>
            <input
              placeholder="Ex: (16) 99123-4567"
              value={form.celular}
              onChange={e => atualizarCelular(e.target.value)}
              style={erros.celular ? { borderColor: '#c0392b' } : {}}
              maxLength={15}
            />
            {erros.celular && <span className="erro-campo">{erros.celular}</span>}
          </div>

          {/* Data de Cadastro */}
          <div className="form-group">
            <label>Data de Cadastro:</label>
            <input
              type="date"
              value={form.dataCadastro}
              onChange={e => atualizar('dataCadastro', e.target.value)}
            />
          </div>

        </div>

        <div className="btn-row">
          <button
            className="btn btn-primary"
            onClick={cadastrarPaciente}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Cadastrar Paciente'}
          </button>
        </div>

      </div>

      {/* Notificação */}
      {toast && <div className="toast">{toast}</div>}

    </div>
  );
}