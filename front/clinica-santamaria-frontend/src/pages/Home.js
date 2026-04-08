import React, { useState, useEffect } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import '../assets/App.css';

const Home = () => {
    const [dataFiltro, setDataFiltro] = useState(new Date());
    const [consultas, setConsultas] = useState([]);

    const hoje = startOfDay(new Date());
    const dataLimite = subDays(hoje, 7); 

    useEffect(() => {
        const carregarConsultasDoDia = async () => {
            const dataFormatada = format(dataFiltro, 'yyyy-MM-dd');
            console.log("Buscando no banco para a data:", dataFormatada);

            try {
                // Simulando o que viria do seu banco de dados
                // Se o banco retornar uma lista vazia [], a tela ficará limpa.
                const dadosFicticios = [
                    { 
                        id: 1, 
                        horario: "09:00", 
                        paciente: { nome: "Maria Joaquina", celular: "(16) 99777-6111" },
                        tipo: "UNIMED" 
                    },
                    { 
                        id: 3, 
                        horario: "14:30", 
                        paciente: { nome: "Laura", celular: "(16) 99777-6111" },
                        tipo: "PARTICULAR" 
                    }
                ];
                setConsultas(dadosFicticios);
            } catch (error) {
                console.error("Erro ao buscar consultas:", error);
            }
        };

        carregarConsultasDoDia();
    }, [dataFiltro]);

    const handleDeletar = (id) => {
        if (window.confirm("Deseja realmente remover esta consulta?")) {
            console.log("Deletando ID:", id);
        }
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-brand">Clinica Santa Maria</div>
                <div className="nav-links">
                    <button className="nav-item">Inicio</button>
                    <button className="nav-item">Cadastros</button>
                    <button className="nav-item active">Retornos Ativos</button>
                </div>
            </nav>

            <div className="content">
                <div className="agenda-header">
                    <div className="title-group">
                        <h2 className="main-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={24} /> Agenda do dia
                        </h2>
                        <span className="subtitle">{consultas.length} Consultas Marcadas</span>
                    </div>

                    <div className="date-picker-container">
                        <CalendarIcon size={18} className="icon-blue" />
                        <div className="input-group">
                            <label>HISTÓRICO (MÁX 7 DIAS)</label>
                            <input 
                                type="date" 
                                min={format(dataLimite, 'yyyy-MM-dd')}
                                max={format(hoje, 'yyyy-MM-dd')}
                                value={format(dataFiltro, 'yyyy-MM-dd')}
                                onChange={(e) => setDataFiltro(new Date(e.target.value + 'T00:00:00'))}
                            />
                        </div>
                    </div>
                </div>

                <div className="agenda-table">
                    <div className="table-thead">
                        <div className="th-hora">HORÁRIO</div>
                        <div className="th-paciente">PACIENTE</div>
                    </div>

                    {/* ALTERAÇÃO AQUI: Só mapeamos as consultas que existem no estado */}
                    {consultas.length > 0 ? (
                        consultas.map((consulta) => (
                            <div key={consulta.id} className="table-row-group">
                                <div className="table-row has-data">
                                    <div className="cell-hora">{consulta.horario}</div>
                                    <div className="cell-paciente">
                                        <div className="paciente-info">
                                            <span className="nome">{consulta.paciente.nome}</span>
                                            <span className="detalhes">
                                                {consulta.paciente.celular} · {consulta.tipo}
                                            </span>
                                        </div>
                                        <button 
                                            className="btn-deletar" 
                                            onClick={() => handleDeletar(consulta.id)}
                                        >
                                            Deletar
                                        </button>
                                    </div>
                                </div>
                                <div className="row-encaixe">
                                    <div className="label-encaixe">Encaixe</div>
                                    <div className="spacer"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Mensagem caso não haja nada agendado no dia selecionado */
                        <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontStyle: 'italic' }}>
                            Nenhuma consulta agendada para este dia.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;