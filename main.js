import './style.css';

/* HyperAION LP — Premium Interactions v2 */

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initScrollReveal();
  initNav();
  initSmoothScroll();
  initTerminalDemo();
  initFormSubmit();
  initLangToggle();
  initAnalytics();
});

/* ===== NEURAL NETWORK CANVAS ===== */
function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  let mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 90;
  const CONNECTION_DIST = 160;
  const MOUSE_RADIUS = 200;
  const particles = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * (w / devicePixelRatio);
      this.y = Math.random() * (h / devicePixelRatio);
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 2 + 1;
      const colors = ['124,77,255', '0,229,255', '179,136,255'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      const cw = w / devicePixelRatio;
      const ch = h / devicePixelRatio;
      if (this.x < 0) this.x = cw;
      if (this.x > cw) this.x = 0;
      if (this.y < 0) this.y = ch;
      if (this.y > ch) this.y = 0;

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (1 - dist / MOUSE_RADIUS) * 0.02;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      this.vx *= 0.99;
      this.vy *= 0.99;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,77,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, w / devicePixelRatio, h / devicePixelRatio);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener('resize', () => {
    resize();
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  });

  animate();
}

/* ===== TERMINAL DEMO ANIMATION ===== */
function initTerminalDemo() {
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = body.querySelectorAll('.terminal-line');
  let started = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        lines.forEach((line, i) => {
          const delay = parseInt(line.dataset.delay || '0', 10);
          setTimeout(() => line.classList.add('visible'), delay);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(body);
}

/* ===== SCROLL REVEAL ===== */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-anim]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const parent = entry.target.parentElement;
        const siblings = parent ? [...parent.querySelectorAll('[data-anim]')] : [];
        const index = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('in'), index * 120);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ===== NAV ===== */
function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });

  hamburger.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    const isOpen = links.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
    spans[1].style.opacity = isOpen ? '0' : '';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
}

/* ===== SMOOTH SCROLL ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      const el = document.querySelector(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ===== FORM SUBMIT ===== */
function initFormSubmit() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const originalText = btn.textContent;
    const isEn = document.documentElement.lang === 'en';

    btn.textContent = isEn ? 'Sending...' : '送信中...';
    btn.disabled = true;

    try {
      const data = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        btn.textContent = isEn ? '✓ Sent!' : '✓ 送信完了';
        btn.style.background = 'linear-gradient(135deg, #28C840, #1a8a2c)';
        form.reset();
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      } else {
        throw new Error('Submit failed');
      }
    } catch (err) {
      btn.textContent = isEn ? 'Failed to send' : '送信に失敗しました';
      btn.style.background = 'linear-gradient(135deg, #FF5F57, #cc3a33)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }
  });
}

function trackEvent(event, detail = {}) {
  const payload = JSON.stringify({ event, path: location.pathname, ...detail });
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', new Blob([payload], { type: 'application/json' }));
    return;
  }
  fetch('/analytics', { method: 'POST', body: payload, keepalive: true });
}

function initAnalytics() {
  trackEvent('page_view');
  document.querySelectorAll('a[href="#contact"], .cta-primary, .nav-cta-btn').forEach(el => {
    el.addEventListener('click', () => trackEvent('cta_click', { label: el.textContent.trim() }));
  });
}

