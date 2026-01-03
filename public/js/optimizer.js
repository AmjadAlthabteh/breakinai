// Resume Optimizer Functions

async function optimizeResume() {
  const resumeText = document.getElementById('resumeInput').value.trim();
  const jobDescription = document.getElementById('jobDescriptionInput').value.trim();
  const style = document.getElementById('styleSelect').value;

  // Validation
  if (!resumeText) {
    toast.error('Please enter your resume');
    document.getElementById('resumeInput').focus();
    return;
  }

  if (resumeText.length < 100) {
    toast.warning('Resume text seems too short. Please provide more details for better optimization.');
    return;
  }

  if (!jobDescription) {
    toast.error('Please enter the job description');
    document.getElementById('jobDescriptionInput').focus();
    return;
  }

  if (jobDescription.length < 50) {
    toast.warning('Job description seems too short. Please provide more details for better matching.');
    return;
  }

  // Show loading
  showLoading();

  try {
    // Step 1: Parse job description
    await simulateProgress('step1', 'Analyzing job description...');
    const jd = parseJobDescription(jobDescription);

    // Step 2: Extract requirements
    await simulateProgress('step2', 'Extracting key requirements...');
    const profile = parseResumeText(resumeText);

    // Step 3: Optimize resume
    await simulateProgress('step3', 'Optimizing resume content...');
    const result = await api.optimizeResume(profile, jd, style);

    // Step 4: Calculate match score
    await simulateProgress('step4', 'Calculating match score...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Display results
    displayResults(result);

  } catch (error) {
    console.error('Optimization error:', error);
    hideLoading();

    // User-friendly error messages
    if (error.message.includes('network') || error.message.includes('fetch')) {
      toast.error('Network error. Please check your connection and try again.');
    } else if (error.message.includes('timeout')) {
      toast.error('Request timeout. Please try again.');
    } else if (error.message.includes('400')) {
      toast.error('Invalid input. Please check your resume and job description.');
    } else if (error.message.includes('500')) {
      toast.error('Server error. Please try again in a few moments.');
    } else {
      toast.error('Failed to optimize resume. Please try again or contact support.');
    }
  }
}

function parseResumeText(text) {
  // Enhanced parser to extract resume information
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);

  // Extract contact information
  const name = lines[0] || 'Your Name';
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch = text.match(/github\.com\/[\w-]+/i);

  // Extract summary/objective
  let summary = '';
  const summaryMatch = text.match(/(?:SUMMARY|OBJECTIVE|PROFILE|ABOUT)\s*:?\s*\n?([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|SKILLS|PROJECTS|$))/i);
  if (summaryMatch) {
    summary = summaryMatch[1].trim().split('\n').join(' ').slice(0, 300);
  } else {
    summary = lines.slice(1, 4).filter(l => !l.match(/[@()]|linkedin|github/i)).join(' ').slice(0, 300);
  }

  // Extract experience section
  const experiences = [];
  const expMatch = text.match(/(?:EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT)\s*:?\s*\n?([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|$))/i);

  if (expMatch) {
    const expText = expMatch[1];
    const expLines = expText.split('\n').map(l => l.trim()).filter(l => l);
    let currentExp = null;

    for (let line of expLines) {
      if (line.match(/^[-•●*]\s+/)) {
        if (currentExp) {
          if (!currentExp.bullets) currentExp.bullets = [];
          currentExp.bullets.push(line.replace(/^[-•●*]\s+/, ''));
        }
      } else if (line.match(/\bat\b|\b(19|20)\d{2}\b/i)) {
        if (currentExp) experiences.push(currentExp);
        const parts = line.split(/\s+at\s+/i);
        currentExp = {
          role: parts[0]?.trim() || line,
          company: parts[1]?.split(/[,|\-]/)[0]?.trim() || 'Company',
          bullets: []
        };
      }
    }
    if (currentExp) experiences.push(currentExp);
  }

  // Extract skills
  const skills = new Set();
  const skillsMatch = text.match(/(?:SKILLS?|TECHNICAL SKILLS|TECHNOLOGIES)\s*:?\s*\n?([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|PROJECTS|$))/i);
  if (skillsMatch) {
    skillsMatch[1].split(/[,;|\n•●]/).forEach(s => {
      const skill = s.trim();
      if (skill && skill.length < 50) skills.add(skill);
    });
  }

  // Detect common tech skills
  const techSkills = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue', 'AWS', 'Docker', 'SQL', 'MongoDB'];
  techSkills.forEach(skill => {
    if (new RegExp('\\b' + skill + '\\b', 'i').test(text)) skills.add(skill);
  });

  return {
    name,
    email: emailMatch ? emailMatch[0] : 'your.email@example.com',
    phone: phoneMatch ? phoneMatch[0] : '(555) 123-4567',
    experiences: experiences.length > 0 ? experiences : [{ role: 'Professional', company: 'Company', bullets: [] }],
    skills: Array.from(skills).slice(0, 20),
    summary: summary || 'Professional seeking new opportunities'
  };
}

