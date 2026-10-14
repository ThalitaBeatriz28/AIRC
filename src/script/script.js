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