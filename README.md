Esta aplicação foi desenvolvida utilizando React e Material UI. Além disso, utilizamos o template Mantis, que fornece uma estrutura de arquivos pré-montada e componentes adicionais que complementam os que não estão disponíveis no Material UI. Fontawesome também é utilizado em casos de ícones ausentes no MUI.

- Para mais informações sobre o Mantis, acesse: https://mantisdashboard.io/

- Para mais informações sobre o Material UI, acesse: https://mui.com/material-ui/all-components/


**Requisitos**


Certifique-se de que você tenha o Visual Studio Code ou outra IDE, Node.js e o npm instalados em sua máquina.


**Como iniciar o projeto**


Link do repositório: https://gitlab.com/hyonpar/e-xyon/novogestor/servicojuridico-ui/

1. Clone o repositório para sua máquina. O próprio Gitlab já fornece essa opção de uma forma mais simples clicando no botão azul code. 


2. Instale as dependências do projeto: 

Abra o terminal, seja do Windows ou do próprio Visual Studio e digite npm install dentro da pasta do projeto.

   
3. Inicie a aplicação:

Abra o terminal, seja do Windows ou do próprio Visual Studio e digite npm start

A aplicação será aberta no seu navegador, geralmente no endereço `http://localhost:4000`.


**Resolvendo o erro "missing script: start"**


Se você receber o erro `missing script: start` ao tentar rodar `npm start`, siga estes passos:

- Certifique-se de que o arquivo package.json contém o script `start` na seção `scripts`. Ele deve se parecer com isso:

"scripts": {
    "start": "set PORT=4000 && react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
 
- Se o script não estiver lá, adicione-o manualmente e tente executar novamente o comando `npm start`.


**Configuração de Ambiente**


Para alternar entre os ambientes de desenvolvimento (dev) e homologação (hom), acesse o arquivo `config.js` na raiz do projeto e faça as alterações necessárias.

Um detalhe importante: O ambiente de homologação possui uma gama maior de dados e é ideal para testes antes de enviar o projeto para o QA.


**Servidores e Endpoints**


Os servidores de homologação e desenvolvimento desligam automaticamente após as 19:00.

Servidor de Homologação: exy-gcp-hdck-02 10.0.72.13

https://console.cloud.google.com/compute/instances?project=novo-gestor-hmg&supportedpurview=project

Servidor de Desenvolvimento: exy-gcp-dapp-01 10.0.70.3

https://console.cloud.google.com/compute/instances?project=d-software-dev&supportedpurview=project

Este projeto possui seus endpoints no Swagger. Geralmente utilizamos o ambiente de homologação para as requisições. Abaixo estão os detalhes:

Query (Listagem de combos, listas, etc.): http://10.0.72.13:5020/swagger/index.html
Command (Inserir, editar, excluir, etc.): http://10.0.72.13:5030/swagger/index.html


Outras Considerações

– A maioria das páginas presentes no projeto se encontram na pasta src/pages/apps.

– Se você precisar de componentes que o Material UI não oferece ou que não se encaixam exatamente com o design no Figma, explore os componentes extras fornecidos pelo template Mantis. 


