// 1. Elementos da página
const welcomeSection = document.getElementById("welcome-section");
const formSection = document.getElementById("form-section");
const enterButton = document.getElementById("enter-button");
const form = document.getElementById("registration-form");
const successMessage = document.getElementById("success-message");

const nameInput = document.getElementById("nome");
const birthInput = document.getElementById("data-nascimento");
const areaInput = document.getElementById("area-nerd");
const cpfInput = document.getElementById("cpf");
const nomeSocialInput = document.getElementById("nome-social");
const telefoneInput = document.getElementById("telefone");
const bioInput = document.getElementById("bio");

// 2. Elementos da "Nossa Party"
const recordsSection = document.getElementById("records-section");
const recordCount = document.getElementById("record-count");
const emptyState = document.getElementById("empty-state");
const recordList = document.getElementById("record-list");

// 3. Muda a tela e tenta mostrar membros salvos
enterButton.addEventListener("click", () => {
  welcomeSection.classList.add("hidden");
  formSection.classList.remove("hidden");
  recordsSection.classList.remove("hidden");
  exibirMembro(); 
});

// A nossa ponte para o Google Sheets
const URL_DA_API = "https://script.google.com/macros/s/AKfycbz8nwqbaovC_LJX3HBNUlQa21FRMJxP385V0Vi9clyMbz2K82R-fOCZsmvVkOQE4pPL4Q/exec"; 

// 4. Salva a LISTA na tela e envia para a NUVEM
form.addEventListener("submit", (event) => {
  event.preventDefault(); 
  
  const novoMembro = {
    nome: nameInput.value,
    nomeSocial: nomeSocialInput.value,
    data: birthInput.value,
    area: areaInput.value,
    cpf: cpfInput.value,
    telefone: telefoneInput.value,
    bio: bioInput.value
  };

  let listaMembros = JSON.parse(localStorage.getItem("membrosAMCN")) || [];
  const jaExiste = listaMembros.some(membro => membro.nome === novoMembro.nome && membro.data === novoMembro.data);

  if (jaExiste) {
    alert("Ops! Este membro já está cadastrado na nossa Party.");
  } else {
    // 1. Atualiza a tela instantaneamente (Local)
    listaMembros.push(novoMembro);
    localStorage.setItem("membrosAMCN", JSON.stringify(listaMembros));
    successMessage.classList.add("is-visible"); 
    exibirMembro(); 

    // 2. Dispara a cópia para a Planilha (Nuvem) ☁️
    fetch(URL_DA_API, {
      method: "POST",
      body: JSON.stringify(novoMembro)
    }).then(() => {
      console.log("Dados enviados para a nuvem com sucesso!");
    }).catch((erro) => {
      console.log("Erro ao tentar enviar para a nuvem: ", erro);
    });
  }
});
// 3. Função que lê a lista da NUVEM e cria os perfis
function exibirMembro() {
  // Mostra um aviso enquanto a internet busca os dados
  recordList.innerHTML = "<p class='text-white'>Carregando membros da Party...</p>";
  
  fetch(URL_DA_API)
    .then(resposta => resposta.json()) // Lê a resposta da planilha
    .then(listaMembros => {
      recordList.innerHTML = ""; // Limpa o "Carregando..."
      
      if (listaMembros.length > 0) {
        emptyState.classList.add("hidden");
        recordCount.innerText = listaMembros.length; 
        
       // Desenha cada cartão recebido da nuvem
        listaMembros.forEach(membro => {
          // Cria o HTML da bio apenas se ela existir
          const bioHtml = membro.bio ? `<p class="text-sm text-white/80 mt-4 italic">"${membro.bio}"</p>` : '';

          recordList.innerHTML += `
            <div class="canva-panel p-6 rounded-xl border border-white/10 bg-white/5">
              <h4 class="font-bold text-xl text-white">${membro.nomeSocial || membro.nome}</h4>
              <p class="text-sm font-bold tracking-widest uppercase mt-2" style="color: var(--lime);">${membro.area}</p>
              ${bioHtml}
            </div>
          `;
        });
      } else {
        // Se a planilha estiver vazia, mostra o estado inicial
        emptyState.classList.remove("hidden");
        recordCount.innerText = "0";
      }
    })
    .catch(erro => console.log("Erro ao carregar: ", erro));
}
// 4. Controle do Modal de Termos de Uso
const btnAbrirTermos = document.getElementById("abrir-termos");
const btnFecharTermos = document.getElementById("fechar-termos");
const modalTermos = document.getElementById("modal-termos");

// Quando clicar no texto verde, mostra a janela (tira o 'hidden' e coloca 'flex')
btnAbrirTermos.addEventListener("click", () => {
  modalTermos.classList.remove("hidden");
  modalTermos.classList.add("flex");
});

// Quando clicar em "Entendi", esconde a janela
btnFecharTermos.addEventListener("click", () => {
  modalTermos.classList.add("hidden");
  modalTermos.classList.remove("flex");
});