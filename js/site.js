// Soul Gastrobar — topo com a banda, agenda, galeria, abas da carta e reserva pelo WhatsApp.
// Nada é enviado a servidor. Textos vindos de dados entram sempre com textContent (nunca innerHTML).
(function () {
  "use strict";

  var WHATSAPP = "5512991885259";
  var SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

  function $(id) { return document.getElementById(id); }
  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }
  function horaBR(h) { var p = h.split(":"); return p[1] === "00" ? p[0] + "h" : p[0] + "h" + p[1]; }
  function dataBR(iso) { var p = iso.split("-"); return p[2] + "/" + p[1]; }
  function maiuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function linkSeguro(url) { return /^https:\/\/(www\.)?sympla\.com\.br\//.test(url || "") ? url : null; }
  function arquivoLocal(c) {
    return /^(img|video)\/[\w\-\/]+\.(jpe?g|png|webp|mp4|webm)$/i.test(c || "") ||
      /^data:(image|video)\/(jpeg|png|webp|mp4);base64,/.test(c || "") ? c : null;
  }
  function descricaoShow(s) { return s.atracao + ", " + SEMANA[s._d.getDay()] + " " + dataBR(s.data); }

  var campoMotivo = $("r-motivo");
  function preencherMotivo(texto) { if (campoMotivo) campoMotivo.value = texto; }

  // Pop-ups (menu, banda, reserva) travam a rolagem do fundo enquanto abertos
  function abrir(d) { if (d && typeof d.showModal === "function" && !d.open) { d.showModal(); document.body.classList.add("modal-aberto"); return true; } return false; }
  function aoFechar(d, volta) {
    if (!d) return;
    d.addEventListener("close", function () {
      if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-aberto");
      var v = volta(); if (v && v.focus && !document.querySelector("dialog[open]")) v.focus();
    });
    d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  }

  // Menu em tela cheia
  var menuTela = $("menu-tela"), botaoMenu = $("menu-botao");
  if (menuTela && botaoMenu) {
    botaoMenu.addEventListener("click", function () {
      if (abrir(menuTela)) botaoMenu.setAttribute("aria-expanded", "true");
    });
    $("menu-fechar").addEventListener("click", function () { menuTela.close(); });
    aoFechar(menuTela, function () { botaoMenu.setAttribute("aria-expanded", "false"); return botaoMenu; });
    menuTela.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && e.target.getAttribute("href").charAt(0) === "#") menuTela.close();
    });
  }

  // Shows de hoje em diante
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var shows = (window.SOUL_AGENDA || [])
    .filter(function (s) { return s && /^\d{4}-\d{2}-\d{2}$/.test(s.data) && /^\d{2}:\d{2}$/.test(s.hora); })
    .map(function (s) { var p = s.data.split("-"); s._d = new Date(+p[0], +p[1] - 1, +p[2]); return s; })
    .filter(function (s) { return s._d >= hoje; })
    .sort(function (a, b) { return a._d - b._d || a.hora.localeCompare(b.hora); });

  // Faixa da agenda: data e nome; o clique abre o pop-up da banda
  var lista = $("lista-agenda");
  if (lista) {
    if (!shows.length) lista.appendChild(el("li", "show-vazio", "Nova agenda em breve."));
    shows.slice(0, 6).forEach(function (s) {
      var li = el("li");
      var bt = el("button", "show-chip"); bt.type = "button";
      var t = el("time", "chip-data", dataBR(s.data) + " " + SEMANA[s._d.getDay()].slice(0, 3)); t.dateTime = s.data + "T" + s.hora;
      bt.appendChild(t);
      bt.appendChild(el("span", "chip-nome", String(s.atracao || "Show ao vivo").slice(0, 60)));
      bt.setAttribute("aria-label", "Ver show: " + descricaoShow(s));
      bt.addEventListener("click", function () { abrirBanda(s, bt); });
      li.appendChild(bt);
      lista.appendChild(li);
    });
  }

  // Pop-up da banda
  var modalBanda = $("modal-banda"), bandaAtual = null, bandaOrigem = null;
  function abrirBanda(s, origem) {
    if (!modalBanda || typeof modalBanda.showModal !== "function") { preencherMotivo(descricaoShow(s)); location.hash = "reservar"; return; }
    bandaAtual = s; bandaOrigem = origem || null;
    $("banda-quando").textContent = maiuscula(SEMANA[s._d.getDay()]) + ", " + dataBR(s.data) + " às " + horaBR(s.hora);
    $("banda-nome").textContent = String(s.atracao || "Show ao vivo").slice(0, 80);
    $("banda-estilo").textContent = s.estilo ? String(s.estilo).slice(0, 100) + "." : "";
    var sobre = $("banda-sobre");
    sobre.textContent = s.sobre ? String(s.sobre).slice(0, 600) : ""; sobre.hidden = !s.sobre;
    var fotoBox = $("banda-foto"); fotoBox.textContent = "";
    var foto = arquivoLocal(s.foto);
    if (foto) {
      var im = document.createElement("img"); im.alt = "Foto da banda " + s.atracao; im.src = foto;
      im.addEventListener("error", function () { fotoBox.hidden = true; });
      fotoBox.appendChild(im); fotoBox.hidden = false;
    } else fotoBox.hidden = true;
    var ing = linkSeguro(s.ingresso), aIng = $("banda-ingresso");
    aIng.hidden = !ing; if (ing) aIng.href = ing;
    abrir(modalBanda);
  }
  if (modalBanda) {
    aoFechar(modalBanda, function () { return bandaOrigem; });
    $("banda-fechar").addEventListener("click", function () { modalBanda.close(); });
    $("banda-reservar").addEventListener("click", function () {
      if (bandaAtual) preencherMotivo(descricaoShow(bandaAtual));
      modalBanda.close();
    });
  }

  // Topo: foto ou vídeo da banda do próximo show, com o nome dela
  var midia = $("palco-midia"), s0 = shows[0];
  if (s0) {
    $("palco-banda").textContent = String(s0.atracao).slice(0, 60);
    $("palco-quando").textContent = (s0._d.getTime() === hoje.getTime() ? "hoje" : SEMANA[s0._d.getDay()] + ", " + dataBR(s0.data)) +
      " às " + horaBR(s0.hora) + ", ao vivo no Soul";
    $("palco-estilo").textContent = s0.estilo ? String(s0.estilo).slice(0, 60) : "";
    var pr = $("palco-reservar");
    pr.textContent = "Reservar para este show";
    pr.addEventListener("click", function () { preencherMotivo(descricaoShow(s0)); });
  }
  var padrao = window.SOUL_PALCO_PADRAO || {};
  var foto = arquivoLocal(s0 && s0.foto) || arquivoLocal(padrao.foto);
  var video = arquivoLocal(s0 && s0.video) || (!(s0 && s0.foto) && arquivoLocal(padrao.video));
  var semMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (midia && video && !semMovimento) {
    var v = document.createElement("video");
    v.src = video; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("playsinline", ""); if (foto) v.poster = foto;
    v.addEventListener("error", function () { midia.textContent = ""; });
    midia.appendChild(v);
  } else if (midia && foto) {
    var im = document.createElement("img"); im.alt = "";
    im.addEventListener("error", function () { midia.textContent = ""; });
    im.src = foto; midia.appendChild(im);
  }

  // Uma noite no Soul: as fotos passam uma de cada vez
  var noite = $("lista-galeria");
  var fotos = (window.SOUL_GALERIA || [])
    .filter(function (f) { return f && arquivoLocal(f.foto); })
    .sort(function (a, b) { return (+a.quadro || 99) - (+b.quadro || 99); })
    .slice(0, 8);
  if (noite && fotos.length) {
    var tempo = 5, ciclo = tempo * fotos.length;
    fotos.forEach(function (f, i) {
      var img = document.createElement("img");
      img.src = f.foto; img.alt = "";
      img.style.setProperty("--ciclo", ciclo + "s");
      img.style.setProperty("--atraso", (i * tempo - 0.8) + "s");
      noite.appendChild(img);
    });
  }

  // Abas da carta: Drinks e Cozinha
  var abas = [$("aba-drinks"), $("aba-cozinha")];
  function mostrarAba(qual) {
    abas.forEach(function (a) {
      var ativa = a.id === "aba-" + qual;
      a.setAttribute("aria-selected", ativa ? "true" : "false");
      a.tabIndex = ativa ? 0 : -1;
      $(a.getAttribute("aria-controls")).hidden = !ativa;
    });
  }
  if (abas[0] && abas[1]) {
    mostrarAba("drinks");
    abas.forEach(function (a) { a.addEventListener("click", function () { mostrarAba(a.id.replace("aba-", "")); }); });
    document.querySelector(".abas").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var outra = document.activeElement === abas[0] ? abas[1] : abas[0];
      outra.focus(); outra.click();
    });
    document.querySelectorAll("[data-aba]").forEach(function (l) {
      l.addEventListener("click", function () { mostrarAba(l.getAttribute("data-aba")); });
    });
  }

  document.querySelectorAll("[data-evento]").forEach(function (link) {
    link.addEventListener("click", function () { preencherMotivo(link.getAttribute("data-evento")); });
  });

  // Pop-up de reserva: todo link para #reservar abre o formulário
  var modal = $("modal-reserva"), abriuDe = null;
  function abrirReserva(origem) {
    if (!modal || typeof modal.showModal !== "function") { location.hash = "reservar"; return; }
    abriuDe = origem || null;
    $("r-pronto").hidden = true; $("r-erro").hidden = true;
    if (menuTela && menuTela.open) menuTela.close();
    abrir(modal);
    var nome = $("r-nome"); if (nome) nome.focus();
  }
  if (modal) {
    aoFechar(modal, function () { return abriuDe; });
    $("modal-fechar").addEventListener("click", function () { modal.close(); });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#reservar"]') : null;
    if (!a || !modal || typeof modal.showModal !== "function") return;
    e.preventDefault();
    var preenchido = a.hasAttribute("data-evento") || a.id === "banda-reservar" || (a.id === "palco-reservar" && s0);
    if (!preenchido) preencherMotivo("");
    abrirReserva(a);
  });

  // Reserva
  var campoData = $("r-data");
  if (campoData) {
    var d = new Date();
    campoData.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  var form = $("form-reserva"), erro = $("r-erro"), pronto = $("r-pronto"), resumo = $("r-resumo"), link = $("r-link");
  function limpar(texto, max) { return String(texto || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = limpar(form.nome.value, 60), data = limpar(form.data.value, 10), hora = limpar(form.hora.value, 5);
      var pessoas = parseInt(form.pessoas.value, 10), motivo = limpar(form.motivo.value, 80);
      var faltando = [];
      if (!nome) faltando.push("seu nome");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) faltando.push("a data");
      if (!/^\d{2}:\d{2}$/.test(hora)) faltando.push("o horário");
      if (!(pessoas >= 1 && pessoas <= 60)) faltando.push("quantas pessoas (de 1 a 60)");
      if (faltando.length) {
        erro.textContent = "Falta preencher " + faltando.join(", ") + ".";
        erro.hidden = false; pronto.hidden = true;
        return;
      }
      erro.hidden = true;
      var p = data.split("-"), dataCompleta = p[2] + "/" + p[1] + "/" + p[0];
      var msg = "Olá, Soul! Quero reservar uma mesa.\nNome: " + nome +
        "\nData: " + dataCompleta + " às " + horaBR(hora) +
        "\nPessoas: " + pessoas + (motivo ? "\nOcasião: " + motivo : "");
      resumo.textContent = "Mesa para " + pessoas + (pessoas === 1 ? " pessoa" : " pessoas") + " em " + dataCompleta +
        " às " + horaBR(hora) + ". Envie pelo WhatsApp para a casa confirmar.";
      link.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
      pronto.hidden = false;
      link.focus();
    });
  }
})();
