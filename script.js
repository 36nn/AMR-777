document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initTheme();
});

// Drag functionality
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentModal = null;

function startDrag(e, modal) {
    isDragging = true;
    currentModal = modal;
    let rect = modal.getBoundingClientRect();
    modal.style.transform = 'none';
    modal.style.left = rect.left + 'px';
    modal.style.top = rect.top + 'px';
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
}

function drag(e) {
    if (isDragging && currentModal) {
        currentModal.style.left = (e.clientX - dragOffsetX) + 'px';
        currentModal.style.top = (e.clientY - dragOffsetY) + 'px';
    }
}

function stopDrag() {
    isDragging = false;
    currentModal = null;
}

document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDrag);


let notes = JSON.parse(localStorage.getItem('notes')) || [];
// Ensure old format is converted
if (notes.length > 0 && typeof notes[0] === 'string') {
    notes = notes.map(text => ({text, done: false}));
}
let midGoals = JSON.parse(localStorage.getItem('midGoals')) || [];
if (midGoals.length > 0 && typeof midGoals[0] === 'string') {
    midGoals = midGoals.map(text => ({text}));
}
let globalGoals = JSON.parse(localStorage.getItem('globalGoals')) || [];
if (globalGoals.length > 0 && typeof globalGoals[0] === 'string') {
    globalGoals = globalGoals.map(text => ({text}));
}
let completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
let chestType = localStorage.getItem('chestType') || null;

let coins = parseInt(localStorage.getItem('coins')) || 0;
let potions = JSON.parse(localStorage.getItem('potions')) || {antidebuff: 0, speed: 0, gold: 0};
let artifactFragments = parseInt(localStorage.getItem('artifactFragments')) || 0;
let amulets = parseInt(localStorage.getItem('amulets')) || 0;
let scrolls = parseInt(localStorage.getItem('scrolls')) || 0;

function loadData() {
    // Загрузка статов
    const exp = 0; // Обнулено
    const level = 1; // Обнулено
    const hp = parseInt(localStorage.getItem('hp')) || 100;
    updateDisplay(exp, level, hp);
    saveStats(exp, level, 0, hp); // Сохранить обнуленные, strike=0

    // Загрузка лута
    coins = parseInt(localStorage.getItem('coins')) || 0;
    potions = JSON.parse(localStorage.getItem('potions')) || {antidebuff: 0, speed: 0, gold: 0};
    artifactFragments = parseInt(localStorage.getItem('artifactFragments')) || 0;
    amulets = parseInt(localStorage.getItem('amulets')) || 0;
    scrolls = parseInt(localStorage.getItem('scrolls')) || 0;

    // Показать сундук если есть
    if (chestType) {
        document.getElementById('chest').style.display = 'block';
        document.getElementById('chest').textContent = chestType;
    }

    // Загрузка заметок, среднесрочных и глобальных целей
    renderNotes();
    renderMidGoals();
    renderGlobalGoals();
    createInventoryGrid();
}

function saveStats(exp, level, strike, hp) {
    localStorage.setItem('exp', exp);
    localStorage.setItem('level', level);
    localStorage.setItem('strike', strike);
    localStorage.setItem('hp', hp);
}

function updateDisplay(exp, level, hp) {
    document.getElementById('level').textContent = level;
    let required = getRequiredExp(level);
    document.getElementById('exp-display').textContent = Math.floor(exp) + ' / ' + required;
    document.getElementById('hp').value = hp;
    let percent = (exp / required) * 100;
    document.getElementById('progress-fill').style.width = percent + '%';
    updateBalance();
}

function updateBalance() {
    document.getElementById('balance').textContent = `Баланс: ${coins}`;
}

function saveMidGoals() {
    localStorage.setItem('midGoals', JSON.stringify(midGoals));
}

function saveGlobalGoals() {
    localStorage.setItem('globalGoals', JSON.stringify(globalGoals));
}

function saveCompletedTasks() {
    localStorage.setItem('completedTasks', completedTasks);
}

