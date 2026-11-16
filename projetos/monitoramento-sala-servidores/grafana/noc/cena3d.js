// =====================================================================
// cena3d.js — a sala em 3D, no estilo "planta técnica isométrica"
// ---------------------------------------------------------------------
// Visual: câmera isométrica (sem perspectiva), materiais foscos e
// contornos finos — parecido com uma ilustração de projeto, não com um
// videogame. A cor aparece só quando significa algo (estado/alarme).
//
// O que tem na sala:
//   • Rack 42U montado A PARTIR DOS DADOS: cada host do grupo
//     "Sala do servidor" com agente vira um servidor de 2U. Clique nele.
//   • Switch e patch panel; embaixo, o nobreak com visor da entrada de energia.
//   • Tomada na parede ligada ao nobreak (pontinhos de energia no cabo).
//   • Ar-condicionado (com vento discreto) e, embaixo dele, as sondas de água.
//   • Porta (abre de verdade) e o sensor na parede.
//
// Alarmes (as partes "vivas" da cena):
//   • Falta de energia → luzes caem, luz de emergência vermelha pisca.
//   • Água → gotas caindo do ar-condicionado e poça no piso.
//   • Porta aberta → a porta gira e o batente fica vermelho.
//   • Qualquer problema → giroflex no topo do rack (laranja = médio,
//     vermelho = grave) e contorno do rack na mesma cor.
//   • Cada tipo de problema tem a sua reação, escolhida pela tag "efeito"
//     do gatilho no Zabbix: calor saindo do rack (temperatura), brilho no
//     chão da porta (porta aberta demais), ondas no sensor (sem resposta /
//     DHT11 com falha), moldura piscando no servidor com problema.
//
// Unidades: 1 = 1 metro. Sala de 8 m × 6 m × 3 m, aberta na frente e à
// direita (como uma maquete) para a câmera enxergar dentro.
// =====================================================================

import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from './vendor/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from './vendor/jsm/environments/RoomEnvironment.js';

// Cores de estado (as mesmas da interface)
const COR = { ok: 0x73bf69, atencao: 0xff9830, alerta: 0xf2495c, neutro: 0x6e7681, agua: 0x5ea8e6, info: 0x5794f2 };
const COR_ESTADO = { ok: COR.ok, atencao: COR.atencao, critico: COR.alerta, desconhecido: COR.neutro };

// Paleta da sala (cinzas neutros)
const P = {
  piso: 0x353a43, junta: 0x40464f, parede: 0x2b2f37, rodape: 0x1d2025,
  rack: 0x2a2e35, rackLateral: 0x343941, equipamento: 0x3b4149, frente: 0x454c56,
  contorno: 0x0d0f12, metal: 0x8b93a0,
};

// Rack: posição e medidas (19" ≈ 0,48 m; 1U = 4,45 cm)
const RACK = { x: 0.35, z: -2.15, largura: 0.66, altura: 2.05, profundidade: 1.0 };
const U = 0.0445;
const BASE_U = 0.09;
const FRENTE = RACK.z + RACK.profundidade / 2 - 0.05;
const MAX_SERVIDORES = 10;
const ALTURA_VISTA = 6.4;      // quantos metros de altura cabem na tela (zoom da câmera)

