document.addEventListener('DOMContentLoaded', () => {
    fetch('../posts.json', { method: 'GET' })
        .then(response => {
            if(!response.ok)
                throw new Error('Ошибка сети: ' + response.status);
        return response.json();
        })
        .then(posts => {
            console.log('Все посты: ', posts);
            renderPosts(posts.slice(0, 30));
        })
        .catch(error => console.error('Ошибка: ', error));
});

function renderPosts(posts) {
    const container = document.querySelector('.posts');
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