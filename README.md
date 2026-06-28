# DSA Hybrid Search Engine

A full-stack search engine designed to aggregate and index over 3,000 algorithmic programming problems across multiple competitive programming platforms. The engine utilizes a custom hybrid Natural Language Processing (NLP) architecture, combining TF-IDF semantic scoring with fuzzy string matching to deliver highly accurate, typo-tolerant search results.

## Features

* **Multi-Platform Aggregation:** Automatically scrapes and normalizes problem data from LeetCode, Codeforces, AtCoder, and CSES.
* **Anti-Bot Evasion:** Bypasses standard web scraping protections (e.g., Cloudflare) by intercepting internal GraphQL queries and public REST APIs using Puppeteer and Node.js.
* **Hybrid Search Algorithm:** Implements TF-IDF from scratch to rank conceptual relevance, merged with Fuse.js to ensure high typo-tolerance for misspelled algorithms or data structures.
* **Dynamic Platform Filtering:** Allows users to narrow down search results to specific platforms before or after scoring.
* **Lightweight Architecture:** Features a low-latency Express.js backend and a Vanilla JavaScript frontend with staggered DOM rendering, requiring no heavy client-side frameworks.

## Tech Stack

* **Backend & API:** Node.js, Express.js
* **Data Pipeline:** Puppeteer, REST/GraphQL API Interception
* **Search & NLP:** Natural (TF-IDF), Stopword, Fuse.js
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## Project Structure

```text
├── assets/                  # UI assets and logos
├── corpus/                  # Generated index files
│   ├── corpus.json          # Cleaned, tokenized text mappings
│   └── tfidf_index.json     # Serialized mathematical term-frequency index
├── problems/                # Raw data storage
│   └── problems.json        # Normalized JSON of all aggregated problems
├── utils/                   # Shared utilities and configurations
├── buildCorpus.js           # NLP processing script (Tokenization & TF-IDF indexing)
├── index.js                 # Express server and hybrid search API
├── scrape.js                # Multi-platform data aggregation script
├── index.html               # Frontend UI
├── script.js                # Client-side API fetching and DOM manipulation
└── styles.css               # UI styling and staggered animation logic
