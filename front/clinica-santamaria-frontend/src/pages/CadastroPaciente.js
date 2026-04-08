import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { PatternFormat } from 'react-number-format';
import { pacienteService } from '../services/api'; // Importando o serviço de conexão
import '../assets/App.css';

const CadastroPaciente = () => {
    // Estado inicial alinhado com a PacienteEntity do Java
    const [formData, setFormData] = useState({
        nome: '',
        dataNascimento: '',
        cpf: '',
        numeroProntuario: '',
        email: '',
        endereco: '',
        estadoCivil: 'SOLTEIRO',
        profissao: '',
        celular: '',
        dataCadastro: new Date().toISOString().split('T')[0]
    });

    // Atualiza campos de texto comuns
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Atualiza campos com máscara (CPF e Celular)
    const handleMaskChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Envia os dados para o @PostMapping do Spring Boot
            await pacienteService.salvar(formData);
            
            alert("✅ Paciente cadastrado com sucesso!");
            
            // Limpa o formulário para um novo cadastro
            setFormData({
                nome: '',
                dataNascimento: '',
                cpf: '',
                numeroProntuario: '',
                email: '',
                endereco: '',
                estadoCivil: 'SOLTEIRO',
                profissao: '',
                celular: '',
                dataCadastro: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            // Exibe o erro retornado pelo Bean Validation do Java (@CPF, @Email, @NotBlank)
            alert("❌ Erro ao cadastrar: " + error.message);
        }
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-brand">Clinica Santa Maria</div>
                <div className="nav-links">
                    <button className="nav-item">Inicio</button>
                    <button className="nav-item active">Cadastros</button>
                    <button className="nav-item">Retornos Ativos</button>
                </div>
            </nav>

            <div className="content">
                <div className="cadastro-card">
                    <div className="form-header">
                        <div className="icon-circle">
                            <User size={24} color="#1a5276" />
                        </div>
                        <h2>Cadastro De Paciente</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="paciente-form">
                        <div className="form-section-title">Dados do Paciente</div>
                        
                        <div className="form-grid">
                            {/* Coluna 1 */}
                            <div className="form-col">
                                <div className="input-block">
                                    <label>Nome Completo:</label>
                                    <input type="text" name="nome" placeholder="Ex: Nome do Paciente" required value={formData.nome} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Data de nascimento:</label>
                                    <input type="date" name="dataNascimento" required value={formData.dataNascimento} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Email:</label>
                                    <input type="email" name="email" placeholder="Ex: paciente@gmail.com" value={formData.email} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Estado Civil:</label>
                                    <select name="estadoCivil" value={formData.estadoCivil} onChange={handleChange}>
                                        <option value="SOLTEIRO">Solteiro</option>
                                        <option value="CASADO">Casado</option>
                                        <option value="DIVORCIADO">Divorciado</option>
                                        <option value="VIUVO">Viúvo</option>
                                    </select>
                                </div>
                                <div className="input-block">
                                    <label>Celular:</label>
                                    <PatternFormat 
                                        format="(##) #####-####" 
                                        mask="_"
                                        value={formData.celular}
                                        onValueChange={(values) => handleMaskChange('celular', values.formattedValue)}
                                        placeholder="(00) 00000-0000"
                                        className="mask-input"
                                    />
                                </div>
                            </div>

                            {/* Coluna 2 */}
                            <div className="form-col">
                                <div className="input-block">
                                    <label>CPF:</label>
                                    <PatternFormat 
                                        format="###.###.###-##" 
                                        mask="_"
                                        value={formData.cpf}
                                        onValueChange={(values) => handleMaskChange('cpf', values.formattedValue)}
                                        placeholder="000.000.000-00"
                                        className="mask-input"
                                        required
                                    />
                                </div>
                                <div className="input-block">
                                    <label>Nº Prontuário:</label>
                                    <input type="number" name="numeroProntuario" placeholder="Ex: 1234" value={formData.numeroProntuario} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Endereço:</label>
                                    <input type="text" name="endereco" placeholder="Ex: Rua, Número, Bairro" value={formData.endereco} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Profissão:</label>
                                    <input type="text" name="profissao" placeholder="Ex: Engenheiro" value={formData.profissao} onChange={handleChange} />
                                </div>
                                <div className="input-block">
                                    <label>Data Cadastro:</label>
                                    <input type="date" name="dataCadastro" readOnly value={formData.dataCadastro} />
                                </div>
                            </div>
                        </div>

                        <div className="form-footer">
                            <button type="submit" className="btn-cadastrar">
                                <Save size={18} style={{ marginRight: '8px' }} />
                                Cadastrar Paciente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CadastroPaciente;