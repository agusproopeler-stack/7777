// ============================================
// FILE: script.js
// GAME: AGUS777 VIRTUAL CASINO
// FITUR: Semua game + sound + localStorage
// ============================================

// ========== GLOBAL VARIABLES ==========
let balance = 4000000000; // Saldo awal 4M
let level = {
    current: 0,
    target: 10000000,
    name: 'SILVER'
};
let streak = 1;
let lastLogin = null;

// Slot variables
let slotBet = 500000;
let slotReels = ['🍒', '🍒', '🍒'];
let slotSpinning = false;
let slotAutoActive = false;
let slotAutoCount = 0;
let slotJackpot = 587432000;
let slotSymbols = ['7⃣', '🔔', '🍒', '🍋', '💎', '福', '財', '大吉'];

// Roulette variables
let rouletteBets = {};
let selectedChip = 10000;
let rouletteHistory = [];
let lastRouletteNumber = null;

// Dice variables
let diceBet = 100000;
let dice1 = 1;
let dice2 = 1;
let diceSelectedBet = null;

// Sound variables
let soundEnabled = true;
let volume = 0.7;
let sounds = {};

// Online users counter
let onlineUsers = 1847;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Load dari localStorage
    loadFromStorage();
    
    // Update UI
    updateBalance();
    updateLevel();
    updateStreak();
    updateJackpot();
    
    // Generate dummy data
    generateLiveFeed();
    generateTopWinners();
    updateOnlineUsers();
    startJackpotCounter();
    
    // Initialize games
    initSlot();
    initRoulette();
    initDice();
    
    // Initialize sound
    initSounds();
    
    // Check daily login
    checkDailyLogin();
    
    // Start random notifications
    startRandomJackpotAlerts();
    startPromoCarousel();
    
    // Event listeners
    initEventListeners();
});

// ========== LOCALSTORAGE ==========
function loadFromStorage() {
    if (localStorage.getItem('agus777_balance')) {
        balance = parseInt(localStorage.getItem('agus777_balance'));
    }
    if (localStorage.getItem('agus777_level')) {
        level.current = parseInt(localStorage.getItem('agus777_level'));
    }
    if (localStorage.getItem('agus777_streak')) {
        streak = parseInt(localStorage.getItem('agus777_streak'));
    }
    if (localStorage.getItem('agus777_lastLogin')) {
        lastLogin = localStorage.getItem('agus777_lastLogin');
    }
}

function saveToStorage() {
    localStorage.setItem('agus777_balance', balance);
    localStorage.setItem('agus777_level', level.current);
    localStorage.setItem('agus777_streak', streak);
    localStorage.setItem('agus777_lastLogin', new Date().toDateString());
}

// ========== BALANCE FUNCTIONS ==========
function updateBalance() {
    const balanceEl = document.getElementById('balanceAmount');
    if (balanceEl) {
        balanceEl.textContent = formatRupiah(balance);
        // Animasi counter (akan diisi nanti)
    }
    saveToStorage();
}

function formatRupiah(angka) {
    return 'Rp ' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function addBalance(amount) {
    balance += amount;
    updateBalance();
    playSound('deposit');
    showNotification(`+ ${formatRupiah(amount)}`, 'success');
}

function subtractBalance(amount) {
    if (balance >= amount) {
        balance -= amount;
        updateBalance();
        playSound('withdraw');
        return true;
    } else {
        playSound('error');
        showNotification('Saldo tidak cukup!', 'error');
        return false;
    }
}

// ========== LEVEL SYSTEM ==========
function updateLevel() {
    level.current = Math.min(level.current, level.target);
    const percentage = (level.current / level.target) * 100;
    document.getElementById('levelProgressFill').style.width = percentage + '%';
    document.getElementById('levelProgressText').textContent = 
        formatRupiah(level.current) + ' / ' + formatRupiah(level.target);
    
    if (level.current >= level.target) {
        level.name = 'GOLD';
        document.querySelector('.level-label span:first-child').textContent = '🏆 GOLD MEMBER';
        playSound('levelup');
    }
}

function addLevelProgress(amount) {
    level.current += amount;
    if (level.current > level.target) level.current = level.target;
    updateLevel();
}

// ========== STREAK SYSTEM ==========
function updateStreak() {
    document.getElementById('streakCount').textContent = streak;
}

function checkDailyLogin() {
    const today = new Date().toDateString();
    if (lastLogin !== today) {
        if (lastLogin) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastLogin === yesterday.toDateString()) {
                streak++;
            } else {
                streak = 1;
            }
        }
        lastLogin = today;
        saveToStorage();
        updateStreak();
        
        // Bonus login
        if (streak >= 3) {
            showNotification('🎁 Bonus login hari ke-' + streak + ': Rp 50.000', 'bonus');
        }
    }
}

