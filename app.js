'use strict';
const menu = document.querySelector('#navigation');
const menuButton = document.querySelector('.menu-toggle');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.classList.toggle('open', open);
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); menuButton.focus(); }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

const brands = {
  loum: {name:'Loum', x:-550, y:-220, alt: 'Aplicativo Loum com a identidade visual da marca'},
  hiven: {name:'Hiven', x:-440, y:-110, alt: 'Aplicativo Hiven com a identidade visual da marca'},
  belletonn: {name:'Belletonn', x:-110, y:-220, alt: 'Aplicativo Belletonn com a identidade visual da marca'}
};
const brandImage = document.querySelector('#brand-preview');
document.querySelectorAll('[data-brand]').forEach(button => button.addEventListener('click', () => {
  const brand = brands[button.dataset.brand];
  const mockup = ext => `assets/${button.dataset.brand}-mockup-480.${ext} 480w, assets/${button.dataset.brand}-mockup-800.${ext} 800w`;
  brandImage.parentElement.querySelectorAll('source').forEach(source => { source.srcset = mockup(source.type.split('/')[1]); });
  brandImage.src = `assets/${button.dataset.brand}-mockup-800.webp`;
  brandImage.alt = brand.alt;
  const brandIcon = document.querySelector('#brand-icon');
  brandIcon.style.left = brand.x + '%';
  brandIcon.style.top = brand.y + '%';
  brandIcon.alt = 'Ícone do app ' + brand.name;
  document.querySelector('#brand-icon-name').textContent = brand.name;
  document.querySelectorAll('[data-brand]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('.app-card').dataset.selectedBrand = button.dataset.brand;
}));

const details = {
  push: {title:'Bons motivos para voltar.', description:'Escreva, escolha o destino e agende. Depois, acompanhe o resultado no painel.', note:'Os pushs são recebidos por clientes que autorizaram as notificações no aplicativo.'},
  integrations: {title:'Sua loja. Seu próximo app.', description:'Conecte sua Nuvemshop ou Shopify. A gente organiza com você o caminho até o app.', note:'A publicação considera as etapas de análise das lojas de aplicativos.'},
  analytics: {title:'Entenda o que acontece no seu app.', description:'O dashboard reúne vendas, recompras, desempenho das campanhas e evolução da base de clientes. Use essa visão para acompanhar o canal e orientar suas próximas ações.', note:'Métricas ilustrativas para mostrar a experiência do painel.'},
  loum: {label:'Case Korza · Loum',title:'42% dos pedidos vieram de quem já conhecia a loja.',description:'No case Loum, 42% dos pedidos feitos dentro do aplicativo vieram de clientes que já haviam comprado na loja. O resultado mostra o papel do app na continuidade da relação com a marca.',note:'Resultado específico apresentado pela Korza. O desempenho varia entre operações.'},
  belletonn: {label:'Case Korza · Belletonn',title:'26,6% de conversão após a abertura do push.',description:'No case Belletonn, a conversão média de push não segmentado foi de 26,6%: entre os clientes que abriram a notificação, essa parcela realizou uma compra.',note:'Resultado específico apresentado pela Korza. O desempenho varia entre operações.'},
  hiven: {label:'App Korza · Hiven',title:'A Hiven na tela do cliente.',description:'Um aplicativo com a identidade da Hiven para aproximar a marca dos clientes e levar a experiência da loja ao celular.',note:'Imagem ilustrativa do aplicativo da marca.'},
  pe: {label:'Case Korza · Pé de Algodão',title:'+4,98% de faturamento com vendas a partir de pushs.',description:'No case Pé de Algodão, as vendas a partir de notificações push geraram um aumento de 4,98% no faturamento da loja, mostrando a contribuição do canal para a operação.',note:'Resultado específico apresentado pela Korza. O desempenho varia entre operações.'}
};
const dialog = document.querySelector('#feature-dialog');
let dialogOpener;
document.querySelectorAll('[data-feature], [data-case]').forEach(trigger => trigger.addEventListener('click', event => {
  event.preventDefault();
  dialogOpener = trigger;
  const detail = details[trigger.dataset.feature || trigger.dataset.case];
  document.querySelector('#dialog-label').textContent = detail.label || 'Conheça a plataforma';
  document.querySelector('#dialog-title').textContent = detail.title;
  document.querySelector('#dialog-description').textContent = detail.description;
  document.querySelector('#dialog-note').textContent = detail.note;
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
});
dialog.addEventListener('close', () => dialogOpener?.focus());

// Content is visible without JavaScript; movement never controls visibility.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
    if (entry.isIntersecting && entry.target.classList.contains('reveal')) { entry.target.classList.add('arrived'); }
  }), {threshold: 0.08});
  document.querySelectorAll('.motion-scene, .reveal').forEach(element => observer.observe(element));
  document.body.classList.add('motion-enabled');
}
document.querySelector('#year').textContent = new Date().getFullYear();

