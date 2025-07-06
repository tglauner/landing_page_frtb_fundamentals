document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    fetch('footer.html')
        .then(response => response.text())
        .then(html => {
            placeholder.innerHTML = html;
        })
        .catch(err => console.error('Failed to load footer:', err));
});
