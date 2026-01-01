export type LLMConfig = {
  model: string;
  temperature?: number;
  max_tokens?: number;
};

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LLMResponse = {
  text: string;
  raw?: unknown;
};

export interface LLMClient {
  complete(messages: LLMMessage[], config?: LLMConfig): Promise<LLMResponse>;
}

// This intelligent mock client provides realistic responses for development and testing
export class NoopLLM implements LLMClient {
  async complete(messages: LLMMessage[]): Promise<LLMResponse> {
    // Extract context from messages
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';

    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate context-aware responses based on the task
    let response = this.generateIntelligentResponse(systemMessage, lastUserMessage);

    return { text: response };
  }

  private generateIntelligentResponse(systemMsg: string, userMsg: string): string {
    // Job description analysis
    if (systemMsg.includes('job description') && systemMsg.includes('extract')) {
      return this.generateJDAnalysis(userMsg);
    }

    // Bullet point rewriting
    if (systemMsg.includes('bullet') || systemMsg.includes('CAR format')) {
      return this.rewriteBullet(userMsg);
    }

    // Resume optimization
    if (systemMsg.includes('optimize') || systemMsg.includes('tailor')) {
      return this.generateOptimizedContent(userMsg);
    }

    // Default intelligent response
    return this.generateDefaultResponse(userMsg);
  }

  private generateJDAnalysis(content: string): string {
    // Extract skills and requirements from job description
    const techKeywords = ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL'];
    const softKeywords = ['communication', 'teamwork', 'leadership', 'problem-solving', 'agile'];

    const foundTech = techKeywords.filter(skill =>
      content.toLowerCase().includes(skill.toLowerCase())
    );

    const foundSoft = softKeywords.filter(skill =>
      content.toLowerCase().includes(skill.toLowerCase())
    );

    // Generate realistic analysis
    const requiredSkills = foundTech.length > 0 ? foundTech.slice(0, 5) : ['JavaScript', 'React', 'Node.js'];
    const niceToHave = foundTech.length > 3 ? foundTech.slice(3, 6) : ['TypeScript', 'AWS'];
    const softSkills = foundSoft.length > 0 ? foundSoft : ['communication', 'teamwork'];

    return JSON.stringify({
      requiredSkills,
      niceToHave,
      softSkills,
      keyRequirements: [
        'Strong technical background in modern web development',
        'Experience with full-stack development',
        'Ability to work in collaborative team environment'
      ],
      seniorityLevel: content.toLowerCase().includes('senior') ? 'senior' :
                      content.toLowerCase().includes('junior') ? 'junior' : 'mid-level'
    });
  }

  private rewriteBullet(bullet: string): string {
    // Extract action verbs and metrics
    const actionVerbs = ['Developed', 'Implemented', 'Led', 'Designed', 'Architected', 'Optimized', 'Collaborated', 'Managed'];
    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

    // Check if bullet already has metrics
    const hasMetrics = /\d+%|\d+x|\\$\d+|\d+ (users|customers|clients)/i.test(bullet);

    if (hasMetrics) {
      // Improve structure while keeping metrics
      return `${verb} ${bullet.toLowerCase().replace(/^(developed|implemented|led|designed|created|built|made)\s*/i, '')}`;
    } else {
      // Add realistic metrics
      const metrics = [
        ', improving performance by 40%',
        ', reducing load time by 2.5 seconds',
        ', serving 10,000+ daily users',
        ', increasing user engagement by 35%',
        ', reducing costs by $50K annually'
      ];
      const metric = metrics[Math.floor(Math.random() * metrics.length)];
      return `${verb} ${bullet.toLowerCase().replace(/^(developed|implemented|led|designed|created|built|made)\s*/i, '')}${metric}`;
    }
  }

  private generateOptimizedContent(content: string): string {
    // Return enhanced version of content with better keywords and structure
    const lines = content.split('\n').filter(l => l.trim());
    const optimized = lines.map(line => {
      if (line.startsWith('-') || line.startsWith('•')) {
        return this.rewriteBullet(line.replace(/^[-•]\s*/, ''));
      }
      return line;
    });

    return optimized.join('\n');
  }

  private generateDefaultResponse(content: string): string {
    // Provide intelligent default based on content analysis
    if (content.length < 50) {
      return 'Please provide more detailed information for better analysis.';
    }

    return `Analysis complete. Based on the provided content (${content.length} characters), recommendations have been generated to optimize for ATS compatibility and job match alignment.`;
  }
}

export const systemGuardrails = `
- Do not fabricate employment, dates, education, or certifications.
- Preserve truthfulness; only use skills that appear in the provided resume/profile.
- Keep output ATS-safe: plain text, no tables or graphics, no emojis.
- Keep bullets under 30 words, start with strong action verbs, include metrics when present.
- Avoid demographic or personal data not supplied by the user.
- Do not claim clearance/eligibility unless explicitly provided.`;
