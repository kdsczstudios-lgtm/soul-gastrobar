// Soul Gastrobar — agenda e reserva pelo WhatsApp.
// Nada é enviado a servidor. Textos vindos de dados entram sempre com textContent (nunca innerHTML).
(function () {
  "use strict";

  var WHATSAPP = "5512991885259";
  var SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  var MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

  function el(tag, classe, texto) {
    var n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }
  function horaBR(h) { var p = h.split(":"); return p[1] === "00" ? p[0] + "h" : p[0] + "h" + p[1]; }
  function dataBR(iso) { var p = iso.split("-"); return p[2] + "/" + p[1]; }
  function linkSeguro(url) { return /^https:\/\/(www\.)?sympla\.com\.br\//.test(url || "") ? url : null; }

  // Menu do celular
  var botaoMenu = document.getElementById("menu-botao");
  var menu = document.getElementById("menu");
  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { menu.classList.remove("aberto"); botaoMenu.setAttribute("aria-expanded", "false"); }
    });
  }

  var campoMotivo = document.getElementById("r-motivo");
  function preencherMotivo(texto) { if (campoMotivo) campoMotivo.value = texto; }

  // Agenda: próximos 3 shows
  var lista = document.getElementById("lista-agenda");
  var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  var shows = (window.SOUL_AGENDA || [])
    .filter(function (s) { return /^\d{4}-\d{2}-\d{2}$/.test(s.data) && /^\d{2}:\d{2}$/.test(s.hora); })
    .map(function (s) { var p = s.data.split("-"); s._d = new Date(+p[0], +p[1] - 1, +p[2]); return s; })
    .filter(function (s) { return s._d >= hoje; })
    .sort(function (a, b) { return a._d - b._d || a.hora.localeCompare(b.hora); })
    .slice(0, 3);

  // Faixa da agenda: só a data e o nome; o clique abre o pop-up da banda
  if (lista) {
    if (!shows.length) {
      lista.appendChild(el("li", "show-vazio", "Nova agenda em breve."));
    }
    shows.forEach(function (s) {
      var li = el("li");
      var bt = el("button", "show-chip"); bt.type = "button";
      var t = el("time", "chip-data", dataBR(s.data) + " " + SEMANA[s._d.getDay()].slice(0, 3)); t.dateTime = s.data + "T" + s.hora;
      bt.appendChild(t);
      bt.appendChild(el("span", "chip-nome", String(s.atracao || "Show ao vivo").slice(0, 60)));
      bt.setAttribute("aria-label", "Ver show: " + s.atracao + ", " + SEMANA[s._d.getDay()] + " " + dataBR(s.data));
      bt.addEventListener("click", function () { abrirBanda(s, bt); });
      li.appendChild(bt);
      lista.appendChild(li);
    });
  }

  // Pop-up da banda
  var modalBanda = document.getElementById("modal-banda");
  var bandaAtual = null, bandaOrigem = null;
  function abrirBanda(s, origem) {
    if (!modalBanda || typeof modalBanda.showModal !== "function") { preencherMotivo(s.atracao + ", " + SEMANA[s._d.getDay()] + " " + dataBR(s.data)); location.hash = "reservar"; return; }
    bandaAtual = s; bandaOrigem = origem || null;
    var dia = SEMANA[s._d.getDay()];
    document.getElementById("banda-quando").textContent = dia.charAt(0).toUpperCase() + dia.slice(1) + ", " + dataBR(s.data) + " às " + horaBR(s.hora);
    document.getElementById("banda-nome").textContent = String(s.atracao || "Show ao vivo").slice(0, 80);
    document.getElementById("banda-estilo").textContent = s.estilo ? String(s.estilo).slice(0, 100) + (s.sobre ? "" : ".") : "";
    var sobre = document.getElementById("banda-sobre");
    sobre.textContent = s.sobre ? String(s.sobre).slice(0, 600) : ""; sobre.hidden = !s.sobre;
    var fotoBox = document.getElementById("banda-foto");
    fotoBox.textContent = "";
    var foto = arquivoLocal(s.foto);
    if (foto) {
      var im = document.createElement("img"); im.alt = "Foto da banda " + s.atracao; im.src = foto;
      im.addEventListener("error", function () { fotoBox.hidden = true; });
      fotoBox.appendChild(im); fotoBox.hidden = false;
    } else fotoBox.hidden = true;
    var ing = linkSeguro(s.ingresso), aIng = document.getElementById("banda-ingresso");
    aIng.hidden = !ing; if (ing) aIng.href = ing;
    modalBanda.showModal();
    document.body.classList.add("modal-aberto");
  }
  if (modalBanda) {
    modalBanda.addEventListener("close", function () {
      document.body.classList.remove("modal-aberto");
      if (bandaOrigem && bandaOrigem.focus && !(modal && modal.open)) bandaOrigem.focus();
    });
    modalBanda.addEventListener("click", function (e) { if (e.target === modalBanda) modalBanda.close(); });
    document.getElementById("banda-fechar").addEventListener("click", function () { modalBanda.close(); });
    document.getElementById("banda-reservar").addEventListener("click", function () {
      if (bandaAtual) preencherMotivo(bandaAtual.atracao + ", " + SEMANA[bandaAtual._d.getDay()] + " " + dataBR(bandaAtual.data));
      modalBanda.close();
    });
  }

  // Palco: foto ou vídeo da banda do próximo show, com o nome dela
  var palco = document.getElementById("inicio");
  var midia = document.getElementById("palco-midia");
  function arquivoLocal(c) { return /^(img|video)\/[\w\-\/]+\.(jpe?g|png|webp|mp4|webm)$/i.test(c || "") || /^data:(image|video)\/(jpeg|png|webp|mp4);base64,/.test(c || "") ? c : null; }
  var s0 = shows[0];
  if (s0) {
    document.getElementById("palco-quando").textContent =
      (s0._d.getTime() === hoje.getTime() ? "Hoje" : SEMANA[s0._d.getDay()].replace(/^./, function (l) { return l.toUpperCase(); }) + ", " + dataBR(s0.data)) +
      " às " + horaBR(s0.hora) + ", ao vivo no Soul";
    document.getElementById("palco-banda").textContent = String(s0.atracao).slice(0, 60);
    document.getElementById("palco-estilo").textContent = s0.estilo ? String(s0.estilo).slice(0, 100) + "." : "";
    document.getElementById("palco-reservar").addEventListener("click", function () {
      preencherMotivo(s0.atracao + ", " + SEMANA[s0._d.getDay()] + " " + dataBR(s0.data));
    });
  }
  var foto = arquivoLocal(s0 && s0.foto) || arquivoLocal(window.SOUL_PALCO_PADRAO && window.SOUL_PALCO_PADRAO.foto);
  var video = arquivoLocal(s0 && s0.video) || arquivoLocal(window.SOUL_PALCO_PADRAO && window.SOUL_PALCO_PADRAO.video);
  var semMovimento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (midia && video && !semMovimento) {
    var v = document.createElement("video");
    v.src = video; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("playsinline", ""); if (foto) v.poster = foto;
    v.addEventListener("error", function () { midia.textContent = ""; palco.classList.add("sem-midia"); });
    midia.appendChild(v);
  } else if (midia && foto) {
    var im = document.createElement("img"); im.alt = "";
    im.addEventListener("error", function () { midia.textContent = ""; palco.classList.add("sem-midia"); });
    im.src = foto; midia.appendChild(im);
  } else if (palco) {
    palco.classList.add("sem-midia");
  }

  // Galeria: cada foto entra no seu quadro; quadros sem foto continuam com a legenda
  var quadros = document.querySelectorAll("#lista-galeria .foto");
  var colocadas = 0;
  (window.SOUL_GALERIA || []).forEach(function (f) {
    var q = quadros[(parseInt(f.quadro, 10) || 0) - 1];
    if (!q || !arquivoLocal(f.foto)) return;
    var im = document.createElement("img");
    im.alt = String(f.legenda || "Foto do Soul Gastrobar").slice(0, 120);
    im.loading = "lazy";
    im.addEventListener("load", function () { q.classList.remove("vazia"); q.textContent = ""; q.appendChild(im); });
    im.src = f.foto;
    colocadas++;
  });
  var gn = document.getElementById("galeria-nota");
  if (gn && colocadas >= quadros.length) gn.remove();

  document.querySelectorAll("[data-evento]").forEach(function (link) {
    link.addEventListener("click", function () { preencherMotivo(link.getAttribute("data-evento")); });
  });

  // Pop-up de reserva: todo link para #reservar abre o formulário
  var modal = document.getElementById("modal-reserva");
  var abriuDe = null;
  function abrirReserva(origem) {
    if (!modal || typeof modal.showModal !== "function") { location.hash = "reservar"; return; }
    abriuDe = origem || null;
    document.getElementById("r-pronto").hidden = true;
    document.getElementById("r-erro").hidden = true;
    if (!modal.open) modal.showModal();
    document.body.classList.add("modal-aberto");
    var nome = document.getElementById("r-nome");
    if (nome) nome.focus();
  }
  function fecharReserva() { if (modal && modal.open) modal.close(); }
  if (modal) {
    modal.addEventListener("close", function () {
      document.body.classList.remove("modal-aberto");
      if (abriuDe && abriuDe.focus) abriuDe.focus();
    });
    modal.addEventListener("click", function (e) { if (e.target === modal) fecharReserva(); });
    document.getElementById("modal-fechar").addEventListener("click", fecharReserva);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#reservar"]') : null;
    if (!a || !modal || typeof modal.showModal !== "function") return;
    e.preventDefault();
    if (!a.hasAttribute("data-evento") && a.id !== "banda-reservar" && a.id !== "palco-reservar" && campoMotivo) campoMotivo.value = "";
    abrirReserva(a);
  });

  // Reserva
  var campoData = document.getElementById("r-data");
  if (campoData) {
    var d = new Date();
    campoData.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  var form = document.getElementById("form-reserva");
  var erro = document.getElementById("r-erro");
  var pronto = document.getElementById("r-pronto");
  var resumo = document.getElementById("r-resumo");
  var link = document.getElementById("r-link");
  function limpar(texto, max) { return String(texto || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = limpar(form.nome.value, 60);
      var data = limpar(form.data.value, 10);
      var hora = limpar(form.hora.value, 5);
      var pessoas = parseInt(form.pessoas.value, 10);
      var motivo = limpar(form.motivo.value, 80);

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
