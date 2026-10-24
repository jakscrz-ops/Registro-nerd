// ==========================================
// INICIALIZAÇÃO SEGURA (GARANTE QUE O DOM EXISTE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 AMCN App iniciado com sucesso!");

    // 1. Elementos da página de Cadastro
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

    // Elementos da "Nossa Party"
    const recordsSection = document.getElementById("records-section");
    const recordCount = document.getElementById("record-count");
    const emptyState = document.getElementById("empty-state");
    const recordList = document.getElementById("record-list");

    if (enterButton) {
        enterButton.addEventListener("click", () => {
            welcomeSection.classList.add("hidden");
            formSection.classList.remove("hidden");
            recordsSection.classList.remove("hidden");
            exibirMembro(); 
        });
    }

    const URL_DA_API = "https://script.google.com/macros/s/AKfycbz8nwqbaovC_LJX3HBNUlQa21FRMJxP385V0Vi9clyMbz2K82R-fOCZsmvVkOQE4pPL4Q/exec"; 

    if (form) {
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
                listaMembros.push(novoMembro);
                localStorage.setItem("membrosAMCN", JSON.stringify(listaMembros));
                successMessage.classList.add("is-visible"); 
                exibirMembro(); 

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
    }

    function exibirMembro() {
        if (!recordList) return;
        recordList.innerHTML = "<p class='text-white'>Carregando membros da Party...</p>";
        
        fetch(URL_DA_API)
            .then(resposta => resposta.json())
            .then(listaMembros => {
                recordList.innerHTML = ""; 
                
                if (listaMembros.length > 0) {
                    emptyState.classList.add("hidden");
                    recordCount.innerText = listaMembros.length; 
                    
                    listaMembros.forEach(membro => {
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
                    emptyState.classList.remove("hidden");
                    recordCount.innerText = "0";
                }
            })
            .catch(erro => console.log("Erro ao carregar: ", erro));
    }

    // Controle do Modal de Termos de Uso
    const btnAbrirTermos = document.getElementById("abrir-termos");
    const btnFecharTermos = document.getElementById("fechar-termos");
    const modalTermos = document.getElementById("modal-termos");

    if (btnAbrirTermos && modalTermos) {
        btnAbrirTermos.addEventListener("click", () => {
            modalTermos.classList.remove("hidden");
            modalTermos.classList.add("flex");
        });
    }

    if (btnFecharTermos && modalTermos) {
        btnFecharTermos.addEventListener("click", () => {
            modalTermos.classList.add("hidden");
            modalTermos.classList.remove("flex");
        });
    }


    // ==========================================
    // 2. LÓGICA DA GALERIA E SUPABASE
    // ==========================================

    const SUPABASE_URL = 'https://cnjdatpupuyteawhvnsxm.supabase.co'; // Sem barra no final!
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuamRhdHB1cHl0ZWF3aHZuc3htIxlmcm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NTA3NjAsImV4cCI6MjEwODQyNjc2MH0.C8hy7E5A5RJp8QLfebO-AlJPl2Dyt4QjqTpPuMBf3g4';

    let supabaseClient = null;
    try {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log("☁️ Supabase conectado com sucesso!");
        } else {
            console.warn("⚠️ Biblioteca do Supabase não encontrada no escopo global.");
        }
    } catch (err) {
        console.error("Erro ao iniciar Supabase:", err);
    }

    let fotosData = [];
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

    async function carregarGaleria() {
        if (!gridFotos || !supabaseClient) return;
        gridFotos.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 30px;">Carregando memórias da comunidade...</p>`;

        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .order('id', { ascending: false });

        if (error) {
            console.error("Erro ao carregar do Supabase:", error);
            gridFotos.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444; padding: 30px;">Erro ao conectar com o banco de dados.</p>`;
            return;
        }

        fotosData = data || [];
        const filtroAtivo = document.querySelector('.filtro-btn.ativo');
        renderizarGaleria(filtroAtivo ? filtroAtivo.dataset.filtro : 'todos');
    }

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
        if (btnApagarPost) {
            btnApagarPost.style.display = isAdmin ? 'flex' : 'none';
        }
    }

    if (btnAdminToggle) {
        btnAdminToggle.addEventListener('click', () => {
            const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
            if (isAdmin) {
                if (confirm("Deseja desativar o modo administrador?")) {
                    sessionStorage.removeItem('amcn_admin');
                    atualizarEstadoAdminUI();
                    if (lightbox && lightbox.style.display === 'flex' && fotoAtualId) {
                        const foto = fotosData.find(f => f.id === fotoAtualId);
                        if (foto) atualizarComentarios(foto.comentarios || []);
                    }
                }
            } else {
                const senha = prompt("🔒 Digite a senha da diretoria da AMCN:");
                if (senha === "amcn2026") {
                    sessionStorage.setItem('amcn_admin', 'true');
                    atualizarEstadoAdminUI();
                    if (lightbox && lightbox.style.display === 'flex' && fotoAtualId) {
                        const foto = fotosData.find(f => f.id === fotoAtualId);
                        if (foto) atualizarComentarios(foto.comentarios || []);
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
            const listaUrls = foto.urls || [];
            const capa = listaUrls[0] || '';
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

    if (btnAbrirModal && modalEnvio) {
        btnAbrirModal.addEventListener('click', () => modalEnvio.style.display = 'flex');
    }
    if (fecharModal && modalEnvio) {
        fecharModal.addEventListener('click', () => modalEnvio.style.display = 'none');
    }

    if (formEnvioFoto && supabaseClient) {
        formEnvioFoto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const autor = document.getElementById('autor-foto').value;
            const categoria = document.getElementById('categoria-foto').value;
            const legenda = document.getElementById('legenda-foto').value;
            const arquivoInput = document.getElementById('arquivo-foto');
            const submitBtn = formEnvioFoto.querySelector('button[type="submit"]');

            const files = arquivoInput.files;
            if (files.length > 0) {
                submitBtn.textContent = "Enviando para a nuvem...";
                submitBtn.disabled = true;

                try {
                    const urlsGeradas = [];
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const fileName = `${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`;
                        
                        const { data: uploadData, error: uploadError } = await supabaseClient.storage
                            .from('fotos-evento')
                            .upload(fileName, file);

                        if (uploadError) throw uploadError;

                        const { data: publicUrlData } = supabaseClient.storage
                            .from('fotos-evento')
                            .getPublicUrl(fileName);

                        urlsGeradas.push(publicUrlData.publicUrl);
                    }

                    const novoPost = {
                        id: Date.now(),
                        autor,
                        categoria,
                        legenda,
                        urls: urlsGeradas,
                        comentarios: []
                    };

                    const { error: dbError } = await supabaseClient
                        .from('posts')
                        .insert([novoPost]);

                    if (dbError) throw dbError;

                    modalEnvio.style.display = 'none';
                    formEnvioFoto.reset();
                    await carregarGaleria();
                } catch (err) {
                    console.error("Erro no envio:", err);
                    alert("Erro ao enviar as fotos. Verifique sua conexão.");
                } finally {
                    submitBtn.textContent = "Publicar na Galeria";
                    submitBtn.disabled = false;
                }
            }
        });
    }

    function abrirLightbox(id) {
        fotoAtualId = id;
        const foto = fotosData.find(f => f.id === id);
        if (!foto) return;

        urlsFotoAtual = foto.urls || [];
        indiceImagemAtual = 0;

        atualizarImagemLightbox();
        if (lightboxAutor) lightboxAutor.textContent = `Enviado por: ${foto.autor}`;
        if (lightboxLegenda) lightboxLegenda.textContent = foto.legenda;
        atualizarComentarios(foto.comentarios || []);

        atualizarEstadoAdminUI();
        if (lightbox) lightbox.style.display = 'flex';
    }

    function atualizarImagemLightbox() {
        if (lightboxImg) lightboxImg.src = urlsFotoAtual[indiceImagemAtual] || '';

        if (urlsFotoAtual.length > 1) {
            if (btnAnterior) btnAnterior.style.display = 'block';
            if (btnProximo) btnProximo.style.display = 'block';
            if (contadorFotos) {
                contadorFotos.style.display = 'block';
                contadorFotos.textContent = `${indiceImagemAtual + 1} / ${urlsFotoAtual.length}`;
            }
        } else {
            if (btnAnterior) btnAnterior.style.display = 'none';
            if (btnProximo) btnProximo.style.display = 'none';
            if (contadorFotos) contadorFotos.style.display = 'none';
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
        if (!listaComentarios) return;
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

    window.apagarComentario = async function(index) {
        const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
        if (!isAdmin || !supabaseClient) {
            alert("Ação restrita aos administradores.");
            return;
        }

        const foto = fotosData.find(f => f.id === fotoAtualId);
        if (foto) {
            foto.comentarios.splice(index, 1);

            const { error } = await supabaseClient
                .from('posts')
                .update({ comentarios: foto.comentarios })
                .eq('id', foto.id);

            if (!error) {
                atualizarComentarios(foto.comentarios);
            } else {
                alert("Erro ao atualizar no banco de dados.");
            }
        }
    };

    if (btnApagarPost && supabaseClient) {
        btnApagarPost.addEventListener('click', async () => {
            const isAdmin = sessionStorage.getItem('amcn_admin') === 'true';
            if (!isAdmin) {
                alert("Ação restrita aos administradores.");
                return;
            }

            if (confirm("Tem certeza que deseja apagar esta publicação da galeria?")) {
                const { error } = await supabaseClient
                    .from('posts')
                    .delete()
                    .eq('id', fotoAtualId);

                if (!error) {
                    if (lightbox) lightbox.style.display = 'none';
                    await carregarGaleria();
                } else {
                    alert("Erro ao apagar publicação.");
                }
            }
        });
    }

    if (fecharLightbox && lightbox) {
        fecharLightbox.addEventListener('click', () => lightbox.style.display = 'none');
    }

    if (formComentario && supabaseClient) {
        formComentario.addEventListener('submit', async (e) => {
            e.preventDefault();
            const autorInput = document.getElementById('input-comentario-autor').value;
            const textoInput = document.getElementById('input-comentario-texto').value;

            const foto = fotosData.find(f => f.id === fotoAtualId);
            if (foto) {
                if (!foto.comentarios) foto.comentarios = [];
                foto.comentarios.push({ autor: autorInput, texto: textoInput });

                const { error } = await supabaseClient
                    .from('posts')
                    .update({ comentarios: foto.comentarios })
                    .eq('id', foto.id);

                if (!error) {
                    atualizarComentarios(foto.comentarios);
                    document.getElementById('input-comentario-texto').value = '';
                } else {
                    alert("Erro ao salvar comentário.");
                }
            }
        });
    }

    carregarGaleria();
    atualizarEstadoAdminUI();
});
