# AI Contribution Guidelines

## Tech Stack Overview
- Aplicação construída com Vite + React 18 e escrita integralmente em TypeScript.
- Navegação controlada por React Router com as páginas localizadas em `src/pages`.
- Estado remoto e efeitos assíncronos gerenciados com @tanstack/react-query.
- Estilização baseada em Tailwind CSS, com variáveis de tema definidas em `src/index.css`.
- Componentes de interface derivados majoritariamente do design system shadcn/ui (Radix UI).
- Sistema de notificações via sonner e toasts personalizados disponíveis em `@/components/ui`.
- Conjunto de ícones fornecido por lucide-react para consistência visual.
- Integração pronta para uso com Supabase através do cliente em `@/integrations/supabase/client`.

## Library Usage Rules
- **Interface**: Prefira componentes shadcn/ui (não edite arquivos originais; crie componentes novos em `src/components` quando necessário).
- **Estilos**: Utilize classes utilitárias do Tailwind e mantenha responsividade; não escreva CSS isolado fora de casos excepcionais.
- **Navegação**: Adicione novas rotas exclusivamente em `src/App.tsx` e crie páginas em `src/pages`.
- **Ícones**: Empregue ícones de lucide-react para manter consistência visual.
- **Feedback ao usuário**: Use `sonner` (função `toast`) ou o sistema de toasts shadcn para mensagens e alertas.
- **Estado assíncrono**: Dependendo de dados remotos, use react-query com os hooks já configurados.
- **Persistência local**: Para dados simples no cliente, utilize localStorage encapsulado em hooks como `useUserProgress`.
- **Integrações externas**: Para backend ou autenticação, conecte-se via Supabase usando o cliente existente.
- **Arquitetura**: Separe componentes por responsabilidade, mantendo-os com menos de 100 linhas quando possível e evitando sobreengenharia.
- **Boas práticas**: Importe arquivos usando aliases definidos (`@/`) e mantenha o padrão de codificação atual sem introduzir bibliotecas adicionais sem justificativa.