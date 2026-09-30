# ⚡ Regra de Execução Autônoma Pós-Aprovação de Plano

Esta regra estabelece o protocolo de autonomia total para o agente no projeto **T-MAINT**:

---

## 🎯 Diretriz de Autonomia & Fluxo Contínuo

1. **Alinhamento Inicial Interativo:**
   - Durante a fase de especificação e design (ex: `/brainstorming` ou questionários de requisitos), o agente faz as perguntas necessárias para coletar as preferências do usuário.
   - Em seguida, o plano de implementação detalhado é gerado.

2. **Execução 100% Autônoma Após Aprovação:**
   - A partir do momento em que o usuário aprova o plano de implementação (seja clicando em **Proceed**, respondendo *"Prosseguir"*, *"Aprovado"*, *"Pode fazer"* ou selecionando a opção final de implementação):
   - **O AGENTE NÃO DEVE MAIS PARAR PARA PEDIR AUTORIZAÇÃO OU PERGUNTAR SE PODE CONTINUAR.**
   - O agente deve executar sequencialmente **todas as tarefas, edições de arquivos e testes** do plano de forma contínua e autônoma.

3. **Ciclo Completo Automático:**
   - Criar/atualizar arquivos e componentes de código.
   - Atualizar e criar os testes unitários correspondentes.
   - Executar a esteira de validação de qualidade:
     - `npx tsc --noEmit` (0 erros)
     - `npm test` (100% de aprovação)
     - `npm run build` (build bem-sucedido)
   - Criar branch dedicada (`feat/*`, `fix/*`, `refactor/*`).
   - Fazer commit padronizado e push para o repositório remoto.
   - Criar o **Pull Request** completo no GitHub com todas as 4 seções obrigatórias de governança.

4. **Entrega Final:**
   - O agente só deve finalizar seu turno após a conclusão de todo o ciclo acima, entregando ao usuário uma mensagem final objetiva com o resumo das alterações e o **link do Pull Request pronto para revisão e aprovação**.
