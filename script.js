document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const loading = document.getElementById('loading');

    const performSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        // UI Updates
        loading.classList.remove('hidden');
        resultsContainer.innerHTML = '';

        try {
            // Hit our Express API
            const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            loading.classList.add('hidden');

            // Right now, our API only returns a placeholder note.
            // We'll update this rendering logic in Phase 6 once TF-IDF is working.
            resultsContainer.innerHTML = `
                <div class="problem-card">
                    <h3>API Response:</h3>
                    <p><strong>Query:</strong> ${data.query}</p>
                    <p><strong>Note:</strong> ${data.note}</p>
                </div>
            `;
            
        } catch (error) {
            loading.classList.add('hidden');
            resultsContainer.innerHTML = `<p style="color: red;">Error connecting to server.</p>`;
        }
    };

    // Trigger search on button click or pressing Enter
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});