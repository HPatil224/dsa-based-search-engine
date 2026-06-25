const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve the static frontend files (HTML, CSS, JS) from the root directory
app.use(express.static(path.join(__dirname)));

// Health-check route to confirm the server is running
app.get('/health', (req, res) => {
    res.json({ status: "ok", message: "DSA Search Engine server is running." });
});

// Search API stub (To be fully implemented in Phase 5)
app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Missing search query" });
    }
    
    res.json({ 
        query: query, 
        results: [], 
        note: "TF-IDF search logic will be wired up here in Phase 5." 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Test health check: http://localhost:${PORT}/health`);
});