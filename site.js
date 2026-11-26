/* Korza — site institucional. */
/* Korza torus — cena KorzaTorus do admin reescrita em WebGL puro (sem three.js).
   Mesma geometria (46 pétalas em anel, raio 1.5), mesmo movimento e luz de ambiente azul/branca.
   Uso: KorzaTorus.mount(canvas, {distance, reducedMotion}) */
(function (root) {
  function petal() {
    var e = 0.075, prof = [], n, r, SEG = 64;
    for (n = 0; n <= 20; n++) { r = n / 20; prof.push([r * 0.985, e * (1 - r * r) + 0.001]); }
    prof.push([1, -0.042 * 0.4]);
    for (n = 20; n >= 0; n--) { r = n / 20; prof.push([r * 0.985, e * (1 - r * r) - 0.042]); }
    var P = prof.length, pos = [], nor = [], idx = [], i, j;
    for (j = 0; j <= SEG; j++) {
      var a = j / SEG * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
      for (i = 0; i < P; i++) {
        pos.push(prof[i][0] * s, prof[i][1], prof[i][0] * c);
        // normal do perfil: perpendicular à tangente
        var p0 = prof[Math.max(0, i - 1)], p1 = prof[Math.min(P - 1, i + 1)];
        var tx = p1[0] - p0[0], ty = p1[1] - p0[1], nx = ty, ny = -tx, l = Math.hypot(nx, ny) || 1;
        nx /= l; ny /= l;
        nor.push(nx * s, ny, nx * c);
      }
    }
    for (j = 0; j < SEG; j++) for (i = 0; i < P - 1; i++) {
      var A = j * P + i, B = (j + 1) * P + i;
      idx.push(A, B, A + 1, B, B + 1, A + 1);
    }
    return { pos: new Float32Array(pos), nor: new Float32Array(nor), idx: new Uint16Array(idx) };
  }
  // ---- matemática 4x4 (coluna-maior)
  function mul(a, b) { var o = new Float32Array(16), i, j, k; for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) { var s = 0; for (k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  function fromQ(q, p, sc) {
    var x = q[0], y = q[1], z = q[2], w = q[3], m = new Float32Array(16);
    m[0] = (1 - 2 * (y * y + z * z)) * sc[0]; m[1] = (2 * (x * y + w * z)) * sc[0]; m[2] = (2 * (x * z - w * y)) * sc[0];
    m[4] = (2 * (x * y - w * z)) * sc[1]; m[5] = (1 - 2 * (x * x + z * z)) * sc[1]; m[6] = (2 * (y * z + w * x)) * sc[1];
    m[8] = (2 * (x * z + w * y)) * sc[2]; m[9] = (2 * (y * z - w * x)) * sc[2]; m[10] = (1 - 2 * (x * x + y * y)) * sc[2];
    m[12] = p[0]; m[13] = p[1]; m[14] = p[2]; m[15] = 1; return m;
  }
  function qmul(a, b) { return [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]; }
  function qAxis(ax, an) { var s = Math.sin(an / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(an / 2)]; }
  function qUnit(f, t) { // de f para t (unitários)
    var d = f[0] * t[0] + f[1] * t[1] + f[2] * t[2] + 1, q;
    if (d < 1e-6) q = [0, 0, 1, 0]; else q = [f[1] * t[2] - f[2] * t[1], f[2] * t[0] - f[0] * t[2], f[0] * t[1] - f[1] * t[0], d];
    var l = Math.hypot(q[0], q[1], q[2], q[3]); return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
  }
  function qEuler(x, y, z) { // ordem XYZ, como o three
    var c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2), s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
    return [s1 * c2 * c3 + c1 * s2 * s3, c1 * s2 * c3 - s1 * c2 * s3, c1 * c2 * s3 + s1 * s2 * c3, c1 * c2 * c3 - s1 * s2 * s3];
  }
  var VS = 'attribute vec3 p;attribute vec3 n;uniform mat4 M;uniform mat4 VP;varying vec3 vN;varying vec3 vW;' +
    'void main(){vec4 w=M*vec4(p,1.);vW=w.xyz;vN=mat3(M)*n;gl_Position=VP*w;}';
  var FS = 'precision highp float;varying vec3 vN;varying vec3 vW;uniform vec3 cam;' +
    'vec3 lobe(vec3 r,vec3 d,float k,vec3 c,float w){return c*k*smoothstep(1.-w,1.,dot(r,normalize(d)));}' +
    'vec3 env(vec3 r,float w){vec3 W=vec3(1.7),B=vec3(.0075,.107,.97)*1.1,D=vec3(.0006,.002,.008);' +
    'vec3 c=r.y>0.?mix(B,W,pow(r.y,.8)):mix(B,D,min(1.,-r.y*1.6));' +
    'c+=lobe(r,vec3(.5,5.,2.5),9.,vec3(1.),.06*w)+lobe(r,vec3(-5.,.5,2.),5.,vec3(1.),.05*w)+lobe(r,vec3(5.,1.,3.5),3.5,vec3(.71,.79,1.),.12*w)' +
    '+lobe(r,vec3(4.5,-1.,-3.),2.2,vec3(.16,.35,1.),.12*w)+lobe(r,vec3(0.,-5.,0.),2.5,vec3(.0075,.107,.97),.15*w);return c;}' +
    'vec3 aces(vec3 x){x*=.85;return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}' +
    'void main(){vec3 N=normalize(vN);vec3 V=normalize(cam-vW);if(dot(N,V)<0.)N=-N;vec3 R=reflect(-V,N);' +
    'float nv=max(dot(N,V),0.);vec3 base=vec3(.044,.15,1.);' +
    'vec3 metal=base*env(R,2.2)*1.2;float F=.04+.96*pow(1.-nv,5.);vec3 coat=env(R,1.)*F*1.2;' +
    'vec3 col=aces(metal*(1.-F)+coat);gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.);}';
  function sh(gl, t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

  function mount(canvas, o) {
    o = o || {};
    var gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return null;
    var pr = gl.createProgram();
    try { gl.attachShader(pr, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl, gl.FRAGMENT_SHADER, FS)); } catch (e) { return null; }
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var g = petal();
    function buf(t, d) { var b = gl.createBuffer(); gl.bindBuffer(t, b); gl.bufferData(t, d, gl.STATIC_DRAW); return b; }
    buf(gl.ARRAY_BUFFER, g.pos); var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 3, gl.FLOAT, false, 0, 0);
    buf(gl.ARRAY_BUFFER, g.nor); var ln = gl.getAttribLocation(pr, 'n'); gl.enableVertexAttribArray(ln); gl.vertexAttribPointer(ln, 3, gl.FLOAT, false, 0, 0);
    buf(gl.ELEMENT_ARRAY_BUFFER, g.idx);
    var uM = gl.getUniformLocation(pr, 'M'), uVP = gl.getUniformLocation(pr, 'VP'), uC = gl.getUniformLocation(pr, 'cam');
    gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
    var dist = o.distance || 20, N = 46, R = 1.5, K = 0.9, spin = 0, calm = !!o.reducedMotion, raf = 0;
    var w = { x: 0, y: 0, tx: 0, ty: 0 }, last = performance.now(), t0 = last, aspect = 1;
    gl.uniform3f(uC, 0, 0, dist);
    function size() {
      var dpr = Math.min(root.devicePixelRatio || 1, 2), cw = canvas.clientWidth, ch = canvas.clientHeight;
      if (!cw || !ch) return; canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height); aspect = cw / ch;
    }
    function draw(t) {
      var f = 1 / Math.tan(15 * Math.PI / 180), near = 0.1, far = 100;
      var P = new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
      var Vw = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -dist, 1]);
      gl.uniformMatrix4fv(uVP, false, mul(P, Vw));
      w.x += (w.tx - w.x) * 0.05; w.y += (w.ty - w.y) * 0.05;
      var G = fromQ(qEuler(-0.95 + Math.sin(t * 0.31) * 0.08 + w.y * 0.22, 0.62 + Math.sin(t * 0.23) * 0.1 + w.x * 0.3, -0.35 + t * 0.04), [0, 0, 0], [1, 1, 1]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (var i = 0; i < N; i++) {
        var ang = i / N * Math.PI * 2 + spin, a = Math.cos(ang), s = Math.sin(ang);
        var q = qUnit([0, 1, 0], [-s, a, 0]);
        q = qmul(qAxis([a, s, 0], Math.sin(ang * 2 - t * 1.3) * 0.1), q);
        var c = K * (1 + 0.06 * Math.sin(ang * 3 + t * 0.9));
        gl.uniformMatrix4fv(uM, false, mul(G, fromQ(q, [R * a, R * s, 0], [c, 1, c])));
        gl.drawElements(gl.TRIANGLES, g.idx.length, gl.UNSIGNED_SHORT, 0);
      }
    }
    var ro = new ResizeObserver(function () { size(); if (calm) draw(2); }); ro.observe(canvas); size();
    function frame(now) { var dt = Math.min((now - last) / 1000, 0.05); last = now; spin += dt * 0.09; draw((now - t0) / 1000); raf = requestAnimationFrame(frame); }
    if (calm) draw(2); else raf = requestAnimationFrame(frame);
    return { setPointer: function (x, y) { w.tx = x; w.ty = y; }, destroy: function () { cancelAnimationFrame(raf); ro.disconnect(); } };
  }
  root.KorzaTorus = { mount: mount };
})(typeof window !== 'undefined' ? window : this);