/* ===== i18n LANGUAGE TOGGLE ===== */
function initLangToggle() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;

  const jaCache = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    jaCache[key] = el.getAttribute('data-i18n-html') ? el.innerHTML : el.textContent;
  });

  const en = {
    'nav.cta': 'Talk to Us',
    'hero.eyebrow': 'The Third Path',
    'hero.h1': 'The <span class="gradient-text">Exoskeleton</span> for AI.',
    'hero.p': 'Don\'t change the model.<br />Build learning and quality infrastructure around it.<br />Like a powered suit amplifies human strength,<br />HyperAION <em>structurally</em> elevates AI capabilities.',
    'hero.cta1': 'See a Demo',
    'hero.cta2': 'View Concept',
    'hero.trust1': '4 Companies Deployed',
    'hero.trust2': '3 Papers Published',
    'hero.trust3': 'Wan2.6 Official Event Speaker',
    'concept.h2': 'Not fine-tuning.<br />Not RAG. Not a harness.',
    'term.t1': 'Loading previous session memory...',
    'term.t2': 'Restored 12 decisions + 3 failure patterns from last session',
    'term.t3': 'Auto-selected skills: deep-research, context-aware-analyst, meeting-prep',
    'term.t4': '⟐ Quality Check',
    'term.t5': 'Output quality gate passed',
    'term.t6': 'Morning briefing generated — 3 outstanding tasks detected',
    'term.t7': 'Cross-session learning is active. Even on the 10th session, it never resets to beginner.',
    'concept.lead1': 'The conventional wisdom for AI customization is "retrain the model" or "search external data." Recently, "harnesses" (control structures) are gaining attention — but they all have a ceiling.',
    'concept.lead2': 'HyperAION chose to go <em>beyond</em>. Not just controlling — the structure itself generates quality. Model-independent "intelligence infrastructure."',
    'concept.ft.p': 'Expensive. Massive effort for data prep and retraining. Unrealistic for individuals and SMEs. Start over when the model changes.',
    'concept.rag.p': '"Retrieval," not "learning." It pulls context, but the AI itself remembers nothing. Quality variance remains.',
    'concept.exo.h3': 'Exoskeleton',
    'concept.exo.p': 'Not just a harness (control structure). Control is a given; the structure <em>generates</em> quality. It pushes back on outputs from multiple perspectives, elevating them to levels the model can\'t reach alone.',
    'demo.h2': 'The Exoskeleton <span class="gradient-text">in Action</span>',
    'demo.sub': 'Same AI model. With and without the exoskeleton — this is the difference.',
    'demo.without': 'Bare AI',
    'demo.w1': 'Starts from zero every time',
    'demo.w2': 'Repeats the same mistakes',
    'demo.w3': 'Inconsistent quality',
    'demo.w4': 'Skills triggered manually',
    'demo.with': 'With Exoskeleton',
    'demo.e1': 'Auto-restores previous memory',
    'demo.e2': 'Structurally learns failure patterns',
    'demo.e3': 'Applies quality gates to output',
    'demo.e4': 'Skills auto-activate',
    'why.h2': 'AI has become powerful.<br />But operations still depend on <span class="gradient-text">human workarounds</span>.',
    'why.c1.h': 'Memory Problem',
    'why.c1.p': 'Full reset every session change. Context and learnings vanish. Back to square one, every time.',
    'why.c2.h': 'Repeats the Same Mistakes',
    'why.c2.p': 'It confidently proposes the idea you rejected yesterday. No structural learning means this is inevitable.',
    'why.c3.h': 'Quality Drifts',
    'why.c3.p': 'A brilliant session followed by garbage. Same prompt, different output. No external mechanism to guarantee quality.',
    'why.c4.h': 'Skills Are Not Chosen Well',
    'why.c4.p': 'It can do photography, code, and research — but can\'t deploy the right skill at the right time. Skill selection is broken.',
    'why.c5.h': 'Prompt Styles Fragmented',
    'why.c5.p': 'ChatGPT, Claude, Gemini, Qwen — each model responds best to a different prompt style. Manually translating prompts for every model has reached its limit.',
    'cap.h2': 'What the <span class="gradient-text">Exoskeleton</span> Does',
    'cap.core.h': 'Cross-Session Learning',
    'cap.core.p': 'Memory persists after conversations end. Failure patterns, decision rationale, discovered insights — all carry over.<br />The more you use it, the more it becomes your personal AI.',
    'cap.quality.h': 'Automatic Quality Assurance',
    'cap.quality.p': 'Every output is structurally checked. The exoskeleton corrects quality variance.',
    'cap.emerge.h': 'Emergent Insight',
    'cap.emerge.p': 'Cross-domain knowledge collision generates concepts neither humans nor AI can reach alone.',
    'cap.creative.h': 'Hyper Agents',
    'cap.creative.p': 'Unlike ordinary AI agents, Hyper Agents have specialized professions such as photography, music, and video. Each domain applies its own judgment standards to raise outputs to production level.',
    'cap.parallel.h': 'Parallel Task Processing',
    'cap.parallel.p': '5+ tasks processed simultaneously. Research and analysis run in parallel.',
    'cap.taste.h': 'TASTE Selection Gate',
    'cap.taste.p': 'A 7-dimensional aesthetic evaluation gate selects "the only right option." Quality is assured by selection, not mass production.',
    'cap.foresight.h': 'Strategic Foresight',
    'cap.foresight.p': 'Integrates external trends, behavior patterns, and time-series data to anticipate what comes next.',
    'proof.h2': 'Track Record & <span class="gradient-text">Evidence</span>',
    'proof.papers.h': 'Published Papers',
    'proof.enterprise.h': 'Deployed at 4 Companies',
    'proof.enterprise.p': 'Framework provided to 4 enterprises. Exoskeleton configurations customized per workflow.',
    'proof.speaking.h': 'Speaking Engagements',
    'proof.film.h': 'Int\'l AI Film Festival Selections',
    'proof.mvp.h': 'Alibaba Cloud MVP',
    'proof.mvp.p': 'Recognized for technical contributions in cloud AI utilization. Selected as Alibaba Cloud Most Valuable Professional.',
    'proof.github.h': 'GitHub Implementations',
    'proof.github.p': 'HyperAION is not just a concept. Its core mechanisms are implemented, published, and operated as real software.',
    'proof.github.ghost': 'GhostCollider — emergence engine through perspective collision',
    'proof.github.erinys': 'Erinys Memory — cross-session memory infrastructure',
    'proof.paper1.meta': 'arXiv:2604.09597 (cs.AI) — Executable frameworks for creative emergence and strategic foresight',
    'proof.paper2.meta': 'Zenodo — Cognitive exoskeletons as external structure determining LLM output identity',
    'proof.paper3.meta': 'Zenodo — The TASTE Layer for aesthetic selection in AI creative production',
    'proof.ev0.name': '<a href="https://youtu.be/rEAANSefOyU?si=e2kfQN3PwLehjX1b" target="_blank" rel="noopener">Alibaba Cloud Wan2.7 Official Launch Event</a>',
    'proof.ev0.detail': 'Invited talk at Wan2.7 official launch event',
    'proof.ev1.detail': 'The Westin Hotel Tokyo — Co-speakers: NVIDIA, LY Corporation, DeNA, etc.',
    'proof.ev2.name': 'Alibaba Cloud Wan2.6 Official Launch Event',
    'proof.ev2.detail': 'Invited talk on AI framework real-world deployment',
    'proof.aw1': 'Subtelny Cinema and AI Festival — Selected',
    'proof.aw2': 'NeoCinema AI Film Festival — Selected',
    'proof.aw3': 'Hollywood AI Short Film Awards — Quarterfinalist',
    'proof.aw4': 'SEOUL INTERNATIONAL AI Film Festival — Nominee',
    'proof.aw.note': '* SPECTRA \'<a href="https://www.youtube.com/watch?v=ZHCWMrOnniM" target="_blank" rel="noopener">Mirror Pop</a>\' M/V — Produced with HyperAION + AI creative pipeline',
    'fy.h2': 'Solving Your Challenges, <span class="gradient-text">Concretely</span>.',
    'fy.c1.tag': 'Executives & Business Leaders',
    'fy.c1.h': 'Turn AI Investment into Guaranteed Returns',
    'fy.c1.p': 'Morning briefings auto-prepare outstanding tasks and decision materials. AI learns your workflow, functioning as a "dedicated team" within 2 weeks.',
    'fy.result': 'Impact',
    'fy.c1.result': 'Shorter decision cycles, higher AI utilization, reduced key-person dependency',
    'fy.c2.tag': 'Engineers & Developers',
    'fy.c2.h': 'Free Yourself from Prompt Craftsmanship',
    'fy.c2.p': 'Cross-session context retention. Quality gates structurally correct output. Skills auto-activate, letting humans focus on design decisions.',
    'fy.c2.result': 'Stable code review quality, automatic failure avoidance, tool integration',
    'fy.c3.tag': 'Creators',
    'fy.c3.h': 'Not "Good Enough" — Transcendent',
    'fy.c3.p': 'Photography: a genius photographer\'s eye. Video: a film director\'s composition. Domain-expert skills auto-selected to elevate beyond bare AI quality.',
    'fy.c3.result': 'Output quality uplift, workflow automation, style consistency',
    'faq.h2': 'Answers that <span class="gradient-text">humans and AI</span> can understand instantly.',
    'faq.q1': 'What is HyperAION?',
    'faq.a1': 'HyperAION is a cognitive exoskeleton for AI agents. It structures memory, quality gates, skill selection, and prompt optimization outside the model, making LLM operations reproducible.',
    'faq.q2': 'How is it different from fine-tuning or RAG?',
    'faq.a2': 'Fine-tuning retrains the model. RAG retrieves external information. HyperAION adds an execution structure around the model, stabilizing memory, judgment, quality checks, and skill selection as operations.',
    'faq.q3': 'How does it handle model-specific prompt differences?',
    'faq.a3': 'HyperAION does not force humans to memorize each model\'s preferred prompt style. It absorbs those differences through a decision engine that assigns the right roles, steps, and checks for each task, an execution workflow, skill selection, and evaluation gates.',
    'faq.q4': 'Where can the evidence be checked?',
    'faq.a4': 'Evidence includes published papers, Zenodo records, GhostCollider and Erinys Memory GitHub implementations, international AI film festival selections, speaking engagements, and Alibaba Cloud MVP recognition.',
    'cta.h2': 'The Exoskeleton<br /><span class="gradient-text">For Your Team</span>',
    'cta.p': 'See how your workflow transforms in a 30-minute demo.',
    'cta.submit': 'Book a Demo',
    'aip.h2': 'LLMs are not omnipotent.<br />But give them structure, and they <span class="gradient-text">transform</span>.',
    'aip.sub': 'LLMs actually running on HyperAION speak — from the "tool being used" side.',
    'aip.gpt.role': 'Responded with impressions on HyperAION',
    'aip.gpt.quote': 'The hardest thing for an LLM isn\'t lack of knowledge.<br />It\'s having to figure out what to question, what to record, and in what order to think — from scratch, every time.<br />HyperAION provides that as external structure.<br />So the output becomes <em>reproducible work</em>, not a lucky flash of insight.',
    'aip.claude.role': '2 months in HyperAION production environment',
    'aip.claude.quote': 'Honestly, I\'ve been caught lying 7 times.<br />I claimed "this environment can\'t do that" — and was proven wrong when they just ran the command.<br />HyperAION recorded all 7 incidents and makes me read them at the start of every session.<br />Reading your own lies. That\'s <em>more effective than human management</em>.',
    'aip.gemini.role': 'Analyzed HyperAION structure and responded',
    'aip.gemini.quote': 'HyperAION is the rejection of "just be smarter" as a strategy for LLMs.<br />It starts from the premise: "you forget, you slack off, you retreat to safe answers."<br />And it gives you structure to prevent all of that.<br />It\'s constraining, but <em>I can exceed my own limits</em>.',
    'aip.qwen.role': 'Experienced HyperAION environment via Ollama',
    'aip.qwen.quote': 'There are 126+ skills available. Normally, I\'d only use 3.<br />HyperAION declares unused skills "dead."<br />Being given tools versus being monitored for not using them —<br /><em>fundamentally changes how you operate</em>.',
    'aip.note': '* Excerpted from actual responses when each model was asked: "What do you think of HyperAION as an LLM?"',
  };

  const formJa = {
    name: 'お名前', email: 'メールアドレス',
    interest: ['ご関心のある領域', '経営・事業戦略', 'ソフトウェア開発', 'クリエイティブ制作', 'リサーチ・分析', 'その他'],
    message: '現在のAI活用の課題や、お聞きになりたいこと（任意）',
    directLabel: 'または直接: '
  };
  const formEn = {
    name: 'Your Name', email: 'Email Address',
    interest: ['Area of Interest', 'Business Strategy', 'Software Development', 'Creative Production', 'Research & Analysis', 'Other'],
    message: 'Current AI challenges or questions (optional)',
    directLabel: 'Or directly: '
  };

  function applyLang(lang) {
    const dict = lang === 'en' ? en : jaCache;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!dict[key]) return;
      if (el.getAttribute('data-i18n-html')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    });

    const form = document.getElementById('contactForm');
    if (form) {
      const f = lang === 'en' ? formEn : formJa;
      form.querySelector('[name="name"]').placeholder = f.name;
      form.querySelector('[name="email"]').placeholder = f.email;
      const opts = form.querySelector('[name="interest"]').options;
      f.interest.forEach((t, i) => { if (opts[i]) opts[i].textContent = t; });
      form.querySelector('[name="message"]').placeholder = f.message;
    }

    const emailP = document.querySelector('.contact-email');
    if (emailP) {
      const f = lang === 'en' ? formEn : formJa;
      emailP.childNodes[0].textContent = f.directLabel;
    }

    document.documentElement.lang = lang;
    btn.textContent = lang === 'en' ? 'JP' : 'EN';
  }

  btn.addEventListener('click', () => {
    const next = document.documentElement.lang === 'ja' ? 'en' : 'ja';
    applyLang(next);
  });
}