// ========== SLOT MACHINE ==========
function initSlot() {
    document.getElementById('slotSpin').addEventListener('click', slotSpin);
    document.getElementById('slotAuto').addEventListener('click', slotAuto);
    document.getElementById('slotStop').addEventListener('click', slotStop);
    document.getElementById('slotBetMinus').addEventListener('click', () => changeSlotBet(-10000));
    document.getElementById('slotBetPlus').addEventListener('click', () => changeSlotBet(10000));
    document.getElementById('slotMaxBet').addEventListener('click', () => setSlotBet(10000000));
    document.getElementById('slotBet').addEventListener('change', (e) => {
        slotBet = Math.min(10000000, Math.max(10000, parseInt(e.target.value) || 10000));
        document.getElementById('slotBet').value = slotBet;
    });
}

function changeSlotBet(delta) {
    slotBet = Math.min(10000000, Math.max(10000, slotBet + delta));
    document.getElementById('slotBet').value = slotBet;
}

function setSlotBet(value) {
    slotBet = Math.min(10000000, Math.max(10000, value));
    document.getElementById('slotBet').value = slotBet;
}

function slotSpin() {
    if (slotSpinning) return;
    if (!subtractBalance(slotBet)) return;
    
    slotSpinning = true;
    document.getElementById('slotSpin').disabled = true;
    document.getElementById('slotAuto').disabled = true;
    document.getElementById('slotStop').disabled = false;
    
    // Animasi spin
    document.querySelectorAll('.reel').forEach(reel => {
        reel.classList.add('spinning');
    });
    
    playSound('slotSpin');
    
    // Random result setelah delay
    setTimeout(() => {
        slotReels = [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol()
        ];
        
        document.getElementById('reel1').textContent = slotReels[0];
        document.getElementById('reel2').textContent = slotReels[1];
        document.getElementById('reel3').textContent = slotReels[2];
        
        document.querySelectorAll('.reel').forEach(reel => {
            reel.classList.remove('spinning');
        });
        
        playSound('slotStop');
        checkSlotWin();
        
        slotSpinning = false;
        document.getElementById('slotSpin').disabled = false;
        document.getElementById('slotAuto').disabled = false;
        document.getElementById('slotStop').disabled = true;
        
        // Auto spin lanjutan
        if (slotAutoActive && slotAutoCount > 0) {
            slotAutoCount--;
            if (slotAutoCount > 0) {
                setTimeout(slotSpin, 500);
            } else {
                slotAutoActive = false;
            }
        }
    }, 1500);
}

function getRandomSymbol() {
    return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
}

