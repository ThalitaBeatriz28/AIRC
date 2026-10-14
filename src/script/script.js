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

/* Valida e envia ao FormSubmit sem recarregar a página.
   Sem JavaScript, o <form> envia por POST normalmente (action no HTML). */
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

/* 6. CONTADOR DO "80%+" (só na home) */
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