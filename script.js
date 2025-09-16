document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

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
let hasChest = localStorage.getItem('hasChest') === 'true';

function loadData() {
    // Загрузка статов
    const exp = 0; // Обнулено
    const level = 1; // Обнулено
    const hp = parseInt(localStorage.getItem('hp')) || 100;
    updateDisplay(exp, level, hp);
    saveStats(exp, level, 0, hp); // Сохранить обнуленные, strike=0

    // Показать сундук если есть
    if (hasChest) {
        document.getElementById('chest').style.display = 'block';
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
                updateStats('completed', 10);
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
    for (let i = 0; i < 20; i++) {
        const cell = document.createElement('div');
        cell.className = 'inventory-cell';
        grid.appendChild(cell);
    }
}


function updateStats(action, extraLevels = 0) {
    let exp = Math.floor(parseInt(localStorage.getItem('exp')) || 0);
    let level = parseInt(localStorage.getItem('level')) || 1;
    let hp = parseInt(localStorage.getItem('hp')) || 100;

    if (action === 'completed') {
        hp = Math.min(100, hp + 5);
        completedTasks++;
        if (completedTasks % 10 === 0) {
            if (Math.random() < 0.5) {
                hasChest = true;
                localStorage.setItem('hasChest', 'true');
                document.getElementById('chest').style.display = 'block';
            }
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

document.getElementById('inventory-modal').addEventListener('click', () => {
    document.getElementById('inventory-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

document.getElementById('chest').addEventListener('click', () => {
    hasChest = false;
    localStorage.setItem('hasChest', 'false');
    document.getElementById('chest').style.display = 'none';
    // Можно добавить награду, например alert('Вы открыли сундук!');
    alert('Вы открыли сундук! Получена награда!');
});