function checkSlotWin() {
    // Cek jackpot (semua sama)
    if (slotReels[0] === slotReels[1] && slotReels[1] === slotReels[2]) {
        // Jackpot
        const winAmount = slotJackpot;
        addBalance(winAmount);
        addLevelProgress(winAmount);
        playSound('jackpot');
        showJackpotModal(winAmount);
        addLiveFeed('JACKPOT', winAmount, 'Slot');
        return;
    }
    
    // Cek scatter (福)
    const scatterCount = slotReels.filter(s => s === '福').length;
    if (scatterCount >= 3) {
        // Free spin
        playSound('bonus');
        showNotification('🎰 FREE SPIN 10X!', 'bonus');
        slotAutoActive = true;
        slotAutoCount = 10;
        slotSpin();
        return;
    }
    
    // Cek kombinasi menang sederhana
    let winMultiplier = 0;
    if (slotReels[0] === slotReels[1]) winMultiplier += 2;
    if (slotReels[1] === slotReels[2]) winMultiplier += 2;
    if (slotReels[0] === slotReels[2]) winMultiplier += 1;
    
    if (winMultiplier > 0) {
        const winAmount = slotBet * winMultiplier;
        addBalance(winAmount);
        addLevelProgress(winAmount);
        playSound(winAmount > slotBet * 5 ? 'bigwin' : 'win');
        addLiveFeed('MENANG', winAmount, 'Slot');
    } else {
        playSound('lose');
        addLiveFeed('KALAH', slotBet, 'Slot');
    }
}

function slotAuto() {
    slotAutoActive = true;
    slotAutoCount = 10;
    slotSpin();
}

function slotStop() {
    slotAutoActive = false;
    slotAutoCount = 0;
}

// ========== ROULETTE ==========
function initRoulette() {
    // Draw roulette wheel
    drawRouletteWheel();
    
    // Generate betting table
    generateRouletteTable();
    
    // Event listeners
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            selectedChip = parseInt(this.dataset.value);
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.getElementById('rouletteSpin').addEventListener('click', rouletteSpin);
    document.getElementById('rouletteClear').addEventListener('click', rouletteClear);
    document.getElementById('rouletteRebet').addEventListener('click', rouletteRebet);
    document.getElementById('rouletteDouble').addEventListener('click', rouletteDouble);
    
    // Set chip default
    document.querySelector('.chip[data-value="10000"]').classList.add('active');
}

function drawRouletteWheel() {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const colors = ['green', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black', 'red', 'black'];
    
    const centerX = 100, centerY = 100, radius = 90;
    const angleStep = (Math.PI * 2) / numbers.length;
    
    ctx.clearRect(0, 0, 200, 200);
    
    for (let i = 0; i < numbers.length; i++) {
        const startAngle = i * angleStep;
        const endAngle = (i + 1) * angleStep;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Angka
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + angleStep/2);
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = '8px Arial';
        ctx.fillText(numbers[i], radius - 15, 0);
        ctx.restore();
    }
}

function generateRouletteTable() {
    const table = document.getElementById('bettingTable');
    let html = '<div class="roulette-numbers">';
    
    // Angka 0-36
    for (let i = 0; i <= 36; i++) {
        let color = i === 0 ? 'green' : (i % 2 === 0 ? 'black' : 'red');
        html += `<div class="bet-number ${color}" data-number="${i}">${i}</div>`;
    }
    html += '</div>';
    
    // Outside bets
    html += '<div class="outside-bets">';
    html += '<div class="bet-outside" data-bet="1st12">1st 12</div>';
    html += '<div class="bet-outside" data-bet="2nd12">2nd 12</div>';
    html += '<div class="bet-outside" data-bet="3rd12">3rd 12</div>';
    html += '<div class="bet-outside" data-bet="1-18">1-18</div>';
    html += '<div class="bet-outside" data-bet="19-36">19-36</div>';
    html += '<div class="bet-outside" data-bet="EVEN">EVEN</div>';
    html += '<div class="bet-outside" data-bet="ODD">ODD</div>';
    html += '<div class="bet-outside" data-bet="RED">RED</div>';
    html += '<div class="bet-outside" data-bet="BLACK">BLACK</div>';
    html += '</div>';
    
    table.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.bet-number, .bet-outside').forEach(el => {
        el.addEventListener('click', placeRouletteBet);
    });
}

