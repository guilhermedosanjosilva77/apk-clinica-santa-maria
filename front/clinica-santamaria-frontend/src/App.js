import './App.css';
// 1. Alteramos o import de BrowserRouter para HashRouter
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Agenda from './pages/Agenda';
import Cadastro from './pages/Cadastro';

function Navbar() {
  return (
    <nav className="navbar">
      <span className="nav-brand">Clínica Santa Maria</span>
      {/* O NavLink continuará funcionando da mesma forma, mas o React Router cuidará do '#' sozinho */}
      <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end> Início </NavLink>
      <NavLink to="/cadastro" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}> Cadastros </NavLink>
    </nav>
  );
}

function App() {
  return (
    // 2. Trocamos o BrowserRouter pelo Router (HashRouter)
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Agenda />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </Router>
  );
}

export default App;