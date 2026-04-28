// ─────────────────────────────────────────────
// App.js — Arquivo principal
// Define as rotas e a navbar da aplicação
// ─────────────────────────────────────────────
import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Agenda   from './pages/Agenda';
import Cadastro from './pages/Cadastro';

// ── Navbar — aparece em todas as páginas ──────
function Navbar() {
  return (
    <nav className="navbar">
      <span className="nav-brand">Clínica Santa Maria</span>
      <NavLink to="/"          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>
        Início
      </NavLink>
      <NavLink to="/cadastros" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
        Cadastros
      </NavLink>
    </nav>
  );
}

// ── App — raiz da aplicação ───────────────────
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Agenda />}   />
        <Route path="/cadastros" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