function placeRouletteBet(e) {
    const betKey = e.target.dataset.number || e.target.dataset.bet;
    if (!betKey) return;
    
    if (!subtractBalance(selectedChip)) return;
    
    if (!rouletteBets[betKey]) {
        rouletteBets[betKey] = 0;
    }
    rouletteBets[betKey] += selectedChip;
    
    // Tampilkan chip di elemen
    let betDisplay = e.target.querySelector('.bet-chip');
    if (!betDisplay) {
        betDisplay = document.createElement('span');
        betDisplay.className = 'bet-chip';
        e.target.appendChild(betDisplay);
    }
    betDisplay.textContent = formatRupiah(rouletteBets[betKey]);
    
    playSound('chip');
}

function rouletteSpin() {
    // Cek apakah ada taruhan
    if (Object.keys(rouletteBets).length === 0) {
        showNotification('Pasang taruhan dulu!', 'error');
        return;
    }
    
    playSound('rouletteSpin');
    
    // Animasi bola
    const ball = document.getElementById('rouletteBall');
    ball.style.animation = 'bounce 0.1s infinite';
    
    setTimeout(() => {
        const result = Math.floor(Math.random() * 37); // 0-36
        lastRouletteNumber = result;
        
        ball.style.animation = '';
        
        // Update history
        rouletteHistory.unshift(result);
        if (rouletteHistory.length > 10) rouletteHistory.pop();
        updateRouletteHistory();
        
        playSound('rouletteBall');
        
        // Hitung kemenangan
        calculateRouletteWins(result);
        
        // Bersihkan taruhan setelah selesai (opsional, kalau mau clear otomatis)
        // rouletteClear();
        
    }, 3000);
}

function calculateRouletteWins(result) {
    let totalWin = 0;
    let winDetails = [];
    
    for (let [bet, amount] of Object.entries(rouletteBets)) {
        let win = false;
        let multiplier = 0;
        
        if (!isNaN(bet)) {
            // Bet angka langsung
            if (parseInt(bet) === result) {
                win = true;
                multiplier = 35;
            }
        } else {
            // Outside bets
            switch(bet) {
                case '1st12': if (result >= 1 && result <= 12) { win = true; multiplier = 2; } break;
                case '2nd12': if (result >= 13 && result <= 24) { win = true; multiplier = 2; } break;
                case '3rd12': if (result >= 25 && result <= 36) { win = true; multiplier = 2; } break;
                case '1-18': if (result >= 1 && result <= 18) { win = true; multiplier = 1; } break;
                case '19-36': if (result >= 19 && result <= 36) { win = true; multiplier = 1; } break;
                case 'EVEN': if (result !== 0 && result % 2 === 0) { win = true; multiplier = 1; } break;
                case 'ODD': if (result % 2 === 1) { win = true; multiplier = 1; } break;
                case 'RED': 
                    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
                    if (redNumbers.includes(result)) { win = true; multiplier = 1; }
                    break;
                case 'BLACK':
                    const blackNumbers = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
                    if (blackNumbers.includes(result)) { win = true; multiplier = 1; }
                    break;
            }
        }
        
        if (win) {
            const winAmount = amount * multiplier;
            totalWin += winAmount;
            winDetails.push({bet, amount, winAmount});
        }
    }
    
    if (totalWin > 0) {
        addBalance(totalWin);
        addLevelProgress(totalWin);
        playSound(totalWin > 1000000 ? 'bigwin' : 'win');
        showNotification(`MENANG ${formatRupiah(totalWin)}`, 'success');
        addLiveFeed('MENANG', totalWin, 'Roulette');
    } else {
        playSound('lose');
        addLiveFeed('KALAH', Object.values(rouletteBets).reduce((a,b) => a+b, 0), 'Roulette');
    }
}

function rouletteClear() {
    rouletteBets = {};
    document.querySelectorAll('.bet-chip').forEach(el => el.remove());
}

