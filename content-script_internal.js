// content-script.js

// Use a API fetch para baixar o conteúdo do script
// fetch('https://raw.githubusercontent.com/seedz-ag/sdz-chrome-meca-extension/main/content-script_internal.js')
//   .then(response => response.text())
//   .then(scriptContent => {
//     // Execute o script baixado
//     eval(scriptContent);
//   })
//   .catch(error => {
//     console.error('Erro ao baixar o script:', error);
//   });


// ===== versão 0.5 ======

// content-script.js

function loadPapaParse(callback) { // Insere a biblioteca papaparse na página. Usada para trabalhar com os dados de forma assincrona.
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

function downloadCSV(data, filename) { // Criação de arquivo CSV e download
  const csvRows = [];

  for (const row of data) {
      const cleanedRow = row.map(cell => cell.trim()); // Remove espaços em branco no início e no fim
      if (cleanedRow.some(cell => cell !== '')) { // Verifica se pelo menos uma célula não está vazia
          csvRows.push(cleanedRow.join(';')); // Utiliza ; como separador
      }
  }

  const csvContent = csvRows.join('\n');

  // Correção: Especificar a codificação como utf-8 com acentuação correta
  const blob = new Blob(["\uFEFF", csvContent], { type: 'text/csv;charset=utf-8;' });

  if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
  } else {
      const link = document.createElement('a');

      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }
}

// ============================================ Trabalho em tipo classico da tabela ==========================================

async function fetchAndExportAllPages(filename, id) {
  loadPapaParse(async function() {
      const mainElement = document.querySelector('main') || document.querySelector('body');

      if (!mainElement) {
          // console.error("No <main> element found on the page.");
          return;
      }

      let paginationItems = mainElement.querySelectorAll('.sc-hRJfrW') || mainElement.querySelectorAll('.v-pagination__item');
      if (mainElement.querySelectorAll('.sc-hRJfrW')) {
        if (mainElement.querySelectorAll('.sc-hRJfrW').length == 0) {
          paginationItems = mainElement.querySelectorAll('.v-pagination__item');
        }
      }

      const allData = [];

    collectTableHeader(mainElement, allData, id);

      if (paginationItems.length == 0) {
        collectTableData(mainElement, allData, id);

      } else {
          const maxPageNumber = parseInt(paginationItems[paginationItems.length-1].textContent, 10);

          for (let i = 1; i <= maxPageNumber; i++) {
            let paginationItemsDinamic = mainElement.querySelectorAll('.sc-hRJfrW') || mainElement.querySelectorAll('.v-pagination__item');
            if (mainElement.querySelectorAll('.sc-hRJfrW')) {
              if (mainElement.querySelectorAll('.sc-hRJfrW').length == 0) {
                paginationItemsDinamic = mainElement.querySelectorAll('.v-pagination__item');
              }
            }
            let thisPageNumber = mainElement;
            if (mainElement.querySelectorAll('.sc-hRJfrW.kMuCIt')) {
              if (mainElement.querySelectorAll('.sc-hRJfrW.kMuCIt').length != 0) {
                thisPageNumber = parseInt(mainElement.querySelectorAll('.sc-hRJfrW.kMuCIt')[0].textContent, 10);
              } else {
                thisPageNumber = parseInt(mainElement.querySelectorAll('.v-pagination__item--active')[0].textContent, 10);
              }
            } else {
              thisPageNumber = parseInt(mainElement.querySelectorAll('.v-pagination__item--active')[0].textContent, 10);
            }
            let k = 0;

              for (let j = 0; j < paginationItemsDinamic.length; j++) {
                  const pageButtonDinamic = paginationItemsDinamic[j];
                  const pageNumberDinamic = parseInt(pageButtonDinamic.textContent, 10);

                  if (pageNumberDinamic == (thisPageNumber + 1)) {
                      k = j;
                      j = paginationItemsDinamic.length;
                  }
              }
              let pageButton = paginationItemsDinamic[k];
              const pageNumber = parseInt(pageButton.textContent, 10);
              if (k == 0) {
                  pageButton = document.getElementsByClassName("sc-dLMFU gamWCV sc-ikkxIA cyzwDs")[1] || document.getElementsByClassName("v-pagination__navigation")[1];
              }

              if (!isNaN(pageNumber)) {
                  collectTableData(mainElement, allData, id);
                  let lastTable = mainElement.querySelectorAll('table')[id].textContent;
                  let count = 0;
                  if (thisPageNumber != maxPageNumber) {
                      pageButton.click();
                  } else {
                      count = -1;
                  }
                  while (count < 60 && count >= 0) {
                      let baseCurrentTable = mainElement.querySelectorAll('table')[id];
                      if (baseCurrentTable) {
                        let currentTable = mainElement.querySelectorAll('table')[id].textContent;
                        if (lastTable !== currentTable) {
                            count = -1;
                        } else {
                          await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 0.5 segundos
                          count++;
                        }
                      } else {
                            await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 0.5 segundos
                            count++;
                      }
                  }
                  if (count == 60) {
                      window.alert("Erro na velocidade de atualização da tabela. O processo de download foi interrompido.");
                      return;
                  }
              }
          }
      }
      if (allData.length > 0) {
          downloadCSV(allData, filename);
      } else {
          console.error("No data found on any page.");
      }
  });
}

