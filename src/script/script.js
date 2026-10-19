/* ==========================================================
   SCRIPT - SUMARIO

   1. Utilidades            7. Cartões que viram
   2. Barra de progresso    8. Livro de opiniões
   3. Menu e submenu        9. Carrossel de fotos
   4. Animações ao rolar    10. Bandeiras ao vento
   5. Formulário e assunto  11. Rodapé (frase do dia e ano)
   6. Contador
   ========================================================== */

"use strict";

/* 1. UTILIDADES */
const selecionar = (seletor, contexto = document) => contexto.querySelector(seletor);
const selecionarTodos = (seletor, contexto = document) => [
  ...contexto.querySelectorAll(seletor),
];
const ehDesktop = () => matchMedia("(min-width: 861px)").matches;

/* 2. BARRA DE PROGRESSO DE LEITURA */
const barraProgresso = selecionar(".progress");

function atualizarProgresso() {
  const alturaTotal = document.documentElement.scrollHeight - innerHeight;
  barraProgresso.style.width = (alturaTotal > 0 ? (scrollY / alturaTotal) * 100 : 0) + "%";
}

addEventListener("scroll", atualizarProgresso, { passive: true });
atualizarProgresso();

/* 3. MENU HAMBÚRGUER E SUBMENU "PARA QUEM" */
const botaoHamburguer = selecionar(".burger");
const menu = selecionar("#menu");
const itensComSubmenu = selecionarTodos(".has-sub");

/* Abre/fecha um submenu e avisa leitores de tela (aria-expanded) */
function definirSubmenu(item, aberto) {
  item.classList.toggle("aberto", aberto);
  selecionar(".sub-toggle", item).setAttribute("aria-expanded", aberto);
}

/* Abre/fecha o menu mobile: classe no menu, aria no botão e trava a rolagem da página */
function definirMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  botaoHamburguer.setAttribute("aria-expanded", aberto);
  botaoHamburguer.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("menu-aberto", aberto);
  if (!aberto) itensComSubmenu.forEach((item) => definirSubmenu(item, false));
}

botaoHamburguer.addEventListener("click", () => definirMenu(!menu.classList.contains("aberto")));

itensComSubmenu.forEach((item) => {
  const botaoSubmenu = selecionar(".sub-toggle", item);
  botaoSubmenu.addEventListener("click", () =>
    definirSubmenu(item, !item.classList.contains("aberto")),
  );
  /* No desktop o submenu também abre ao passar o mouse */
  item.addEventListener("mouseenter", () => ehDesktop() && definirSubmenu(item, true));
  item.addEventListener("mouseleave", () => ehDesktop() && definirSubmenu(item, false));
});

/* Clicar num link fecha o menu; clicar fora fecha o submenu */
selecionarTodos("#menu a").forEach((link) =>
  link.addEventListener("click", () => definirMenu(false)),
);
document.addEventListener("click", (evento) => {
  itensComSubmenu.forEach((item) => !item.contains(evento.target) && definirSubmenu(item, false));
});

addEventListener("keydown", (evento) => evento.key === "Escape" && definirMenu(false));
addEventListener("resize", () => ehDesktop() && definirMenu(false));

/* 4. ANIMAÇÃO DE ENTRADA */
const observadorDeEntrada = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("visivel");
      observadorDeEntrada.unobserve(entrada.target);
    });
  },
  { threshold: 0.2 },
);

selecionarTodos(".revelar, .passos li").forEach((elemento, indice) => {
  elemento.style.transitionDelay = (indice % 3) * 90 + "ms";
  observadorDeEntrada.observe(elemento);
});

/* 5. CONTATO: assunto vindo da URL e envio do formulário */
const campoAssunto = selecionar("#assunto");
if (campoAssunto) {
  campoAssunto.value = new URLSearchParams(location.search).get("assunto") || "";
}

/* Valida e envia ao FormSubmit sem recarregar a página. */
const formulario = selecionar("#formulario-contato");

