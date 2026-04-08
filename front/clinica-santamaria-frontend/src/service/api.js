const API_URL = "http://localhost:8080"; // URL padrão do seu Spring Boot

export const pacienteService = {
    salvar: async (paciente) => {
        const response = await fetch(`${API_URL}/paciente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paciente)
        });

        if (!response.ok) {
            // Tenta pegar a mensagem de erro do Spring (como as do @CPF ou @Email)
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao salvar paciente");
        }

        return await response.json();
    }
};