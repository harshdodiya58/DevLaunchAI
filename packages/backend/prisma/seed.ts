import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const problems = [
  { title: 'Two Sum', difficulty: 'EASY' as const, topic: 'Arrays', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }], testCases: [{ input: '[2,7,11,15],9', expected: '[0,1]' }], constraints: '2 <= nums.length <= 10^4' },
  { title: 'Valid Parentheses', difficulty: 'EASY' as const, topic: 'Stacks', description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.', examples: [{ input: 's = "()[]{}"', output: 'true' }], testCases: [{ input: '"()[]{}"', expected: 'true' }], constraints: '1 <= s.length <= 10^4' },
  { title: 'Reverse Linked List', difficulty: 'EASY' as const, topic: 'Linked Lists', description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.', examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }], testCases: [{ input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' }], constraints: '0 <= nodes <= 5000' },
  { title: 'Binary Search', difficulty: 'EASY' as const, topic: 'Searching', description: 'Given an array of integers nums sorted in ascending order, and an integer target, return the index of target if it exists, else -1.', examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }], testCases: [{ input: '[-1,0,3,5,9,12],9', expected: '4' }], constraints: '1 <= nums.length <= 10^4' },
  { title: 'Maximum Subarray', difficulty: 'MEDIUM' as const, topic: 'Dynamic Programming', description: 'Find the contiguous subarray with the largest sum and return its sum.', examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }], testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' }], constraints: '1 <= nums.length <= 10^5' },
  { title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM' as const, topic: 'Strings', description: 'Given a string s, find the length of the longest substring without repeating characters.', examples: [{ input: 's = "abcabcbb"', output: '3' }], testCases: [{ input: '"abcabcbb"', expected: '3' }], constraints: '0 <= s.length <= 5 * 10^4' },
  { title: '3Sum', difficulty: 'MEDIUM' as const, topic: 'Arrays', description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.', examples: [{ input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }], testCases: [{ input: '[-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' }], constraints: '3 <= nums.length <= 3000' },
  { title: 'LRU Cache', difficulty: 'MEDIUM' as const, topic: 'Design', description: 'Design a data structure that follows the Least Recently Used (LRU) cache strategy.', examples: [{ input: 'LRUCache cache = new LRUCache(2); cache.put(1,1); cache.put(2,2); cache.get(1);', output: '1' }], testCases: [{ input: '["LRUCache","put","put","get","put","get","put","get","get","get"],[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expected: '[null,null,null,1,null,-1,null,-1,3,4]' }], constraints: '1 <= capacity <= 3000' },
  { title: 'Merge K Sorted Lists', difficulty: 'HARD' as const, topic: 'Heaps', description: 'Given an array of k linked-lists, each linked-list is sorted in ascending order, merge all into one sorted list.', examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }], testCases: [{ input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' }], constraints: 'k == lists.length, 0 <= k <= 10^4' },
  { title: 'Word Ladder', difficulty: 'HARD' as const, topic: 'Graphs', description: 'Given two words beginWord and endWord, and a dictionary wordList, return the length of the shortest transformation sequence from beginWord to endWord.', examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }], testCases: [{ input: '"hit","cog",["hot","dot","dog","lot","log","cog"]', expected: '5' }], constraints: '1 <= beginWord.length <= 10' },
];

async function main() {
  console.log('Seeding database...');

  for (const problem of problems) {
    await prisma.codingProblem.create({ data: problem });
  }
  console.log(`Seeded ${problems.length} coding problems`);

  const roadmaps = [
    { title: 'Frontend Developer', category: 'FRONTEND', description: 'Master HTML, CSS, JavaScript, React, and modern frontend tools', isPublished: true, nodes: [
      { id: 'fe-1', title: 'HTML & CSS Fundamentals', resources: ['MDN Web Docs'], duration: '2 weeks' },
      { id: 'fe-2', title: 'JavaScript Core Concepts', resources: ['JavaScript.info'], duration: '4 weeks' },
      { id: 'fe-3', title: 'Git & Version Control', resources: ['GitHub Skills'], duration: '1 week' },
      { id: 'fe-4', title: 'React Fundamentals', resources: ['React Docs'], duration: '4 weeks' },
      { id: 'fe-5', title: 'State Management', resources: ['Zustand Docs'], duration: '2 weeks' },
      { id: 'fe-6', title: 'Frontend Testing', resources: ['Vitest'], duration: '2 weeks' },
      { id: 'fe-7', title: 'TypeScript for Frontend', resources: ['TypeScript Handbook'], duration: '2 weeks' },
      { id: 'fe-8', title: 'Advanced React Patterns', resources: ['React Patterns'], duration: '2 weeks' },
    ]},
    { title: 'Backend Developer', category: 'BACKEND', description: 'Build robust server-side applications with Node.js, databases, and APIs', isPublished: true, nodes: [
      { id: 'be-1', title: 'Node.js Fundamentals', resources: ['Node.js Docs'], duration: '3 weeks' },
      { id: 'be-2', title: 'Express.js & REST APIs', resources: ['Express Docs'], duration: '2 weeks' },
      { id: 'be-3', title: 'Databases (SQL & NoSQL)', resources: ['PostgreSQL Tutorial'], duration: '3 weeks' },
      { id: 'be-4', title: 'Authentication & Authorization', resources: ['JWT.io'], duration: '2 weeks' },
      { id: 'be-5', title: 'Backend Testing', resources: ['Jest'], duration: '1 week' },
      { id: 'be-6', title: 'Docker & Containerization', resources: ['Docker Docs'], duration: '2 weeks' },
      { id: 'be-7', title: 'Deployment & DevOps', resources: ['Railway Docs'], duration: '2 weeks' },
      { id: 'be-8', title: 'Performance & Scaling', resources: ['System Design Primer'], duration: '2 weeks' },
    ]},
    { title: 'Full Stack Developer', category: 'FULLSTACK', description: 'Become a complete full-stack developer', isPublished: true, nodes: [
      { id: 'fs-1', title: 'HTML, CSS & JavaScript', resources: ['MDN Web Docs'], duration: '4 weeks' },
      { id: 'fs-2', title: 'React or Next.js', resources: ['React Docs'], duration: '4 weeks' },
      { id: 'fs-3', title: 'Node.js & Express', resources: ['Node.js Docs'], duration: '3 weeks' },
      { id: 'fs-4', title: 'Full-Stack Databases', resources: ['Prisma Docs'], duration: '2 weeks' },
      { id: 'fs-5', title: 'API Design & GraphQL', resources: ['REST API Design'], duration: '2 weeks' },
      { id: 'fs-6', title: 'Auth & Security', resources: ['OWASP Top 10'], duration: '2 weeks' },
      { id: 'fs-7', title: 'Deployment & CI/CD', resources: ['Vercel Docs'], duration: '2 weeks' },
      { id: 'fs-8', title: 'Monitoring & Observability', resources: ['Sentry Docs'], duration: '1 week' },
    ]},
  ];

  for (const roadmap of roadmaps) {
    await prisma.roadmap.create({ data: roadmap });
  }
  console.log(`Seeded ${roadmaps.length} roadmaps`);

  console.log('Database seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
