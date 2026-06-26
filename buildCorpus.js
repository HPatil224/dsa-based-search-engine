const express = require('express');
const path = require('path');
const fs = require('fs');
const natural = require('natural');
const sw = require('stopword');
const Fuse = require('fuse.js'); // NEW: Fuzzy string matching

const app = express();
const PORT = 3000;

console.log("Loading data and booting hybrid search engine...");
const problems = JSON.parse(fs.readFileSync('./problems/problems.json', 'utf8'));
const corpus = JSON.parse(fs.readFileSync('./corpus/corpus.json', 'utf8'));

// 1. Setup TF-IDF
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
corpus.forEach(doc => tfidf.addDocument(doc.processedText));
const tokenizer = new natural.WordTokenizer();

// 2. Setup Fuse.js for Typo Tolerance
const fuse = new Fuse(problems, {
    keys: ['title', 'tags'],
    includeScore: true,
    threshold: 0.4 // Lower is stricter matching
});

app.use(express.static(path.join(__dirname)));

app.get('/search', (req, res) => {
    const query = req.query.q;
    const sourceFilter = req.query.source;
    if (!query) return res.status(400).json({ error: "Missing search query" });

    const rawTokens = tokenizer.tokenize(query.toLowerCase());
    const queryTokens = sw.removeStopwords(rawTokens);
    
    // We use a Map to merge scores from both TF-IDF and Fuse.js without duplicating problems
    let resultsMap = new Map();

    // -- HYBRID ENGINE PART A: TF-IDF (Semantic/Keyword Scoring) --
    tfidf.tfidfs(queryTokens, (index, score) => {
        if (score > 0) {
            const p = problems.find(prob => prob.id === corpus[index].id);
            if (!sourceFilter || sourceFilter === 'all' || p.source === sourceFilter) {
                resultsMap.set(p.id, { problem: p, score: score * 10 }); // Scale up TF-IDF
            }
        }
    });

    // -- HYBRID ENGINE PART B: Fuse.js (Typo Tolerance / Exact Match) --
    const fuseResults = fuse.search(query);
    fuseResults.forEach(res => {
        const p = res.item;
        if (!sourceFilter || sourceFilter === 'all' || p.source === sourceFilter) {
            // Fuse score is 0.0 (perfect) to 1.0 (mismatch). Invert it to make higher better.
            const fuseScore = (1 - res.score) * 15; 
            if (resultsMap.has(p.id)) {
                resultsMap.get(p.id).score += fuseScore; // Boost existing score
            } else {
                resultsMap.set(p.id, { problem: p, score: fuseScore }); // Add new fuzzy match
            }
        }
    });

    // Convert Map back to array and sort by our custom hybrid score
    const scoredResults = Array.from(resultsMap.values()).sort((a, b) => b.score - a.score);

    const topResults = scoredResults.slice(0, 15).map(result => ({
        ...result.problem,
        relevanceScore: result.score.toFixed(2)
    }));

    res.json({ query, totalMatches: scoredResults.length, results: topResults });
});

app.listen(PORT, () => console.log(`🚀 Engine live at http://localhost:${PORT}`));