function rouletteRebet() {
    // Implementasi rebet (ulang taruhan sebelumnya)
    // Bisa pakai last bets
}

function rouletteDouble() {
    for (let bet in rouletteBets) {
        if (subtractBalance(rouletteBets[bet])) {
            rouletteBets[bet] *= 2;
        }
    }
    // Update tampilan chip
}

function updateRouletteHistory() {
    const historyEl = document.getElementById('rouletteHistory');
    let html = '';
    rouletteHistory.forEach(num => {
        let color = num === 0 ? 'green' : (num % 2 === 0 ? 'black' : 'red');
        html += `<div class="history-number ${color}">${num}</div>`;
    });
    historyEl.innerHTML = html;
}

// ========== DICE ==========
function initDice() {
    document.getElementById('diceShake').addEventListener('click', diceShake);
    document.getElementById('diceClear').addEventListener('click', diceClear);
    document.getElementById('diceDouble').addEventListener('click', diceDouble);
    document.getElementById('diceMax').addEventListener('click', () => diceSetBet(10000000));
    
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            diceAddBet(parseInt(this.dataset.value));
        });
    });
    
    document.getElementById('diceBetAmount').addEventListener('change', function(e) {
        diceBet = Math.min(10000000, Math.max(1000, parseInt(e.target.value) || 1000));
        this.value = diceBet;
    });
    
    // Generate betting options
    generateDiceOptions();
}

