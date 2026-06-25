const fs = require('fs');
const natural = require('natural');
const sw = require('stopword');

// Initialize NLP tools
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();
const tokenizer = new natural.WordTokenizer();

console.log("Loading scraped problems...");
// Make sure you actually have problems inside this file from Phase 2!
const problemsRaw = fs.readFileSync('./problems/problems.json', 'utf8');
const problems = JSON.parse(problemsRaw);

const corpusData = [];

console.log("Cleaning text and building TF-IDF index...");

problems.forEach((problem, index) => {
    // 1. Combine title and tags to form our searchable text.
    // (If you scraped full descriptions later, you'd add problem.description here too)
    let rawText = `${problem.title} ${problem.tags.join(' ')}`.toLowerCase();
    
    // 2. Tokenize: Break the string down into individual words
    let tokens = tokenizer.tokenize(rawText);
    
    // 3. Remove Stopwords: Strip out common useless words ("the", "is", "a")
    let cleanTokens = sw.removeStopwords(tokens);
    
    // 4. Rejoin into a clean string
    let processedText = cleanTokens.join(' ');
    
    // 5. Add this document to our TF-IDF model
    tfidf.addDocument(processedText);
    
    // Save a reference mapping back to the original problem ID
    corpusData.push({
        documentIndex: index,
        id: problem.id,
        processedText: processedText
    });
});

// Save the clean text mapping so our server can boot up fast
fs.writeFileSync(
    './corpus/corpus.json', 
    JSON.stringify(corpusData, null, 2)
);

// Optional: Save the mathematical TF-IDF state if you want to inspect it
fs.writeFileSync(
    './corpus/tfidf_index.json', 
    JSON.stringify(tfidf)
);

console.log(`✅ Successfully cleaned and indexed ${problems.length} problems!`);