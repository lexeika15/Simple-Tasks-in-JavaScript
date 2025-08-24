let container;
let countInput;
let userIdInput;
let randomCheckbox;
let titleInput;
let searchButton;

let allPosts = [];
let randomTimer = null;
let uniqueUserIds = [];
const usedUserIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initElements();
    loadPosts();
    registerEventHandlers();
});

function initElements() {
    container = document.querySelector('.posts');
    countInput = document.querySelector('#countInput');
    userIdInput = document.querySelector('#userIdInput');
    randomCheckbox = document.querySelector('#randomCheckbox');
    titleInput = document.querySelector('#titleInput');
    searchButton = document.querySelector('#searchButton');
}

async function loadPosts() {
    try {
        const response = await fetch('../posts.json', { method: 'GET' });
        if(!response.ok) 
            throw new Error('Ошибка сети: ' + response.status);

        const data = await response.json();
        console.log("Все посты: ", data);

        allPosts = data;
        uniqueUserIds = [...new Set(allPosts.map(p => Number(p.userId)))].sort((a, b) => a - b);
        renderPosts(allPosts.slice(0, 30));
    }
    catch(error) {
        console.error("Ошибка: ", error);
    }
}

function registerEventHandlers() {
    searchButton.addEventListener('click', () => {
        stopRandomMode();
        const count = getNumberFromInput(countInput, 1, 100, 'Введите значение count от 1 до 100');
        const userId = getNumberFromInput(userIdInput, 1, 10, 'Введите значение userId от 1 до 10');
        if ((userId === null || userId === 'invalid') &&
            (count  === null || count  === 'invalid')) { return; }
        container.innerHTML = `<p style="font-size: 18px; font-weight: bold;">Ищем...</p>`;
        setTimeout(() => {
            updatePosts({ count, userId });
        }, 3000);
    });

    if(randomCheckbox) {
        randomCheckbox.addEventListener('change', (e) => {
            if(e.target.checked) startRandomMode();
            else {
                stopRandomMode();
                container.innerHTML = '';
            }
        });
    }

    if(titleInput) {
        titleInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if(q === '') {
                updatePosts({ count: 30 });
                return;
            }
            updatePosts({ query: q });
        });
    }
}

function updatePosts({ count = null, userId = null, query = '', showHeaderAfterClear = false } = {}) {
    container.innerHTML = '';
    if(showHeaderAfterClear) container.innerHTML = `<h3 style="margin: 0 0 8px;">Пользователь #${userId}</h3>`;
    let postsToShow = [...allPosts];
    if (query) {
        postsToShow = postsToShow.filter(p => (p.title ?? '').toLowerCase().includes(query.toLowerCase()));
    }

    if (userId != null && userId !== 'invalid') {
        postsToShow = postsToShow.filter(p => Number(p.userId) === userId);
    }

    if (count != null && count !== 'invalid') {
        postsToShow = postsToShow.slice(0, count);
    }

    renderPosts(postsToShow);
}

function renderPosts(posts) {
    posts.forEach(post => {
        const el = document.createElement('div');
        el.className = 'post';
        el.innerHTML = `<h2>${post.title}</h2><p>${post.body}</p>`;
        el.style.border = '1px solid #ccc';
        el.style.borderRadius = '6px';
        el.style.padding = '10px';
        el.style.marginBottom = '12px';
        container.appendChild(el);
    });
}

function getNumberFromInput(inputElement, min, max, errorMessage) {
    const raw = (inputElement?.value ?? '').trim();
    if(raw === '') return null;

    const value = Number(raw);
    if(!Number.isInteger(value) || value < min || value > max) {
        alert(errorMessage);
        return 'invalid';
    }

    return value;
}

function getRandomUnusedUserId() {
    if(!uniqueUserIds.length) return null;
    if(usedUserIds.size >= uniqueUserIds.length) return null;
    const pool = uniqueUserIds.filter(id => !usedUserIds.has(id));
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

function renderRandomTick() {
    const count = getNumberFromInput(countInput, 1, 100, 'Введите значение count от 1 до 100');
    if(count === 'invalid') {
        stopRandomMode();
        return;
    }

    const uid = getRandomUnusedUserId();
    if(uid === null) {
        stopRandomMode();
        container.innerHTML = `<p>Все пользователи уже показаны. Включите рандом снова, чтобы начать заново. </p>`;
        return;
    }

    let posts = allPosts.filter(p => Number(p.userId) === uid);
    if(!posts.length) container.innerHTML = `<p>У пользователя #${uid} нет постов. </p>`;
    else updatePosts({ count, userId: uid, showHeaderAfterClear: true});

    usedUserIds.add(uid);
}

function startRandomMode() {
    usedUserIds.clear();
    if(userIdInput) userIdInput.disabled = true;
    renderRandomTick();
    randomTimer = setInterval(renderRandomTick, 3000);
}

function stopRandomMode() {
    if(randomTimer) {
        clearInterval(randomTimer);
        randomTimer = null;
    }

    if(randomCheckbox) randomCheckbox.checked = false;
    if(userIdInput) userIdInput.disabled = false;
}