export function criarCena(caixa, eventos = {}) {
  const ico = eventos.icone || (() => '');
  // ---------- Renderizadores ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x15181d, 1);
  caixa.appendChild(renderer.domElement);

  const etiquetas = new CSS2DRenderer();
  etiquetas.domElement.className = 'noc3d-etiquetas';
  caixa.appendChild(etiquetas.domElement);

  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const ambienteRefl = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  cena.environment = ambienteRefl;           // reflexo suave para os metais
  cena.environmentIntensity = 0.25;

  // ---------- Câmera isométrica ----------
  // Ortográfica: objetos não diminuem com a distância (como num desenho técnico).
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const VISTA = { alvo: new THREE.Vector3(-0.9, 0.85, -1.3), direcao: new THREE.Vector3(0.55, 0.72, 1).normalize(), zoom: 1 };
  const posDaVista = (alvo) => alvo.clone().add(VISTA.direcao.clone().multiplyScalar(22));
  camera.position.copy(posDaVista(VISTA.alvo));

  const controles = new OrbitControls(camera, etiquetas.domElement);
  controles.target.copy(VISTA.alvo);
  controles.enableDamping = true;
  controles.dampingFactor = 0.08;
  // Botão esquerdo gira, direito arrasta a vista, roda aproxima.
  controles.enablePan = true;
  controles.screenSpacePanning = true;
  controles.minZoom = 0.6;
  controles.maxZoom = 4;
  // Ângulos (radianos): de quase de cima (0,2) até perto do chão (1,4); de
  // lado, da esquerda (-0,5) até de frente para a parede do fundo (1,7).
  // Mais que isso, as paredes da sala ficam entre a câmera e o rack.
  controles.minPolarAngle = 0.2;
  controles.maxPolarAngle = 1.4;
  controles.minAzimuthAngle = -0.5;
  controles.maxAzimuthAngle = 1.7;
  // O arraste não deixa o olhar sair da sala.
  const LIMITE_ALVO = new THREE.Box3(new THREE.Vector3(-3.6, 0.2, -2.9), new THREE.Vector3(2.4, 2.6, 0.8));
  controles.addEventListener('change', () => {
    const antes = controles.target.clone();
    LIMITE_ALVO.clampPoint(controles.target, controles.target);
    camera.position.add(controles.target.clone().sub(antes));
  });
  controles.update();
  controles.addEventListener('start', () => { voo = null; });

  // ---------- Luzes (neutras, suaves) ----------
  const luzCeu = new THREE.HemisphereLight(0xf1f5f9, 0x23272e, 1.8);
  cena.add(luzCeu);
  const luzPrincipal = new THREE.DirectionalLight(0xffffff, 1.6);
  luzPrincipal.position.set(-3, 9, 5);
  luzPrincipal.castShadow = true;
  luzPrincipal.shadow.mapSize.set(2048, 2048);
  Object.assign(luzPrincipal.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  luzPrincipal.shadow.bias = -0.0004;
  luzPrincipal.shadow.radius = 4;
  cena.add(luzPrincipal);
  const luzEmergencia = new THREE.PointLight(COR.alerta, 0, 10, 1.3);
  luzEmergencia.position.set(-0.5, 2.8, -1.4);
  cena.add(luzEmergencia);

  // ---------- Atalhos ----------
  const geradas = [];
  const mat = (cor, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0.05, ...extra });
    geradas.push(m);
    return m;
  };
  const led = (cor, intensidade = 1.6) => mat(cor, { emissive: cor, emissiveIntensity: intensidade, roughness: 0.5 });
  const matContorno = new THREE.LineBasicMaterial({ color: P.contorno, transparent: true, opacity: 0.55 });

  // Caixa com contorno fino (é o contorno que dá o ar de "desenho").
  const bloco = (l, a, p, material, x, y, z, pai = cena, contorno = true) => {
    const geo = new THREE.BoxGeometry(l, a, p);
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    if (contorno) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), matContorno));
    pai.add(m);
    return m;
  };
  const pequeno = (l, a, p, material, x, y, z, pai = cena) => {
    const m = bloco(l, a, p, material, x, y, z, pai, false);
    m.castShadow = false;
    return m;
  };
  const rotulo = (pai, x, y, z, classe = '') => {
    const el = document.createElement('div');
    el.className = 'rotulo3d ' + classe;
    const o = new CSS2DObject(el);
    o.position.set(x, y, z);
    pai.add(o);
    return el;
  };

  // =====================================================================
  // SALA
  // =====================================================================
  bloco(8, 0.1, 6, mat(P.piso), 0, -0.05, 0, cena, false);
  // Juntas das placas do piso elevado (60 cm)
  const juntas = new THREE.GridHelper(8, 13, P.junta, P.junta);
  juntas.scale.z = 6 / 8;
  juntas.position.y = 0.002;
  cena.add(juntas);
  // Paredes "em corte": se a câmera gira para o lado de FORA de uma parede,
  // ela fica quase transparente (comum em plantas isométricas), senão
  // taparia a sala inteira.
  const matParedeFundo = mat(P.parede, { transparent: true });
  const matParedeEsq = mat(P.parede, { transparent: true });
  const paredes = [
    { mats: matParedeFundo, atras: () => camera.position.z < -3.05,
      malhas: [bloco(8.1, 3, 0.1, matParedeFundo, -0.05, 1.5, -3.05)] },
    { mats: matParedeEsq, atras: () => camera.position.x < -4.05,
      malhas: [bloco(0.1, 3, 1.1, matParedeEsq, -4.05, 1.5, -2.45), bloco(0.1, 3, 3.9, matParedeEsq, -4.05, 1.5, 1.05),
        bloco(0.1, 0.9, 1.0, matParedeEsq, -4.05, 2.55, -1.4)] },
  ];
  bloco(8.0, 0.08, 0.02, mat(P.rodape), 0, 0.04, -2.99, cena, false);
  bloco(0.02, 0.08, 6, mat(P.rodape), -3.99, 0.04, 0, cena, false);

  // =====================================================================
  // RACK 42U
  // =====================================================================
  const rack = new THREE.Group();
  cena.add(rack);
  const { x: rx, z: rz, largura: rl, altura: ra, profundidade: rp } = RACK;
  const matRack = mat(P.rack, { metalness: 0.3, roughness: 0.6 });
  bloco(rl, 0.05, rp, matRack, rx, ra - 0.025, rz, rack);
  bloco(rl, 0.06, rp, matRack, rx, 0.03, rz, rack);
  bloco(0.02, ra - 0.11, rp, mat(P.rackLateral, { metalness: 0.3, roughness: 0.55 }), rx - rl / 2 + 0.01, ra / 2, rz, rack);
  bloco(0.02, ra - 0.11, rp, mat(P.rackLateral, { metalness: 0.3, roughness: 0.55 }), rx + rl / 2 - 0.01, ra / 2, rz, rack);
  bloco(rl - 0.04, ra - 0.11, 0.02, matRack, rx, ra / 2, rz - rp / 2 + 0.01, rack);
  for (const dx of [-1, 1]) bloco(0.03, ra - 0.11, 0.03, matRack, rx + dx * (rl / 2 - 0.045), ra / 2, FRENTE + 0.035, rack);
  // Contorno de alarme (invisível no normal; colorido quando há alerta)
  const matAlarmeRack = new THREE.LineBasicMaterial({ color: COR.alerta, transparent: true, opacity: 0 });
  const contornoRack = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(rl + 0.03, ra + 0.02, rp + 0.03)), matAlarmeRack);
  contornoRack.position.set(rx, ra / 2, rz);
  rack.add(contornoRack);

  const yDoU = (u, alturaU) => BASE_U + (u - 1) * U + (alturaU * U) / 2;
  const LARG = 0.5, PROF = 0.78;
  function equipamento(uInicial, alturaU, cor, textura) {
    const y = yDoU(uInicial, alturaU);
    const corpo = bloco(LARG, alturaU * U - 0.004, PROF, mat(cor, { metalness: 0.25, roughness: 0.6 }), rx, y, FRENTE - PROF / 2, rack);
    if (textura) {
      const frente = new THREE.Mesh(new THREE.PlaneGeometry(LARG, alturaU * U - 0.004),
        new THREE.MeshStandardMaterial({ map: textura, roughness: 0.7 }));
      frente.position.set(rx, y, FRENTE + 0.002);
      rack.add(frente);
    }
    return corpo;
  }

  // Patch panel (U41) e switch (U40)
  equipamento(41, 1, P.equipamento, texturaCanvas(512, 44, (c) => {
    c.fillStyle = '#2f343c'; c.fillRect(0, 0, 512, 44);
    for (let i = 0; i < 24; i++) { c.fillStyle = '#16191e'; c.fillRect(34 + i * 19, 13, 13, 17); }
    c.fillStyle = '#7d8590'; c.font = '10px sans-serif'; c.fillText('1', 36, 40); c.fillText('24', 470, 40);
  }));
  equipamento(40, 1, P.equipamento, texturaCanvas(512, 44, (c) => {
    c.fillStyle = '#2a2f36'; c.fillRect(0, 0, 512, 44);
    for (let i = 0; i < 24; i++) { c.fillStyle = '#121418'; c.fillRect(74 + i * 17, 13, 13, 17); }
    c.fillStyle = '#8b939e'; c.font = 'bold 10px sans-serif'; c.fillText('SW01', 12, 26);
  }));
  const ledsSwitch = [];
  const matLedSwitch = [led(COR.ok, 1.4), mat(0x1d3a24)];
  for (let i = 0; i < 24; i++) {
    const l = pequeno(0.006, 0.004, 0.004, matLedSwitch[0], rx - LARG / 2 + (74 + i * 17 + 6.5) / 512 * LARG, yDoU(40, 1) + 0.013, FRENTE + 0.004, rack);
    l.userData.fase = Math.random() * 10;
    ledsSwitch.push(l);
  }
  equipamento(39, 1, 0x16191d);

  // Nobreak (U1–U3) com visor
  const visorUps = criarVisor(256, 64);
  equipamento(1, 3, 0x272b31);
  const visor = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.038), new THREE.MeshBasicMaterial({ map: visorUps.textura, toneMapped: false }));
  visor.position.set(rx - 0.12, yDoU(1, 3) + 0.01, FRENTE + 0.004);
  rack.add(visor);
  const matLedUps = led(COR.ok);
  pequeno(0.012, 0.012, 0.004, matLedUps, rx + 0.16, yDoU(1, 3) + 0.03, FRENTE + 0.004, rack);

  // Painel cego (espaço livre), refeito quando muda o número de servidores
  const texCego = texturaCanvas(64, 256, (c) => {
    c.fillStyle = '#31363d'; c.fillRect(0, 0, 64, 256);
    c.fillStyle = '#272b31'; for (let y = 0; y < 256; y += 12.8) c.fillRect(0, y, 64, 1.5);
  });
  texCego.wrapT = THREE.RepeatWrapping;
  let painelCego = null;

  // ---------- Servidores (vêm do Zabbix) ----------
  let servidores3d = [];
  const clicaveis = [];
  let assinaturaRack = '';
  let selecionado = null;

  function montarServidores(lista) {
    const assinatura = lista.map((s) => s.id).join(',');
    if (assinatura === assinaturaRack) return;
    assinaturaRack = assinatura;
    for (const s of servidores3d) { rack.remove(s.grupo); s.textura.dispose(); }
    servidores3d = [];
    for (let i = clicaveis.length - 1; i >= 0; i--) if (clicaveis[i].userData.servidorId) clicaveis.splice(i, 1);

    const visiveis = lista.slice(0, MAX_SERVIDORES);
    visiveis.forEach((srv, i) => {
      const grupo = new THREE.Group();
      grupo.position.set(rx, yDoU(37 - i * 2, 2), 0);
      const corpo = bloco(LARG, 2 * U - 0.004, PROF, mat(P.frente, { metalness: 0.3, roughness: 0.5 }), 0, 0, FRENTE - PROF / 2, grupo);
      const textura = texturaCanvas(512, 92, () => {});
      const frente = new THREE.Mesh(new THREE.PlaneGeometry(LARG, 2 * U - 0.004), new THREE.MeshStandardMaterial({ map: textura, roughness: 0.6 }));
      frente.position.set(0, 0, FRENTE + 0.003);
      grupo.add(frente);
      const matEstado = led(COR.ok, 1.8);
      pequeno(0.012, 0.012, 0.004, matEstado, LARG / 2 - 0.03, 0.018, FRENTE + 0.006, grupo);
      const discos = [];
      for (let d = 0; d < 4; d++) {
        const l = pequeno(0.007, 0.004, 0.004, led(COR.ok, 1.2), LARG / 2 - 0.12 + d * 0.016, -0.02, FRENTE + 0.006, grupo);
        l.userData.fase = Math.random() * 10;
        discos.push(l);
      }
      // Moldura de seleção (aparece no hover e quando o servidor está aberto)
      const moldura = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LARG + 0.02, 2 * U + 0.012, 0.02)),
        new THREE.LineBasicMaterial({ color: COR.info, transparent: true, opacity: 0 }));
      moldura.position.set(0, 0, FRENTE + 0.01);
      grupo.add(moldura);
      // Moldura de alarme: pisca quando ESTE servidor tem um problema.
      const alarme = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(LARG + 0.04, 2 * U + 0.03, 0.03)),
        new THREE.LineBasicMaterial({ color: COR.alerta, transparent: true, opacity: 0 }));
      alarme.position.set(0, 0, FRENTE + 0.012);
      grupo.add(alarme);
      for (const m of [corpo, frente]) { m.userData.servidorId = srv.id; clicaveis.push(m); }
      rack.add(grupo);
      servidores3d.push({ id: srv.id, grupo, textura, matEstado, discos, moldura, alarme, temAlarme: false, dados: srv, hover: false });
    });

    if (painelCego) { rack.remove(painelCego); painelCego.geometry.dispose(); }
    const uTopoLivre = 37 - visiveis.length * 2 + 1;
    if (uTopoLivre >= 4) {
      const n = uTopoLivre - 4 + 1;
      const t = texCego.clone(); t.needsUpdate = true; t.repeat.set(1, n / 20);
      painelCego = new THREE.Mesh(new THREE.BoxGeometry(LARG, n * U - 0.004, 0.02), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }));
      painelCego.position.set(rx, yDoU(4, n), FRENTE - 0.01);
      rack.add(painelCego);
    }
  }

  // Frente do servidor: só o que existe num servidor de verdade —
  // etiqueta de patrimônio com o nome, grade de ventilação e baias de disco.
  function desenharFrente(s3d) {
    const sel = selecionado === s3d.id;
    pintarCanvas(s3d.textura, (c, w, h) => {
      c.fillStyle = sel ? '#55617a' : '#4a5059'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#3b4048';
      for (let x = 20; x < 250; x += 58) c.fillRect(x, 12, 50, h - 24);         // baias de disco
      c.fillStyle = '#353a41';
      for (let x = 280; x < 400; x += 7) for (let y = 16; y < h - 14; y += 7) c.fillRect(x, y, 4, 4);  // ventilação
      c.fillStyle = '#e8e8e2'; c.fillRect(20, 12, 108, 22);                     // etiqueta adesiva
      c.fillStyle = '#1c1f24'; c.font = 'bold 15px Consolas, monospace';
      c.fillText(s3d.dados.nome.toUpperCase().slice(0, 12), 26, 28);
    });
  }

  // =====================================================================
  // TOMADA E CABO ATÉ O NOBREAK
  // =====================================================================
  const tomada = new THREE.Group();
  tomada.position.set(-0.6, 0.42, -2.98);
  bloco(0.15, 0.22, 0.025, mat(0xd6d3cc), 0, 0, 0, tomada);
  const matTomada = led(COR.ok, 1.2);
  const indicadorTomada = pequeno(0.02, 0.02, 0.01, matTomada, 0.045, 0.07, 0.016, tomada);
  cena.add(tomada);
  const curvaCabo = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.6, 0.32, -2.96), new THREE.Vector3(-0.58, 0.03, -2.86),
    new THREE.Vector3(-0.3, 0.03, -2.66), new THREE.Vector3(rx - 0.15, 0.03, RACK.z - 0.2),
    new THREE.Vector3(rx - 0.15, 0.1, RACK.z + 0.1),
  ]);
  const matCabo = mat(0x121418);
  cena.add(new THREE.Mesh(new THREE.TubeGeometry(curvaCabo, 48, 0.012, 8, false), matCabo));
  const etqTomada = rotulo(cena, -0.6, 0.8, -2.9);
  // Energia passando: 3 pontinhos verdes, pequenos e translúcidos, que
  // correm devagar pelo cabo da tomada até o rack. Somem sem energia.
  const matPulso = new THREE.MeshBasicMaterial({ color: COR.ok, transparent: true, opacity: 0, depthWrite: false });
  const pulsos = [0, 1 / 3, 2 / 3].map((fase) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), matPulso.clone());
    m.userData.fase = fase;
    cena.add(m);
    return m;
  });
  indicadorTomada.userData.sensor = 'energia';
  tomada.children[0].userData.sensor = 'energia';
  clicaveis.push(tomada.children[0]);

  // =====================================================================
  // AR-CONDICIONADO E ÁGUA
  // =====================================================================
  const ar = new THREE.Group();
  ar.position.set(-2.15, 2.5, -2.84);
  bloco(1.5, 0.38, 0.28, mat(0xd9d8d2, { roughness: 0.6 }), 0, 0, 0, ar);
  pequeno(1.3, 0.035, 0.01, mat(0x2a2d33), 0, -0.13, 0.145, ar);
  cena.add(ar);

  const POCA = new THREE.Vector3(-2.15, 0.006, -2.2);
  const sondas = new THREE.Group();
  sondas.position.set(POCA.x + 0.3, 0.006, POCA.z + 0.15);
  bloco(0.3, 0.01, 0.2, mat(0x8a6a48), 0, 0, 0, sondas);
  pequeno(0.016, 0.016, 0.14, mat(P.metal, { metalness: 0.8, roughness: 0.3 }), -0.05, 0.013, 0, sondas);
  pequeno(0.016, 0.016, 0.14, mat(P.metal, { metalness: 0.8, roughness: 0.3 }), 0.05, 0.013, 0, sondas);
  cena.add(sondas);
  sondas.children[0].userData.sensor = 'agua';
  clicaveis.push(sondas.children[0]);
  const poca = new THREE.Mesh(new THREE.CircleGeometry(0.85, 40),
    new THREE.MeshStandardMaterial({ color: COR.agua, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.2 }));
  poca.rotation.x = -Math.PI / 2;
  poca.position.copy(POCA);
  poca.scale.setScalar(0.001);
  cena.add(poca);
  const onda = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 48),
    new THREE.MeshBasicMaterial({ color: 0xbcdcf5, transparent: true, opacity: 0, side: THREE.DoubleSide }));
  onda.rotation.x = -Math.PI / 2;
  onda.position.set(POCA.x, 0.009, POCA.z);
  cena.add(onda);
  const gotas = [];
  const geoGota = new THREE.SphereGeometry(0.022, 8, 8); geoGota.scale(1, 1.6, 1);
  const matGota = mat(COR.agua, { roughness: 0.1 });
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Mesh(geoGota, matGota);
    g.visible = false;
    g.userData.fase = i / 4;
    g.userData.dx = (i - 1.5) * 0.18;
    cena.add(g);
    gotas.push(g);
  }
  const etqAgua = rotulo(cena, POCA.x + 0.3, 0.2, POCA.z + 0.55);

  // Vento do ar: névoa fria bem leve. São "manchas" redondas e desfocadas
  // (sprites com degradê radial) que saem da grade, descem em curva para
  // dentro da sala, crescem e se dissolvem. Várias sobrepostas dão a
  // impressão de ar em movimento, sem nenhuma forma reta.
  // Param quando falta energia (o ar desliga junto).
  const texNevoa = texturaCanvas(64, 64, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.4, 'rgba(255,255,255,.45)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, w, h);
  });
  const ventos = [];
  for (let i = 0; i < 36; i++) {
    const v = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texNevoa, color: 0xd6ecff, transparent: true, opacity: 0, depthWrite: false,
    }));
    v.userData = {
      fase: i / 36,
      x: (Math.random() - 0.5) * 1.2,                     // ponto da grade de onde sai
      velocidade: 0.12 + Math.random() * 0.06,
      deriva: (Math.random() - 0.5) * 0.35,               // leve desvio para o lado
      giro: Math.random() * Math.PI * 2,
      forca: 0,                                           // 0 = desligado, 1 = soprando
    };
    cena.add(v);
    ventos.push(v);
  }

  // =====================================================================
  // PORTA E SENSOR NA PAREDE
  // =====================================================================
  const dobradica = new THREE.Group();
  dobradica.position.set(-3.98, 0, -1.88);
  const folha = bloco(0.045, 2.08, 0.96, mat(0x4a4f57, { roughness: 0.6 }), 0, 1.04, 0.48, dobradica);
  bloco(0.05, 0.03, 0.12, mat(P.metal, { metalness: 0.8, roughness: 0.3 }), 0.04, 1.0, 0.82, dobradica);
  cena.add(dobradica);
  const matBatente = mat(0x3a3f47);
  bloco(0.05, 0.05, 1.06, matBatente, -3.97, 2.1, -1.4);
  bloco(0.05, 2.1, 0.05, matBatente, -3.97, 1.05, -1.91);
  bloco(0.05, 2.1, 0.05, matBatente, -3.97, 1.05, -0.89);
  pequeno(0.02, 0.1, 0.02, mat(0xd6d3cc), -3.94, 1.6, -0.86);        // reed switch no batente
  const etqPorta = rotulo(cena, -3.9, 2.35, -1.4);
  folha.userData.sensor = 'porta';
  clicaveis.push(folha);

  const sensor = new THREE.Group();
  sensor.position.set(-1.15, 1.45, -2.97);
  const caixaSensor = bloco(0.16, 0.22, 0.06, mat(0xd6d3cc, { roughness: 0.7 }), 0, 0, 0, sensor);
  const matLedSensor = led(COR.info, 1.4);
  pequeno(0.012, 0.012, 0.008, matLedSensor, -0.05, 0.08, 0.032, sensor);
  const telaSensor = criarVisor(256, 128);
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ map: telaSensor.textura, toneMapped: false }));
  tela.position.set(0, -0.02, 0.031);
  sensor.add(tela);
  cena.add(sensor);
  caixaSensor.userData.sensor = 'temperatura';
  tela.userData.sensor = 'temperatura';
  clicaveis.push(caixaSensor, tela);
  const etqSensor = rotulo(sensor, 0, 0.3, 0.05);

  // =====================================================================
  // REAÇÕES A PROBLEMAS (uma para cada tag "efeito" dos gatilhos)
  // =====================================================================
  // Temperatura: ar quente subindo do topo do rack (mesma névoa do ar-
  // condicionado, só que em laranja/vermelho e somando luz).
  const calor = [];
  for (let i = 0; i < 14; i++) {
    const c = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texNevoa, color: COR.atencao, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    c.userData = { fase: i / 14, x: (Math.random() - 0.5) * rl * 0.8, z: (Math.random() - 0.5) * rp * 0.6, giro: Math.random() * 6 };
    c.visible = false;
    cena.add(c);
    calor.push(c);
  }
  // Porta aberta demais: brilho suave pulsando no chão, na frente da porta.
  const brilhoPorta = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({ map: texNevoa, color: COR.atencao, transparent: true, opacity: 0, depthWrite: false }));
  brilhoPorta.rotation.x = -Math.PI / 2;
  brilhoPorta.position.set(-3.45, 0.012, -1.4);
  cena.add(brilhoPorta);
  // Sensor sem resposta / DHT11 com falha: ondas saindo do sensor, como um
  // aparelho "procurando sinal".
  const ondasSensor = [0, 0.5].map((fase) => {
    const o = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.14, 48),
      new THREE.MeshBasicMaterial({ color: COR.alerta, transparent: true, opacity: 0, depthWrite: false }));
    o.position.set(0, 0, 0.035);
    o.userData.fase = fase;
    sensor.add(o);
    return o;
  });

  // Giroflex no topo do rack. Só existe na tela quando há algum problema
  // (apagado ele seria só um enfeite sem função). Laranja para problemas
  // médios, vermelho para graves. Formato de sinalizador (base + cúpula).
  const giroflex = new THREE.Group();
  giroflex.position.set(rx + 0.2, ra, rz + 0.25);
  giroflex.visible = false;
  const matGiroflex = mat(0x5a2a2e, { emissive: COR.alerta, emissiveIntensity: 0, roughness: 0.4 });
  const baseGiroflex = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.025, 20), mat(0x2a2e35));
  baseGiroflex.position.y = 0.0125;
  const cupula = new THREE.Mesh(new THREE.SphereGeometry(0.04, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), matGiroflex);
  cupula.position.y = 0.025;
  giroflex.add(baseGiroflex, cupula);
  const luzGiroflex = new THREE.SpotLight(COR.alerta, 0, 6, 0.55, 0.7, 1.2);
  const alvoGiroflex = new THREE.Object3D(); alvoGiroflex.position.set(2, -0.6, 0);
  giroflex.add(luzGiroflex, alvoGiroflex);
  luzGiroflex.target = alvoGiroflex;
  cena.add(giroflex);

  // =====================================================================
  // VISTA EXPLODIDA: o servidor selecionado desliza para fora do rack e,
  // na frente dele, aparece o que ele RODA — no caminho de uma requisição:
  //   clientes → proxy (nginx) → aplicação → banco
  //   • banco = cilindro (o símbolo clássico); aplicação = bloco com faixas
  //     que piscam no ritmo das requisições; proxy = caixa fina de rede;
  //   • contorno na cor do pior alerta daquele componente;
  //   • quem é container aparece com um selo na gaveta lateral, não aqui:
  //     uma caixa em volta da peça parecia defeito de desenho;
  //   • partículas nas ligações: velocidade ∝ req/s, vermelhas com erros.
  // =====================================================================
  const COR_COMP = { ok: COR.ok, atencao: COR.atencao, alerta: COR.alerta, parado: COR.neutro };
  const ESPACO = 0.7;             // distância entre componentes (m)
  let vista = null;

  function criarComponente(c) {
    const g = new THREE.Group();
    const geos = [], mats = [];
    const malha = (geo, material) => { geos.push(geo); mats.push(material); const m = new THREE.Mesh(geo, material); g.add(m); return m; };
    const matCorpo = new THREE.MeshStandardMaterial({ color: 0x2f343c, metalness: 0.3, roughness: 0.55 });
    const matFaixa = new THREE.MeshStandardMaterial({ color: COR.ok, emissive: COR.ok, emissiveIntensity: 1.2 });
    const faixas = [];
    let geoContorno;
    if (c.tipo === 'banco') {
      malha(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 32), matCorpo);
      for (const y of [0.13, 0.043, -0.043]) {            // os "discos" do símbolo de banco
        const anel = malha(new THREE.TorusGeometry(0.1115, 0.0045, 6, 48), matFaixa);
        anel.rotation.x = Math.PI / 2;
        anel.position.y = y;
        faixas.push(anel);
      }
      geoContorno = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.128, 0.128, 0.29, 24), 30);
    } else if (c.tipo === 'proxy') {
      malha(new THREE.BoxGeometry(0.32, 0.08, 0.2), matCorpo);
      for (let i = 0; i < 4; i++) {                       // portas de rede
        const p = malha(new THREE.BoxGeometry(0.035, 0.022, 0.006), matFaixa);
        p.position.set(-0.09 + i * 0.06, 0, 0.102);
        faixas.push(p);
      }
      geoContorno = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.35, 0.11, 0.23));
    } else {                                              // aplicação
      malha(new THREE.BoxGeometry(0.26, 0.22, 0.2), matCorpo);
      for (const y of [-0.06, 0, 0.06]) {                 // "threads" trabalhando
        const f = malha(new THREE.BoxGeometry(0.18, 0.012, 0.006), matFaixa);
        f.position.set(0, y, 0.102);
        faixas.push(f);
      }
      geoContorno = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.29, 0.25, 0.23));
    }
    for (const m of g.children) { m.userData.componente = c.id; clicaveis.push(m); }
    const matContorno = new THREE.LineBasicMaterial({ color: COR.ok, transparent: true, opacity: 0.9 });
    geos.push(geoContorno); mats.push(matContorno);
    g.add(new THREE.LineSegments(geoContorno, matContorno));
    const el = document.createElement('div');
    el.className = 'rotulo3d componente3d';
    const etiqueta = new CSS2DObject(el);
    etiqueta.position.set(0, c.tipo === 'proxy' ? 0.17 : 0.27, 0);
    g.add(etiqueta);
    return { id: c.id, g, faixas, matFaixa, matContorno, el, etiqueta, geos, mats: [...mats, matCorpo], fase: Math.random() * 6, dados: c };
  }

  // "1 conexão", "2 conexões": plural só quando precisa.
  const qtd = (n, um, varios) => `${fmt(n, 0)} ${Math.round(n) === 1 ? um : varios}`;

  function textoComponente(c) {
    const icone = { banco: 'banco', proxy: 'proxy', app: 'app' }[c.tipo];
    const partes = [];
    if (c.tipo === 'app' && c.rps !== undefined) {
      partes.push(`${fmt(c.rps, 1)} req/s`, `p95 ${fmt(c.p95, 0)} ms`);
      if (c.erros > 0) partes.push(`${fmt(c.erros, 0)}% erros`);
    } else if (c.tipo === 'banco' && c.conexoes !== undefined) {
      partes.push(`${qtd(c.conexoes, 'conexão', 'conexões')} (${fmt(c.conexoesPct, 0)}%)`);
      if (c.tamanhoMb !== null) partes.push(`${fmt(c.tamanhoMb, 1)} MB`);
    } else if (c.tipo === 'proxy' && c.reqSeg !== undefined) {
      partes.push(`${fmt(c.reqSeg, 1)} req/s`, qtd(c.conexoesAtivas, 'conexão', 'conexões'));
    } else if (c.container) {
      partes.push(`CPU ${fmt(c.cpu, 1)}%`, `${fmt(c.memoriaMb, 0)} MB`);
    }
    if (c.container && c.reinicios) partes.push(qtd(c.reinicios, 'reinício', 'reinícios'));
    if (c.estado === 'parado') partes.splice(0, partes.length, c.status || 'parado');
    return `${ico(icone)}<span>${c.nome}</span><b>${partes.join(' · ')}</b>`;
  }

  // Ligação animada entre dois pontos (requisições passando).
  function criarFluxo(de, para) {
    const geo = new THREE.BufferGeometry().setFromPoints([de, para]);
    const matLinha = new THREE.LineBasicMaterial({ color: COR.info, transparent: true, opacity: 0.35 });
    const linha = new THREE.Line(geo, matLinha);
    const geoBola = new THREE.SphereGeometry(0.012, 8, 6);
    const matBola = new THREE.MeshBasicMaterial({ color: COR.info, transparent: true });
    const bolas = [0, 0.25, 0.5, 0.75].map((fase) => { const b = new THREE.Mesh(geoBola, matBola); b.userData.fase = fase; return b; });
    return { de, para, linha, bolas, matLinha, matBola, geos: [geo, geoBola], mats: [matLinha, matBola], velocidade: 0.4 };
  }

  function montarVista(s) {
    desmontarVista();
    const comps = s.dados.componentes || [];
    if (!comps.length) return;
    // Os componentes ficam AO LADO do rack (à direita, no chão livre da
    // sala), e não na frente dele — assim não cobrem o próprio servidor.
    const grupo = new THREE.Group();
    const ys = s.grupo.position.y;
    const largura = (comps.length - 1) * ESPACO;
    grupo.position.set(rx + rl / 2 + 0.75 + largura / 2, Math.max(0.6, ys - 0.2), FRENTE + 0.25);
    cena.add(grupo);
    const pecas = comps.map((c, i) => {
      const p = criarComponente(c);
      p.g.position.x = (i - (comps.length - 1) / 2) * ESPACO;
      // Na vista isométrica a fileira desce na diagonal: alterna as
      // etiquetas entre em cima e embaixo, para uma não cobrir a outra.
      if (i % 2) p.etiqueta.position.y = -0.24;
      grupo.add(p.g);
      return p;
    });
    // Fluxos: clientes (à esquerda) → 1º componente → 2º → ...
    const pontos = [new THREE.Vector3(pecas[0].g.position.x - ESPACO * 0.9, 0, 0), ...pecas.map((p) => p.g.position.clone())];
    const fluxos = [];
    for (let i = 0; i < pontos.length - 1; i++) {
      const f = criarFluxo(pontos[i].clone().add(new THREE.Vector3(i ? 0.17 : 0, 0, 0)), pontos[i + 1].clone().add(new THREE.Vector3(-0.17, 0, 0)));
      grupo.add(f.linha, ...f.bolas);
      fluxos.push(f);
    }
    // Linha tracejada da frente do servidor (já fora do rack) até os
    // componentes: "isto roda aqui dentro".
    const frenteServidor = new THREE.Vector3(rx + LARG / 2, ys, FRENTE + 0.32).sub(grupo.position);
    const geoLiga = new THREE.BufferGeometry().setFromPoints([
      frenteServidor, new THREE.Vector3(pecas[0].g.position.x - ESPACO * 0.9, 0, 0)]);
    const matLiga = new THREE.LineDashedMaterial({ color: 0x8e959e, dashSize: 0.04, gapSize: 0.03, transparent: true, opacity: 0.6 });
    const liga = new THREE.Line(geoLiga, matLiga);
    liga.computeLineDistances();
    grupo.add(liga);
    vista = { id: s.id, assinatura: comps.map((c) => c.id).join(','), grupo, pecas, fluxos, extras: { geos: [geoLiga], mats: [matLiga] } };
    atualizarVista(s);
  }

  function desmontarVista() {
    if (!vista) return;
    for (const p of vista.pecas) {
      p.etiqueta.removeFromParent();                       // tira a etiqueta do HTML
      for (const m of p.g.children) { const i = clicaveis.indexOf(m); if (i >= 0) clicaveis.splice(i, 1); }
      p.geos.forEach((x) => x.dispose()); p.mats.forEach((x) => x.dispose());
    }
    for (const f of vista.fluxos) { f.geos.forEach((x) => x.dispose()); f.mats.forEach((x) => x.dispose()); }
    vista.extras.geos.forEach((x) => x.dispose()); vista.extras.mats.forEach((x) => x.dispose());
    cena.remove(vista.grupo);
    vista = null;
  }

  function atualizarVista(s) {
    if (!vista) return;
    const comps = s.dados.componentes || [];
    if (comps.map((c) => c.id).join(',') !== vista.assinatura) { montarVista(s); return; }
    let rps = 0, erros = 0, lenta = false;
    for (const p of vista.pecas) {
      const c = comps.find((x) => x.id === p.id);
      p.dados = c;
      const cor = COR_COMP[c.estado] ?? COR.ok;
      p.matContorno.color.setHex(cor);
      pintar(p.matFaixa, c.estado === 'parado' ? COR.neutro : cor);
      p.el.className = 'rotulo3d componente3d ' + ({ ok: 'ok', atencao: 'atencao', alerta: 'alerta' }[c.estado] || 'neutro');
      const html = textoComponente(c);
      if (p.el.__html !== html) { p.el.__html = html; p.el.innerHTML = html; }
      if (c.tipo === 'app' && c.rps !== undefined) { rps = c.rps || 0; erros = c.erros || 0; lenta = (c.p95 || 0) > 800; }
    }
    for (const f of vista.fluxos) {
      f.velocidade = lenta ? 0.15 : 0.25 + Math.min(rps, 25) * 0.05;
      const cor = erros > 5 ? COR.alerta : lenta ? COR.atencao : COR.info;
      f.matBola.color.setHex(cor);
      f.matLinha.color.setHex(cor);
      f.ativo = rps > 0.05;
    }
  }

  function animarVista(t, dt) {
    for (const s of servidores3d) {
      const fora = vista && vista.id === s.id ? 0.32 : 0;   // o servidor desliza para fora do rack
      s.grupo.position.z += (fora - s.grupo.position.z) * Math.min(1, dt * 6);
    }
    if (!vista) return;
    for (const p of vista.pecas) {
      const c = p.dados;
      const ritmo = c.tipo === 'app' ? 2 + Math.min(c.rps || 0, 25) * 0.6 : c.tipo === 'banco' ? 1.5 + (c.conexoesPct || 0) * 0.08 : 3;
      p.faixas.forEach((f, i) => { f.visible = c.estado === 'parado' ? false : Math.sin(t * ritmo + i * 1.7 + p.fase) > -0.6; });
      p.matContorno.opacity = c.estado === 'alerta' ? 0.55 + 0.45 * Math.sin(t * 5) : 0.9;
      p.g.position.y = Math.sin(t * 0.8 + p.fase) * 0.012;  // flutua de leve
    }
    for (const f of vista.fluxos) {
      for (const b of f.bolas) {
        const q = (t * f.velocidade + b.userData.fase) % 1;
        b.position.lerpVectors(f.de, f.para, q);
        b.visible = f.ativo;
      }
    }
  }

  // =====================================================================
  // INTERAÇÃO
  // =====================================================================
  const raio = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  let inicioClique = null;
  const dom = etiquetas.domElement;
  const acertar = (ev) => {
    const r = dom.getBoundingClientRect();
    ponteiro.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(ponteiro, camera);
    return raio.intersectObjects(clicaveis, false)[0]?.object || null;
  };
  dom.addEventListener('pointerdown', (ev) => { inicioClique = [ev.clientX, ev.clientY]; });
  dom.addEventListener('pointerup', (ev) => {
    if (!inicioClique || Math.hypot(ev.clientX - inicioClique[0], ev.clientY - inicioClique[1]) > 5) return;
    const alvo = acertar(ev);
    if (alvo?.userData.componente) eventos.aoClicarComponente?.(alvo.userData.componente);
    else if (alvo?.userData.servidorId) eventos.aoClicarServidor?.(alvo.userData.servidorId);
    else if (alvo?.userData.sensor) eventos.aoClicarSensor?.(alvo.userData.sensor);
    else if (!alvo) eventos.aoClicarVazio?.();
  });
  dom.addEventListener('pointermove', (ev) => {
    const alvo = acertar(ev);
    dom.style.cursor = alvo ? 'pointer' : 'grab';
    for (const s of servidores3d) s.hover = alvo?.userData.servidorId === s.id;
  });
  dom.addEventListener('dblclick', () => voarPara(VISTA.alvo, VISTA.zoom));

  // Voo da câmera: anda o alvo e ajusta o zoom, mantendo o ângulo atual.
  let voo = null;
  function voarPara(alvoNovo, zoomNovo) {
    const deslocamento = camera.position.clone().sub(controles.target);
    voo = { deAlvo: controles.target.clone(), paraAlvo: alvoNovo.clone(), deZoom: camera.zoom, paraZoom: zoomNovo, desloc: deslocamento, t: 0 };
  }

  // =====================================================================
  // ESTADO ALVO (vem dos dados)
  // =====================================================================
  const alvo = { porta: 0, poca: 0.001, agua: false, emergencia: false, energiaOk: false, giroflex: 0, corGiroflex: COR.alerta,
    calor: 0, corCalor: COR.atencao, portaAlarme: false, sinalSensor: null, trafego: 0, online: true, alertaSensor: false };

  function atualizar(r) {
    const amb = r.ambiente;
    const on = amb.online;
    montarServidores(r.servidores);
    for (const s of servidores3d) {
      s.dados = r.servidores.find((x) => x.id === s.id) || s.dados;
      pintar(s.matEstado, COR_ESTADO[s.dados.estado] ?? COR.neutro);
      desenharFrente(s);
    }
    const sel = vista && servidores3d.find((x) => x.id === vista.id);
    if (sel) atualizarVista(sel);

    // Energia
    const semEnergia = on && amb.energia === 0;
    const corEnergia = !on || amb.energia === null ? COR.neutro : semEnergia ? COR.alerta : COR.ok;
    pintar(matTomada, corEnergia);
    pintar(matLedUps, semEnergia ? COR.atencao : corEnergia);
    alvo.emergencia = semEnergia;
    alvo.energiaOk = on && amb.energia === 1;
    visorUps.escrever(!on || amb.energia === null ? ['UPS', 'ENTRADA --', '#8b949e']
      : semEnergia ? ['UPS', 'ENTRADA FALHA', '#ff9830'] : ['UPS', 'ENTRADA OK', '#9fd89a']);
    estadoRotulo(etqTomada, on, amb.energia, (v) => v === 1, ico('raio'), 'Tomada', ['com energia', 'sem energia']);

    // Água
    alvo.agua = on && amb.agua === 1;
    alvo.poca = alvo.agua ? 1 : 0.001;
    estadoRotulo(etqAgua, on, amb.agua, (v) => v === 0, ico('piso'), 'Piso', ['seco', 'água detectada']);

    // Porta
    const aberta = on && amb.porta === 1;
    alvo.porta = aberta ? 1.2 : 0;
    matBatente.color.set(aberta ? COR.alerta : 0x3a3f47);
    estadoRotulo(etqPorta, on, amb.porta, (v) => v === 0, ico('porta'), 'Porta', ['fechada', 'aberta']);

    // Sensor de temperatura
    const t = on ? amb.temperatura : null;
    const nivelT = t === null ? 'neutro' : t >= 32 ? 'alerta' : t >= 28 ? 'atencao' : 'ok';
    telaSensor.escrever(t === null ? ['--.-', on ? 'DHT?' : 'OFF', '#8b949e']
      : [`${fmt(t, 1)}°`, `${amb.umidade ?? '--'}%`, '#d7dbe0'], true);
    pintar(matLedSensor, on ? COR.info : COR.alerta);
    alvo.online = on;
    etqSensor.className = 'rotulo3d ' + nivelT;
    etqSensor.innerHTML = t === null ? `${ico('termometro')}<span>Temperatura</span><b>${on ? '--' : 'sem leitura'}</b>`
      : `${ico('termometro')}<span>Temperatura</span><b>${fmt(t, 1)} °C</b>`;

    // Rack e giroflex: pior alerta ativo. Servidor em manutenção não acende
    // nada: o alerta dele foi silenciado de propósito (botão Manutenção).
    const ativos = r.problemas.filter((p) => !p.suprimido);
    const piorSev = ativos.reduce((m, p) => Math.max(m, p.severidade), 0);
    alvo.giroflex = piorSev >= 2 ? 1 : 0;
    alvo.corGiroflex = piorSev >= 4 ? COR.alerta : COR.atencao;
    matAlarmeRack.color.set(piorSev >= 4 ? COR.alerta : COR.atencao);
    matAlarmeRack.opacity = piorSev >= 2 ? 0.9 : 0;
    alvo.alertaSensor = alvo.agua || aberta || semEnergia;
    // Reações por tipo de problema (tag "efeito" vinda do Zabbix)
    const comEfeito = (ef) => r.problemas.filter((p) => p.efeito === ef);
    const pior = (lista) => lista.reduce((m, p) => Math.max(m, p.severidade), -1);
    const sevTemp = pior(comEfeito('temperatura'));
    alvo.calor = sevTemp >= 0 ? 1 : 0;
    alvo.corCalor = sevTemp >= 4 ? COR.alerta : COR.atencao;
    alvo.portaAlarme = comEfeito('porta').length > 0;
    alvo.sinalSensor = comEfeito('sensor').length ? COR.alerta : comEfeito('dht').length ? COR.atencao : null;
    for (const s of servidores3d) {
      // Qualquer problema do servidor acende a moldura dele no rack: do
      // sistema, do banco, da aplicação ou de um container.
      const sev = pior(ativos.filter((p) => p.servidorId === s.id));
      s.temAlarme = sev >= 2;
      s.alarme.material.color.set(sev >= 4 ? COR.alerta : COR.atencao);
    }
    alvo.trafego = r.servidores.reduce((m, s) => m + (s.redeEntrada || 0) + (s.redeSaida || 0), 0);
  }

  function selecionar(id) {
    selecionado = id;
    for (const s of servidores3d) desenharFrente(s);
    const s = id && servidores3d.find((x) => x.id === id);
    if (s) {
      montarVista(s);
      // Enquadra o servidor E os componentes na frente dele. A gaveta cobre o
      // lado direito da tela: desloca o enquadramento para a parte visível.
      const temComps = (s.dados.componentes || []).length > 0;
      const zoom = temComps ? 2.4 : 2.6;
      const larguraVisivel = (camera.right - camera.left) / zoom;
      const direita = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      // Centro entre o servidor e a fileira de componentes.
      const centro = temComps && vista
        ? new THREE.Vector3(rx, s.grupo.position.y, FRENTE).lerp(vista.grupo.position, 0.7)
        : new THREE.Vector3(rx, s.grupo.position.y, FRENTE);
      voarPara(centro.add(direita.multiplyScalar(larguraVisivel * 0.18)), zoom);
    } else {
      desmontarVista();
      voarPara(VISTA.alvo, VISTA.zoom);
    }
  }

  // =====================================================================
  // FOCO EM UM ALERTA: clicar num problema/evento leva a câmera ao lugar
  // dele e põe um anel pulsando ali por alguns segundos (cor = gravidade).
  // =====================================================================
  const texAnel = texturaCanvas(128, 128, (c, w, h) => {
    c.strokeStyle = '#ffffff';
    c.lineWidth = 7;
    c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 3;
    c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 20, 0, Math.PI * 2); c.stroke();
  });
  const marcador = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texAnel, color: COR.alerta, transparent: true, depthTest: false, opacity: 0 }));
  marcador.renderOrder = 10;                         // sempre por cima: não some atrás de nada
  marcador.visible = false;
  cena.add(marcador);
  const foco = { ate: 0, tamanho: 0.5 };

  // Onde fica cada tipo de alerta da sala (efeito → ponto do marcador).
  const LUGAR_DO_EFEITO = {
    agua: new THREE.Vector3(POCA.x + 0.3, 0.12, POCA.z + 0.15),     // sondas no piso
    energia: tomada.position.clone().add(new THREE.Vector3(0, 0, 0.06)),
    porta: new THREE.Vector3(-3.9, 1.05, -1.4),
    temperatura: sensor.position.clone().add(new THREE.Vector3(0, 0, 0.06)),
    sensor: sensor.position.clone().add(new THREE.Vector3(0, 0, 0.06)),
    dht: sensor.position.clone().add(new THREE.Vector3(0, 0, 0.06)),
  };

  const corDaGravidade = (sev) => (sev >= 4 ? COR.alerta : sev >= 2 ? COR.atencao : COR.info);

  function marcar(ponto, severidade, tamanho = 0.5) {
    marcador.position.copy(ponto);
    marcador.material.color.setHex(corDaGravidade(severidade));
    foco.ate = relogio.elapsedTime + 7;
    foco.tamanho = tamanho;
  }

  // Alerta da sala (água, energia, porta, temperatura, sensor): voa até lá.
  function focar(efeito, severidade) {
    const ponto = LUGAR_DO_EFEITO[efeito];
    if (!ponto) return false;
    if (selecionado) selecionar(null);
    voarPara(ponto, 2.6);
    marcar(ponto, severidade);
    return true;
  }

  // Alerta de um servidor: marca o componente (já com a vista aberta) ou o
  // próprio servidor no rack.
  function marcarNoServidor(servidorId, componenteId, severidade) {
    const peca = componenteId && vista?.id === servidorId && vista.pecas.find((p) => p.id === componenteId);
    if (peca) {
      marcar(peca.g.getWorldPosition(new THREE.Vector3()), severidade, 0.45);
      return;
    }
    const s = servidores3d.find((x) => x.id === servidorId);
    if (s) marcar(new THREE.Vector3(rx + LARG / 2 + 0.05, s.grupo.position.y, FRENTE + 0.35), severidade, 0.35);
  }

  function animarFoco(t) {
    const resta = foco.ate - t;
    marcador.visible = resta > 0;
    if (!marcador.visible) return;
    const pulso = (t * 1.6) % 1;                     // anel que "respira" para fora
    marcador.scale.setScalar(foco.tamanho * (0.7 + pulso * 0.6));
    marcador.material.opacity = Math.min(1, resta) * (1 - pulso * 0.7);
  }

  // =====================================================================
  // ANIMAÇÃO
  // =====================================================================
  const relogio = new THREE.Clock();
  let quadro = 0;
  const vida = { viva: true };

  function animar() {
    if (!caixa.isConnected) { destruir(); return; }
    quadro = requestAnimationFrame(animar);
    const dt = Math.min(relogio.getDelta(), 0.1);
    const t = relogio.elapsedTime;
    const suave = (a, b, v) => a + (b - a) * Math.min(1, dt * v);

    if (voo) {
      voo.t = Math.min(1, voo.t + dt / 1.1);
      const e = voo.t < 0.5 ? 4 * voo.t ** 3 : 1 - (-2 * voo.t + 2) ** 3 / 2;
      controles.target.lerpVectors(voo.deAlvo, voo.paraAlvo, e);
      camera.position.copy(controles.target).add(voo.desloc);
      camera.zoom = voo.deZoom + (voo.paraZoom - voo.deZoom) * e;
      camera.updateProjectionMatrix();
      if (voo.t >= 1) voo = null;
    }

    dobradica.rotation.y = suave(dobradica.rotation.y, alvo.porta, 3);
    const s = suave(poca.scale.x, alvo.poca, alvo.agua ? 0.6 : 2);
    poca.scale.setScalar(s);
    poca.visible = s > 0.01;
    const f = (t * 0.4) % 1;
    onda.scale.setScalar(Math.max(0.01, s * (0.3 + f * 0.6)));
    onda.material.opacity = alvo.agua ? (1 - f) * 0.5 : 0;
    for (const g of gotas) {
      g.visible = alvo.agua;
      if (!g.visible) continue;
      const q = (t * 0.6 + g.userData.fase) % 1;
      g.position.set(ar.position.x + g.userData.dx, 2.3 * (1 - q * q), ar.position.z + 0.25);
    }

    const fator = alvo.emergencia ? 0.35 : 1;
    luzPrincipal.intensity = suave(luzPrincipal.intensity, 1.6 * fator, 2);
    luzCeu.intensity = suave(luzCeu.intensity, 1.8 * (alvo.emergencia ? 0.4 : 1), 2);
    luzEmergencia.intensity = alvo.emergencia ? 10 + 8 * Math.sin(t * 4) : suave(luzEmergencia.intensity, 0, 4);
    matTomada.emissiveIntensity = alvo.emergencia ? (Math.floor(t * 2) % 2 ? 2 : 0.3) : 1.2;

    // Energia no cabo e vento do ar (aparecem e somem devagar).
    const brilho = (q) => Math.sin(Math.PI * q);              // 0 nas pontas, 1 no meio
    for (const pz of pulsos) {
      const q = (t * 0.22 + pz.userData.fase) % 1;
      pz.position.copy(curvaCabo.getPointAt(q));
      pz.material.opacity = suave(pz.material.opacity, alvo.energiaOk ? 0.75 * brilho(q) : 0, 6);
      pz.visible = pz.material.opacity > 0.01;
    }
    for (const v of ventos) {
      const d = v.userData;
      d.forca = suave(d.forca, alvo.energiaOk ? 1 : 0, 1.5);
      const q = (t * d.velocidade + d.fase) % 1;              // 0 = na grade, 1 = dissolvido
      // Sai para frente e vai caindo (ar frio desce), balançando de leve.
      v.position.set(
        ar.position.x + d.x + d.deriva * q + Math.sin(t * 0.8 + d.giro) * 0.04 * q,
        ar.position.y - 0.18 - 1.1 * q * q,
        ar.position.z + 0.22 + 1.3 * q - 0.35 * q * q,
      );
      v.scale.setScalar(0.12 + q * 0.55);                     // a névoa se espalha
      // Com problema de temperatura o ar "trabalha mais": névoa mais forte.
      v.material.opacity = 0.09 * (1 + alvo.calor * 0.7) * d.forca * Math.sin(Math.PI * Math.min(1, q * 1.4)) ** 1.5;
      v.visible = v.material.opacity > 0.003;
    }

    giroflex.visible = !!alvo.giroflex;
    const grave = alvo.corGiroflex === COR.alerta;
    giroflex.rotation.y += dt * (grave ? 5 : 2.5);            // grave gira mais rápido
    luzGiroflex.color.setHex(alvo.corGiroflex);
    matGiroflex.emissive.setHex(alvo.corGiroflex);
    luzGiroflex.intensity = alvo.giroflex ? (grave ? 18 : 10) : 0;
    matGiroflex.emissiveIntensity = alvo.giroflex ? 1.5 + Math.sin(t * (grave ? 10 : 5)) : 0;

    // Calor subindo do rack
    for (const c of calor) {
      const d = c.userData;
      const q = (t * 0.25 + d.fase) % 1;
      c.position.set(rx + d.x + Math.sin(t * 1.3 + d.giro) * 0.06 * q, ra + 0.05 + q * 1.0, rz + d.z);
      c.scale.setScalar(0.18 + q * 0.5);
      c.material.color.setHex(alvo.corCalor);
      c.material.opacity = suave(c.material.opacity, alvo.calor ? 0.16 * Math.sin(Math.PI * q) : 0, 4);
      c.visible = c.material.opacity > 0.003;
    }
    // Brilho no chão da porta
    brilhoPorta.material.opacity = suave(brilhoPorta.material.opacity, alvo.portaAlarme ? 0.22 + 0.14 * Math.sin(t * 3) : 0, 4);
    brilhoPorta.visible = brilhoPorta.material.opacity > 0.003;
    // Ondas no sensor
    for (const o of ondasSensor) {
      const q = (t * 0.6 + o.userData.fase) % 1;
      o.scale.setScalar(1 + q * 2.2);
      if (alvo.sinalSensor) o.material.color.setHex(alvo.sinalSensor);
      o.material.opacity = alvo.sinalSensor ? 0.55 * (1 - q) : 0;
      o.visible = o.material.opacity > 0.003;
    }
    animarVista(t, dt);
    animarFoco(t);
    for (const pa of paredes) {
      const atras = pa.atras();
      pa.mats.opacity = suave(pa.mats.opacity, atras ? 0.12 : 1, 6);
      pa.mats.depthWrite = !atras;
      for (const m of pa.malhas) for (const c of m.children) c.visible = !atras;   // contorno some junto
    }

    // Moldura piscando no servidor com problema
    for (const sv of servidores3d) {
      sv.alarme.material.opacity = sv.temAlarme ? 0.55 + 0.45 * Math.sin(t * 4) : suave(sv.alarme.material.opacity, 0, 6);
    }

    // LEDs: switch conforme o tráfego; discos conforme a CPU; ESP32 pisca
    // rápido em alerta (igual à placa de verdade).
    const ritmo = Math.min(1, alvo.trafego / 200000) * 0.7 + 0.15;
    for (const l of ledsSwitch) l.material = Math.sin(t * 14 + l.userData.fase * 7) > 1 - ritmo * 1.5 ? matLedSwitch[0] : matLedSwitch[1];
    for (const sv of servidores3d) {
      const cpu = (sv.dados.cpu ?? 0) / 100;
      for (const d of sv.discos) d.visible = sv.dados.estado !== 'critico' && Math.sin(t * (5 + cpu * 25) + d.userData.fase * 9) > 0.5 - cpu;
      sv.moldura.material.opacity = suave(sv.moldura.material.opacity, sv.hover || selecionado === sv.id ? 1 : 0, 8);
    }
    matLedSensor.emissiveIntensity = !alvo.online ? 0 : alvo.alertaSensor ? (Math.floor(t * 8) % 2 ? 1.8 : 0.2) : 1.4;

    controles.update();
    renderer.render(cena, camera);
    etiquetas.render(cena, camera);
    afastarEtiquetas();
  }

  // Etiquetas que se cruzam na tela se afastam na vertical, só o necessário,
  // sem mudar o visual delas. Algumas vezes por segundo:
  //   1. lê a posição ORIGINAL de cada uma — a que o CSS2DRenderer grava no
  //      transform — e o tamanho (offsetWidth/Height). Nada disso muda com o
  //      deslocamento nem com a animação, então a conta não "persegue" a si
  //      mesma (era isso que fazia as etiquetas tremerem);
  //   2. de cima para baixo, empurra para baixo a que encosta numa anterior;
  //   3. tolerância (histerese): para AFASTAR basta encostar; para VOLTAR ao
  //      lugar a etiqueta precisa estar folgada. Mudanças de poucos pixels são
  //      ignoradas. Assim, etiquetas no limite não ficam pulando.
  // O deslocamento é margin-top (o CSS2DRenderer só mexe no transform).
  let quadroEtiquetas = 0;
  const POSICAO_2D = /translate\(([-\d.e]+)px,\s*([-\d.e]+)px\)/;
  function afastarEtiquetas() {
    if (++quadroEtiquetas % 5) return;
    const caixas = [];
    for (const e of etiquetas.domElement.querySelectorAll('.rotulo3d')) {
      if (e.style.display === 'none') continue;
      const m = e.style.transform.match(POSICAO_2D);
      const w = e.offsetWidth, h = e.offsetHeight;
      if (!m || !w) continue;
      caixas.push({ e, x0: +m[1] - w / 2, x1: +m[1] + w / 2, y0: +m[2] - h / 2, h });
    }
    caixas.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
    const colocadas = [];
    const cruza = (c, y, folga) => colocadas.some((o) =>
      c.x0 < o.x1 + 4 && c.x1 > o.x0 - 4 && y < o.y + o.h + folga && y + c.h > o.y - folga);
    for (const c of caixas) {
      const antes = c.e.__desloc || 0;
      let y = c.y0;
      if (antes && cruza(c, c.y0, 10) && !cruza(c, c.y0 + antes, 3)) {
        y = c.y0 + antes;                         // ainda precisa e ainda serve: fica onde está
      } else if (cruza(c, c.y0, 3)) {
        for (let voltas = 0; voltas < 12 && cruza(c, y, 3); voltas++) {
          const bloqueio = colocadas.filter((o) => c.x0 < o.x1 + 4 && c.x1 > o.x0 - 4 && y < o.y + o.h + 3 && y + c.h > o.y - 3);
          y = Math.max(...bloqueio.map((o) => o.y + o.h + 3));
        }
      }
      let d = Math.round(y - c.y0);
      if (d && antes && Math.abs(d - antes) < 6) { d = antes; y = c.y0 + antes; }   // ignora micro mudanças
      colocadas.push({ x0: c.x0, x1: c.x1, y, h: c.h });
      if (d !== antes) { c.e.__desloc = d; c.e.style.marginTop = d ? `${d}px` : ''; }
    }
  }

  function redimensionar() {
    const w = Math.max(200, caixa.clientWidth), h = Math.max(200, caixa.clientHeight);
    renderer.setSize(w, h);
    etiquetas.setSize(w, h);
    const aspecto = w / h;
    camera.top = ALTURA_VISTA / 2;
    camera.bottom = -ALTURA_VISTA / 2;
    camera.left = (-ALTURA_VISTA * aspecto) / 2;
    camera.right = (ALTURA_VISTA * aspecto) / 2;
    // Tela estreita: afasta um pouco para a sala caber.
    VISTA.zoom = aspecto < 1.5 ? 0.85 * (aspecto / 1.5) + 0.15 : 1;
    if (!voo && !selecionado) camera.zoom = VISTA.zoom;
    camera.updateProjectionMatrix();
  }
  const observador = new ResizeObserver(redimensionar);
  observador.observe(caixa);
  redimensionar();

  function destruir() {
    vida.viva = false;
    desmontarVista();
    cancelAnimationFrame(quadro);
    observador.disconnect();
    controles.dispose();
    cena.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { m.map?.dispose(); m.dispose(); });
    });
    geradas.forEach((m) => m.dispose());
    ambienteRefl.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  animar();
  return Object.assign(vida, { atualizar, selecionar, destruir, focar, marcarNoServidor });
}