function collectTableHeader(mainElement, allData, id) {
  const table = mainElement.querySelectorAll('table')[id];
  if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      const pageData = rows.map(row => {
          const cells = Array.from(row.querySelectorAll('th'));
          return cells.map(cell => cell.textContent);
      });
      allData.push(...pageData);
  }

}

function collectTableData(mainElement, allData, id) {
  const table = mainElement.querySelectorAll('table')[id];
  if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      const pageData = rows.map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells.map(cell => cell.textContent);
      });
      allData.push(...pageData);
  }
}

function insertExcelIconBeforeTable() {
  const mainElement = document.querySelector('main') || document.querySelector('body');
  const tables = mainElement.querySelectorAll('table');
  const excelIconUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1-cz7MFvpQ7rGJbthiRbXgJIHxrJIIvrTiA4RgVw5ug&s';
  let excelIcon = document.querySelector('#excel-icon');
  let i = 0;

  if (tables.length === 0) {
      // console.error("No <table> elements found on the page.");
      return;
  } else {
      tables.forEach(table => {
          const excelIcon = document.createElement('img');
          excelIcon.src = excelIconUrl;
          excelIcon.alt = 'Excel Icon';
          excelIcon.id = i;
          excelIcon.style.margin = '15px 0 0 15px';
          excelIcon.style.height = '30px';
          excelIcon.style.cursor = 'pointer';
          excelIcon.addEventListener('click', function() {
              const clickedIconId = parseInt(this.id);
              fetchAndExportAllPages('dados.csv', clickedIconId);
          });
          i = i + 1;

          if (table.parentNode.firstElementChild.src != excelIconUrl) {
              table.parentNode.insertBefore(excelIcon, table);
          }
      });
  }
}

// ============================================ Trabalho em tipo específico da tabela ==========================================

async function fetchAndExportAllPages2(filename, id) { 
  loadPapaParse(async function() {
      const mainElement = document.querySelector('main');

      if (!mainElement) {
          // console.error("No <main> element found on the page.");
          return;
      }

      const paginationItems = mainElement.querySelectorAll('.v-pagination__item');

      const allData = [];

      if (paginationItems.length == 0) {
        collectTableData2(mainElement, allData, id);
      } else {
          const maxPageNumber = parseInt(paginationItems[paginationItems.length-1].textContent, 10);

          for (let i = 1; i <= maxPageNumber; i++) {
            const paginationItemsDinamic = mainElement.querySelectorAll('.v-pagination__item');
            const thisPageNumber = parseInt(mainElement.querySelectorAll('.v-pagination__item--active')[0].textContent, 10);
            let k = 0;

              for (let j = 0; j < paginationItemsDinamic.length; j++) {
                  const pageButtonDinamic = paginationItemsDinamic[j];
                  const pageNumberDinamic = parseInt(pageButtonDinamic.textContent, 10);

                  if (pageNumberDinamic == (thisPageNumber + 1)) {
                      k = j;
                      j = paginationItemsDinamic.length;
                  }
              }
              let pageButton = paginationItemsDinamic[k];
              const pageNumber = parseInt(pageButton.textContent, 10);
              if (k == 0) {
                  pageButton = document.getElementsByClassName("v-pagination__navigation")[1];
              }

              if (!isNaN(pageNumber)) {
                  collectTableData2(mainElement, allData, id);
                  let get = 0;
                  let lastTable = null;
                  while (get < 60) {
                      if (mainElement.querySelectorAll('.v-expansion-panel')[id] != undefined) {
                          lastTable = mainElement.querySelectorAll('.v-expansion-panel')[id].textContent;
                          get = 60;
                      } else {
                          await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 0.5 segundos
                          count++;
                      }
                  }
                  let count = 0;
                  if (thisPageNumber != maxPageNumber) {
                      pageButton.click();
                  } else {
                      count = -1;
                  }
                  let currentTable = lastTable;
                  while (count < 60 && count >= 0) {
                      if (mainElement.querySelectorAll('.v-expansion-panel')[id] != undefined) {
                          currentTable = mainElement.querySelectorAll('.v-expansion-panel')[id].textContent;
                          if (lastTable !== currentTable) {
                              count = -1;
                          } else {
                              await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 0.5 segundos
                              count++;
                          }
                      } else {
                          await new Promise(resolve => setTimeout(resolve, 500)); // Aguarda 0.5 segundos
                          count++;
                      }
                  }
              }
          }
      }
      if (allData.length > 0) {
          downloadCSV(allData, filename);
      } else {
          console.error("No data found on any page.");
      }
  });
}

