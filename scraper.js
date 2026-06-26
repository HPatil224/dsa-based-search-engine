const puppeteer = require('puppeteer');
const fs = require('fs');

let allProblems = [];

async function scrapeCodeforces() {
    console.log("Fetching Codeforces via API...");
    try {
        const response = await fetch('https://codeforces.com/api/problemset.problems');
        const data = await response.json();
        if (data.status !== "OK") return;

        // SCALED UP: Grabbing 1000 problems
        const rawProblems = data.result.problems.slice(0, 1000); 
        const problems = rawProblems.map(p => ({
            id: `CF-${p.contestId}${p.index}`,
            title: p.name,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            source: 'codeforces',
            difficulty: p.rating ? p.rating.toString() : 'Unknown',
            tags: p.tags || [],
            description: p.name
        }));

        console.log(`Found ${problems.length} Codeforces problems.`);
        allProblems.push(...problems);
    } catch (error) {
        console.error("Codeforces error:", error);
    }
}

async function scrapeAtCoder() {
    console.log("Fetching AtCoder via Kenkoooo API...");
    try {
        const response = await fetch('https://kenkoooo.com/atcoder/resources/problems.json');
        const data = await response.json();
        
        // SCALED UP: Grabbing 1000 problems
        const rawProblems = data.slice(0, 1000); 
        const problems = rawProblems.map(p => ({
            id: `AC-${p.id}`,
            title: p.title,
            url: `https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`,
            source: 'atcoder',
            difficulty: 'Standard',
            tags: [],
            description: p.title
        }));

        console.log(`Found ${problems.length} AtCoder problems.`);
        allProblems.push(...problems);
    } catch (error) {
        console.error("AtCoder error:", error);
    }
}

async function scrapeLeetCode(page) {
    console.log("Scraping LeetCode via internal GraphQL API...");
    await page.goto('https://leetcode.com', { waitUntil: 'domcontentloaded' });

    const problems = await page.evaluate(async () => {
        const query = {
            query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
              problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                questions: data { title titleSlug frontendQuestionId: questionFrontendId difficulty topicTags { name } }
              }
            }`,
            // SCALED UP: Limit set to 1000
            variables: { categorySlug: "", skip: 0, limit: 1000, filters: {} }
        };

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(query)
        });

        const data = await response.json();
        const rawProblems = data.data.problemsetQuestionList.questions;

        return rawProblems.map(p => ({
            id: `LC-${p.frontendQuestionId}`,
            title: p.title,
            url: `https://leetcode.com/problems/${p.titleSlug}/`,
            source: 'leetcode',
            difficulty: p.difficulty,
            tags: p.topicTags.map(tag => tag.name),
            description: p.title
        }));
    });

    console.log(`Found ${problems.length} LeetCode problems.`);
    allProblems.push(...problems);
}

async function scrapeCSES(page) {
    console.log("Scraping CSES Problem Set...");
    await page.goto('https://cses.fi/problemset/', { waitUntil: 'domcontentloaded' });

    const problems = await page.evaluate(() => {
        const results = [];
        const links = document.querySelectorAll('.task a'); 
        
        links.forEach(link => {
            const title = link.innerText.trim();
            const url = link.href;
            const idMatch = url.match(/task\/(\d+)/);
            
            if (idMatch) {
                results.push({
                    id: `CSES-${idMatch[1]}`,
                    title: title,
                    url: url,
                    source: 'cses',
                    difficulty: 'Standard',
                    tags: ['cses'],
                    description: title
                });
            }
        });
        // SCALED UP: No slice, returning all ~300 problems
        return results; 
    });

    console.log(`Found ${problems.length} CSES problems.`);
    allProblems.push(...problems);
}

async function scrapeData() {
    console.log("Launching browser for web scraping...");
    const browser = await puppeteer.launch({ headless: "new" }); 
    const page = await browser.newPage();

    try {
        await scrapeCodeforces(); 
        await scrapeAtCoder();    
        await scrapeLeetCode(page);
        await scrapeCSES(page);
    } catch (err) {
        console.error("Error during scraping:", err);
    } finally {
        await browser.close();
    }

    fs.writeFileSync('./problems/problems.json', JSON.stringify(allProblems, null, 2));
    console.log(`✅ Scraping complete! Saved ${allProblems.length} problems to problems.json.`);
}

scrapeData();