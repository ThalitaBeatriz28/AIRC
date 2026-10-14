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