function renderNotes() {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.className = 'note';
        if (note.done) li.classList.add('done');

        const input = document.createElement('input');
        input.value = note.text;
        input.addEventListener('input', (e) => {
            // Find index by position in DOM
            const allNotes = Array.from(document.querySelectorAll('.note input'));
            const currentIndex = allNotes.indexOf(e.target);
            if (currentIndex !== -1) {
                notes[currentIndex].text = e.target.value;
                saveNotes();
            }
        });

        const completeBtn = document.createElement('span');
        completeBtn.textContent = '✓';
        completeBtn.className = 'icon complete';
        completeBtn.addEventListener('click', () => {
            const allNotes = Array.from(document.querySelectorAll('.note input'));
            const currentIndex = allNotes.indexOf(input);
            if (currentIndex !== -1) {
                notes.splice(currentIndex, 1);
                updateStats('completed');
                renderNotes();
                saveNotes();
            }
        });

        const failBtn = document.createElement('span');
        failBtn.textContent = '✗';
        failBtn.className = 'icon fail';
        failBtn.addEventListener('click', () => {
            const allNotes = Array.from(document.querySelectorAll('.note input'));
            const currentIndex = allNotes.indexOf(input);
            if (currentIndex !== -1) {
                notes.splice(currentIndex, 1);
                updateStats('failed');
                renderNotes();
                saveNotes();
            }
        });

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.addEventListener('click', () => {
            if (index > 0) {
                [notes[index], notes[index - 1]] = [notes[index - 1], notes[index]];
                renderNotes();
                saveNotes();
            }
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.addEventListener('click', () => {
            if (index < notes.length - 1) {
                [notes[index], notes[index + 1]] = [notes[index + 1], notes[index]];
                renderNotes();
                saveNotes();
            }
        });

        li.appendChild(input);
        li.appendChild(completeBtn);
        li.appendChild(failBtn);
        li.appendChild(upBtn);
        li.appendChild(downBtn);
        list.appendChild(li);
    });
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function renderMidGoals() {
    const list = document.getElementById('mid-goals-list');
    list.innerHTML = '';
    midGoals.forEach((goal, index) => {
        const li = document.createElement('li');
        li.className = 'goal';

        const input = document.createElement('input');
        input.value = goal.text;
        input.addEventListener('input', (e) => {
            const allGoals = Array.from(document.querySelectorAll('#mid-goals-list input'));
            const currentIndex = allGoals.indexOf(e.target);
            if (currentIndex !== -1) {
                midGoals[currentIndex].text = e.target.value;
                saveMidGoals();
            }
        });

        const completeBtn = document.createElement('span');
        completeBtn.textContent = '✓';
        completeBtn.className = 'icon complete';
        completeBtn.addEventListener('click', () => {
            const allGoals = Array.from(document.querySelectorAll('#mid-goals-list input'));
            const currentIndex = allGoals.indexOf(input);
            if (currentIndex !== -1) {
                midGoals.splice(currentIndex, 1);
                updateStats('completed');
                // Give legendary chest for completing mid-term goal
                chestType = 'легендарный';
                localStorage.setItem('chestType', chestType);
                document.getElementById('chest').style.display = 'block';
                document.getElementById('chest').textContent = chestType;
                renderMidGoals();
                saveMidGoals();
            }
        });

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.addEventListener('click', () => {
            if (index > 0) {
                [midGoals[index], midGoals[index - 1]] = [midGoals[index - 1], midGoals[index]];
                renderMidGoals();
                saveMidGoals();
            }
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.addEventListener('click', () => {
            if (index < midGoals.length - 1) {
                [midGoals[index], midGoals[index + 1]] = [midGoals[index + 1], midGoals[index]];
                renderMidGoals();
                saveMidGoals();
            }
        });

        li.appendChild(input);
        li.appendChild(completeBtn);
        li.appendChild(upBtn);
        li.appendChild(downBtn);
        list.appendChild(li);
    });
}

function renderGlobalGoals() {
    const list = document.getElementById('global-goals-list');
    list.innerHTML = '';
    globalGoals.forEach((goal, index) => {
        const li = document.createElement('li');
        li.className = 'goal';

        const input = document.createElement('input');
        input.value = goal.text;
        input.addEventListener('input', (e) => {
            const allGoals = Array.from(document.querySelectorAll('#global-goals-list input'));
            const currentIndex = allGoals.indexOf(e.target);
            if (currentIndex !== -1) {
                globalGoals[currentIndex].text = e.target.value;
                saveGlobalGoals();
            }
        });

        const completeBtn = document.createElement('span');
        completeBtn.textContent = '✓';
        completeBtn.className = 'icon complete';
        completeBtn.addEventListener('click', () => {
            const allGoals = Array.from(document.querySelectorAll('#global-goals-list input'));
            const currentIndex = allGoals.indexOf(input);
            if (currentIndex !== -1) {
                globalGoals.splice(currentIndex, 1);
                updateStats('completed');
                renderGlobalGoals();
                saveGlobalGoals();
            }
        });

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.addEventListener('click', () => {
            if (index > 0) {
                [globalGoals[index], globalGoals[index - 1]] = [globalGoals[index - 1], globalGoals[index]];
                renderGlobalGoals();
                saveGlobalGoals();
            }
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.addEventListener('click', () => {
            if (index < globalGoals.length - 1) {
                [globalGoals[index], globalGoals[index + 1]] = [globalGoals[index + 1], globalGoals[index]];
                renderGlobalGoals();
                saveGlobalGoals();
            }
        });

        li.appendChild(input);
        li.appendChild(completeBtn);
        li.appendChild(upBtn);
        li.appendChild(downBtn);
        list.appendChild(li);
    });
}

function addNote() {
    notes.push({text: 'Новая заметка', done: false});
    renderNotes();
    saveNotes();
}

function addMidGoal() {
    midGoals.push({text: 'Новая цель'});
    renderMidGoals();
    saveMidGoals();
}

function addGlobalGoal() {
    globalGoals.push({text: 'Новая цель'});
    renderGlobalGoals();
    saveGlobalGoals();
}

function createInventoryGrid() {
    const grid = document.querySelector('.inventory-grid');
    grid.innerHTML = '';
    const itemDescriptions = {
        antidebuff: 'Зелье антидебафа: Восстанавливает 20 HP и снимает негативные эффекты.',
        speed: 'Зелье ускорения: Увеличивает скорость выполнения задач на 50% на 1 час.',
        gold: 'Зелье золота: Увеличивает доход от лута на 100% на следующий сундук.',
        fragment: 'Фрагмент артефакта: Соберите 3, чтобы получить амулет.',
        amulet: 'Амулет: Повышает максимальный HP на 10.',
        scroll: 'Защитный свиток: Блокирует следующий провал задачи.'
    };
    const items = [
        {type: 'antidebuff', count: potions.antidebuff, image: 'apps_29805_14478994967251976_1fe20a17-044a-4c1d-b5-no-bg-preview (carve.photos).png'},
        {type: 'speed', count: potions.speed, image: 'i-no-bg-preview (carve.photos).png'},
        {type: 'gold', count: potions.gold, image: 'apps_62003_13960015020777823_cee4347e-2b33-4142-83-no-bg-preview (carve.photos).png'},
        {type: 'fragment', count: artifactFragments, image: '1323c4b7812112a2c274c72f2ccddbb5-no-bg-preview (carve.photos).png'},
        {type: 'amulet', count: amulets, image: 'cb1723a57a4d27dc89a69e2f38205f9c-no-bg-preview (carve.photos).png'},
        {type: 'scroll', count: scrolls, image: '9eb4d11a1e7373524852c6aa01b4058b-no-bg-preview (carve.photos).png'}
    ];
    items.forEach(item => {
        const cell = document.createElement('div');
        cell.className = 'inventory-cell';
        if (item.count > 0) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.type;
            img.style.width = '82px';
            img.style.height = '82px';
            itemDiv.appendChild(img);
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = itemDescriptions[item.type];
            itemDiv.appendChild(tooltip);
            itemDiv.addEventListener('mouseover', () => {
                tooltip.classList.add('show');
            });
            itemDiv.addEventListener('mouseout', () => {
                tooltip.classList.remove('show');
            });
            itemDiv.addEventListener('click', () => openUseModal(item.type));
            if (item.count > 1) {
                const countDiv = document.createElement('div');
                countDiv.className = 'item-count';
                countDiv.textContent = item.count;
                itemDiv.appendChild(countDiv);
            }
            cell.appendChild(itemDiv);
        }
        grid.appendChild(cell);
    });
    // Заполнить пустыми ячейками до 20
    for (let i = items.length; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'inventory-cell';
        grid.appendChild(cell);
    }
}

function createShopGrid() {
    const grid = document.querySelector('.shop-grid');
    grid.innerHTML = '';
    const items = [
        {name: 'Зелье антидебафа', price: 10, type: 'antidebuff'},
        {name: 'Зелье ускорения', price: 15, type: 'speed'},
        {name: 'Зелье золота', price: 20, type: 'gold'},
        {name: 'Амулет', price: 50, type: 'amulet'},
        {name: 'Защитный свиток', price: 30, type: 'scroll'},
        {name: 'Фрагмент артефакта', price: 5, type: 'fragment'}
    ];
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shop-item';
        card.innerHTML = `
            <h4>${item.name}</h4>
            <p>Цена: ${item.price} монет</p>
            <button onclick="buyItem('${item.type}', ${item.price})">Купить</button>
        `;
        grid.appendChild(card);
    });
    updateShopBalance();
}

function buyItem(type, price) {
    if (coins >= price) {
        coins -= price;
        if (type === 'antidebuff') potions.antidebuff++;
        else if (type === 'speed') potions.speed++;
        else if (type === 'gold') potions.gold++;
        else if (type === 'amulet') amulets++;
        else if (type === 'scroll') scrolls++;
        else if (type === 'fragment') artifactFragments++;
        saveLoot();
        createInventoryGrid();
        updateDisplay(0, 0, 0); // обновить отображаемое
        alert(`Куплено: ${type}`);
    } else {
        alert('Недостаточно монет!');
    }
}

function updateShopBalance() {
    document.getElementById('shop-balance').textContent = `Баланс: ${coins}`;
}

function closeModal(modalType) {
    document.getElementById(modalType + '-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').textContent = '☀️';
    } else {
        document.getElementById('theme-toggle').textContent = '🌙';
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('theme-toggle').textContent = isDark ? '☀️' : '🌙';
}


function updateStats(action, extraLevels = 0) {
    let exp = Math.floor(parseInt(localStorage.getItem('exp')) || 0);
    let level = parseInt(localStorage.getItem('level')) || 1;
    let hp = parseInt(localStorage.getItem('hp')) || 100;

    if (action === 'completed') {
        hp = Math.min(100, hp + 5);
        completedTasks++;
        if (completedTasks % 10 === 0) {
            chestType = getChestType();
            localStorage.setItem('chestType', chestType);
            document.getElementById('chest').style.display = 'block';
            document.getElementById('chest').textContent = chestType;
        }
        if (extraLevels > 0) {
            level += extraLevels;
            exp = 0;
        } else {
            exp += 5;
            exp = Math.floor(exp);
            let required = getRequiredExp(level);
            if (exp >= required) {
                level += 1;
                exp = 0;
            }
        }
    } else if (action === 'failed') {
        hp = Math.max(0, hp - 10);
    }

    updateDisplay(exp, level, hp);
    saveStats(exp, level, 0, hp);
    saveCompletedTasks();
}

function getRequiredExp(level) {
    return Math.floor(11.35 * Math.pow(level, 1.4));
}

function getChestType() {
    const rand = Math.random();
    if (rand < 0.7) return 'обычный';
    if (rand < 0.9) return 'редкий';
    if (rand < 0.97) return 'эпический';
    return 'легендарный';
}

function saveLoot() {
    localStorage.setItem('coins', coins);
    localStorage.setItem('potions', JSON.stringify(potions));
    localStorage.setItem('artifactFragments', artifactFragments);
    localStorage.setItem('amulets', amulets);
    localStorage.setItem('scrolls', scrolls);
}

function addXP(amount) {
    let exp = parseInt(localStorage.getItem('exp')) || 0;
    let level = parseInt(localStorage.getItem('level')) || 1;
    let hp = parseInt(localStorage.getItem('hp')) || 100;

    exp += amount;
    let required = getRequiredExp(level);
    while (exp >= required) {
        exp -= required;
        level += 1;
        required = getRequiredExp(level);
    }

    updateDisplay(exp, level, hp);
    saveStats(exp, level, 0, hp);
}

function generateLoot(chestType) {
    let lootMessage = '';
    if (chestType === 'обычный') {
        let coinGain = Math.floor(Math.random() * 5) + 1;
        coins += coinGain;
        lootMessage += `Монеты: +${coinGain}`;
        let xpGain = Math.floor(Math.random() * 5) + 1;
        addXP(xpGain);
        lootMessage += `, XP: +${xpGain}`;
        if (Math.random() < 0.3) {
            potions.antidebuff += 1;
            lootMessage += `, Зелье антидебафа: +1`;
        }
    } else if (chestType === 'редкий') {
        let coinGain = Math.floor(Math.random() * 11) + 5;
        coins += coinGain;
        lootMessage += `Монеты: +${coinGain}`;
        let xpGain = Math.floor(Math.random() * 11) + 5;
        addXP(xpGain);
        lootMessage += `, XP: +${xpGain}`;
        if (Math.random() < 0.4) {
            potions.speed += 1;
            lootMessage += `, Зелье ускорения: +1`;
        }
        if (Math.random() < 0.3) {
            artifactFragments += 1;
            lootMessage += `, Фрагмент артефакта: +1`;
            if (artifactFragments >= 3) {
                artifactFragments -= 3;
                amulets += 1;
                lootMessage += ` (собрано 3 фрагмента → Амулет: +1)`;
            }
        }
    } else if (chestType === 'эпический') {
        let coinGain = Math.floor(Math.random() * 16) + 15;
        coins += coinGain;
        lootMessage += `Монеты: +${coinGain}`;
        let xpGain = Math.floor(Math.random() * 16) + 15;
        addXP(xpGain);
        lootMessage += `, XP: +${xpGain}`;
        if (Math.random() < 0.5) {
            potions.gold += 1;
            lootMessage += `, Зелье золота: +1`;
        }
        if (Math.random() < 0.4) {
            amulets += 1;
            lootMessage += `, Амулет: +1`;
        }
        if (Math.random() < 0.3) {
            scrolls += 1;
            lootMessage += `, Защитный свиток: +1`;
        }
    } else if (chestType === 'легендарный') {
        let coinGain = Math.floor(Math.random() * 21) + 30;
        coins += coinGain;
        lootMessage += `Монеты: +${coinGain}`;
        let xpGain = Math.floor(Math.random() * 21) + 30;
        addXP(xpGain);
        lootMessage += `, XP: +${xpGain}`;
        if (Math.random() < 0.3) {
            potions.gold += 2;
            lootMessage += `, Зелье золота: +2`;
        } else if (Math.random() < 0.6) {
            amulets += 2;
            lootMessage += `, Амулет: +2`;
        } else {
            scrolls += 2;
            lootMessage += `, Защитный свиток: +2`;
        }
    }
    saveLoot();
    createInventoryGrid();
    return lootMessage;
}

// Event listeners для кнопок
document.getElementById('add-note').addEventListener('click', addNote);
document.getElementById('add-mid-goal').addEventListener('click', addMidGoal);
document.getElementById('add-global-goal').addEventListener('click', addGlobalGoal);
document.getElementById('reset-stats').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});

