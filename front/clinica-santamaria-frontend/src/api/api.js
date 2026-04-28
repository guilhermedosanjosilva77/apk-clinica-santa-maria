// ─────────────────────────────────────────────
// api/api.js
// Centraliza todas as chamadas para a API
// Se o endereço mudar, muda só aqui
// ─────────────────────────────────────────────
import axios from 'axios';

const API = 'http://localhost:8080';

// ── PACIENTE ──────────────────────────────────
export const pacienteApi = {

  // GET /paciente — lista todos
  listar: () =>
    axios.get(`${API}/paciente`),

  // GET /paciente/{id} — busca por ID
  buscarPorId: (id) =>
    axios.get(`${API}/paciente/${id}`),

  // GET /paciente/buscar?data=yyyy-mm-dd — busca por data de nascimento
  buscarPorData: (data) =>
    axios.get(`${API}/paciente/buscar`, { params: { data } }),

  // POST /paciente — cadastra nova paciente
  criar: (dados) =>
    axios.post(`${API}/paciente`, dados),

  // PUT /paciente/{id} — atualiza cadastro
  atualizar: (id, dados) =>
    axios.put(`${API}/paciente/${id}`, dados),

  // DELETE /paciente/{id} — remove paciente
  deletar: (id) =>
    axios.delete(`${API}/paciente/${id}`),
};

// ── CONSULTA ──────────────────────────────────
export const consultaApi = {

  // GET /consulta — lista todas
  listar: () =>
    axios.get(`${API}/consulta`),

  // GET /consulta/buscar?data=yyyy-mm-dd — busca por data
  buscarPorData: (data) =>
    axios.get(`${API}/consulta/buscar`, { params: { data } }),

  // POST /consulta — cria nova consulta
  criar: (dados) =>
    axios.post(`${API}/consulta`, dados),

  // POST /consulta/{id} — atualiza consulta
  atualizar: (id, dados) =>
    axios.post(`${API}/consulta/${id}`, dados),

  // DELETE /consulta — deleta consulta
  deletar: (id) =>
    axios.delete(`${API}/consulta/${id}`),
};
