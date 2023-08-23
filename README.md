# M.E.C.A. Seedz
Chrome Extension.

BAIXE QUALQUER TABELA DO ADM SEEDZ!

Antes de começar baixe o aquivo em zip, e descompacte ele em sua máquina: https://github.com/seedz-ag/sdz-chrome-meca-extension/archive/refs/heads/main.zip

Se você não tiver um descompactador clique aqui e faça o download: https://www.winzip.com/br/download/winzip/

Siga os passos abaixo para instalar a extensão da Seedz:

1 - Abra seu navegador Google Chrome e entre na URL chrome://extensions/

2 - Ligue o seu “modo do desenvolvedor” e clique no botão para “carregar sem compactação”

3 - Procure pela pasta “M.E.C.A”, e clique em “selecionar Pasta”

4 - Agora é só recarregar a página do ADM da Seedz (https://adm.seedz.ag/) e usar a vontade! Não precisa clicar em nada, os ícones já começaram a aparecer dentro do ADM Seedz.

======= Para nerds e curiosos =======

"M.E.C.A." significa Melhor Extensão do Chrome para Administradores (ADM). 

Dentro da pasta, existem 4 arquivos:

- Logo Cor 4.png: Este é o logotipo da Seedz, que servirá como ícone da extensão.

- content-script.js: Trata-se de um código JavaScript relativamente simples que essencialmente importa o código do content-script_internal.js. Ele faz isso para que, uma vez instalado na máquina, seja possível efetuar edições no código sem que todos os clientes precisem baixar novamente a extensão, caso surja algum problema ou atualização. Esse arquivo é obtido através de uma URL estática, o que nos permite realizar edições à distância, sem a necessidade de alterar o código baixado pelo usuário.

- manifest.json: Esse arquivo contém as declarações da extensão para o Google Chrome, permitindo que a extensão modifique as páginas e realize downloads.

- popup.html: Trata-se de uma página exibida ao clicar no ícone da extensão. Ela não possui funcionalidade prática, apenas um layout para evitar que o usuário pense que ocorreu um erro; caso contrário, uma página em branco seria exibida.
