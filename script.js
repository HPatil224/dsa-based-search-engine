document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const loading = document.getElementById('loading');

    const performSearch = async () => {
        const query = searchInput.value.trim();
        // NEW: Grab the value from the dropdown filter
        const source = document.getElementById('sourceFilter').value; 
        
        if (!query) return;

        // UI Updates
        loading.classList.remove('hidden');
        resultsContainer.innerHTML = '';

        try {
            // NEW: Pass BOTH the query and the source filter to the backend
            const response = await fetch(`/search?q=${encodeURIComponent(query)}&source=${source}`);
            const data = await response.json();

            loading.classList.add('hidden');

            if (data.results.length === 0) {
                resultsContainer.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #64748b;">
                        <svg style="width: 48px; height: 48px; margin-bottom: 1rem; opacity: 0.5;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p>No problems found for "<strong>${data.query}</strong>". Try different keywords.</p>
                    </div>`;
                return;
            }

            // Generate HTML for each problem card
            const html = data.results.map((problem, index) => `
                <div class="problem-card" id="card-${index}">
                    <h3><a href="${problem.url}" target="_blank">${problem.title}</a></h3>
                    <div>
                        <span class="badge source-${problem.source}">${problem.source}</span>
                        <span class="badge badge-diff">Diff: ${problem.difficulty}</span>
                        <span class="badge badge-score" title="TF-IDF Relevance Score">Score: ${problem.relevanceScore}</span>
                    </div>
                    <div class="tags">
                        <strong>Tags:</strong> ${problem.tags && problem.tags.length > 0 ? problem.tags.join(', ') : '<span style="opacity: 0.5">None extracted</span>'}
                    </div>
                </div>
            `).join('');

            resultsContainer.innerHTML = html;

            // Trigger staggered cascade animation
            data.results.forEach((_, index) => {
                setTimeout(() => {
                    const card = document.getElementById(`card-${index}`);
                    if (card) card.classList.add('show');
                }, index * 80); // 80ms delay between each card appearing
            });
            
        } catch (error) {
            loading.classList.add('hidden');
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444; background: #fef2f2; border-radius: 12px; margin-top: 2rem;">
                    <p><strong>Connection Error</strong></p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">Could not reach the search engine backend.</p>
                </div>`;
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});