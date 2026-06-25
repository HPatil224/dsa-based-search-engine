const puppeteer = require('puppeteer');
const fs = require('fs');

let allProblems = [];

async function scrapeCodeforces(page) {
    console.log("Scraping Codeforces via API...");
    // Go to a lightweight page to establish context
    await page.goto('https://codeforces.com', { waitUntil: 'domcontentloaded' });

    const problems = await page.evaluate(async () => {
        // Hit their official public API
        const response = await fetch('https://codeforces.com/api/problemset.problems');
        const data = await response.json();

        if (data.status !== "OK") return [];

        // Slice to 50 problems so we don't overwhelm the index right away
        const rawProblems = data.result.problems.slice(0, 50);

        return rawProblems.map(p => ({
            id: `CF-${p.contestId}${p.index}`,
            title: p.name,
            url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
            source: 'codeforces',
            difficulty: p.rating ? p.rating.toString() : 'Unknown',
            tags: p.tags || [],
            description: p.name
        }));
    });

    console.log(`Found ${problems.length} Codeforces problems.`);
    allProblems.push(...problems);
}

async function scrapeLeetCode(page) {
    console.log("Scraping LeetCode via internal GraphQL API...");
    // Go to the homepage to grab valid cookies/headers
    await page.goto('https://leetcode.com', { waitUntil: 'domcontentloaded' });

    const problems = await page.evaluate(async () => {
        // LeetCode's internal GraphQL query to fetch problem lists
        const query = {
            query: `query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
              problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                questions: data {
                  title
                  titleSlug
                  frontendQuestionId: questionFrontendId
                  difficulty
                  topicTags { name }
                }
              }
            }`,
            variables: { categorySlug: "", skip: 0, limit: 50, filters: {} }
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

async function scrapeData() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: "new" }); 
    const page = await browser.newPage();

    try {
        await scrapeCodeforces(page);
        await scrapeLeetCode(page);
    } catch (err) {
        console.error("Error during scraping:", err);
    } finally {
        await browser.close();
    }

    // Save the data to our JSON file
    fs.writeFileSync(
        './problems/problems.json', 
        JSON.stringify(allProblems, null, 2)
    );
    console.log(`✅ Scraping complete! Saved ${allProblems.length} problems to problems.json.`);
}

scrapeData();