function generateDiceOptions() {
    const options = [
        { name: 'BESAR (8-14)', multiplier: 1, key: 'big' },
        { name: 'KECIL (3-7)', multiplier: 1, key: 'small' },
        { name: 'GANJIL', multiplier: 1, key: 'odd' },
        { name: 'GENAP', multiplier: 1, key: 'even' },
        { name: 'DOUBLE (sama)', multiplier: 8, key: 'double' },
        { name: 'TRIPLE (3-3,4-4,dll)', multiplier: 30, key: 'triple' }
    ];
    
    let html = '';
    options.forEach(opt => {
        html += `<div class="dice-option" data-bet="${opt.key}">
            <span>${opt.name}</span>
            <span class="multiplier">x${opt.multiplier}</span>
        </div>`;
    });
    
    document.getElementById('diceOptions').innerHTML = html;
    
    document.querySelectorAll('.dice-option').forEach(opt => {
        opt.addEventListener('click', function() {
            diceSelectedBet = this.dataset.bet;
            document.querySelectorAll('.dice-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function diceAddBet(amount) {
    diceBet = Math.min(10000000, diceBet + amount);
    document.getElementById('diceBetAmount').value = diceBet;
}

function diceSetBet(amount) {
    diceBet = amount;
    document.getElementById('diceBetAmount').value = diceBet;
}

function diceShake() {
    if (!diceSelectedBet) {
        showNotification('Pilih jenis taruhan dulu!', 'error');
        return;
    }
    
    if (!subtractBalance(diceBet)) return;
    
    playSound('diceShake');
    
    document.getElementById('dice1').classList.add('shaking');
    document.getElementById('dice2').classList.add('shaking');
    
    setTimeout(() => {
        dice1 = Math.floor(Math.random() * 6) + 1;
        dice2 = Math.floor(Math.random() * 6) + 1;
        
        const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        document.getElementById('dice1').textContent = diceSymbols[dice1-1];
        document.getElementById('dice2').textContent = diceSymbols[dice2-1];
        
        document.getElementById('dice1').classList.remove('shaking');
        document.getElementById('dice2').classList.remove('shaking');
        
        playSound('diceRoll');
        checkDiceWin();
    }, 1000);
}

function checkDiceWin() {
    const total = dice1 + dice2;
    let win = false;
    let multiplier = 0;
    
    switch(diceSelectedBet) {
        case 'big':
            if (total >= 8 && total <= 14) { win = true; multiplier = 1; }
            break;
        case 'small':
            if (total >= 3 && total <= 7) { win = true; multiplier = 1; }
            break;
        case 'odd':
            if (total % 2 === 1) { win = true; multiplier = 1; }
            break;
        case 'even':
            if (total % 2 === 0) { win = true; multiplier = 1; }
            break;
        case 'double':
            if (dice1 === dice2) { win = true; multiplier = 8; }
            break;
        case 'triple':
            if (dice1 === dice2 && (dice1 === 3 || dice1 === 4 || dice1 === 5 || dice1 === 6)) {
                win = true; multiplier = 30;
            }
            break;
    }
    
    if (win) {
        const winAmount = diceBet * multiplier;
        addBalance(winAmount);
        addLevelProgress(winAmount);
        playSound(winAmount > 1000000 ? 'bigwin' : 'win');
        addLiveFeed('MENANG', winAmount, 'Dice');
        showNotification(`MENANG ${formatRupiah(winAmount)}`, 'success');
    } else {
        playSound('lose');
        addLiveFeed('KALAH', diceBet, 'Dice');
    }
}

function diceClear() {
    diceSelectedBet = null;
    document.querySelectorAll('.dice-option').forEach(o => o.classList.remove('active'));
}

function diceDouble() {
    diceBet = Math.min(10000000, diceBet * 2);
    document.getElementById('diceBetAmount').value = diceBet;
}

// ========== SOUND SYSTEM (Howler.js) ==========
function initSounds() {
    if (typeof Howl === 'undefined') {
        console.warn('Howler.js not loaded');
        return;
    }
    
    sounds = {
        slotSpin: new Howl({ src: ['https://actions.google.com/sounds/v1/alarms/beep_short.ogg'], volume: volume }),
        slotStop: new Howl({ src: ['https://actions.google.com/sounds/v1/alarms/digital_watch_alarm.ogg'], volume: volume }),
        win: new Howl({ src: ['https://actions.google.com/sounds/v1/crowds/fanfare.ogg'], volume: volume }),
        bigwin: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        jackpot: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        lose: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        deposit: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        withdraw: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        chip: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        rouletteSpin: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        rouletteBall: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        diceShake: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        diceRoll: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        error: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        bonus: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume }),
        levelup: new Howl({ src: ['https://actions.google.com/sounds/v1/cartoon/boing.ogg'], volume: volume })
    };
    
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('volumeSlider').addEventListener('input', function(e) {
        volume = e.target.value / 100;
        for (let s in sounds) {
            sounds[s].volume(volume);
        }
    });
}

function playSound(name) {
    if (soundEnabled && sounds[name]) {
        sounds[name].play();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.querySelector('#soundToggle i');
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
    } else {
        icon.className = 'fas fa-volume-mute';
    }
}

// ========== LIVE FEED ==========
function generateLiveFeed() {
    const feed = document.getElementById('liveFeed');
    feed.innerHTML = '';
    
    const dummyUsers = ['user***45', 'user***78', 'user***12', 'user***90', 'user***34', 'user***67', 'user***23', 'user***56'];
    const dummyGames = ['Slot', 'Roulette', 'Dice'];
    const dummyActions = ['MENANG', 'KALAH', 'JACKPOT'];
    
    for (let i = 0; i < 5; i++) {
        const user = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
        const game = dummyGames[Math.floor(Math.random() * dummyGames.length)];
        const action = dummyActions[Math.floor(Math.random() * dummyActions.length)];
        const amount = Math.floor(Math.random() * 10000000) + 100000;
        const time = new Date().getHours() + ':' + 
                    String(new Date().getMinutes()).padStart(2,'0');
        
        const item = document.createElement('div');
        item.className = `feed-item ${action === 'MENANG' ? 'win' : action === 'KALAH' ? 'lose' : 'jackpot'}`;
        item.innerHTML = `[${time}] ${user} ${action === 'MENANG' ? '🔴 MENANG' : action === 'KALAH' ? '🟢 KALAH' : '🔥 JACKPOT'} ${formatRupiah(amount)} di ${game}`;
        feed.appendChild(item);
    }
    
    // Update setiap 5 detik
    setInterval(() => {
        const newItem = document.createElement('div');
        const user = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
        const game = dummyGames[Math.floor(Math.random() * dummyGames.length)];
        const action = dummyActions[Math.floor(Math.random() * dummyActions.length)];
        const amount = Math.floor(Math.random() * 10000000) + 100000;
        const time = new Date().getHours() + ':' + 
                    String(new Date().getMinutes()).padStart(2,'0');
        
        newItem.className = `feed-item ${action === 'MENANG' ? 'win' : action === 'KALAH' ? 'lose' : 'jackpot'}`;
        newItem.innerHTML = `[${time}] ${user} ${action === 'MENANG' ? '🔴 MENANG' : action === 'KALAH' ? '🟢 KALAH' : '🔥 JACKPOT'} ${formatRupiah(amount)} di ${game}`;
        
        feed.insertBefore(newItem, feed.firstChild);
        if (feed.children.length > 5) {
            feed.removeChild(feed.lastChild);
        }
    }, 8000);
}

function addLiveFeed(action, amount, game) {
    const feed = document.getElementById('liveFeed');
    const dummyUsers = ['user***45', 'user***78', 'user***12', 'user***90', 'user***34'];
    const user = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
    const time = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2,'0');
    
    const item = document.createElement('div');
    item.className = `feed-item ${action === 'MENANG' ? 'win' : action === 'JACKPOT' ? 'jackpot' : 'lose'}`;
    item.innerHTML = `[${time}] ${user} ${action === 'MENANG' ? '🔴 MENANG' : action === 'JACKPOT' ? '🔥 JACKPOT' : '🟢 KALAH'} ${formatRupiah(amount)} di ${game}`;
    
    feed.insertBefore(item, feed.firstChild);
    if (feed.children.length > 5) {
        feed.removeChild(feed.lastChild);
    }
}

// ========== TOP WINNERS ==========
function generateTopWinners() {
    const winners = [
        { user: 'user***47', amount: 287000000, game: 'Slot' },
        { user: 'user***92', amount: 156000000, game: 'Roulette' },
        { user: 'user***13', amount: 98000000, game: 'Dice' },
        { user: 'user***78', amount: 76000000, game: 'Slot' },
        { user: 'user***55', amount: 52000000, game: 'Roulette' }
    ];
    
    const list = document.getElementById('topWinners');
    let html = '';
    winners.forEach((w, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i+1 + '.';
        html += `<div class="winner-item"><span>${medal} ${w.user}</span> <span>${formatRupiah(w.amount)}</span></div>`;
    });
    list.innerHTML = html;
}

// ========== ONLINE USERS COUNTER ==========
function updateOnlineUsers() {
    setInterval(() => {
        onlineUsers += Math.floor(Math.random() * 20) - 5; // -5 sampai +15
        onlineUsers = Math.max(1500, Math.min(2500, onlineUsers));
        document.querySelector('.online-count').textContent = onlineUsers.toLocaleString();
    }, 10000);
}

// ========== JACKPOT COUNTER ==========
function startJackpotCounter() {
    setInterval(() => {
        slotJackpot += 1000;
        document.getElementById('jackpotAmount').textContent = formatRupiah(slotJackpot);
    }, 1000);
}

// ========== JACKPOT ALERT RANDOM ==========
function startRandomJackpotAlerts() {
    setInterval(() => {
        const alertBox = document.getElementById('jackpotAlert');
        const users = ['user***23', 'user***45', 'user***78', 'user***12', 'user***90'];
        const amounts = [1200000, 3500000, 8700000, 15000000, 42000000];
        const user = users[Math.floor(Math.random() * users.length)];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        
        alertBox.innerHTML = `🔥🔥 JACKPOT! ${user} memenangkan ${formatRupiah(amount)} di Golden Fortune!`;
        alertBox.style.animation = 'none';
        alertBox.offsetHeight;
        alertBox.style.animation = 'slideInRight 0.5s';
        
        setTimeout(() => {
            alertBox.innerHTML = '';
        }, 5000);
    }, 150000); // 2.5 menit
}

// ========== PROMO CAROUSEL ==========
function startPromoCarousel() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.promo-slide');
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000);
}

