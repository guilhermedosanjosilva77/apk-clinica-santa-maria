// ─────────────────────────────────────────────
// api/api.js
// ─────────────────────────────────────────────
import axios from 'axios';

const API = 'http://localhost:8080';

// ── PACIENTE ──────────────────────────────────
export const pacienteApi = {
  listar: () =>
    axios.get(`${API}/paciente`),

  buscarPorId: (id) =>
    axios.get(`${API}/paciente/${id}`),

  buscarPorData: (data) =>
    axios.get(`${API}/paciente/buscar`, { params: { data } }),

  buscarPorNome: (nome) =>
    axios.get(`${API}/paciente/nome`, { params: { nome } }),

  buscarPorCpf: (cpf) =>
    axios.get(`${API}/paciente/cpf`, { params: { cpf } }),

  criar: (dados) =>
    axios.post(`${API}/paciente`, dados),

  atualizar: (id, dados) =>
    axios.put(`${API}/paciente/${id}`, dados),

  deletar: (id) =>
    axios.delete(`${API}/paciente/${id}`),
};

// ── CONSULTA ──────────────────────────────────
export const consultaApi = {
  listar: () =>
    axios.get(`${API}/consulta`),

  buscarPorData: (data) =>
    axios.get(`${API}/consulta/buscar`, { params: { data } }),

  // Busca todas as consultas cadastradas com determinado horário
  // Retorna lista de ConsultaResponse — filtramos por data no front
  buscarPorHorario: (horario) =>
    axios.get(`${API}/consulta/buscarHorario`, { params: { horario } }),

  criar: (dados) =>
    axios.post(`${API}/consulta`, dados),

  atualizar: (id, dados) =>
    axios.put(`${API}/consulta/${id}`, dados),

  deletar: (id) =>
    axios.delete(`${API}/consulta/${id}`),
};

// ── EXAMES ────────────────────────────────────
export const examesApi = {
  listar: () =>
    axios.get(`${API}/exames`),

  buscarPorId: (id) =>
    axios.get(`${API}/exames/${id}`),

  criar: (dados) =>
    axios.post(`${API}/exames`, dados),

  atualizar: (id, dados) =>
    axios.put(`${API}/exames/${id}`, dados),

  deletar: (id) =>
    axios.delete(`${API}/exames/${id}`),
};