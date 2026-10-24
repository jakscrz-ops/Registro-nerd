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

// Lógica da Galeria com Ativação de Admin pelo Selo do Topo
    let fotosData = JSON.parse(localStorage.getItem('registroNerd_fotos')) || [
        {
            id: 1,
            autor: "Diretoria AMCN",
            categoria: "rpg",
            legenda: "Sessão de RPG na sede da associação.",
            urls: ["https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=800&q=80"],
            comentarios: [
                { autor: "Lucas", texto: "Foi uma tarde excelente!" }
            ]
        },
        {
            id: 2,
            autor: "Comunidade",
            categoria: "boardgames",
            legenda: "Encontro de jogos de tabuleiro.",
            urls: ["https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80"],
            comentarios: []
        }
    ];

    let fotoAtualId = null;
    let indiceImagemAtual = 0;
    let urlsFotoAtual = [];

    const gridFotos = document.getElementById('grid-fotos');
    const modalEnvio = document.getElementById('modal-envio');
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const fecharModal = document.getElementById('fechar-modal');
    const formEnvioFoto = document.getElementById('form-envio-foto');

    const lightbox = document.getElementById('lightbox');
    const fecharLightbox = document.getElementById('fechar-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxAutor = document.getElementById('lightbox-autor');
    const lightboxLegenda = document.getElementById('lightbox-legenda');
    const listaComentarios = document.getElementById('lista-comentarios');
    const formComentario = document.getElementById('form-comentario');
    
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const contadorFotos = document.getElementById('contador-fotos');
    const btnApagarPost = document.getElementById('btn-apagar-post');
    const btnAdminToggle = document.getElementById('btn-admin-toggle');

    // Atualiza o visual do selo no topo dependendo do estado admin
    function atualizarEstadoAdminUI() {
        const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
        if (btnAdminToggle) {
            if (isAdmin) {
                btnAdminToggle.textContent = "🛡️ ADMIN ATIVO (Clique p/ Sair)";
                btnAdminToggle.style.borderColor = "var(--lime)";
                btnAdminToggle.style.color = "var(--lime)";
            } else {
                btnAdminToggle.textContent = "COMUNIDADE ONLINE";
                btnAdminToggle.style.borderColor = "";
                btnAdminToggle.style.color = "";
            }
        }
        // Atualiza visibilidade do botão de apagar post no lightbox se estiver aberto
        if (btnApagarPost) {
            btnApagarPost.style.display = isAdmin ? 'flex' : 'none';
        }
    }

    // Clique no selo do topo para ativar/desativar admin
    if (btnAdminToggle) {
        btnAdminToggle.addEventListener('click', () => {
            const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
            if (isAdmin) {
                if (confirm("Deseja desativar o modo administrador?")) {
                    sessionStorage.removeItem('amcn_admin');
                    atualizarEstadoAdminUI();
                    // Atualiza os comentários se o lightbox estiver aberto
                    if (lightbox.style.display === 'flex' && fotoAtualId) {
                        const foto = fotosData.find(f => f.id === fotoAtualId);
                        if (foto) atualizarComentarios(foto.comentarios);
                    }
                    alert("Modo administrador desativado.");
                }
            } else {
                const senha = prompt("🔒 Digite a senha da diretoria da AMCN:");
                if (senha === "amcn2026") { // <--- Altere a senha aqui se quiser
                    sessionStorage.setItem('amcn_admin', 'true');
                    atualizarEstadoAdminUI();
                    // Atualiza os comentários se o lightbox estiver aberto
                    if (lightbox.style.display === 'flex' && fotoAtualId) {
                        const foto = fotosData.find(f => f.id === fotoAtualId);
                        if (foto) atualizarComentarios(foto.comentarios);
                    }
                    alert("✅ Modo Administrador ativado com sucesso!");
                } else if (senha !== null) {
                    alert("❌ Senha incorreta!");
                }
            }
        });
    }

    function renderizarGaleria(filtro = 'todos') {
        if (!gridFotos) return;
        gridFotos.innerHTML = '';
        
        const fotosFiltradas = filtro === 'todos' 
            ? fotosData 
            : fotosData.filter(f => f.categoria === filtro);

        if (fotosFiltradas.length === 0) {
            gridFotos.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 30px;">Nenhuma foto encontrada nesta categoria.</p>`;
            return;
        }

        fotosFiltradas.forEach(foto => {
            const listaUrls = foto.urls || [foto.url];
            const capa = listaUrls[0];
            const qtd = listaUrls.length;

            const card = document.createElement('div');
            card.className = 'foto-card';
            card.innerHTML = `
                ${qtd > 1 ? `<div class="badge-qtd-fotos">📷 +${qtd}</div>` : ''}
                <img src="${capa}" alt="${foto.legenda}">
                <div class="foto-info">
                    <h4>Por: ${foto.autor}</h4>
                    <p>${foto.legenda}</p>
                    <small style="color: var(--lime); font-weight: 600;">#${foto.categoria}</small>
                </div>
            `;
            card.addEventListener('click', () => abrirLightbox(foto.id));
            gridFotos.appendChild(card);
        });
    }

    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');
            renderizarGaleria(e.target.dataset.filtro);
        });
    });

    if (btnAbrirModal) btnAbrirModal.addEventListener('click', () => modalEnvio.style.display = 'flex');
    if (fecharModal) fecharModal.addEventListener('click', () => modalEnvio.style.display = 'none');

    // Função de compressão blindada
    function comprimirImagem(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onerror = () => resolve(null);
            reader.onload = (event) => {
                const img = new Image();
                img.onerror = () => resolve(event.target.result);
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        const maxWidth = 800;

                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    } catch (err) {
                        resolve(event.target.result);
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (formEnvioFoto) {
        formEnvioFoto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const autor = document.getElementById('autor-foto').value;
            const categoria = document.getElementById('categoria-foto').value;
            const legenda = document.getElementById('legenda-foto').value;
            const arquivoInput = document.getElementById('arquivo-foto');

            const files = arquivoInput.files;
            if (files.length > 0) {
                const urlsGeradas = [];
                for (let i = 0; i < files.length; i++) {
                    const urlOtimizada = await comprimirImagem(files[i]);
                    if (urlOtimizada) {
                        urlsGeradas.push(urlOtimizada);
                    }
                }

                if (urlsGeradas.length > 0) {
                    const novaFoto = {
                        id: Date.now(),
                        autor,
                        categoria,
                        legenda,
                        urls: urlsGeradas,
                        comentarios: []
                    };

                    fotosData.unshift(novaFoto);
                    
                    if (salvarEAtualizar()) {
                        modalEnvio.style.display = 'none';
                        formEnvioFoto.reset();
                    }
                } else {
                    alert("Não foi possível processar as imagens selecionadas. Tente outras fotos.");
                }
            }
        });
    }

    function abrirLightbox(id) {
        fotoAtualId = id;
        const foto = fotosData.find(f => f.id === id);
        if (!foto) return;

        urlsFotoAtual = foto.urls || [foto.url];
        indiceImagemAtual = 0;

        atualizarImagemLightbox();
        lightboxAutor.textContent = `Enviado por: ${foto.autor}`;
        lightboxLegenda.textContent = foto.legenda;
        atualizarComentarios(foto.comentarios);

        atualizarEstadoAdminUI(); // Garante o estado correto do botão de apagar post

        lightbox.style.display = 'flex';
    }

    function atualizarImagemLightbox() {
        lightboxImg.src = urlsFotoAtual[indiceImagemAtual];

        if (urlsFotoAtual.length > 1) {
            btnAnterior.style.display = 'block';
            btnProximo.style.display = 'block';
            contadorFotos.style.display = 'block';
            contadorFotos.textContent = `${indiceImagemAtual + 1} / ${urlsFotoAtual.length}`;
        } else {
            btnAnterior.style.display = 'none';
            btnProximo.style.display = 'none';
            contadorFotos.style.display = 'none';
        }
    }

    if (btnAnterior) {
        btnAnterior.addEventListener('click', (e) => {
            e.stopPropagation();
            indiceImagemAtual = (indiceImagemAtual === 0) ? urlsFotoAtual.length - 1 : indiceImagemAtual - 1;
            atualizarImagemLightbox();
        });
    }

    if (btnProximo) {
        btnProximo.addEventListener('click', (e) => {
            e.stopPropagation();
            indiceImagemAtual = (indiceImagemAtual === urlsFotoAtual.length - 1) ? 0 : indiceImagemAtual + 1;
            atualizarImagemLightbox();
        });
    }

    function atualizarComentarios(comentarios) {
        listaComentarios.innerHTML = '';
        if (comentarios.length === 0) {
            listaComentarios.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem; text-align: center; margin-top: 10px;">Nenhum comentário ainda. Seja o primeiro!</p>';
            return;
        }
        
        const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';

        comentarios.forEach((c, index) => {
            const div = document.createElement('div');
            div.className = 'comentario-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <span><strong>${c.autor}:</strong> ${c.texto}</span>
                ${isAdmin ? `<button type="button" onclick="apagarComentario(${index})" title="Apagar comentário" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px; padding: 0 4px; font-weight:bold;">&times;</button>` : ''}
            `;
            listaComentarios.appendChild(div);
        });
    }

    window.apagarComentario = function(index) {
        const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
        if (!isAdmin) {
            alert("Ação restrita aos administradores.");
            return;
        }

        const foto = fotosData.find(f => f.id === fotoAtualId);
        if (foto) {
            foto.comentarios.splice(index, 1);
            salvarEAtualizar();
            atualizarComentarios(foto.comentarios);
        }
    };

    if (btnApagarPost) {
        btnApagarPost.addEventListener('click', () => {
            const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
            if (!isAdmin) {
                alert("Ação restrita aos administradores.");
                return;
            }

            if (confirm("Tem certeza que deseja apagar esta publicação da galeria?")) {
                fotosData = fotosData.filter(f => f.id !== fotoAtualId);
                salvarEAtualriage = salvarEAtualizar();
                lightbox.style.display = 'none';
            }
        });
    }

    if (fecharLightbox) fecharLightbox.addEventListener('click', () => lightbox.style.display = 'none');

    if (formComentario) {
        formComentario.addEventListener('submit', (e) => {
            e.preventDefault();
            const autorInput = document.getElementById('input-comentario-autor').value;
            const textoInput = document.getElementById('input-comentario-texto').value;

            const foto = fotosData.find(f => f.id === fotoAtualId);
            if (foto) {
                foto.comentarios.push({ autor: autorInput, texto: textoInput });
                salvarEAtualizar();
                atualizarComentarios(foto.comentarios);
                document.getElementById('input-comentario-texto').value = '';
            }
        });
    }

    function salvarEAtualizar() {
        try {
            localStorage.setItem('registroNerd_fotos', JSON.stringify(fotosData));
            const filtroAtivo = document.querySelector('.filtro-btn.ativo');
            const filtro = filtroAtivo ? filtroAtivo.dataset.filtro : 'todos';
            renderizarGaleria(filtro);
            return true;
        } catch (error) {
            alert("O armazenamento do navegador ficou cheio com tantas fotos. Tente enviar um lote um pouco menor.");
            fotosData.shift();
            return false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderizarGaleria();
        atualizarEstadoAdminUI(); // Verifica o estado inicial do admin ao carregar a página
    });