// Shared motion control: all visible loops pause together.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pushScene = document.querySelector('.push-art');
const pushStack = document.querySelector('.push-device .push-stack');
let userPaused = false;
let pushVisible = false;
let pushTimer;
let pushWelcomeTimer;
let nextPush = 0;
const pushExamples = [
  {brand:'LOUM', x:-550, y:-220, title:'Seu novo favorito chegou 🤎', text:'A coleção nova já está no app.'},
  {brand:'ONUH', x:-110, y:-440, title:'Seu pedido está a caminho', text:'A ansiedade é sua. O cuidado é nosso.'},
  {brand:'GREEN IS GOOD', x:-220, y:0, title:'Uma pausa para se cuidar 🌿', text:'Seus favoritos estão por aqui.'},
  {brand:'HIVEN', x:-440, y:-110, title:'Olha quem voltou ao estoque', text:'A peça que você queria. No seu tamanho.'},
  {brand:'DONA RICA', x:-220, y:-330, title:'Tem novidade no seu estilo', text:'Sua próxima escolha está no app.'},
  {brand:'LOUM', x:-550, y:-220, title:'Seu carrinho sentiu saudade', text:'Seu próximo look ficou te esperando.'}
];
function addPush() {
  const messages = [...pushStack.children];
  const incoming = messages[0].cloneNode(true);
  const example = pushExamples[nextPush++ % pushExamples.length];
  incoming.className = 'push-message push-enter';
  incoming.style.setProperty('--slot', '0');
  incoming.querySelector('strong').textContent = example.title;
  incoming.querySelector('p').textContent = example.text;
  const label = incoming.querySelector('small');
  label.firstChild.textContent = example.brand + ' ';
  label.querySelector('span').textContent = 'agora';
  incoming.querySelector('img').style.left = example.x + '%';
  incoming.querySelector('img').style.top = example.y + '%';
  messages.forEach((message, i) => {
    message.style.setProperty('--slot', String(i + 1));
    message.querySelector('small>span').textContent = i === 0 ? 'há 1 min' : 'há 3 min';
  });
  const outgoing = messages[messages.length - 1];
  outgoing.classList.add('push-leave');
  pushStack.prepend(incoming);
  requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.remove('push-enter')));
  window.setTimeout(() => outgoing.remove(), 750);
}
function updateMotion() {
  const stopped = userPaused || reducedMotion.matches || document.hidden;
  document.body.classList.toggle('animations-paused', stopped);
  clearInterval(pushTimer);
  clearTimeout(pushWelcomeTimer);
  if (!stopped && pushVisible) {
    pushWelcomeTimer = setTimeout(addPush, 1000);
    pushTimer = setInterval(addPush, 3600);
  }
}
reducedMotion.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', updateMotion);
if ('IntersectionObserver' in window) {
  const mediaObserver = new IntersectionObserver(entries => {
    pushVisible = entries[0].isIntersecting;
    updateMotion();
  }, {threshold: .2});
  mediaObserver.observe(pushScene);
}
updateMotion();

// Targets count up once; they remain explicitly labelled as goals, not achieved results.
const goalSection = document.querySelector('.goal-grid');
if ('IntersectionObserver' in window) {
  const goalObserver = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    goalObserver.disconnect();
    if (reducedMotion.matches || userPaused) return;
    const counters = [...goalSection.querySelectorAll('[data-goal-count]')];
    const start = performance.now();
    function tick(now) {
      const progress = reducedMotion.matches || userPaused ? 1 : Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(node => { node.textContent = Math.round(Number(node.dataset.goalCount) * eased); });
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, {threshold: .3});
  goalObserver.observe(goalSection);
}