// =====================================================================
// UTILITÁRIOS
// =====================================================================
function fmt(n, casas) {
  if (n === null || n === undefined) return '--';
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

function pintar(material, cor, intensidade) {
  material.color.set(cor);
  if (material.emissive) {
    material.emissive.set(cor);
    if (intensidade !== undefined) material.emissiveIntensity = intensidade;
  }
}

// Rótulo simples: ícone na cor do estado + nome + estado. Só existe para o que tem estado.
function estadoRotulo(el, online, valor, ehBom, icone, nome, textos) {
  const sem = !online || valor === null || valor === undefined;
  const bom = !sem && ehBom(valor);
  el.className = 'rotulo3d ' + (sem ? 'neutro' : bom ? 'ok' : 'alerta');
  el.innerHTML = `${icone}<span>${nome}</span><b>${sem ? 'sem leitura' : bom ? textos[0] : textos[1]}</b>`;
}

function texturaCanvas(w, h, desenhar) {
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  desenhar(canvas.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function pintarCanvas(textura, desenhar) {
  const c = textura.image.getContext('2d');
  c.clearRect(0, 0, textura.image.width, textura.image.height);
  desenhar(c, textura.image.width, textura.image.height);
  textura.needsUpdate = true;
}

// Visor LCD (nobreak e sensor). [linha1, linha2, cor]
function criarVisor(w, h) {
  const textura = texturaCanvas(w, h, (c) => { c.fillStyle = '#0e1114'; c.fillRect(0, 0, w, h); });
  let anterior = '';
  return {
    textura,
    escrever([l1, l2, cor], grande = false) {
      const chave = l1 + l2 + cor;
      if (chave === anterior) return;
      anterior = chave;
      pintarCanvas(textura, (c) => {
        c.fillStyle = '#0e1114'; c.fillRect(0, 0, w, h);
        c.fillStyle = cor; c.textBaseline = 'middle';
        c.font = `${grande ? 'bold ' : ''}${Math.round(h * (grande ? 0.42 : 0.32))}px Consolas, monospace`;
        c.fillText(l1, 10, h * (grande ? 0.34 : 0.32));
        c.font = `${Math.round(h * (grande ? 0.24 : 0.32))}px Consolas, monospace`;
        c.fillText(l2, 10, h * (grande ? 0.76 : 0.72));
      });
    },
  };
}
