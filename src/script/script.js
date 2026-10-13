"use strict";

/* 1. UTILIDADES */
const selecionar = (seletor, contexto = document) => contexto.querySelector(seletor);
const selecionarTodos = (seletor, contexto = document) => [
  ...contexto.querySelectorAll(seletor),
];
const ehDesktop = () => matchMedia("(min-width: 861px)").matches;