// content-script.js

// Use a API fetch para baixar o conteúdo do script
fetch('https://raw.githubusercontent.com/seedz-ag/sdz-chrome-meca-extension/main/content-script_internal.js')
  .then(response => response.text())
  .then(scriptContent => {
    // Execute o script baixado
    eval(scriptContent);
  })
  .catch(error => {
    console.error('Erro ao baixar o script:', error);
  });