// Horizontal case studies: automatic progression, with manual controls and touch scrolling.
const storyRail = document.querySelector('.story-carousel');
const storyCards = [...document.querySelectorAll('.story-card')];
const storyDots = [...document.querySelectorAll('[data-story]')];
let storyIndex = 0;
let storyVisible = false;
let storyManual = false;
function showStory(index, manual = false) {
  storyManual = storyManual || manual;
  storyIndex = (index + storyCards.length) % storyCards.length;
  storyRail.scrollTo({left:storyCards[storyIndex].offsetLeft - storyCards[0].offsetLeft, behavior:reducedMotion.matches ? 'instant' : 'smooth'});
}
document.querySelector('.story-prev').addEventListener('click', () => showStory(storyIndex - 1, true));
document.querySelector('.story-next').addEventListener('click', () => showStory(storyIndex + 1, true));
storyDots.forEach(dot => dot.addEventListener('click', () => showStory(Number(dot.dataset.story), true)));
storyRail.addEventListener('pointerdown', () => { storyManual = true; });
storyRail.addEventListener('wheel', () => { storyManual = true; }, {passive:true});
storyRail.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); showStory(storyIndex + (event.key === 'ArrowRight' ? 1 : -1), true); }
});
storyRail.addEventListener('scroll', () => {
  const firstLeft = storyCards[0].offsetLeft;
  storyIndex = storyCards.reduce((best, card, index) => Math.abs(card.offsetLeft - firstLeft - storyRail.scrollLeft) < Math.abs(storyCards[best].offsetLeft - firstLeft - storyRail.scrollLeft) ? index : best, 0);
  storyDots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === storyIndex)));
}, {passive:true});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {storyVisible = entries[0].isIntersecting;}, {threshold:.4});
  observer.observe(storyRail);
}
setInterval(() => {
  if (storyVisible && !storyManual && !reducedMotion.matches && !document.hidden && !storyRail.matches(':hover') && !storyRail.contains(document.activeElement)) showStory(storyIndex + 1);
}, 6500);

// Illustrative push revenue: simulated purchases, never live customer data.
const pushRevenueCard = document.querySelector('.push-revenue-metric');
const pushRevenueTotal = document.querySelector('#push-revenue-total');
const pushOrderValue = document.querySelector('#push-order-value');
const pushSale = document.querySelector('.push-sale');
let revenueVisible = false;
let revenueStep = 0;
let revenueValue = 12480;
let revenueTimer;
let revenueFrame;
const demoOrders = [190, 250, 150, 320];
const currencyNumber = value => value.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
function animateRevenue() {
  const order = demoOrders[revenueStep % demoOrders.length];
  const from = revenueStep % demoOrders.length === 0 ? 12480 : revenueValue;
  const to = from + order;
  revenueStep++;
  revenueValue = to;
  pushOrderValue.textContent = '+ R$ ' + currencyNumber(order);
  pushSale.classList.remove('sale-arrives');
  void pushSale.offsetWidth;
  pushSale.classList.add('sale-arrives');
  const start = performance.now();
  function draw(now) {
    const progress = Math.min((now - start) / 1100, 1);
    pushRevenueTotal.textContent = currencyNumber(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) revenueFrame = requestAnimationFrame(draw);
  }
  cancelAnimationFrame(revenueFrame);
  revenueFrame = requestAnimationFrame(draw);
}
function syncRevenue() {
  clearInterval(revenueTimer);
  cancelAnimationFrame(revenueFrame);
  pushRevenueTotal.textContent = currencyNumber(revenueValue);
  if (revenueVisible && !reducedMotion.matches && !document.hidden) revenueTimer = setInterval(animateRevenue, 3500);
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {revenueVisible = entries[0].isIntersecting; syncRevenue();}, {threshold:.25});
  observer.observe(pushRevenueCard);
}
reducedMotion.addEventListener('change', syncRevenue);
document.addEventListener('visibilitychange', syncRevenue);