// ========== NOTIFICATIONS ==========
function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b09b' : type === 'error' ? '#8B0000' : '#D4AF37'};
        color: ${type === 'success' ? 'black' : 'white'};
        padding: 15px 30px;
        border-radius: 50px;
        z-index: 10000;
        font-weight: bold;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function showJackpotModal(amount) {
    const modal = document.getElementById('jackpotModal');
    document.getElementById('jackpotWinAmount').textContent = formatRupiah(amount);
    modal.classList.add('active');
    
    // Konfeti effect (simulasi)
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.innerHTML = '🎉';
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -20px;
                font-size: ${Math.random() * 30 + 20}px;
                z-index: 10001;
                animation: fall ${Math.random() * 3 + 2}s linear;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }, i * 50);
    }
    
    setTimeout(() => {
        modal.classList.remove('active');
    }, 5000);
}

// ========== MODALS ==========
function initEventListeners() {
    // Deposit modal
    document.getElementById('depositBtn').addEventListener('click', () => {
        document.getElementById('depositModal').classList.add('active');
    });
    
    document.getElementById('submitDeposit').addEventListener('click', () => {
        const amount = parseInt(document.getElementById('depositNominal').value);
        addBalance(amount);
        document.getElementById('depositModal').classList.remove('active');
    });
    
    // Withdraw modal
    document.getElementById('withdrawBtn').addEventListener('click', () => {
        document.getElementById('withdrawModal').classList.add('active');
    });
    
    document.getElementById('submitWithdraw').addEventListener('click', () => {
        const amount = parseInt(document.getElementById('withdrawNominal').value);
        if (subtractBalance(amount)) {
            showNotification(`Withdraw ${formatRupiah(amount)} berhasil diproses`, 'success');
        }
        document.getElementById('withdrawModal').classList.remove('active');
    });
    
    // Reset balance
    document.getElementById('resetBalanceBtn').addEventListener('click', () => {
        balance = 4000000000;
        updateBalance();
        playSound('deposit');
    });
    
    // Max bet (untuk semua game - akan dihandle masing-masing)
    document.getElementById('maxBetBtn').addEventListener('click', () => {
        // Set max bet di semua game
        setSlotBet(10000000);
        diceSetBet(10000000);
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // CS Chat
    document.getElementById('csChatBtn').addEventListener('click', () => {
        document.getElementById('chatModal').classList.toggle('active');
    });
    
    document.querySelector('.close-chat').addEventListener('click', () => {
        document.getElementById('chatModal').classList.remove('active');
    });
    
    // Copy referral link
    document.getElementById('copyReferralLink').addEventListener('click', () => {
        navigator.clipboard.writeText('https://agus777.netlify.app/?ref=agus' + Math.floor(Math.random()*1000));
        showNotification('Link referral disalin!', 'success');
    });
    
    // Daily bonus claim
    document.getElementById('claimDailyBonus').addEventListener('click', () => {
        if (streak >= 3) {
            addBalance(50000);
            showNotification('Bonus harian Rp 50.000 diklaim!', 'success');
            playSound('bonus');
        } else {
            showNotification('Login streak belum cukup!', 'error');
        }
    });
}

// ========== EXTRA: ANIMATIONS ==========
// Tambah keyframes untuk slideOut
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fall {
        to { transform: translateY(100vh) rotate(360deg); }
    }
`;
document.head.appendChild(style);
