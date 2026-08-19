import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const defaultProblems = [
  {
    title: 'Two Sum',
    difficulty: 'EASY',
    topic: 'Arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' }
    ]
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'EASY',
    topic: 'Stacks',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}"',
    testCases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' }
    ]
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'EASY',
    topic: 'Linked Lists',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }
    ],
    constraints: 'The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000',
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' }
    ]
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'MEDIUM',
    topic: 'Dynamic Programming',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' }
    ]
  },
  {
    title: 'Merge K Sorted Lists',
    difficulty: 'HARD',
    topic: 'Heaps',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }
    ],
    constraints: 'k == lists.length\n0 <= k <= 10^4\n0 <= lists[i].length <= 500',
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' }
    ]
  }
];

export class CodingService {
  async seedDefaultProblems() {
    const count = await prisma.codingProblem.count();
    if (count > 0) return;

    for (const problem of defaultProblems) {
      await prisma.codingProblem.create({
        data: {
          title: problem.title,
          difficulty: problem.difficulty as any,
          topic: problem.topic,
          description: problem.description,
          examples: problem.examples,
          constraints: problem.constraints,
          testCases: problem.testCases
        }
      });
    }
  }
  async listProblems(topic?: string, difficulty?: string) {
    const where: Record<string, unknown> = {};
    if (topic) where.topic = topic;
    if (difficulty) where.difficulty = difficulty.toUpperCase();

    return prisma.codingProblem.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { title: 'asc' }],
      select: { id: true, title: true, difficulty: true, topic: true },
    });
  }

  async getProblem(problemId: string) {
    const problem = await prisma.codingProblem.findUnique({ where: { id: problemId } });
    if (!problem) throw new AppError(404, 'PROBLEM_NOT_FOUND', 'Coding problem not found');
    return problem;
  }

  async submit(userId: string, problemId: string, code: string, language: string) {
    const problem = await this.getProblem(problemId);

    const submission = await prisma.codingSubmission.create({
      data: { userId, problemId, code, language, status: 'PENDING' },
    });

    const result = await this.evaluateCode(code, language, problem.testCases as any[]);

    const updated = await prisma.codingSubmission.update({
      where: { id: submission.id },
      data: { status: result.status, aiFeedback: result.feedback },
    });

    return { ...updated, consoleOutput: result.consoleOutput };
  }

  async getUserSubmissions(userId: string, problemId?: string) {
    const where: Record<string, unknown> = { userId };
    if (problemId) where.problemId = problemId;
    return prisma.codingSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      include: { problem: { select: { title: true, difficulty: true } } },
    });
  }

  async getStats(userId: string) {
    const submissions = await prisma.codingSubmission.findMany({
      where: { userId },
      include: { problem: true },
    });

    const uniqueSolved = new Set(
      submissions.filter((s: any) => s.status === 'PASSED').map((s: any) => s.problemId)
    );

    return {
      totalSubmissions: submissions.length,
      problemsSolved: uniqueSolved.size,
      byDifficulty: {
        EASY: submissions.filter((s: any) => s.problem?.difficulty === 'EASY' && s.status === 'PASSED').length,
        MEDIUM: submissions.filter((s: any) => s.problem?.difficulty === 'MEDIUM' && s.status === 'PASSED').length,
        HARD: submissions.filter((s: any) => s.problem?.difficulty === 'HARD' && s.status === 'PASSED').length,
      },
      byTopic: this.groupByTopic(submissions),
    };
  }

  private groupByTopic(submissions: any[]) {
    const topics: Record<string, number> = {};
    submissions.filter(s => s.status === 'PASSED').forEach(s => {
      const topic = s.problem?.topic || 'Unknown';
      topics[topic] = (topics[topic] || 0) + 1;
    });
    return topics;
  }

  private async evaluateCode(code: string, language: string, testCases: any[]): Promise<{ status: any; feedback: string; consoleOutput: string }> {
    try {
      const aiService = (await import('./ai.service')).aiService;
      const prompt = `You are a code evaluator. Evaluate the following ${language} code against the given test cases.

Code:
${code.substring(0, 4000)}

Test Cases:
${JSON.stringify(testCases)}

Respond ONLY with a JSON object:
{
  "status": "PASSED|FAILED|ERROR",
  "passedTests": 0,
  "totalTests": 0,
  "feedback": "Detailed feedback on code quality, correctness, and suggestions for improvement",
  "consoleOutput": "Simulated standard output resulting from print/console.log statements in the code. If none, return an empty string.",
  "timeComplexity": "O(n)",
  "spaceComplexity": "O(n)"
}`;

      const result = await aiService['callLLM'](prompt);
      const cleanJson = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.error('EVALUATION ERROR:', err);
      return {
        status: 'ERROR',
        feedback: 'Failed to evaluate code properly. Please check for obvious syntax errors and try again.',
        consoleOutput: '',
      };
    }
  }
}

export const codingService = new CodingService();
