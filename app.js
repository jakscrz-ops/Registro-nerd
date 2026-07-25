// 1. Elementos da página
const welcomeSection = document.getElementById("welcome-section");
const formSection = document.getElementById("form-section");
const enterButton = document.getElementById("enter-button");
const form = document.getElementById("registration-form");
const successMessage = document.getElementById("success-message");

const nameInput = document.getElementById("nome");
const birthInput = document.getElementById("data-nascimento");
const areaInput = document.getElementById("area-nerd");

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
const URL_DA_API = "https://script.google.com/macros/s/AKfycbxLHs9De0xPas96p1tjTSl8cuoKNDowINT7-w14dk-LbmVH6fNtHtZFwGSWV8qzslX75w/exec"; 

// 4. Salva a LISTA na tela e envia para a NUVEM
form.addEventListener("submit", (event) => {
  event.preventDefault(); 
  
  const novoMembro = {
    nome: nameInput.value,
    data: birthInput.value,
    area: areaInput.value
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
// 5. Função que lê a lista da NUVEM e cria os perfis
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
          recordList.innerHTML += `
            <div class="canva-panel p-6 rounded-xl border border-white/10 bg-white/5">
              <h4 class="font-bold text-xl text-white">${membro.nome}</h4>
              <p class="text-sm font-bold tracking-widest uppercase mt-2" style="color: var(--lime);">${membro.area}</p>
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
// --- Passo 6: Lógica do Carrossel de Eventos ---

// 1. Variáveis e Seletores
const carousel = document.getElementById("event-carousel");
const slides = carousel.querySelectorAll(".carousel-item");
const prevBtn = document.getElementById("carousel-prev");
const nextBtn = document.getElementById("carousel-next");
const indicators = carousel.querySelectorAll(".indicator");
let currentSlideIndex = 0; // Índice do slide visível inicialmente (o primeiro)
let carouselInterval; // Variável para o intervalo automático

// 2. Função para exibir um slide específico
function showSlide(index) {
  // Primeiro, oculta todos os slides e indicadores
  slides.forEach((slide) => slide.classList.add("opacity-0"));
  slides.forEach((slide) => slide.classList.remove("opacity-100"));
  indicators.forEach((indicator) => indicator.classList.add("bg-white/40"));
  indicators.forEach((indicator) => indicator.classList.remove("bg-white"));

  // Depois, exibe apenas o slide do índice solicitado
  slides[index].classList.remove("opacity-0");
  slides[index].classList.add("opacity-100");
  indicators[index].classList.remove("bg-white/40");
  indicators[index].classList.add("bg-white");
}

// 3. Funções para próximo e anterior slide
function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length; // Avança e volta para 0 se chegar no fim
  showSlide(currentSlideIndex);
}

function prevSlide() {
  currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length; // Volta e vai para o fim se chegar no 0
  showSlide(currentSlideIndex);
}

// 4. Funções para controlar a troca automática
function startCarouselAutoPlay() {
  // Define o intervalo (5000ms = 5 segundos)
  carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselAutoPlay() {
  // Limpa o intervalo para parar a troca automática
  clearInterval(carouselInterval);
}

// 5. Event Listeners (para os botões)
nextBtn.addEventListener("click", () => {
  stopCarouselAutoPlay(); // Para a troca automática ao clicar
  nextSlide();
  startCarouselAutoPlay(); // Reinicia o cronômetro
});

prevBtn.addEventListener("click", () => {
  stopCarouselAutoPlay();
  prevSlide();
  startCarouselAutoPlay();
});

// 6. Inicia o carrossel automático
startCarouselAutoPlay();