function kTorusBoot(root) {
  var cv = root.querySelector('canvas.k-torus'); if (!cv) return;
  if (window.matchMedia && window.matchMedia('(max-width:760px)').matches) return;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go() {
    if (!window.KorzaTorus) return;
    var h = window.KorzaTorus.mount(cv, { distance: 12.5, reducedMotion: calm });
    if (!h) return;
    cv.parentNode.setAttribute('data-torus', '1');
    var hero = cv.closest('.k-hero') || root;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      h.setPointer(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    }, { passive: true });
  }
  go();
}

function kCasesBoot(root) {
  var tr = root.querySelector('.k-cs'); if (!tr || tr._k) return; tr._k = 1;
  var prev = root.querySelector('[data-cs="prev"]'), next = root.querySelector('[data-cs="next"]'), bar = root.querySelector('[data-csbar]');
  function step() { var c = tr.querySelector('.k-csc'); return c ? c.getBoundingClientRect().width + 20 : 400; }
  function upd() {
    var max = tr.scrollWidth - tr.clientWidth;
    if (prev) prev.disabled = tr.scrollLeft < 4;
    if (next) next.disabled = tr.scrollLeft > max - 4;
    if (bar) { var f = tr.clientWidth / tr.scrollWidth; bar.style.width = (f * 100) + '%'; bar.style.transform = 'translateX(' + (max > 0 ? tr.scrollLeft / max * (1 / f - 1) * 100 : 0) + '%)'; }
  }
  if (prev) prev.addEventListener('click', function () { tr.scrollBy({ left: -step(), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', function () { tr.scrollBy({ left: step(), behavior: 'smooth' }); });
  tr.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
}

(function () {
  var page = document.querySelector('[data-kroot]');
  if (!page) return;
  kTorusBoot(page);
  kCasesBoot(page);
    // perguntas e respostas
    var buttons = Array.prototype.slice.call(page.querySelectorAll('button[data-faq]'));
    function setOpen(btn, open) {
      var body = btn.parentNode.querySelector('[data-faq-body]');
      var mark = btn.lastElementChild;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (body) body.hidden = !open;
      if (mark) { mark.textContent = open ? '–' : '+'; mark.style.background = open ? '#15191E' : 'transparent'; mark.style.color = open ? '#FFFFFF' : '#15191E'; }
    }
    buttons.forEach(function (btn, idx) {
      setOpen(btn, idx === 0);
      btn.addEventListener('click', function () {
        var was = btn.getAttribute('aria-expanded') === 'true';
        buttons.forEach(function (b) { setOpen(b, false); });
        setOpen(btn, !was);
      });
    });

    // âncoras do menu
    page.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) { ev.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });

    // entrada ao rolar + números que contam
    var root = page;

var prog = root.querySelector('[data-prog]');
if (prog) {
var onScroll = function () {
var h = document.documentElement.scrollHeight - window.innerHeight;
prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll, { passive: true });
onScroll();
}
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || !('IntersectionObserver' in window)) return;
    page.classList.add('k-js');
    function count(n) {
      var to = parseFloat(n.getAttribute('data-count'));
      var dec = parseInt(n.getAttribute('data-dec') || '0', 10);
      var th = n.getAttribute('data-th') === '1';
      function fmt(v) { var t = v.toFixed(dec).replace('.', ','); return th ? t.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : t; }
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, ((now || t0) - t0) / 1800), e = 1 - Math.pow(1 - k, 4);
        n.textContent = fmt(to * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    }
    function show(el) {
      if (el.classList.contains('k-in')) return;
      el.classList.add('k-in');
      Array.prototype.forEach.call(el.querySelectorAll('[data-count]'), count);
    }
    var items = Array.prototype.slice.call(page.querySelectorAll('[data-rv]'));
    var heard = false;
    var io = new IntersectionObserver(function (entries) {
      heard = true;
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!heard) items.forEach(show); }, 1500);
})();

