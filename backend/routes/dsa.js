const express = require('express');
const router = express.Router();
const DsaProblem = require('../models/DsaProblem');
const DsaProgress = require('../models/DsaProgress');
const auth = require('../middleware/auth');

// GET /api/dsa/problems
// Returns all Striver A2Z problems categorized, enriched with user's progress
router.get('/problems', auth, async (req, res) => {
  try {
    const problems = await DsaProblem.find({ sheetSource: 'striver_a2z' })
      .sort({ orderIndex: 1 });

    const userProgress = await DsaProgress.find({ userId: req.user._id });
    const progressMap = {};
    userProgress.forEach(p => {
      progressMap[p.problemId.toString()] = {
        status: p.status,
        completedVia: p.completedVia,
        completedAt: p.completedAt,
      };
    });

    let totalDone = 0;
    const enrichedProblems = problems.map(prob => {
      const prog = progressMap[prob._id.toString()];
      const isDone = prog?.status === 'done';
      if (isDone) totalDone++;

      return {
        id: prob._id,
        title: prob.title,
        slug: prob.slug,
        category: prob.category,
        step: prob.step,
        difficulty: prob.difficulty,
        link: prob.link,
        status: prog?.status || 'todo',
        completedVia: prog?.completedVia || null,
        completedAt: prog?.completedAt || null,
      };
    });

    // Group by Category
    const categoryMap = {};
    enrichedProblems.forEach(p => {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = {
          name: p.category,
          step: p.step,
          total: 0,
          done: 0,
          problems: [],
        };
      }
      categoryMap[p.category].total++;
      if (p.status === 'done') categoryMap[p.category].done++;
      categoryMap[p.category].problems.push(p);
    });

    res.json({
      totalProblems: problems.length,
      completedCount: totalDone,
      completionPercentage: problems.length > 0 ? Math.round((totalDone / problems.length) * 100) : 0,
      categories: Object.values(categoryMap),
      problems: enrichedProblems,
    });
  } catch (err) {
    console.error('Fetch DSA problems error:', err);
    res.status(500).json({ message: 'Error fetching DSA problems' });
  }
});

// PATCH /api/dsa/progress/:problemId
// Toggle completion of a problem manually
router.patch('/progress/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { status, completedVia = 'manual' } = req.body;

    const problem = await DsaProblem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    let progress = await DsaProgress.findOne({
      userId: req.user._id,
      problemId,
    });

    if (!progress) {
      progress = new DsaProgress({
        userId: req.user._id,
        problemId,
        status: status || 'done',
        completedVia,
        completedAt: status === 'todo' ? null : new Date(),
      });
    } else {
      progress.status = status || (progress.status === 'done' ? 'todo' : 'done');
      progress.completedVia = completedVia;
      progress.completedAt = progress.status === 'done' ? new Date() : null;
    }

    await progress.save();

    res.json({
      problemId,
      status: progress.status,
      completedVia: progress.completedVia,
      completedAt: progress.completedAt,
    });
  } catch (err) {
    console.error('Update DSA progress error:', err);
    res.status(500).json({ message: 'Error updating DSA progress' });
  }
});

module.exports = router;
