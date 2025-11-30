// Resume Optimizer Functions

async function optimizeResume() {
  const resumeText = document.getElementById('resumeInput').value.trim();
  const jobDescription = document.getElementById('jobDescriptionInput').value.trim();
  const style = document.getElementById('styleSelect').value;

  // Validation
  if (!resumeText) {
    showError('Please enter your resume');
    return;
  }

  if (!jobDescription) {
    showError('Please enter the job description');
    return;
  }

  // Show loading
  showLoading();

  try {
    // Parse resume into UserProfile format
    const profile = parseResumeText(resumeText);

    // Parse job description
    const jd = parseJobDescription(jobDescription);

    // Call backend API
    const result = await api.optimizeResume(profile, jd, style);

    // Display results
    displayResults(result);

  } catch (error) {
    console.error('Optimization error:', error);
    showError('Failed to optimize resume: ' + error.message);
    hideLoading();
  }
}

function parseResumeText(text) {
  // Simple parser to extract resume information
  const lines = text.split('\n').filter(line => line.trim());

  // Extract basic info (this is a simple implementation)
  const name = lines[0] || 'Your Name';
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  // Extract experience section
  const experiences = [];
  let inExperience = false;
  let currentExp = null;

  for (let line of lines) {
    if (line.match(/EXPERIENCE|WORK EXPERIENCE/i)) {
      inExperience = true;
      continue;
    }
    if (line.match(/EDUCATION|SKILLS|PROJECTS/i)) {
      inExperience = false;
    }
    if (inExperience && line.trim()) {
      if (line.startsWith('-') || line.startsWith('•')) {
        if (currentExp) {
          if (!currentExp.bullets) currentExp.bullets = [];
          currentExp.bullets.push(line.replace(/^[-•]\s*/, ''));
        }
      } else {
        if (currentExp) experiences.push(currentExp);
        currentExp = {
          company: line.split('at')[1]?.trim() || line,
          role: line.split('at')[0]?.trim() || line,
          bullets: []
        };
      }
    }
  }
  if (currentExp) experiences.push(currentExp);

  // Extract skills
  const skillsMatch = text.match(/SKILLS?:?\s*([^\n]+)/i);
  const skills = skillsMatch
    ? skillsMatch[1].split(/[,;]/).map(s => s.trim()).filter(s => s)
    : ['JavaScript', 'Python', 'React'];

  return {
    name,
    email: emailMatch ? emailMatch[0] : 'your.email@example.com',
    phone: phoneMatch ? phoneMatch[0] : '(555) 123-4567',
    experiences,
    skills,
    summary: lines.slice(1, 4).join(' ')
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

  // Display skill gaps
  const gaps = result.gaps || { missing: [], suggested: [] };
  const gapsHTML = `
    ${gaps.missing && gaps.missing.length > 0 ? `
      <div style="margin-bottom: 16px;">
        <strong style="color: #DC2626;">Missing Skills:</strong>
        <ul style="margin-top: 8px; padding-left: 20px;">
          ${gaps.missing.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    ${gaps.suggested && gaps.suggested.length > 0 ? `
      <div>
        <strong style="color: #3B82F6;">Suggested Skills:</strong>
        <ul style="margin-top: 8px; padding-left: 20px;">
          ${gaps.suggested.map(skill => `<li>${skill}</li>`).join('')}
        </ul>
      </div>
    ` : '<p style="color: #10B981;">Great! Your skills align well with the job requirements.</p>'}
  `;
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

  let text = `${resume.name || 'Your Name'}\n`;
  text += `${resume.email || 'email@example.com'} | ${resume.phone || '(555) 123-4567'}\n\n`;

  if (resume.summary) {
    text += `PROFESSIONAL SUMMARY\n${resume.summary}\n\n`;
  }

  text += `EXPERIENCE\n`;
  for (let exp of resume.experiences) {
    text += `\n${exp.role} at ${exp.company}\n`;
    if (exp.bullets && exp.bullets.length > 0) {
      for (let bullet of exp.bullets) {
        text += `• ${bullet}\n`;
      }
    }
  }

  if (resume.skills && resume.skills.length > 0) {
    text += `\nSKILLS\n`;
    text += resume.skills.join(', ');
  }

  return text;
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
    alert('Resume copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy resume. Please select and copy manually.');
  });
}

function clearForm() {
  document.getElementById('resumeInput').value = '';
  document.getElementById('jobDescriptionInput').value = '';
  document.getElementById('styleSelect').value = 'concise';
  hideError();
}

function showLoading() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('errorState').style.display = 'none';
  document.getElementById('optimizeBtn').disabled = true;
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