document.getElementById('inventory-btn').addEventListener('click', () => {
    const modal = document.getElementById('inventory-modal');
    const isVisible = modal.style.display === 'block';
    modal.style.display = isVisible ? 'none' : 'block';
    document.body.style.overflow = isVisible ? 'auto' : 'hidden';
});

document.getElementById('shop-btn').addEventListener('click', () => {
    const modal = document.getElementById('shop-modal');
    const isVisible = modal.style.display === 'block';
    modal.style.display = isVisible ? 'none' : 'block';
    document.body.style.overflow = isVisible ? 'auto' : 'hidden';
    if (!isVisible) createShopGrid();
});


document.getElementById('theme-toggle').addEventListener('click', toggleTheme);



document.getElementById('chest').addEventListener('click', () => {
    const currentChestType = chestType;
    const lootMessage = generateLoot(currentChestType);
    chestType = null;
    localStorage.setItem('chestType', '');
    document.getElementById('chest').style.display = 'none';
    document.getElementById('congrats-text').textContent = `Вы открыли ${currentChestType} сундук! Получена награда: ${lootMessage}`;
    document.getElementById('congrats-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
});

function openUseModal(type) {
    document.getElementById('use-item-text').textContent = `Хотите использовать ${type}?`;
    document.getElementById('use-item-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    window.currentItemType = type;
}

function useItem() {
    const type = window.currentItemType;
    if (type === 'antidebuff') {
        potions.antidebuff--;
        // Восстановить HP
        let hp = parseInt(localStorage.getItem('hp')) || 100;
        hp = Math.min(100, hp + 20);
        updateDisplay(0, parseInt(localStorage.getItem('level')) || 1, hp);
        saveStats(0, parseInt(localStorage.getItem('level')) || 1, 0, hp);
        alert('Восстановлено 20 HP');
    } else if (type === 'speed') {
        potions.speed--;
        alert('Ускорение активировано на 1 час');
    } else if (type === 'gold') {
        potions.gold--;
        alert('Золотой бонус активирован');
    } else if (type === 'amulet') {
        amulets--;
        alert('Максимальный HP увеличен на 10');
    } else if (type === 'scroll') {
        scrolls--;
        alert('Защитный свиток активирован');
    }
    saveLoot();
    createInventoryGrid();
    closeModal('use-item');
}

document.getElementById('use-yes').addEventListener('click', useItem);
document.getElementById('use-no').addEventListener('click', () => closeModal('use-item'));