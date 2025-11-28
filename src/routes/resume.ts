import { Router, Request, Response } from 'express';
import { orchestrate } from '../orchestrator';
import { UserProfile, JobDescription } from '../types';
import { NoopLLM } from '../llm';

export const resumeRouter = Router();

resumeRouter.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { profile, jobDescription, style } = req.body;

    if (!profile || !jobDescription) {
      res.status(400).json({
        error: 'Missing required fields: profile and jobDescription'
      });
      return;
    }

    const userProfile: UserProfile = profile;
    const jd: JobDescription = jobDescription;

    const llm = new NoopLLM();
    const result = await orchestrate(userProfile, jd, {
      style: style || 'concise',
      llm
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Resume optimization error:', error);
    res.status(500).json({
      error: 'Failed to optimize resume',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

resumeRouter.post('/analyze-jd', async (req: Request, res: Response) => {
  try {
    const { jobDescription, userSkills } = req.body;

    if (!jobDescription) {
      res.status(400).json({
        error: 'Missing required field: jobDescription'
      });
      return;
    }

    const { analyzeJD } = await import('../modules/jdAnalyzer');
    const llm = new NoopLLM();
    const analysis = await analyzeJD(jobDescription, userSkills || [], llm);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('JD analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze job description',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

resumeRouter.post('/score-match', async (req: Request, res: Response) => {
  try {
    const { resume, analysis } = req.body;

    if (!resume || !analysis) {
      res.status(400).json({
        error: 'Missing required fields: resume and analysis'
      });
      return;
    }

    const { scoreMatch } = await import('../modules/matchScorer');
    const score = scoreMatch(resume, analysis);

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    console.error('Match scoring error:', error);
    res.status(500).json({
      error: 'Failed to score match',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
