/* =========================================================
   Adnan Mohammad · Portfolio · main.js
   1. Nav (auto-hide + mobile menu)
   2. Hero blueprint grid (mouse-reactive)
   3. Scroll reveals (GSAP ScrollTrigger)
   4. Statement word-by-word blur reveal
   5. Process line draw
   6. Exploded assembly (Three.js, scroll-scrubbed)
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- 1. NAV ---------------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var lastY = window.scrollY, ticking = false;

  function closeMenu() { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var down = y > lastY;
      if (down && y > 80 && !nav.classList.contains('is-open')) nav.classList.add('is-hidden');
      else if (!down) nav.classList.remove('is-hidden');
      lastY = y; ticking = false;
    });
  }, { passive: true });

  /* ---------------- 2. HERO BLUEPRINT GRID ---------------- */
  (function heroGrid() {
    var canvas = document.getElementById('heroGrid');
    var hero = document.getElementById('hero');
    var ctx = canvas.getContext('2d');
    var w, h, dpr, mouse = { x: -999, y: -999 }, smooth = { x: -999, y: -999 }, visible = true;
    var GAP = 48;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (smooth.x < -900) { smooth.x = mouse.x; smooth.y = mouse.y; }
    });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });

    function draw(t) {
      if (!visible) return requestAnimationFrame(draw);
      ctx.clearRect(0, 0, w, h);
      if (mouse.x > -900) { smooth.x += (mouse.x - smooth.x) * 0.08; smooth.y += (mouse.y - smooth.y) * 0.08; }

      // base grid
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(79,156,249,0.025)';
      ctx.beginPath();
      for (var x = (w / 2) % GAP; x < w; x += GAP) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); }
      for (var y = 0; y < h; y += GAP) { ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); }
      ctx.stroke();

      // spotlight under the cursor
      if (smooth.x > -900) {
        var g = ctx.createRadialGradient(smooth.x, smooth.y, 0, smooth.x, smooth.y, 260);
        g.addColorStop(0, 'rgba(245,166,35,0.10)');
        g.addColorStop(1, 'rgba(245,166,35,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

        ctx.save();
        ctx.beginPath(); ctx.arc(smooth.x, smooth.y, 220, 0, Math.PI * 2); ctx.clip();
        ctx.strokeStyle = 'rgba(245,166,35,0.16)';
        ctx.beginPath();
        for (x = (w / 2) % GAP; x < w; x += GAP) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); }
        for (y = 0; y < h; y += GAP) { ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); }
        ctx.stroke();
        ctx.restore();

        // crosshair coordinates, like a CAD cursor
        ctx.strokeStyle = 'rgba(245,166,35,0.35)';
        ctx.beginPath();
        ctx.moveTo(smooth.x - 10, smooth.y + .5); ctx.lineTo(smooth.x + 10, smooth.y + .5);
        ctx.moveTo(smooth.x + .5, smooth.y - 10); ctx.lineTo(smooth.x + .5, smooth.y + 10);
        ctx.stroke();
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(245,166,35,0.55)';
        ctx.fillText('X ' + (smooth.x / 10).toFixed(1) + '  Y ' + ((h - smooth.y) / 10).toFixed(1), smooth.x + 14, smooth.y - 10);
      }

      // slow scan line
      if (!reduceMotion) {
        var sy = ((t || 0) * 0.04) % (h + 200) - 100;
        var sg = ctx.createLinearGradient(0, sy - 60, 0, sy);
        sg.addColorStop(0, 'rgba(79,156,249,0)');
        sg.addColorStop(1, 'rgba(79,156,249,0.06)');
        ctx.fillStyle = sg; ctx.fillRect(0, sy - 60, w, 60);
      }
      requestAnimationFrame(draw);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(hero);
    }
    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  })();

  /* ---------------- 3. SCROLL REVEALS ---------------- */
  if (hasGSAP && !reduceMotion) {
    gsap.from('[data-hero]', { y: 30, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 });

    var reveals = gsap.utils.toArray('[data-reveal]');
    gsap.set(reveals, { opacity: 0, y: 40 });
    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', overwrite: true });
      }
    });
  }

  /* ---------------- 3b. HERO BACKGROUND PARALLAX ---------------- */
  if (hasGSAP && !reduceMotion) {
    gsap.fromTo('#heroBg', { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.2, ease: 'power2.out' });
    gsap.to('#heroBg', { yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ---------------- 4. STATEMENT BLUR REVEAL ---------------- */
  (function statement() {
    var el = document.getElementById('statementText');
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    if (!hasGSAP || reduceMotion) return;
    gsap.fromTo(el.querySelectorAll('.w'),
      { opacity: 0.12, filter: 'blur(6px)' },
      { opacity: 1, filter: 'blur(0px)', stagger: 0.05, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 1 } });
  })();

  /* ---------------- 5. PROCESS LINE ---------------- */
  if (hasGSAP) {
    var mm = gsap.matchMedia();
    var lineST = { trigger: '.process', start: 'top 75%', end: 'bottom 55%', scrub: true };
    mm.add('(min-width: 761px)', function () { gsap.fromTo('#processLine', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: lineST }); });
    mm.add('(max-width: 760px)', function () { gsap.fromTo('#processLine', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: lineST }); });
  } else {
    document.getElementById('processLine').style.transform = 'none';
  }

  /* ---------------- 6. EXPLODED ASSEMBLY ---------------- */
  (function assembly() {
    var canvas = document.getElementById('assemblyCanvas');
    var stage = document.querySelector('.assembly-stage');
    var stateEl = document.getElementById('assemblyState');
    var barEl = document.getElementById('assemblyBar');
    var bomEl = document.getElementById('bom');
    var bomRows = Array.prototype.slice.call(document.querySelectorAll('#bom tbody tr'));

    if (typeof THREE === 'undefined' || !window.WebGLRenderingContext) {
      document.getElementById('assemblyFallback').hidden = false; return;
    }
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
    catch (err) { document.getElementById('assemblyFallback').hidden = false; return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

    // ---- lighting: soft studio setup with a blue rim ----
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x0a0c14, 0.75));
    var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(5, 8, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0x4F9CF9, 0.9); rim.position.set(-6, 3, -6); scene.add(rim);
    var fill = new THREE.DirectionalLight(0xF5A623, 0.25); fill.position.set(-4, -3, 5); scene.add(fill);

    // ---- materials ----
    var M = {
      housing: new THREE.MeshStandardMaterial({ color: 0x22304b, metalness: 0.35, roughness: 0.6 }),
      steel:   new THREE.MeshStandardMaterial({ color: 0xc8cdd5, metalness: 0.9, roughness: 0.28 }),
      chrome:  new THREE.MeshStandardMaterial({ color: 0xe8ecf2, metalness: 1.0, roughness: 0.12 }),
      gold:    new THREE.MeshStandardMaterial({ color: 0xF5A623, metalness: 0.65, roughness: 0.35 }),
      dark:    new THREE.MeshStandardMaterial({ color: 0x1c212b, metalness: 0.6, roughness: 0.45 })
    };
    var edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });

    function withEdges(mesh, angle) {
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, angle || 30), edgeMat));
      return mesh;
    }
    function ring(rOut, rIn, depth, bevel) {
      var s = new THREE.Shape(); s.absarc(0, 0, rOut, 0, Math.PI * 2, false);
      var hole = new THREE.Path(); hole.absarc(0, 0, rIn, 0, Math.PI * 2, true); s.holes.push(hole);
      var b = bevel || 0.02;
      var g = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 48 });
      g.translate(0, 0, -depth / 2);
      return g;
    }
    function cylZ(r, len, seg) { var g = new THREE.CylinderGeometry(r, r, len, seg || 32); g.rotateX(Math.PI / 2); return g; }

    var model = new THREE.Group();
    scene.add(model);
    var parts = []; // { obj, dir: Vector3, order }

    function addPart(obj, dir, order) {
      obj.userData.base = obj.position.clone();
      parts.push({ obj: obj, dir: new THREE.Vector3(dir[0], dir[1], dir[2]), order: order });
      model.add(obj);
    }

    // 1  Housing (shaft axis = Z)
    (function () {
      var s = new THREE.Shape();
      s.moveTo(-2.2, -1.5); s.lineTo(2.2, -1.5); s.lineTo(2.2, -1.05); s.lineTo(1.3, -1.05);
      s.lineTo(1.3, 0); s.absarc(0, 0, 1.3, 0, Math.PI, false); s.lineTo(-1.3, -1.05);
      s.lineTo(-2.2, -1.05); s.lineTo(-2.2, -1.5);
      var hole = new THREE.Path(); hole.absarc(0, 0, 0.85, 0, Math.PI * 2, true); s.holes.push(hole);
      var g = new THREE.ExtrudeGeometry(s, { depth: 1.6, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2, curveSegments: 48 });
      g.translate(0, 0, -0.8);
      addPart(withEdges(new THREE.Mesh(g, M.housing)), [0, 0, 0], 0);
    })();

    // 2  Shaft
    addPart(withEdges(new THREE.Mesh(cylZ(0.3, 5.2, 40), M.steel), 50), [0, 0, -5.2], 8);

    // 3  Outer race
    addPart(withEdges(new THREE.Mesh(ring(0.85, 0.62, 0.7), M.chrome), 50), [0, 0, 2.0], 1);

    // 4  Ball set
    (function () {
      var g = new THREE.Group(), sg = new THREE.SphereGeometry(0.11, 24, 16);
      for (var i = 0; i < 10; i++) {
        var a = i / 10 * Math.PI * 2, b = new THREE.Mesh(sg, M.chrome);
        b.position.set(Math.cos(a) * 0.51, Math.sin(a) * 0.51, 0); g.add(b);
      }
      addPart(g, [0, 0, 3.0], 2);
    })();

    // 5  Inner race
    addPart(withEdges(new THREE.Mesh(ring(0.40, 0.30, 0.7), M.steel), 50), [0, 0, 4.0], 3);

    // 6  Front end cap
    (function () {
      var m = withEdges(new THREE.Mesh(ring(1.15, 0.42, 0.14, 0.03), M.gold), 50);
      m.position.z = 0.93; addPart(m, [0, 0, 5.1], 4);
    })();

    // 7  Rear end cap
    (function () {
      var m = withEdges(new THREE.Mesh(ring(1.15, 0.42, 0.14, 0.03), M.gold), 50);
      m.position.z = -0.93; addPart(m, [0, 0, -2.1], 5);
    })();

    // 8  Socket head cap screws (x4) on the front cap
    (function () {
      var g = new THREE.Group();
      var shank = cylZ(0.055, 0.5, 16), head = cylZ(0.11, 0.11, 24);
      for (var i = 0; i < 4; i++) {
        var a = Math.PI / 4 + i * Math.PI / 2, x = Math.cos(a) * 0.8, y = Math.sin(a) * 0.8;
        var sm = new THREE.Mesh(shank, M.dark); sm.position.set(x, y, 0.78);
        var hm = new THREE.Mesh(head, M.dark); hm.position.set(x, y, 1.06);
        g.add(sm, hm);
      }
      addPart(g, [0, 0, 6.2], 6);
    })();

    // 9  Hex mounting bolts (x2) through the feet
    (function () {
      var g = new THREE.Group();
      var shank = new THREE.CylinderGeometry(0.11, 0.11, 1.0, 16);
      var head = new THREE.CylinderGeometry(0.21, 0.21, 0.15, 6);
      [-1.75, 1.75].forEach(function (x) {
        var s = new THREE.Mesh(shank, M.dark); s.position.set(x, -1.45, 0);
        var h = withEdges(new THREE.Mesh(head, M.dark), 30); h.position.set(x, -0.92, 0);
        g.add(s, h);
      });
      addPart(g, [0, 2.6, 0], 7);
    })();

    // BOM row order matches HTML: housing, shaft, outer, balls, inner, front cap, rear cap, screws, bolts
    var bomIndexOfPart = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    // ---- sizing / camera framing ----
    var target = new THREE.Vector3(), aspect = 1, mobile = false, spread = 1;
    var T = Math.tan(THREE.MathUtils.degToRad(35 / 2));
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix();
      mobile = w < 761;
      spread = mobile ? 0.55 : 0.9;
      target.set(mobile ? 0 : -1.5, mobile ? -0.2 : -0.1, 0);
      render();
    }

    // ---- explode state ----
    var progress = 0, mouseX = 0, mouseSX = 0;
    function smoothstep(x) { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); }
    function explodeAmount(p) {           // 0→1 explode, hold, 1→0 implode
      if (p < 0.42) return smoothstep(p / 0.42);
      if (p < 0.58) return 1;
      return 1 - smoothstep((p - 0.58) / 0.42);
    }

    function render() {
      var e = explodeAmount(progress);
      var maxOrder = 8, lastActive = -1;
      parts.forEach(function (pt, i) {
        var local = smoothstep(e * 1.4 - pt.order * 0.05);
        pt.obj.position.copy(pt.obj.userData.base).addScaledVector(pt.dir, local * spread);
        var row = bomRows[bomIndexOfPart[i]];
        if (row) {
          var on = i === 0 ? e > 0.02 : local > 0.5;
          row.classList.toggle('is-active', on);
          if (on && pt.order >= (lastActive < 0 ? -1 : parts[lastActive].order)) lastActive = i;
        }
      });
      bomRows.forEach(function (r, i) { r.classList.toggle('is-current', i === bomIndexOfPart[lastActive]); });
      bomEl.classList.toggle('is-empty', lastActive < 0);

      // turntable: 3/4 view assembled → more side-on when exploded
      mouseSX += (mouseX - mouseSX) * 0.06;
      model.rotation.y = 0.62 + e * 0.42 + mouseSX * 0.15;
      model.rotation.x = 0.08;

      // camera pulls back as parts spread out
      var halfA = mobile ? 2.7 : 3.1, halfE = mobile ? 5.4 : 8.6;
      var half = halfA + (halfE - halfA) * e;
      var dist = Math.max(half / (T * aspect), (mobile ? 2.4 : 3.0) / T);
      var look = target.clone();
      if (!mobile) look.x += e * 1.9;          // re-center as the exploded view grows
      camera.position.set(look.x + dist * 0.02, look.y + dist * 0.2, dist);
      camera.lookAt(look);
      renderer.render(scene, camera);

      // UI
      barEl.style.width = (progress * 100).toFixed(1) + '%';
      stateEl.textContent = e < 0.03 ? 'Assembled' : e > 0.97 ? 'Exploded view · 9 items' : (progress < 0.5 ? 'Exploding…' : 'Reassembling…');
    }

    // ---- render loop only while on screen ----
    var running = false;
    function loop() { if (!running) return; render(); requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var v = en[0].isIntersecting;
        if (v && !running) { running = true; requestAnimationFrame(loop); }
        running = v;
      }).observe(stage);
    } else { running = true; requestAnimationFrame(loop); }

    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      mouseX = (e.clientX - r.left) / r.width * 2 - 1;
    });

    // ---- scroll control: pin the stage and scrub progress ----
    if (hasGSAP) {
      ScrollTrigger.create({
        trigger: '.assembly',
        start: 'top top',
        end: '+=280%',
        pin: '.assembly-stage',
        scrub: true,
        onUpdate: function (self) { progress = self.progress; }
      });
    } else {
      progress = 0.5; // no scroll library: show it exploded
    }

    resize();
    window.addEventListener('resize', resize);
  })();

})();
