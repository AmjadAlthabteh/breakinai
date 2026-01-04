/**
 * AI-powered resume bullet point strength analyzer
 * Evaluates bullet points based on multiple criteria
 */

export interface StrengthScore {
  overall: number; // 0-100
  hasActionVerb: boolean;
  hasMetrics: boolean;
  hasImpact: boolean;
  hasContext: boolean;
  wordCount: number;
  isOptimalLength: boolean;
  suggestions: string[];
  rating: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
}

export interface BulletAnalysis {
  original: string;
  strength: StrengthScore;
  enhanced?: string;
}

// Strong action verbs for resume bullets
const ACTION_VERBS = new Set([
  'achieved', 'accelerated', 'accomplished', 'administered', 'analyzed', 'architected',
  'automated', 'built', 'championed', 'collaborated', 'created', 'delivered',
  'designed', 'developed', 'drove', 'engineered', 'enhanced', 'established',
  'executed', 'expanded', 'generated', 'grew', 'implemented', 'improved',
  'increased', 'initiated', 'launched', 'led', 'managed', 'optimized',
  'orchestrated', 'pioneered', 'reduced', 'resolved', 'scaled', 'spearheaded',
  'streamlined', 'strengthened', 'transformed', 'unified'
]);

// Weak verbs to avoid
const WEAK_VERBS = new Set([
  'helped', 'worked', 'did', 'made', 'was', 'were', 'responsible', 'duties',
  'assisted', 'contributed', 'participated', 'involved', 'handled'
]);

/**
 * Analyze a single resume bullet point
 */
export function analyzeBulletStrength(bullet: string): StrengthScore {
  const trimmed = bullet.trim();
  const words = trimmed.split(/\s+/);
  const firstWord = words[0]?.toLowerCase() || '';
  const wordCount = words.length;

  // Check for action verb
  const hasActionVerb = ACTION_VERBS.has(firstWord);
  const hasWeakVerb = WEAK_VERBS.has(firstWord);

  // Check for metrics (numbers, percentages, dollar amounts)
  const hasMetrics = /\d+/.test(trimmed) &&
    (/\d+%|\$\d+|\d+x|\d+\+|by \d+|over \d+|under \d+/i.test(trimmed));

  // Check for impact indicators
  const impactWords = /improve|increase|reduce|save|enhance|optimize|boost|accelerate|streamline|scale/i;
  const hasImpact = impactWords.test(trimmed);

  // Check for context (mentions technology, methodology, or business outcome)
  const techPattern = /React|Node|Python|Java|AWS|Azure|API|database|machine learning|AI|cloud/i;
  const methodPattern = /agile|scrum|CI\/CD|TDD|microservices|REST|GraphQL/i;
  const outcomePattern = /revenue|cost|efficiency|performance|customer|user|engagement|conversion/i;
  const hasContext = techPattern.test(trimmed) || methodPattern.test(trimmed) || outcomePattern.test(trimmed);

  // Optimal length: 15-25 words
  const isOptimalLength = wordCount >= 15 && wordCount <= 25;

  // Generate suggestions
  const suggestions: string[] = [];

  if (!hasActionVerb) {
    if (hasWeakVerb) {
      suggestions.push(`Replace weak verb "${firstWord}" with a strong action verb like: achieved, developed, led`);
    } else {
      suggestions.push('Start with a strong action verb (e.g., built, improved, led)');
    }
  }

  if (!hasMetrics) {
    suggestions.push('Add quantifiable metrics (e.g., "by 40%", "$2M revenue", "500+ users")');
  }

  if (!hasImpact) {
    suggestions.push('Emphasize impact with words like improved, increased, reduced, or optimized');
  }

  if (!hasContext) {
    suggestions.push('Add technical context or business outcome for clarity');
  }

  if (wordCount < 10) {
    suggestions.push('Expand with more detail - aim for 15-25 words');
  } else if (wordCount > 30) {
    suggestions.push('Simplify - keep bullets concise (15-25 words)');
  }

  // Calculate overall score (0-100)
  let score = 0;
  if (hasActionVerb) score += 30;
  if (hasMetrics) score += 30;
  if (hasImpact) score += 20;
  if (hasContext) score += 15;
  if (isOptimalLength) score += 5;

  // Penalties
  if (hasWeakVerb) score -= 15;
  if (wordCount < 10) score -= 10;
  if (wordCount > 30) score -= 5;

  score = Math.max(0, Math.min(100, score));

  // Determine rating
  let rating: StrengthScore['rating'];
  if (score >= 85) rating = 'excellent';
  else if (score >= 70) rating = 'strong';
  else if (score >= 55) rating = 'good';
  else if (score >= 35) rating = 'fair';
  else rating = 'weak';

  return {
    overall: score,
    hasActionVerb,
    hasMetrics,
    hasImpact,
    hasContext,
    wordCount,
    isOptimalLength,
    suggestions,
    rating
  };
}

/**
 * Analyze multiple bullets and return detailed analysis
 */
export function analyzeBullets(bullets: string[]): BulletAnalysis[] {
  return bullets.map(bullet => ({
    original: bullet,
    strength: analyzeBulletStrength(bullet)
  }));
}

/**
 * Get overall resume strength score from all bullets
 */
export function getOverallResumeStrength(bullets: string[]): {
  averageScore: number;
  totalBullets: number;
  strongBullets: number;
  weakBullets: number;
  improvementPotential: number;
} {
  const analyses = analyzeBullets(bullets);
  const scores = analyses.map(a => a.strength.overall);
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  const strongBullets = scores.filter(s => s >= 70).length;
  const weakBullets = scores.filter(s => s < 55).length;
  const improvementPotential = 100 - averageScore;

  return {
    averageScore: Math.round(averageScore),
    totalBullets: bullets.length,
    strongBullets,
    weakBullets,
    improvementPotential: Math.round(improvementPotential)
  };
}

/**
 * Enhance a bullet point based on strength analysis
 */
export function enhanceBullet(bullet: string, strength: StrengthScore): string {
  let enhanced = bullet.trim();

  // If no action verb, suggest adding one
  if (!strength.hasActionVerb) {
    const suggestions = ['Developed', 'Implemented', 'Led', 'Built', 'Improved'];
    const randomVerb = suggestions[Math.floor(Math.random() * suggestions.length)];
    enhanced = `${randomVerb} ${enhanced}`;
  }

  // If no metrics, add suggestion
  if (!strength.hasMetrics) {
    enhanced = enhanced.replace(/\.$/, '') + ' (add specific metrics here)';
  }

  return enhanced;
}