if (formulario) {
  const mensagemStatus = selecionar(".formulario-status", formulario);

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    let valido = true;
    selecionarTodos("[required]", formulario).forEach((campo) => {
      const invalido =
        !campo.value.trim() ||
        (campo.type === "email" && !/^\S+@\S+\.\S+$/.test(campo.value));
      campo.classList.toggle("erro", invalido);
      if (invalido) valido = false;
    });

    mensagemStatus.className = "formulario-status " + (valido ? "sucesso" : "falha");
    if (!valido) {
      mensagemStatus.textContent = "Preencha nome, e-mail válido e mensagem.";
      return;
    }

    mensagemStatus.textContent = "Enviando…";
    try {
      /* Para trocar o e-mail de destino, altere aqui E no atributo action do <form> */
      const resposta = await fetch("https://formsubmit.co/ajax/ana.izaura1904@gmail.com", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(formulario),
      });
      if (!resposta.ok) throw new Error(resposta.status);
      mensagemStatus.textContent = "Mensagem enviada! A Ana responde pelo seu e-mail.";
      formulario.reset();
    } catch {
      mensagemStatus.className = "formulario-status falha";
      mensagemStatus.textContent =
        "Não foi possível enviar agora. Escreva para ana.izaura1904@gmail.com.";
    }
  });
}

/* 6. CONTADOR DO "80%+"  */
const contador = selecionar("[data-contar]");

if (contador) {
  const valorFinal = Number(contador.dataset.contar);

  new IntersectionObserver(([entrada], observador) => {
    if (!entrada.isIntersecting) return;
    const inicio = performance.now();

    const animar = (agora) => {
      const progresso = Math.min((agora - inicio) / 1600, 1);
      contador.textContent = Math.round(valorFinal * (1 - (1 - progresso) ** 3));
      if (progresso < 1) requestAnimationFrame(animar);
    };

    requestAnimationFrame(animar);
    observador.disconnect();
  }).observe(contador);
}

/* 7. CARTÕES QUE VIRAM  */
selecionarTodos(".cartao-vira-botao").forEach((botao) => {
  botao.addEventListener("click", () => {
    botao.setAttribute("aria-pressed", botao.getAttribute("aria-pressed") !== "true");
  });
});

/* 8. LIVRO DE OPINIÕES
   "folhasViradas" = quantas folhas já foram viradas (0 = livro fechado).
   O botão "Abrir o livro" fica na própria capa; os controles abaixo só aparecem com o livro aberto. */
const livro = selecionar("[data-livro]");

if (livro) {
  const folhas = selecionarTodos(".folha", livro);
  const ultimaFolha = folhas.length - 1;
  const botaoAbrir = selecionar("[data-livro-abrir]", livro);
  const botaoProxima = selecionar("[data-livro-proxima]", livro);
  const botaoAnterior = selecionar("[data-livro-anterior]", livro);
  const controles = selecionar(".livro-controles", livro);
  const statusLivro = selecionar("[data-livro-status]", livro);
  let folhasViradas = 0;

  function desenharLivro() {
    folhas.forEach((folha, indice) => {
      folha.classList.toggle("virada", indice < folhasViradas);
      /* Folhas viradas empilham à esquerda; as demais à direita, da primeira para a última */
      folha.style.setProperty("--camada", indice < folhasViradas ? indice : folhas.length - indice);
      folha.inert = indice !== folhasViradas;
    });

    livro.classList.toggle("aberto", folhasViradas > 0);
    controles.hidden = folhasViradas === 0;
    botaoAnterior.hidden = false; /* voltar página fica disponível em qualquer folha */
    botaoProxima.hidden = folhasViradas === ultimaFolha;
    botaoAnterior.textContent = folhasViradas === 1 ? "Fechar o livro" : "Página anterior";
    statusLivro.textContent =
      folhasViradas === 0 ? "Livro fechado" : `Página ${folhasViradas} de ${ultimaFolha}`;
  }

  botaoAbrir.addEventListener("click", () => {
    folhasViradas = 1;
    desenharLivro();
    botaoProxima.focus();
  });

  botaoProxima.addEventListener("click", () => {
    folhasViradas = Math.min(folhasViradas + 1, ultimaFolha);
    desenharLivro();
    if (folhasViradas === ultimaFolha) botaoAnterior.focus();
});

  botaoAnterior.addEventListener("click", () => {
    folhasViradas = Math.max(folhasViradas - 1, 0);
    desenharLivro();
    if (folhasViradas === 0) botaoAbrir.focus();
  });

  desenharLivro();
}

