// utils/problemSchema.js

// This factory function ensures every scraped problem follows the exact same structure.
module.exports = {
    createProblem: (id, title, url, source, difficulty, tags, description) => ({
        id,          // e.g., "LC-1" or "CF-1752A"
        title,       // e.g., "Two Sum"
        url,         // Full link to the problem
        source,      // "leetcode" | "codeforces"
        difficulty,  // "Easy", "Medium", "Hard", or numerical rating
        tags,        // Array of strings, e.g., ["arrays", "hash-table"]
        description  // Text block used later for TF-IDF indexing
    })
};