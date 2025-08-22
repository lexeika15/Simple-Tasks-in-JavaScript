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
    container = document.querySelector('.posts');
    countInput = document.querySelector('#countInput');
    userIdInput = document.querySelector('#userIdInput');
    randomCheckbox = document.querySelector('#randomCheckbox');
    titleInput = document.querySelector('#titleInput');
    searchButton = document.querySelector('#searchButton');

    fetch('../posts.json', { method: 'GET' })
        .then(response => {
            if(!response.ok)
                throw new Error('Ошибка сети: ' + response.status);
        return response.json();
        })
        .then(data => {
            console.log('Все посты: ', data);
            allPosts = data;
            uniqueUserIds = [...new Set(allPosts.map(p => Number(p.userId)))].sort((a, b) => a-b);
            renderPosts(allPosts.slice(0, 30));
        })
        .catch(error => console.error('Ошибка: ', error));

    searchButton.addEventListener('click', () => {
        stopRandomMode();
        const count = getCountFromInput();
        const userId = getUserIdFromInput();
        if ((userId === null || userId === 'invalid') &&
            (count  === null || count  === 'invalid')) { return;}
        container.innerHTML = `<p style="font-size: 18px; font-weight: bold;">Ищем...</p>`;
        setTimeout(() => {
            container.innerHTML = '';
            let postsToShow = [...allPosts];
            if(userId != null) postsToShow = postsToShow.filter(p => Number(p.userId) === userId);
            if(count != null) postsToShow = postsToShow.slice(0, count);
            renderPosts(postsToShow);
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
            container.innerHTML = '';
            if(q === '') {
                renderPosts(allPosts.slice(0,30));
                return;
            }
            const filtered = allPosts.filter(p => (p.title ?? '').toLowerCase().includes(q));
            renderPosts(filtered);
        });
    }
});

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

function getCountFromInput() {
    const raw = (countInput?.value ?? '').trim();
    if(raw === '') return null;
    const count = Number(raw);
    if(!Number.isInteger(count) || count < 1 || count > 100) {
        alert('Введите значение count от 1 до 99');
        return 'invalid';
    }
    return count;
}

function getUserIdFromInput() {
    const raw = (userIdInput?.value ?? '').trim();
    if(raw === '') return null;
    const userId = Number(raw);
    if(!Number.isInteger(userId) || userId < 1 || userId > 10) {
        alert('Введите значение UserId от 1 до 10');
        return 'invalid';
    }
    return userId;
}

function getRandomUnusedUserId() {
    if(!uniqueUserIds.length) return null;
    if(usedUserIds.size >= uniqueUserIds.length) return null;
    const pool = uniqueUserIds.filter(id => !usedUserIds.has(id));
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

function renderRandomTick() {
    const count = getCountFromInput();
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
    if(count !== null) posts = posts.slice(0, count);
    if(!posts.length) container.innerHTML = `<p>У пользователя #${uid} нет постов. </p>`;
    else {
        container.innerHTML = '';
        container.innerHTML = `<h3 style="margin: 0 0 8px;">Пользователь #${uid}</h3>`;
        renderPosts(posts);
    }
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