function collectTableData2(mainElement, allData, id) {
  const table = mainElement.querySelectorAll('.v-expansion-panel')[id];
  if (table) {
      const rows = Array.from(table.querySelectorAll('li'));
      const pageData = rows.map(row => {
          let textRow = row.textContent;
          textRow = textRow.replace(new RegExp("arrow_upward", "g"), "arrow_upward ⬆ arrow_upward");
          textRow = textRow.replace(new RegExp("arrow_downward", "g"), "arrow_downward ⬇ arrow_downward");
          const cells = textRow.split(/\n| person |event |arrow_upward|arrow_downward|keyboard_arrow_down|keyboard_arrow_up/);
          return cells.map(cell => cell);
      });
      allData.push(...pageData);
  }
}

function insertExcelIconBeforeTable2() {
  const mainElement = document.querySelector('main') || document.querySelector('body');
  const validation = document.createElement("a");
  const tables = mainElement.querySelectorAll('.v-expansion-panel') || validation;
  if (tables == validation) {
    return;
  }
  const excelIconUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1-cz7MFvpQ7rGJbthiRbXgJIHxrJIIvrTiA4RgVw5ug&s';
  let excelIcon = document.querySelector('#excel-icon');
  let i = 0;

  if (tables.length === 0) {
      // console.error("No <table> elements found on the page.");
      return;
  } else {
      if (tables[0].previousElementSibling == null || (tables[0].previousElementSibling != null && tables[0].previousElementSibling.src != excelIconUrl)) {
  tables.forEach(table => {
      const excelIcon = document.createElement('img');
      excelIcon.src = excelIconUrl;
      excelIcon.alt = 'Excel Icon';
      excelIcon.id = i;
      excelIcon.style.margin = '15px 0 0 15px';
      excelIcon.style.height = '30px';
      excelIcon.style.cursor = 'pointer';
      excelIcon.addEventListener('click', function() {
    const clickedIconId = parseInt(this.id);
    fetchAndExportAllPages2('dados.csv', clickedIconId);
      });
      i = i + 1;
      table.parentNode.insertBefore(excelIcon, table);
  });
    }
  }
}

// Chame a função para inserir o ícone antes da tabela
window.onload = function() {

  var element1 = document.createElement("a");
  element1.href = "https://adm.seedz.ag/";
  element1.style.top = "0px";  
  element1.style.left = "0px";     
  element1.style.width = "200px";
  if (!document.getElementsByClassName("v-toolbar__content")[1]) {
    element1.style.height = "55px"; 
  } else {
    element1.style.height = "80px";
  }
  element1.style.position = "fixed";
  element1.style.zIndex = "1000";  
  document.body.appendChild(element1);

  const element2 = document.createElement('div');
  element2.textContent = "A Extensão 'M.E.C.A. Seedz' está em Execução!";
  element2.style.position = "fixed"; 
  if (!document.getElementsByClassName("v-toolbar__content")[1]) {
    element2.style.top = "10px";  
  } else {
    element2.style.top = "50px";  
  }
  element2.style.left = "270px";      
  element2.style.color = "gray";
  element2.style.zIndex = "1000"; 
  document.body.appendChild(element2);

  insertExcelIconBeforeTable(); // tipo classico da tabela
  insertExcelIconBeforeTable2(); // tipo específico de tabela

  // Executa a função a cada 1.5 segundos
  setInterval(insertExcelIconBeforeTable, 1500);
  setInterval(insertExcelIconBeforeTable2, 1500);
  // Executa a função a cada 3 segundos
  setInterval(insertExcelIconBeforeTable, 3000);
  setInterval(insertExcelIconBeforeTable2, 3000);
  // Executa a função a cada 10 segundos
  setInterval(insertExcelIconBeforeTable, 10000);
  setInterval(insertExcelIconBeforeTable2, 10000);
  console.log("M.E.C.A. Seedz v0.5.3");
};
