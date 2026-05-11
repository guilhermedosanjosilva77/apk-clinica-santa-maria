import './App.css';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Agenda from './pages/Agenda';
import Cadastro from './pages/Cadastro';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="nav-brand">Clínica Santa Maria</span>
      <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end> Início </NavLink>
      <NavLink to="/cadastro" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}> Cadastros </NavLink>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Agenda />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;