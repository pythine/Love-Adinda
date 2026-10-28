(() => {
  const $ = (id) => document.getElementById(id);
  const rooms = ['room1','room2','room3','room4'];
  let currentRoom = 0;
  let audioCtx = null, masterGain = null, musicOn = false;

  // GANTI FILE MP3 DI SINI
  // Simpan lagu di folder music/ dengan nama romantis.mp3
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
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => t.classList.remove('show'), 2300);
  }

  function goToRoom(index) {
    currentRoom = index;
    rooms.forEach((id, i) => $(id).classList.toggle('active', i === index));
    $('roomLabel').textContent = `RUANG 0${index + 1} / 04`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (index === 2 && messageIndex === 0) showMessage();
    if (index === 3) {
      $('arenaHint').textContent = gameRunning ? '' : 'Tekan “Mulai bermain” untuk menangkap hati 💕';
    }
  }

  // AudioContext hanya untuk efek suara mini game.
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
    if (!audioCtx || !masterGain) return;
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
      $('musicState').textContent = 'Musik menyala';
      $('musicToggle').classList.add('playing');
    }).catch(() => {
      musicOn = false;
      $('musicState').textContent = 'Klik lagi untuk memutar musik';
      $('musicToggle').classList.remove('playing');
      showToast('Periksa file music/romantis.mp3');
    });
  }

  function stopMusic() {
    backgroundMusic.pause();
    musicOn = false;
    $('musicState').textContent = 'Musik mati';
    $('musicToggle').classList.remove('playing');
  }

  backgroundMusic.addEventListener('ended', () => {
    musicOn = false;
    $('musicState').textContent = 'Musik mati';
    $('musicToggle').classList.remove('playing');
  });

  function firstChoice() { startMusic(); }

  $('firstYes').addEventListener('click', () => {
    firstChoice();
    goToRoom(1);
    showToast('Yay! Satu langkah lebih dekat ke hatiku. ♡');
  });

  const noBtn = $('firstNo');

  function dodgeNo() {
    firstChoice();
    const maxX = Math.max(0, Math.min(140, window.innerWidth / 2 - 90));
    const x = (Math.random() * 2 - 1) * maxX;
    const y = (Math.random() * 2 - 1) * 25;
    noBtn.style.transform = `translate(${x}px, ${y}px)`;
    $('firstNote').textContent = [
      'Hehe, coba lagi dong 🙈',
      'Eits, tombolnya malu dipilih! 💗',
      'Kayaknya tombol No ingin bilang Yes. 😚',
      'Yakin nih? Kasih aku satu kesempatan.'
    ][Math.floor(Math.random() * 4)];
    if (window.matchMedia('(hover: none)').matches) {
      noBtn.style.transform = 'translate(0,0)';
    }
  }

  noBtn.addEventListener('pointerenter', () => {
    if (!window.matchMedia('(hover: none)').matches) dodgeNo();
  });
  noBtn.addEventListener('click', () => {
    firstChoice();
    dodgeNo();
  });

  $('certYes').addEventListener('click', () => {
    startMusic();
    goToRoom(2);
    showToast('Sertifikat diterima! Semoga senyummu ikut hadir. 💞');
  });

  $('certNo').addEventListener('click', () => {
    startMusic();
    $('certNote').textContent = 'Nggak apa-apa, sertifikat ini akan tetap menunggumu dengan manis. ♡';
    showToast('Sertifikatnya tetap berlaku di dunia imajinasi 😌');
    $('certNo').textContent = 'Oke, aku terima ♡';
    $('certNo').classList.remove('btn-no');
    $('certNo').classList.add('btn-yes');
    $('certNo').onclick = () => goToRoom(2);
  });

  $('logoPopup').addEventListener('click', () => {
    $('logoModal').classList.add('show');
    startMusic();
  });

  function closeModal() { $('logoModal').classList.remove('show'); }
  $('closeModal').addEventListener('click', closeModal);
  $('modalOkay').addEventListener('click', closeModal);
  $('logoModal').addEventListener('click', e => {
    if (e.target === $('logoModal')) closeModal();
  });

  function showMessage() {
    const stage = $('messageStage');
    if (messageIndex >= messages.length) {
      stage.innerHTML = '<span class="line">Semua pesanku sudah terbuka. Tapi rasa sayangku masih terus bertambah. ♥</span>';
      $('nextMessage').textContent = 'Masuk ke mini game ♡';
      $('messageCounter').textContent = '4 / 4 pesan terbuka';
      $('nextMessage').onclick = () => goToRoom(3);
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
      if (i < text.length) {
        span.textContent += text.charAt(i++);
        setTimeout(type, 24);
      } else cursor.remove();
    };

    type();
    messageIndex++;
    $('messageCounter').textContent = `${messageIndex} / ${messages.length} pesan terbuka`;
    $('nextMessage').textContent = messageIndex === messages.length
      ? 'Baca penutup ♡'
      : 'Buka pesan berikutnya ✨';
  }

  $('nextMessage').addEventListener('click', () => {
    if (messageIndex >= messages.length) goToRoom(3);
    else showMessage();
  });

  function clearGameTimers() {
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    gameTimer = null;
    spawnTimer = null;
  }

  function resetGame() {
    clearGameTimers();
    gameRunning = false;
    score = 0;
    timeLeft = 30;
    $('score').textContent = score;
    $('timeLeft').textContent = timeLeft;
    $('gameArena').querySelectorAll('.falling-heart').forEach(h => h.remove());
    $('arenaHint').style.display = 'grid';
    $('arenaHint').textContent = 'Tekan “Mulai bermain” untuk menangkap hati 💕';
    $('gameResult').textContent = '';
    $('startGame').disabled = false;
    $('startGame').textContent = 'Mulai bermain ♡';
  }

  function spawnHeart() {
    if (!gameRunning) return;
    const arena = $('gameArena');
    const heart = document.createElement('button');
    heart.className = 'falling-heart';
    heart.type = 'button';
    heart.textContent = ['♥', '♡', '💗', '💖'][Math.floor(Math.random() * 4)];
    heart.setAttribute('aria-label', 'Tangkap hati');
    heart.style.fontSize = `${22 + Math.random() * 20}px`;
    heart.style.left = `${Math.random() * 88 + 3}%`;
    heart.style.top = '-35px';
    const duration = 2.4 + Math.random() * 1.8;
    heart.style.animationDuration = `${duration}s`;

    heart.addEventListener('click', () => {
      if (!gameRunning) return;
      score++;
      $('score').textContent = score;
      heart.remove();
      playCatchSound();
      if (score >= 10) finishGame(true);
    });

    arena.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000 + 100);
  }

  function playCatchSound() {
    if (ensureAudio()) {
      const now = audioCtx.currentTime;
      playNote(659.25, now, 0.12, 'sine', 0.12);
      playNote(783.99, now + 0.07, 0.16, 'sine', 0.1);
    }
  }

  function finishGame(won) {
    if (!gameRunning) return;
    gameRunning = false;
    clearGameTimers();
    $('startGame').disabled = false;
    $('startGame').textContent = won ? 'Main lagi ♡' : 'Coba lagi ♡';
    $('arenaHint').style.display = 'grid';
    $('arenaHint').textContent = won
      ? 'Kamu berhasil menangkap semua hati! 💖'
      : 'Waktu habis! Setiap hati tetap untukmu. ♡';
    $('gameResult').textContent = won
      ? 'Kejutan terbuka: kamu adalah rumah bagi hati ini. I LOVE YOU! ♥'
      : `Skor ${score}/10 — yuk coba sekali lagi, kamu pasti bisa!`;
    $('gameArena').querySelectorAll('.falling-heart').forEach(h => h.remove());
    if (won) {
      for (let i = 0; i < 18; i++) setTimeout(createCelebrationHeart, i * 90);
    }
  }

  function createCelebrationHeart() {
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.textContent = ['♥', '♡', '💗'][Math.floor(Math.random() * 3)];
    h.style.left = `${Math.random() * 100}%`;
    h.style.bottom = '0';
    h.style.fontSize = `${14 + Math.random() * 22}px`;
    h.style.animationDuration = `${3 + Math.random() * 3}s`;
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 6500);
  }

  $('startGame').addEventListener('click', () => {
    if (gameRunning) resetGame();
    startMusic();
    clearGameTimers();
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    $('score').textContent = score;
    $('timeLeft').textContent = timeLeft;
    $('arenaHint').style.display = 'none';
    $('gameResult').textContent = 'Semangat, tangkap hati-hatinya! 💘';
    $('startGame').disabled = true;
    spawnHeart();
    spawnTimer = setInterval(spawnHeart, 620);
    gameTimer = setInterval(() => {
      timeLeft--;
      $('timeLeft').textContent = timeLeft;
      if (timeLeft <= 0) finishGame(score >= 10);
    }, 1000);
  });

  $('replayGame').addEventListener('click', resetGame);

  $('restartJourney').addEventListener('click', () => {
    resetGame();
    messageIndex = 0;
    $('nextMessage').onclick = null;
    $('nextMessage').textContent = 'Buka pesan berikutnya ✨';
    $('firstNote').textContent = 'Pilih dengan hati, ya. ✨';
    noBtn.style.transform = '';
    goToRoom(0);
  });

  $('musicToggle').addEventListener('click', () => {
    if (musicOn) stopMusic();
    else startMusic();
  });

  setInterval(() => {
    if (document.hidden) return;
    const holder = $('floatingHearts');
    const h = document.createElement('span');
    h.className = 'floating-heart';
    h.textContent = Math.random() > 0.5 ? '♡' : '♥';
    h.style.left = `${Math.random() * 100}%`;
    h.style.fontSize = `${10 + Math.random() * 17}px`;
    h.style.animationDuration = `${8 + Math.random() * 8}s`;
    holder.appendChild(h);
    setTimeout(() => h.remove(), 17000);
  }, 1500);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicOn) backgroundMusic.pause();
    else if (!document.hidden && musicOn) backgroundMusic.play().catch(() => {});
    if (document.hidden && audioCtx) audioCtx.suspend();
    else if (!document.hidden && audioCtx) audioCtx.resume();
  });
})();