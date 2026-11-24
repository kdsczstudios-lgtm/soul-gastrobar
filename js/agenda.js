// AGENDA DE SHOWS — o dono atualiza este arquivo (ou pela aba Agenda do editor).
// Cada show: data (AAAA-MM-DD), hora (HH:MM), atracao, estilo.
// Opcional: foto ("img/bandas/nome.jpg"), video ("video/nome.mp4", curto, sem som, até ~8 MB),
// sobre (um texto curto sobre a banda) e ingresso (link do Sympla).
// O próximo show aparece no topo do site com a foto ou o vídeo da banda e o nome dela.
// Shows com data passada somem sozinhos. A faixa da agenda mostra os 6 próximos.
window.SOUL_AGENDA = [
  { data: "2026-11-26", hora: "19:30", atracao: "Banda Outs", estilo: "Pop rock", foto: "img/bandas/outs.jpg" },
  { data: "2026-11-27", hora: "19:30", atracao: "Lóssios", estilo: "Brasilidades", foto: "img/bandas/lossios.jpg" },
  { data: "2026-11-28", hora: "13:30", atracao: "Luara e as Comadres", estilo: "Samba", foto: "img/bandas/luara-e-as-comadres.jpg" },
  { data: "2026-11-28", hora: "19:30", atracao: "London", estilo: "Rock", foto: "img/bandas/london.jpg" }
];

// Foto ou vídeo do topo quando não há show marcado (de preferência uma banda no palco do Soul).
window.SOUL_PALCO_PADRAO = { foto: "img/bandas/old-is-cool.jpg", video: "" };

// GALERIA — fotos que passam em sequência na seção "Uma noite no Soul", na ordem do "quadro".
window.SOUL_GALERIA = [
  { quadro: 1, foto: "img/galeria/drink-balcao.jpg", legenda: "Drink sendo servido no balcão do Soul" },
  { quadro: 2, foto: "img/galeria/steak-tartare.jpg", legenda: "Steak tartare com Aperol Spritz, sobre o jogo americano do Soul" },
  { quadro: 3, foto: "img/galeria/torresmo.jpg", legenda: "Torresmo de rolo com gin tônica" },
  { quadro: 4, foto: "img/galeria/bolovo-chopp.jpg", legenda: "Bolovo de carne de panela com chopp na taça do Soul" },
  { quadro: 5, foto: "img/galeria/entrada-aperol.jpg", legenda: "Entrada da casa com Aperol Spritz" },
  { quadro: 6, foto: "img/galeria/aniversario.jpg", legenda: "Aniversário comemorado no Soul" }
];