/* 9. CARROSSEL DE FOTOS ("Momentos de aula") */
const galeria = selecionar("[data-galeria]");

if (galeria) {
  const trilha = selecionar("[data-galeria-trilha]", galeria);
  const botaoAnteriorGaleria = selecionar("[data-galeria-anterior]", galeria);
  const botaoProximaGaleria = selecionar("[data-galeria-proxima]", galeria);
  const statusGaleria = selecionar("[data-galeria-status]", galeria);
  const fotos = [...trilha.children];
  let temporizador;

  /* Distância de uma foto à seguinte = largura da foto + espaço entre elas */
  const tamanhoDoPasso = () =>
    fotos[1] ? fotos[1].offsetLeft - fotos[0].offsetLeft : trilha.clientWidth;

  function atualizarGaleria() {
    const rolagemMaxima = trilha.scrollWidth - trilha.clientWidth;
    botaoAnteriorGaleria.disabled = trilha.scrollLeft <= 2;
    botaoProximaGaleria.disabled = trilha.scrollLeft >= rolagemMaxima - 2;
  }

  function irPara(direcao) {
    trilha.scrollBy({ left: direcao * tamanhoDoPasso(), behavior: "smooth" });
  }

  botaoAnteriorGaleria.addEventListener("click", () => irPara(-1));
  botaoProximaGaleria.addEventListener("click", () => irPara(1));

  trilha.addEventListener(
    "scroll",
    () => {
      atualizarGaleria();
      /* Só anuncia quando a rolagem para, para o leitor de tela não falar sem parar */
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        const primeira = Math.round(trilha.scrollLeft / tamanhoDoPasso()) + 1;
        const visiveis = Math.max(1, Math.round(trilha.clientWidth / tamanhoDoPasso()));
        const ultimaMostrada = Math.min(primeira + visiveis - 1, fotos.length);
        statusGaleria.textContent =
          primeira === ultimaMostrada
            ? `Foto ${primeira} de ${fotos.length}`
            : `Fotos ${primeira} a ${ultimaMostrada} de ${fotos.length}`;
        /* Se a seta clicada ficou desativada, o foco vai para a seta oposta */
        if (document.activeElement?.disabled) {
          (document.activeElement === botaoProximaGaleria
            ? botaoAnteriorGaleria
            : botaoProximaGaleria
          ).focus();
        }
      }, 160);
    },
    { passive: true },
  );

  addEventListener("resize", atualizarGaleria);
  atualizarGaleria();
}

/* 10. BANDEIRAS AO VENTO */
const QUANTIDADE_DE_FAIXAS = 24;

selecionarTodos(".bandeira").forEach((bandeira) => {
  bandeira.style.setProperty("--total-faixas", QUANTIDADE_DE_FAIXAS);
  for (let i = 0; i < QUANTIDADE_DE_FAIXAS; i++) {
    const faixa = document.createElement("i");
    faixa.style.setProperty("--indice", i);
    bandeira.append(faixa);
  }
  bandeira.classList.add("ondulando");
});

/* 11. RODAPÉ: FRASE DO DIA (muda a cada dia) E ANO */
const frases = [
  ["Practice makes perfect.", "A prática leva à perfeição."],
  ["Better late than never.", "Antes tarde do que nunca."],
  ["Don't give up!", "Não desista!"],
  ["Learning never stops.", "Aprender nunca acaba."],
  ["Every day is a new chance.", "Todo dia é uma nova chance."],
  ["Speak up, you've got this!", "Fale, você consegue!"],
  ["Mistakes help us learn.", "Errar ajuda a aprender."],
];
const fraseEmIngles = selecionar("#frase-en");

if (fraseEmIngles) {
  const inicioDoAno = new Date(new Date().getFullYear(), 0, 0);
  const diaDoAno = Math.floor((Date.now() - inicioDoAno) / 86400000);
  const [ingles, portugues] = frases[diaDoAno % frases.length];
  fraseEmIngles.textContent = ingles;
  selecionar("#frase-pt").textContent = portugues;
}
selecionar("#ano-atual").textContent = new Date().getFullYear();