function parseJobDescription(text) {
  // Simple parser for job description
  const lines = text.split('\n').filter(line => line.trim());

  // Extract company and role from first lines
  const title = lines[0] || 'Job Position';
  const company = lines[1] || 'Company Name';

  // Extract requirements
  const requirements = [];
  for (let line of lines) {
    if (line.match(/^[-•●]/)) {
      requirements.push(line.replace(/^[-•●]\s*/, ''));
    }
  }

  return {
    title,
    company,
    description: text,
    requirements
  };
}

function displayResults(result) {
  hideLoading();

  // Hide input form, show results
  document.getElementById('inputSection').style.display = 'none';
  document.getElementById('resultsSection').style.display = 'block';

  // Display match score
  const score = result.score || { overall: 75 };
  document.getElementById('matchScore').textContent = score.overall || 75;
  document.getElementById('matchDescription').textContent = getScoreDescription(score.overall || 75);

  // Display optimized resume
  const resume = result.tailored || {};
  const resumeText = formatOptimizedResume(resume);
  document.getElementById('optimizedResume').textContent = resumeText;

  // Store resume data for export
  currentResumeData = {
    resume: resumeText,
    score: score,
    gaps: gaps,
    analysis: analysis,
    metadata: {
      generatedAt: new Date().toISOString(),
      style: result.tailored?.style || 'concise'
    }
  };

  // Display skill gaps with visual chart
  const gaps = result.gaps || { missing: [], suggested: [] };
  const analysis = result.analysis || {};
  const requiredSkills = analysis.requiredSkills || [];
  const userSkills = resume.skills || [];

  const gapsHTML = renderSkillGapsChart(requiredSkills, userSkills, gaps);
  document.getElementById('skillGaps').innerHTML = gapsHTML;

  // Display recommendations
  const recommendations = [
    'Tailor your summary to highlight relevant experience',
    'Use action verbs to describe accomplishments',
    'Quantify your achievements with metrics',
    'Match keywords from the job description'
  ];
  const recsHTML = `
    <ul style="padding-left: 20px;">
      ${recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
    </ul>
  `;
  document.getElementById('recommendations').innerHTML = recsHTML;

  // Display analysis details
  const analysis = result.analysis || {};
  const analysisHTML = `
    <div>
      <p><strong>Required Skills:</strong></p>
      <p style="margin: 8px 0 16px; color: #64748B;">
        ${analysis.requiredSkills?.join(', ') || 'React, Node.js, TypeScript, Python'}
      </p>

      <p><strong>Nice-to-Have Skills:</strong></p>
      <p style="margin: 8px 0 16px; color: #64748B;">
        ${analysis.niceToHave?.join(', ') || 'Docker, AWS, GraphQL'}
      </p>

      <p><strong>Key Requirements:</strong></p>
      <ul style="padding-left: 20px; color: #64748B;">
        ${analysis.keyRequirements?.map(req => `<li>${req}</li>`).join('') ||
          '<li>3+ years of experience</li><li>Strong problem-solving skills</li><li>Team collaboration</li>'}
      </ul>
    </div>
  `;
  document.getElementById('analysisDetails').innerHTML = analysisHTML;

  // Scroll to results
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatOptimizedResume(resume) {
  if (!resume.experiences || resume.experiences.length === 0) {
    return 'Your optimized resume will appear here...';
  }

  // Get section preferences from checkboxes
  const includeSummary = document.getElementById('includeSummary')?.checked ?? true;
  const includeSkills = document.getElementById('includeSkills')?.checked ?? true;
  const includeProjects = document.getElementById('includeProjects')?.checked ?? true;
  const includeEducation = document.getElementById('includeEducation')?.checked ?? true;
  const includeCertifications = document.getElementById('includeCertifications')?.checked ?? true;

  let text = `${resume.name || 'Your Name'}\n`;
  text += `${resume.email || 'email@example.com'} | ${resume.phone || '(555) 123-4567'}\n\n`;

  // Professional Summary (optional)
  if (includeSummary && resume.summary) {
    text += `PROFESSIONAL SUMMARY\n${resume.summary}\n\n`;
  }

  // Work Experience (always included)
  text += `EXPERIENCE\n`;
  for (let exp of resume.experiences) {
    text += `\n${exp.role} at ${exp.company}\n`;
    if (exp.bullets && exp.bullets.length > 0) {
      for (let bullet of exp.bullets) {
        text += `• ${bullet}\n`;
      }
    }
  }

  // Skills (optional)
  if (includeSkills && resume.skills && resume.skills.length > 0) {
    text += `\nSKILLS\n`;
    const categorized = categorizeSkills(resume.skills);

    if (categorized.languages.length > 0) {
      text += `\nLanguages: ${categorized.languages.join(', ')}`;
    }
    if (categorized.frameworks.length > 0) {
      text += `\nFrameworks: ${categorized.frameworks.join(', ')}`;
    }
    if (categorized.tools.length > 0) {
      text += `\nTools: ${categorized.tools.join(', ')}`;
    }
    if (categorized.technical.length > 0) {
      text += `\nTechnical: ${categorized.technical.join(', ')}`;
    }
    if (categorized.soft.length > 0) {
      text += `\nSoft Skills: ${categorized.soft.join(', ')}`;
    }
    if (categorized.other.length > 0) {
      text += `\nOther: ${categorized.other.join(', ')}`;
    }
  }

  // Projects (optional)
  if (includeProjects && resume.projects && resume.projects.length > 0) {
    text += `\n\nPROJECTS\n`;
    for (let project of resume.projects) {
      text += `\n${project.name}\n`;
      text += `${project.description || ''}\n`;
    }
  }

  // Education (optional)
  if (includeEducation && resume.education && resume.education.length > 0) {
    text += `\n\nEDUCATION\n`;
    for (let edu of resume.education) {
      text += `\n${edu.degree} - ${edu.institution}\n`;
      if (edu.year) text += `${edu.year}\n`;
    }
  }

  // Certifications (optional)
  if (includeCertifications && resume.certifications && resume.certifications.length > 0) {
    text += `\n\nCERTIFICATIONS\n`;
    for (let cert of resume.certifications) {
      text += `• ${cert}\n`;
    }
  }

  return text;
}

function renderSkillGapsChart(requiredSkills, userSkills, gaps) {
  // Analyze skill coverage
  const userSkillsLower = (Array.isArray(userSkills) ? userSkills : userSkills.map(s => s.name || s)).map(s =>
    typeof s === 'string' ? s.toLowerCase() : ''
  );

  const skillAnalysis = requiredSkills.slice(0, 8).map(skill => {
    const hasSkill = userSkillsLower.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));
    return {
      name: skill,
      hasSkill,
      level: hasSkill ? 100 : 0
    };
  });

  // Calculate overall coverage
  const coverage = skillAnalysis.filter(s => s.hasSkill).length;
  const total = skillAnalysis.length;
  const coveragePercent = total > 0 ? Math.round((coverage / total) * 100) : 100;

  // Generate chart HTML
  return `
    <div class="skill-gap-summary">
      <div class="coverage-indicator">
        <span class="coverage-label">Skill Coverage</span>
        <div class="coverage-bar">
          <div class="coverage-fill" style="width: ${coveragePercent}%; background: ${getCoverageColor(coveragePercent)}"></div>
        </div>
        <span class="coverage-percent">${coveragePercent}%</span>
      </div>
    </div>

    <div class="skills-chart">
      ${skillAnalysis.map(skill => `
        <div class="skill-row">
          <div class="skill-name" title="${skill.name}">
            <span class="skill-status ${skill.hasSkill ? 'has-skill' : 'missing-skill'}">${skill.hasSkill ? '✓' : '✗'}</span>
            ${skill.name}
          </div>
          <div class="skill-bar-container">
            <div class="skill-bar ${skill.hasSkill ? 'skill-bar--complete' : 'skill-bar--missing'}">
              <span class="skill-bar-label">${skill.hasSkill ? 'You have this' : 'Need to add'}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    ${gaps.missing && gaps.missing.length > 0 ? `
      <div class="gap-recommendations">
        <strong style="color: #DC2626; display: block; margin-bottom: 12px;">🎯 Skills to Add:</strong>
        <div class="skill-pills">
          ${gaps.missing.slice(0, 6).map(skill => `
            <span class="skill-pill skill-pill--missing">${skill}</span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${gaps.suggested && gaps.suggested.length > 0 ? `
      <div class="gap-recommendations">
        <strong style="color: #3B82F6; display: block; margin-bottom: 12px;">💡 Nice to Have:</strong>
        <div class="skill-pills">
          ${gaps.suggested.slice(0, 6).map(skill => `
            <span class="skill-pill skill-pill--suggested">${skill}</span>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${coverage === total ? `
      <div class="success-message">
        <strong style="color: #10B981;">✨ Excellent!</strong> Your skills align perfectly with the job requirements.
      </div>
    ` : ''}
  `;
}

function getCoverageColor(percent) {
  if (percent >= 80) return 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)';
  if (percent >= 60) return 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
  if (percent >= 40) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
  return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
}

function categorizeSkills(skills) {
  const categories = {
    languages: [],
    frameworks: [],
    tools: [],
    technical: [],
    soft: [],
    other: []
  };

  const languageKeywords = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'html', 'css'];
  const frameworkKeywords = ['react', 'angular', 'vue', 'next', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'tailwind', 'bootstrap'];
  const toolKeywords = ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'terraform', 'jira', 'figma', 'postman', 'webpack', 'vite'];
  const technicalKeywords = ['api', 'database', 'microservices', 'cloud', 'devops', 'ci/cd', 'testing', 'security', 'algorithm'];
  const softKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'agile', 'scrum', 'mentoring', 'collaboration'];

  skills.forEach(skill => {
    const skillLower = skill.toLowerCase();

    if (languageKeywords.some(kw => skillLower.includes(kw))) {
      categories.languages.push(skill);
    } else if (frameworkKeywords.some(kw => skillLower.includes(kw))) {
      categories.frameworks.push(skill);
    } else if (toolKeywords.some(kw => skillLower.includes(kw))) {
      categories.tools.push(skill);
    } else if (technicalKeywords.some(kw => skillLower.includes(kw))) {
      categories.technical.push(skill);
    } else if (softKeywords.some(kw => skillLower.includes(kw))) {
      categories.soft.push(skill);
    } else {
      categories.other.push(skill);
    }
  });

  return categories;
}

function getScoreDescription(score) {
  if (score >= 90) return 'Excellent match! Your resume aligns very well with this role.';
  if (score >= 75) return 'Good match! With some tweaks, you\'ll be a strong candidate.';
  if (score >= 60) return 'Decent match. Consider highlighting more relevant experience.';
  return 'This role may not be the best fit, but you can still apply with the optimized resume.';
}

function showInputForm() {
  document.getElementById('resultsSection').style.display = 'none';
  document.getElementById('inputSection').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyResume() {
  const resumeText = document.getElementById('optimizedResume').textContent;
  navigator.clipboard.writeText(resumeText).then(() => {
    toast.success('Resume copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    toast.error('Failed to copy resume. Please select and copy manually.');
  });
}

// Store resume data globally for export
let currentResumeData = null;

function toggleExportMenu() {
  const menu = document.getElementById('exportMenu');
  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.export-dropdown');
  const menu = document.getElementById('exportMenu');
  if (menu && dropdown && !dropdown.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function exportResume(format) {
  const resumeText = document.getElementById('optimizedResume').textContent;
  let content, mimeType, filename;

  switch (format) {
    case 'txt':
      content = resumeText;
      mimeType = 'text/plain';
      filename = 'resume.txt';
      break;

    case 'md':
      content = convertToMarkdown(resumeText);
      mimeType = 'text/markdown';
      filename = 'resume.md';
      break;

    case 'html':
      content = convertToHTML(resumeText);
      mimeType = 'text/html';
      filename = 'resume.html';
      break;

    case 'json':
      content = JSON.stringify(currentResumeData || { resume: resumeText }, null, 2);
      mimeType = 'application/json';
      filename = 'resume.json';
      break;

    default:
      toast.error('Unsupported export format');
      return;
  }

  downloadFile(content, mimeType, filename);
  document.getElementById('exportMenu').style.display = 'none';
  toast.success(`Resume exported as ${format.toUpperCase()}!`);
}

function convertToMarkdown(text) {
  // Convert plain text resume to Markdown format
  let md = text
    .replace(/^([A-Z][A-Z\s]+)$/gm, '# $1') // Headers
    .replace(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):$/gm, '## $1') // Section headers
    .replace(/^([A-Z][a-z].*?(?:at|@|-)\s+.*)$/gm, '### $1') // Job titles
    .replace(/^•\s+/gm, '- '); // Bullets

  return `# Resume\n\n${md}\n\n---\n*Generated with BreakIn.ai Resume Optimizer*`;
}

function convertToHTML(text) {
  const lines = text.split('\n');
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume</title>
  <style>
    body { font-family: 'Arial', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #0EA5E9; border-bottom: 3px solid #0EA5E9; padding-bottom: 10px; }
    h2 { color: #1E293B; margin-top: 30px; border-bottom: 2px solid #E2E8F0; padding-bottom: 5px; }
    h3 { color: #475569; margin-top: 20px; }
    ul { list-style-type: none; padding-left: 0; }
    li { padding: 5px 0; padding-left: 20px; position: relative; }
    li:before { content: "▸"; position: absolute; left: 0; color: #0EA5E9; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 0.9em; color: #64748B; text-align: center; }
  </style>
</head>
<body>`;

  let inList = false;
  lines.forEach(line => {
    line = line.trim();
    if (!line) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += '<br>\n';
      return;
    }

    if (/^[A-Z][A-Z\s]+$/.test(line)) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h1>${line}</h1>\n`;
    } else if (line.match(/^(EXPERIENCE|SKILLS|EDUCATION|PROJECTS|CERTIFICATIONS)/)) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h2>${line}</h2>\n`;
    } else if (line.includes(' at ') || line.includes(' - ')) {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<h3>${line}</h3>\n`;
    } else if (line.startsWith('•') || line.startsWith('-')) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${line.replace(/^[•-]\s*/, '')}</li>\n`;
    } else {
      if (inList) { html += '</ul>\n'; inList = false; }
      html += `<p>${line}</p>\n`;
    }
  });

  if (inList) html += '</ul>\n';
  html += `<div class="footer">Generated with BreakIn.ai Resume Optimizer</div>
</body>
</html>`;

  return html;
}

function downloadFile(content, mimeType, filename) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function clearForm() {
  document.getElementById('resumeInput').value = '';
  document.getElementById('jobDescriptionInput').value = '';
  document.getElementById('styleSelect').value = 'concise';
  hideError();
}

async function simulateProgress(stepId, message) {
  // Update message
  document.getElementById('loadingMessage').textContent = message;

  // Mark previous steps as completed
  const stepNumber = parseInt(stepId.replace('step', ''));
  for (let i = 1; i < stepNumber; i++) {
    const prevStep = document.getElementById('step' + i);
    prevStep.classList.remove('active');
    prevStep.classList.add('completed');
    // Hide number, show checkmark
    prevStep.querySelector('.step-icon').textContent = '';
  }

  // Mark current step as active
  const currentStep = document.getElementById(stepId);
  currentStep.classList.add('active');
  currentStep.classList.remove('completed');

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 600));
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('optimizeBtn').disabled = true;

  // Reset all steps
  for (let i = 1; i <= 4; i++) {
    const step = document.getElementById('step' + i);
    step.classList.remove('active', 'completed');
    step.querySelector('.step-icon').textContent = i;
  }
}

function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('optimizeBtn').disabled = false;
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorState').style.display = 'block';
  document.getElementById('loadingState').style.display = 'none';
}

function hideError() {
  document.getElementById('errorState').style.display = 'none';
}
