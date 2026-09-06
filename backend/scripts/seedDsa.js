require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const DsaProblem = require('../models/DsaProblem');

const striverA2ZProblems = [
  // Step 1: Learn the basics
  { slug: 'user-input-output', title: 'User Input / Output in C++/Java/Python', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://takeuforward.org/plus/dsa/basics' },
  { slug: 'count-digits', title: 'Count Digits in a Number', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://leetcode.com/problems/count-digits/' },
  { slug: 'reverse-a-number', title: 'Reverse a Number', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-integer/' },
  { slug: 'check-palindrome-number', title: 'Check Palindrome Number', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://leetcode.com/problems/palindrome-number/' },
  { slug: 'gcd-or-hcf', title: 'Find GCD / HCF of Two Numbers', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/find-gcd-of-two-numbers/' },
  { slug: 'armstrong-numbers', title: 'Check Armstrong Number', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://leetcode.com/problems/armstrong-number/' },
  { slug: 'print-all-divisors', title: 'Print all Divisors of a Number', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/print-all-divisors-of-a-given-number/' },
  { slug: 'check-for-prime', title: 'Check if a Number is Prime', category: '1. Basics', step: 'Step 1', difficulty: 'Easy', link: 'https://leetcode.com/problems/prime-arrangements/' },

  // Step 2: Sorting Techniques
  { slug: 'selection-sort', title: 'Selection Sort', category: '2. Sorting', step: 'Step 2', difficulty: 'Easy', link: 'https://takeuforward.org/sorting/selection-sort-algorithm/' },
  { slug: 'bubble-sort', title: 'Bubble Sort', category: '2. Sorting', step: 'Step 2', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/bubble-sort-algorithm/' },
  { slug: 'insertion-sort', title: 'Insertion Sort', category: '2. Sorting', step: 'Step 2', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/insertion-sort-algorithm/' },
  { slug: 'merge-sort', title: 'Merge Sort Algorithm', category: '2. Sorting', step: 'Step 2', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-an-array/' },
  { slug: 'quick-sort', title: 'Quick Sort Algorithm', category: '2. Sorting', step: 'Step 2', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/quick-sort-algorithm/' },

  // Step 3: Arrays (Easy / Medium / Hard)
  { slug: 'largest-element-in-array', title: 'Largest Element in an Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/' },
  { slug: 'second-largest-element', title: 'Second Largest Element without Sorting', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/find-second-smallest-and-second-largest-element-in-an-array/' },
  { slug: 'check-sorted-array', title: 'Check if Array is Sorted and Rotated', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/' },
  { slug: 'remove-duplicates-sorted-array', title: 'Remove Duplicates from Sorted Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
  { slug: 'rotate-array-by-k-places', title: 'Rotate Array by K Places', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-array/' },
  { slug: 'move-zeroes-to-end', title: 'Move Zeroes to End', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/move-zeroes/' },
  { slug: 'linear-search', title: 'Linear Search', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/linear-search-in-c/' },
  { slug: 'union-of-two-sorted-arrays', title: 'Union of Two Sorted Arrays', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/union-of-two-sorted-arrays/' },
  { slug: 'missing-number', title: 'Find Missing Number in an Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/missing-number/' },
  { slug: 'max-consecutive-ones', title: 'Maximum Consecutive Ones', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/max-consecutive-ones/' },
  { slug: 'two-sum', title: 'Two Sum Problem', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
  { slug: 'sort-colors', title: 'Sort an Array of 0s, 1s, and 2s (Dutch National Flag)', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/sort-colors/' },
  { slug: 'majority-element', title: 'Majority Element (> n/2 times)', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/majority-element/' },
  { slug: 'kadanes-algorithm', title: 'Maximum Subarray Sum (Kadane\'s Algorithm)', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-subarray/' },
  { slug: 'best-time-to-buy-and-sell-stock', title: 'Stock Buy and Sell', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
  { slug: 'rearrange-array-elements-by-sign', title: 'Rearrange Array Elements by Sign', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/' },
  { slug: 'next-permutation', title: 'Next Permutation', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/next-permutation/' },
  { slug: 'leaders-in-an-array', title: 'Leaders in an Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Easy', link: 'https://takeuforward.org/data-structure/leaders-in-an-array/' },
  { slug: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence in an Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
  { slug: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/set-matrix-zeroes/' },
  { slug: 'rotate-matrix-90-degrees', title: 'Rotate Image / Matrix by 90 Degrees', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotate-image/' },
  { slug: 'spiral-matrix', title: 'Spiral Traversal of Matrix', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/spiral-matrix/' },
  { slug: '3-sum', title: '3 Sum - Triplet Sum to Zero', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/3sum/' },
  { slug: '4-sum', title: '4 Sum Problem', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/4sum/' },
  { slug: 'merge-intervals', title: 'Merge Overlapping Sub-intervals', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-intervals/' },
  { slug: 'merge-sorted-array', title: 'Merge Two Sorted Arrays Without Extra Space', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/merge-sorted-array/' },
  { slug: 'find-repeating-and-missing-number', title: 'Find the Repeating and Missing Number', category: '3. Arrays', step: 'Step 3', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/find-the-repeating-and-missing-number/' },
  { slug: 'count-inversions', title: 'Count Inversions in an Array', category: '3. Arrays', step: 'Step 3', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/count-inversions-in-an-array/' },
  { slug: 'reverse-pairs', title: 'Reverse Pairs', category: '3. Arrays', step: 'Step 3', difficulty: 'Hard', link: 'https://leetcode.com/problems/reverse-pairs/' },
  { slug: 'maximum-product-subarray', title: 'Maximum Product Subarray', category: '3. Arrays', step: 'Step 3', difficulty: 'Medium', link: 'https://leetcode.com/problems/maximum-product-subarray/' },

  // Step 4: Binary Search
  { slug: 'binary-search-to-find-x', title: 'Binary Search to Find X in Sorted Array', category: '4. Binary Search', step: 'Step 4', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-search/' },
  { slug: 'lower-bound-and-upper-bound', title: 'Implement Lower Bound and Upper Bound', category: '4. Binary Search', step: 'Step 4', difficulty: 'Easy', link: 'https://takeuforward.org/arrays/implement-lower-bound-bs-2/' },
  { slug: 'search-insert-position', title: 'Search Insert Position', category: '4. Binary Search', step: 'Step 4', difficulty: 'Easy', link: 'https://leetcode.com/problems/search-insert-position/' },
  { slug: 'first-and-last-occurrence', title: 'Find First and Last Position of Element', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/' },
  { slug: 'search-in-rotated-sorted-array', title: 'Search in Rotated Sorted Array I & II', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { slug: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum in Rotated Sorted Array', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { slug: 'single-element-in-sorted-array', title: 'Single Element in a Sorted Array', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/single-element-in-a-sorted-array/' },
  { slug: 'find-peak-element', title: 'Find Peak Element', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/find-peak-element/' },
  { slug: 'square-root-of-a-number', title: 'Find Square Root of a Number in log N', category: '4. Binary Search', step: 'Step 4', difficulty: 'Easy', link: 'https://leetcode.com/problems/sqrtx/' },
  { slug: 'koko-eating-bananas', title: 'Koko Eating Bananas', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/koko-eating-bananas/' },
  { slug: 'capacity-to-ship-packages', title: 'Capacity to Ship Packages within D Days', category: '4. Binary Search', step: 'Step 4', difficulty: 'Medium', link: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/' },
  { slug: 'aggressive-cows', title: 'Aggressive Cows', category: '4. Binary Search', step: 'Step 4', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/aggressive-cows-detailed-solution/' },
  { slug: 'book-allocation-problem', title: 'Book Allocation Problem', category: '4. Binary Search', step: 'Step 4', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/allocate-minimum-number-of-pages/' },
  { slug: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays of Different Sizes', category: '4. Binary Search', step: 'Step 4', difficulty: 'Hard', link: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },

  // Step 5: Strings
  { slug: 'remove-outermost-parentheses', title: 'Remove Outermost Parentheses', category: '5. Strings', step: 'Step 5', difficulty: 'Easy', link: 'https://leetcode.com/problems/remove-outermost-parentheses/' },
  { slug: 'reverse-words-in-string', title: 'Reverse Words in a String', category: '5. Strings', step: 'Step 5', difficulty: 'Medium', link: 'https://leetcode.com/problems/reverse-words-in-a-string/' },
  { slug: 'largest-odd-number-in-string', title: 'Largest Odd Number in String', category: '5. Strings', step: 'Step 5', difficulty: 'Easy', link: 'https://leetcode.com/problems/largest-odd-number-in-string/' },
  { slug: 'longest-common-prefix', title: 'Longest Common Prefix', category: '5. Strings', step: 'Step 5', difficulty: 'Easy', link: 'https://leetcode.com/problems/longest-common-prefix/' },
  { slug: 'isomorphic-strings', title: 'Isomorphic Strings', category: '5. Strings', step: 'Step 5', difficulty: 'Easy', link: 'https://leetcode.com/problems/isomorphic-strings/' },
  { slug: 'valid-anagram', title: 'Valid Anagram', category: '5. Strings', step: 'Step 5', difficulty: 'Easy', link: 'https://leetcode.com/problems/valid-anagram/' },
  { slug: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', category: '5. Strings', step: 'Step 5', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-palindromic-substring/' },
  { slug: 'string-to-integer-atoi', title: 'Implement Atoi (String to Integer)', category: '5. Strings', step: 'Step 5', difficulty: 'Medium', link: 'https://leetcode.com/problems/string-to-integer-atoi/' },

  // Step 6: Linked List
  { slug: 'reverse-linked-list', title: 'Reverse a Linked List [Iterative + Recursive]', category: '6. Linked List', step: 'Step 6', difficulty: 'Easy', link: 'https://leetcode.com/problems/reverse-linked-list/' },
  { slug: 'middle-of-linked-list', title: 'Middle of the Linked List [Tortoise & Hare]', category: '6. Linked List', step: 'Step 6', difficulty: 'Easy', link: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
  { slug: 'detect-loop-in-linked-list', title: 'Detect a Loop in Linked List', category: '6. Linked List', step: 'Step 6', difficulty: 'Easy', link: 'https://leetcode.com/problems/linked-list-cycle/' },
  { slug: 'find-starting-point-of-loop', title: 'Find Starting Point of Loop in Linked List', category: '6. Linked List', step: 'Step 6', difficulty: 'Medium', link: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
  { slug: 'check-if-ll-is-palindrome', title: 'Check if Linked List is Palindrome', category: '6. Linked List', step: 'Step 6', difficulty: 'Medium', link: 'https://leetcode.com/problems/palindrome-linked-list/' },
  { slug: 'remove-nth-node-from-end', title: 'Remove Nth Node from End of List', category: '6. Linked List', step: 'Step 6', difficulty: 'Medium', link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
  { slug: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', category: '6. Linked List', step: 'Step 6', difficulty: 'Easy', link: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { slug: 'intersection-of-two-linked-lists', title: 'Find Intersection Point of Y Linked List', category: '6. Linked List', step: 'Step 6', difficulty: 'Medium', link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/' },
  { slug: 'flattening-a-linked-list', title: 'Flattening a Linked List', category: '6. Linked List', step: 'Step 6', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/flattening-a-linked-list/' },

  // Step 7: Trees & Binary Trees
  { slug: 'binary-tree-inorder-traversal', title: 'Binary Tree Inorder Traversal', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/' },
  { slug: 'binary-tree-preorder-traversal', title: 'Binary Tree Preorder Traversal', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-preorder-traversal/' },
  { slug: 'binary-tree-postorder-traversal', title: 'Binary Tree Postorder Traversal', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/binary-tree-postorder-traversal/' },
  { slug: 'binary-tree-level-order-traversal', title: 'Level Order Traversal / BFS', category: '7. Trees', step: 'Step 7', difficulty: 'Medium', link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { slug: 'maximum-depth-of-binary-tree', title: 'Height / Maximum Depth of Binary Tree', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { slug: 'balanced-binary-tree', title: 'Check for Balanced Binary Tree', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/balanced-binary-tree/' },
  { slug: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', category: '7. Trees', step: 'Step 7', difficulty: 'Easy', link: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
  { slug: 'maximum-path-sum-binary-tree', title: 'Binary Tree Maximum Path Sum', category: '7. Trees', step: 'Step 7', difficulty: 'Hard', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
  { slug: 'lowest-common-ancestor-binary-tree', title: 'Lowest Common Ancestor for Two Given Nodes', category: '7. Trees', step: 'Step 7', difficulty: 'Medium', link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/' },
  { slug: 'serialize-and-deserialize-binary-tree', title: 'Serialize and Deserialize Binary Tree', category: '7. Trees', step: 'Step 7', difficulty: 'Hard', link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },

  // Step 8: Graphs
  { slug: 'number-of-provinces', title: 'Number of Provinces / Connected Components', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-provinces/' },
  { slug: 'number-of-islands', title: 'Number of Islands (BFS / DFS)', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://leetcode.com/problems/number-of-islands/' },
  { slug: 'rotting-oranges', title: 'Rotting Oranges (BFS)', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://leetcode.com/problems/rotting-oranges/' },
  { slug: 'detect-cycle-in-undirected-graph', title: 'Detect Cycle in Undirected Graph (BFS/DFS)', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/detect-cycle-in-an-undirected-graph-using-bfs/' },
  { slug: 'topological-sort-kahns-algo', title: 'Topological Sort / Kahn\'s Algorithm', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/topological-sort-bfs/' },
  { slug: 'dijkstras-algorithm', title: 'Dijkstra\'s Shortest Path Algorithm', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/dijkstras-algorithm-using-priority-queue/' },
  { slug: 'bellman-ford-algorithm', title: 'Bellman-Ford Algorithm (Detect Negative Cycle)', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/bellman-ford-algorithm-shortest-distance-with-negative-cycles/' },
  { slug: 'floyd-warshall-algorithm', title: 'Floyd Warshall Algorithm (All Pairs Shortest Path)', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/floyd-warshall-algorithm/' },
  { slug: 'prims-algorithm-mst', title: 'Prim\'s Algorithm for Minimum Spanning Tree', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/prims-algorithm-minimum-spanning-tree-c-and-java/' },
  { slug: 'kruskals-algorithm-disjoint-set', title: 'Kruskal\'s Algorithm & Disjoint Set Union', category: '8. Graphs', step: 'Step 8', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/kruskals-algorithm-minimum-spanning-tree-mst-c-and-java/' },

  // Step 9: Dynamic Programming
  { slug: 'climbing-stairs', title: 'Climbing Stairs', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Easy', link: 'https://leetcode.com/problems/climbing-stairs/' },
  { slug: 'frog-jump', title: 'Frog Jump with K Steps', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/dynamic-programming-frog-jump-with-k-distances-dp-4/' },
  { slug: 'house-robber', title: 'House Robber / Maximum Sum of Non-Adjacent Elements', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://leetcode.com/problems/house-robber/' },
  { slug: 'ninja-training', title: 'Ninja\'s Training (2D DP)', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/dynamic-programming-ninjas-training-dp-7/' },
  { slug: 'grid-unique-paths', title: 'Grid Unique Paths', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://leetcode.com/problems/unique-paths/' },
  { slug: '0-1-knapsack-problem', title: '0/1 Knapsack Problem', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/0-1-knapsack-dp-19/' },
  { slug: 'subset-sum-equal-to-k', title: 'Subset Sum Equal to Target K', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://takeuforward.org/data-structure/subset-sum-equal-to-target-dp-14/' },
  { slug: 'coin-change', title: 'Coin Change Minimum Coins', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://leetcode.com/problems/coin-change/' },
  { slug: 'longest-common-subsequence', title: 'Longest Common Subsequence (LCS)', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { slug: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence (LIS)', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Medium', link: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { slug: 'edit-distance', title: 'Edit Distance', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Hard', link: 'https://leetcode.com/problems/edit-distance/' },
  { slug: 'matrix-chain-multiplication', title: 'Matrix Chain Multiplication (MCM Partition DP)', category: '9. Dynamic Programming', step: 'Step 9', difficulty: 'Hard', link: 'https://takeuforward.org/data-structure/matrix-chain-multiplication-dp-48/' },
];

async function seed() {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('MONGODB_URI missing');
      process.exit(1);
    }
    const cleanedUri = connStr.replace(/<([^>]+)>/g, '$1');
    await mongoose.connect(cleanedUri);
    console.log('Connected to MongoDB for DSA seeding...');

    await DsaProblem.deleteMany({ sheetSource: 'striver_a2z' });
    console.log('Cleared existing Striver A2Z problems.');

    const docs = striverA2ZProblems.map((prob, index) => ({
      ...prob,
      sheetSource: 'striver_a2z',
      orderIndex: index,
    }));

    await DsaProblem.insertMany(docs);
    console.log(`✅ Successfully seeded ${docs.length} Striver A2Z DSA problems!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