// Rastreio dos cliques em "Criar conta" e repasse da origem (UTMs, gclid, fbclid) ao cadastro — igual ao site anterior.
const signupLinks = 'a[href^="https://admin.korza.app/create-account"]';
document.addEventListener('click', event => {
  const link = event.target.closest(signupLinks);
  if (!link || typeof gtag !== 'function') return;
  const place = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : link.closest('section[id], dialog[id]')?.id || 'outro';
  gtag('event', 'cta_click', {cta_text: link.textContent.trim(), cta_location: place});
});

// Repassa a origem da visita (UTMs e cliques de anúncio) para o cadastro em admin.korza.app, que a guarda na conta.
// Guarda na primeira página da visita, porque a pessoa pode navegar antes de clicar no CTA. A URL atual tem prioridade.
const originParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
const originKey = 'korza_origin';
function readOrigin() {
  let stored = {};
  try { stored = JSON.parse(sessionStorage.getItem(originKey) || '{}'); } catch {}
  const current = new URLSearchParams(location.search);
  const fromUrl = {};
  originParams.forEach(key => { const value = current.get(key); if (value) fromUrl[key] = value; });
  return Object.keys(fromUrl).length ? fromUrl : stored;
}
try {
  const origin = readOrigin();
  if (Object.keys(origin).length) sessionStorage.setItem(originKey, JSON.stringify(origin));
} catch {}

// O cookie _fbc do Pixel não atravessa para admin.korza.app; sem fbclid na origem, usa o clique guardado nele.
function cookieClickId() {
  const fbc = document.cookie.match(/(?:^|; )_fbc=fb\.\d+\.\d+\.([^;]+)/);
  return fbc ? decodeURIComponent(fbc[1]) : null;
}
document.addEventListener('click', event => {
  const link = event.target.closest(signupLinks);
  if (!link) return;
  const origin = readOrigin();
  if (!origin.fbclid) { const id = cookieClickId(); if (id) origin.fbclid = id; }
  if (!Object.keys(origin).length) return;
  const url = new URL(link.href);
  Object.entries(origin).forEach(([key, value]) => url.searchParams.set(key, value));
  link.href = url;
});
