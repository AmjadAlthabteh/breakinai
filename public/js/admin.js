// Admin page functionality

const DOMAIN_LABELS = {
  startup: 'Startups',
  fintech: 'Fintech',
  ml: 'AI / ML',
  health: 'Health',
  infra: 'Infrastructure',
  consumer: 'Consumer'
};

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
  loadJobs();

  const form = document.getElementById('addJobForm');
  if (form) {
    form.addEventListener('submit', handleAddJob);
  }
});

// Handle add job form submission
async function handleAddJob(event) {
  event.preventDefault();

  const formData = {
    title: document.getElementById('jobTitle').value,
    company: document.getElementById('jobCompany').value,
    location: document.getElementById('jobLocation').value,
    salary: document.getElementById('jobSalary').value || 'Competitive',
    domain: document.getElementById('jobDomain').value,
    domainLabel: DOMAIN_LABELS[document.getElementById('jobDomain').value],
    level: document.getElementById('jobLevel').value,
    workMode: document.getElementById('jobWorkMode').value,
    employmentType: document.getElementById('jobEmploymentType').value,
    stack: document.getElementById('jobStack').value
      .split(',')
      .map(s => s.trim())
      .filter(s => s),
    summary: document.getElementById('jobSummary').value,
    description: document.getElementById('jobDescription').value,
    applyUrl: document.getElementById('jobApplyUrl').value,
    postedDays: parseInt(document.getElementById('jobPostedDays').value) || 0,
    hot: document.getElementById('jobHot').checked,
    score: 75, // Default score
    compValue: extractCompValue(document.getElementById('jobSalary').value)
  };

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Job added successfully!', 'success');
      clearForm();
      loadJobs();
    } else {
      showMessage('Failed to add job: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error adding job:', error);
    showMessage('Failed to add job: ' + error.message, 'error');
  }
}

// Extract compensation value from salary string
function extractCompValue(salary) {
  if (!salary) return 100;

  // Try to extract numbers from salary string
  const matches = salary.match(/\d+/g);
  if (matches && matches.length > 0) {
    // If range, take the higher value
    const numbers = matches.map(n => parseInt(n));
    return Math.max(...numbers);
  }

  return 100;
}

// Load and display existing jobs
async function loadJobs() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/jobs`);
    const result = await response.json();

    if (result.success) {
      displayJobs(result.data);
    } else {
      showMessage('Failed to load jobs', 'error');
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    showMessage('Failed to load jobs: ' + error.message, 'error');
  }
}

// Display jobs list
function displayJobs(jobs) {
  const jobsList = document.getElementById('jobsList');
  const jobCount = document.getElementById('jobCount');

  jobCount.textContent = jobs.length;

  if (jobs.length === 0) {
    jobsList.innerHTML = '<p style="color: #64748B; text-align: center; padding: 40px;">No jobs yet. Add your first job above!</p>';
    return;
  }

  jobsList.innerHTML = jobs.map(job => `
    <div class="job-item">
      <div class="job-item-info">
        <h3>${job.title} at ${job.company}</h3>
        <p><strong>Location:</strong> ${job.location} | <strong>Mode:</strong> ${job.workMode} | <strong>Level:</strong> ${job.level}</p>
        <p><strong>Salary:</strong> ${job.salary}</p>
        <p><strong>Stack:</strong> ${job.stack.join(', ')}</p>
        <p style="margin-top: 8px;">${job.summary}</p>
        ${job.hot ? '<p style="color: #DC2626; font-weight: 600; margin-top: 8px;">🔥 Hot Lead</p>' : ''}
        ${job.applyUrl ? `<p style="margin-top: 8px;"><a href="${job.applyUrl}" target="_blank" style="color: #3B82F6;">Apply Here</a></p>` : ''}
      </div>
      <div class="job-item-actions">
        <button class="btn-delete" onclick="deleteJob('${job.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Delete job
async function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job?')) {
    return;
  }

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Job deleted successfully!', 'success');
      loadJobs();
    } else {
      showMessage('Failed to delete job: ' + result.error, 'error');
    }
  } catch (error) {
    console.error('Error deleting job:', error);
    showMessage('Failed to delete job: ' + error.message, 'error');
  }
}

// Clear form
function clearForm() {
  document.getElementById('addJobForm').reset();
}

// Show message
function showMessage(message, type) {
  const messageDiv = document.getElementById('formMessage');
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
  messageDiv.style.display = 'block';

  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}
