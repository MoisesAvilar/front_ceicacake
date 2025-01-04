# Frontend Ceicacake

Este projeto é o frontend da aplicação Ceicacake, desenvolvido para consumir a API de gerenciamento de clientes e vendas.

## Objetivo
O objetivo deste frontend é oferecer uma interface amigável e intuitiva para o gerenciamento de todo o sistema utilizando tanto o celular quanto qualquer outro dispositivo.

## Funcionalidades

- **Design Responsivo**: Interface desenvolvida para ser totalmente responsiva em dispositivos móveis, tablets e desktops.
- **Listagem de Clientes**: Visualize uma lista completa de todos os clientes cadastrados.
- **Gerenciamento de Vendas**: Registre novas vendas, visualize vendas passadas e acompanhe o status de pagamento.
- **Autenticação de Usuário**: Login e logout utilizando a API de autenticação JWT.
- **Cadastro de Novos Clientes e Vendas**: Interface simples para adicionar novos clientes e registrar vendas.
- **Atualização de Dados**: Edite e atualize informações de clientes e vendas conforme necessário.
- **Gráficos**: Permite visualizar dados de vendas de forma personalizada.

## Tecnologias Utilizadas

- **React.js**: Biblioteca JavaScript para construção da interface do usuário.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática, melhorando a qualidade do código e a manutenção.
- **Axios**: Cliente HTTP para consumir a API Django.
- **React Router**: Para navegação entre páginas do aplicativo.

## Estrutura do Projeto
- `/src/components`: Componentes reutilizáveis, como botões e formulários.
- `/src/pages`: Páginas principais da aplicação, como a listagem de clientes e formulário de vendas.
- `/src/services`: Serviços para consumir a API com Axios.

## Rotas da Aplicação
- `/login`: Página de autenticação do usuário.
- `/customers`: Listagem de todos os clientes.
- `/customers/:id`: Detalhes e edição de um cliente específico.
- `/customers/new`: Formulário para registrar novos clientes.
- `/sales`: Listagem de todas as vendas.
- `/sales/new`: Formulário para registrar uma nova venda.
- `/sales/:id`: Detalhes e edição de uma venda específica.
- `/sales/chart`: Gráficos para visualização de métricas e detalhes do sistema. 

## Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir um problema ou enviar um pull request. Toda ajuda é apreciada para melhorar e expandir as funcionalidades deste projeto.

# Licença
Este projeto está licenciado sob a MIT License.