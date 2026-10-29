(() => {
  const $ = (id) => document.getElementById(id);
  const VALID_USER = "adinda";
  const VALID_PASS = "sayang";

  const rooms = ['room1', 'room2', 'room3', 'room4'];
  let currentRoom = 0;
  let audioCtx = null, masterGain = null, musicOn = false;

  const backgroundMusic = new Audio('Romantis.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.45;

  let messageIndex = 0, score = 0, timeLeft = 30;
  let gameTimer = null, spawnTimer = null, gameRunning = false;

  const messages = [
    'Kamu nggak harus selalu baik-baik saja. Aku ingin jadi tempatmu pulang, bahkan di hari yang paling melelahkan.',
    'Dari banyak hal indah di dunia, salah satu favoritku adalah kesempatan untuk mengenal kamu lebih jauh.',
    'Kalau suatu hari kamu lupa betapa berharganya dirimu, semoga halaman kecil ini mengingatkanmu: kamu berarti.',
    'Aku nggak menjanjikan semuanya selalu mudah. Tapi aku ingin terus belajar memilih kamu, lagi dan lagi. ♡'
  ];

  function showToast(text) {
    const t = $('toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => t.classList.remove('show'), 2300);
  }

  function goToRoom(index) {
    currentRoom = index;
    rooms.forEach((id, i) => {
      const room = $(id);
      if (room) room.classList.toggle('active', i === index);
    });
    if ($('roomLabel')) $('roomLabel').textContent = `RUANG 0${index + 1} / 04`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (index === 2 && messageIndex === 0) showMessage();
  }

  // ========== LOGIC LOGIN FIX - MUNCUL TIAP BUKA ==========
  function handleLogin(e) {
    e.preventDefault();
    const user = $('loginUsername')?.value.trim().toLowerCase() || "";
    const pass = $('loginPassword')?.value.trim().toLowerCase() || "";
    const errorEl = $('loginError');

    if (user === VALID_USER && pass === VALID_PASS) {
      if (errorEl) errorEl.textContent = "";
      const gate = $('loginGate');
      if (gate) {
        gate.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        gate.style.opacity = "0";
        gate.style.transform = "scale(1.05)";
        setTimeout(() => {
          gate.style.display = "none";
          gate.style.opacity = "1";
          gate.style.transform = "scale(1)";
          goToRoom(0);
          firstChoice();
          showToast(`Hai Adinda! Selamat datang ♡`);
        }, 600);
      }
      // HAPUS localStorage BIAR LOGIN MUNCUL TERUS
    } else {
      if (errorEl) errorEl.textContent = "Username atau password salah, coba lagi yaa 🙈";
      const card = document.querySelector('.login-card');
      if(card){
        card.animate([{transform: 'translateX(0)'}, {transform: 'translateX(-8px)'}, {transform: 'translateX(8px)'}, {transform: 'translateX(0)'}], {duration: 300});
      }
    }
  }

  function checkExistingLogin() {
    // FIX: Selalu tampilkan login tiap buka web
    const gate = $('loginGate');
    if (gate) {
      gate.style.display = "flex";
      gate.style.opacity = "1";
    }
    rooms.forEach(id => $(id)?.classList.remove('active'));
    // kalau mau langsung masuk room1 tanpa login, hapus 2 baris di atas dan pakai goToRoom(0)
  }
  // ======================================

  function ensureAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.12;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return true;
  }

  function playNote(freq, start, duration, type = 'sine', volume = 0.23) {
    if (!ensureAudio() || !masterGain) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  function startMusic() {
    if (musicOn && !backgroundMusic.paused) return;
    backgroundMusic.play().then(() => {
      musicOn = true;
      if ($('musicState')) $('musicState').textContent = 'Musik menyala';
      $('musicToggle')?.classList.add('playing');
    }).catch(() => {
      if ($('musicState')) $('musicState').textContent = 'Klik lagi untuk memutar musik';
    });
  }
  function stopMusic() {
    backgroundMusic.pause();
    musicOn = false;
    if ($('musicState')) $('musicState').textContent = 'Musik mati';
    $('musicToggle')?.classList.remove('playing');
  }
  function firstChoice() { startMusic(); ensureAudio(); }

  $('firstYes')?.addEventListener('click', () => { firstChoice(); goToRoom(1); showToast('Yay! Satu langkah lebih dekat ke hatiku. ♡'); });
  const noBtn = $('firstNo');
  function dodgeNo() {
    if (!noBtn || window.matchMedia('(hover: none)').matches) return;
    const maxX = Math.min(140, window.innerWidth / 2 - 90);
    const x = (Math.random() * 2 - 1) * maxX;
    const y = (Math.random() * 2 - 1) * 25;
    noBtn.style.transform = `translate(${x}px, ${y}px)`;
  }
  noBtn?.addEventListener('pointerenter', dodgeNo);
  noBtn?.addEventListener('click', (e) => { e.preventDefault(); firstChoice(); dodgeNo(); });

  $('certYes')?.addEventListener('click', () => { startMusic(); goToRoom(2); });
  $('certNo')?.addEventListener('click', () => {
    const btnNo = $('certNo');
    if ($('certNote')) $('certNote').textContent = 'Nggak apa-apa, sertifikat ini akan tetap menunggumu dengan manis. ♡';
    btnNo.textContent = 'Oke, aku terima ♡';
    btnNo.className = 'btn btn-yes';
    btnNo.onclick = () => goToRoom(2);
  });
  $('logoPopup')?.addEventListener('click', () => { startMusic(); $('logoModal')?.classList.add('show'); });
  const closeModal = () => $('logoModal')?.classList.remove('show');
  $('closeModal')?.addEventListener('click', closeModal);
  $('modalOkay')?.addEventListener('click', closeModal);
  $('logoModal')?.addEventListener('click', e => { if (e.target === $('logoModal')) closeModal(); });

  function showMessage() {
    const stage = $('messageStage');
    if (!stage) return;
    if (messageIndex >= messages.length) {
      stage.innerHTML = '<span class="line">Semua pesanku sudah terbuka. Tapi rasa sayangku masih terus bertambah. ♥</span>';
      if ($('nextMessage')) { $('nextMessage').textContent = 'Masuk ke mini game ♡'; $('nextMessage').onclick = () => goToRoom(3); }
      if ($('messageCounter')) $('messageCounter').textContent = '4 / 4 pesan terbuka';
      return;
    }
    stage.innerHTML = '<span class="typing-cursor"></span>';
    const text = messages[messageIndex];
    let i = 0;
    const cursor = stage.querySelector('.typing-cursor');
    const span = document.createElement('span');
    span.className = 'line';
    stage.insertBefore(span, cursor);
    const type = () => {
      if (i < text.length) { span.textContent += text.charAt(i++); setTimeout(type, 24); }
      else cursor?.remove();
    };
    type();
    messageIndex++;
    if ($('messageCounter')) $('messageCounter').textContent = `${messageIndex} / ${messages.length} pesan terbuka`;
    if ($('nextMessage')) $('nextMessage').textContent = messageIndex === messages.length ? 'Baca penutup ♡' : 'Buka pesan berikutnya ✨';
  }
  $('nextMessage')?.addEventListener('click', () => { messageIndex >= messages.length ? goToRoom(3) : showMessage(); });

  function clearGameTimers() { clearInterval(gameTimer); clearInterval(spawnTimer); gameTimer = null; spawnTimer = null; }
  function resetGame() {
    clearGameTimers();
    gameRunning = false; score = 0; timeLeft = 30;
    if ($('score')) $('score').textContent = score;
    if ($('timeLeft')) $('timeLeft').textContent = timeLeft;
    $('gameArena')?.querySelectorAll('.falling-heart').forEach(h => h.remove());
    if ($('arenaHint')) { $('arenaHint').style.display = 'grid'; $('arenaHint').textContent = 'Tekan “Mulai bermain” untuk menangkap hati 💕'; }
    if ($('gameResult')) $('gameResult').textContent = '';
    if ($('startGame')) { $('startGame').disabled = false; $('startGame').textContent = 'Mulai bermain ♡'; }
  }
  function spawnHeart() {
    if (!gameRunning) return;
    const arena = $('gameArena');
    if (!arena) return;
    const heart = document.createElement('button');
    heart.className = 'falling-heart';
    heart.type = 'button';
    heart.textContent = ['♥','♡','💗','💖'][Math.floor(Math.random()*4)];
    heart.style.fontSize = `${22 + Math.random() * 20}px`;
    heart.style.left = `${Math.random() * 88 + 3}%`;
    heart.style.top = '-35px';
    heart.style.animationDuration = `${2.4 + Math.random() * 1.8}s`;
    heart.addEventListener('click', () => {
      if (!gameRunning) return;
      score++;
      if ($('score')) $('score').textContent = score;
      const now = audioCtx?.currentTime || 0;
      if (audioCtx) { playNote(523.25, now, 0.08); playNote(659.25, now + 0.05, 0.12); }
      heart.remove();
    });
    heart.addEventListener('animationend', () => heart.remove());
    arena.appendChild(heart);
  }
  function startGame() {
    resetGame();
    gameRunning = true;
    if ($('arenaHint')) $('arenaHint').style.display = 'none';
    if ($('startGame')) { $('startGame').disabled = true; $('startGame').textContent = 'Bermain...'; }
    gameTimer = setInterval(() => {
      timeLeft--;
      if ($('timeLeft')) $('timeLeft').textContent = timeLeft;
      if (timeLeft <= 0) {
        clearGameTimers();
        gameRunning = false;
        if ($('gameResult')) $('gameResult').textContent = `Kamu dapat ${score} hati! ${score >= 10 ? 'Kejutan terbuka! ♡' : 'Coba lagi yaa 💕'}`;
        if ($('startGame')) { $('startGame').disabled = false; $('startGame').textContent = 'Main lagi ♡'; }
        if ($('arenaHint')) { $('arenaHint').style.display = 'grid'; $('arenaHint').textContent = 'Waktu habis!'; }
      }
    }, 1000);
    spawnTimer = setInterval(spawnHeart, 450);
  }
  $('startGame')?.addEventListener('click', () => { ensureAudio(); startMusic(); startGame(); });
  $('replayGame')?.addEventListener('click', resetGame);
  $('restartJourney')?.addEventListener('click', () => { resetGame(); messageIndex = 0; goToRoom(0); showToast('Balik ke awal lagi ♡'); });
  $('musicToggle')?.addEventListener('click', () => { musicOn ? stopMusic() : startMusic(); });

  $('loginForm')?.addEventListener('submit', handleLogin);
  checkExistingLogin();
  resetGame();
})();