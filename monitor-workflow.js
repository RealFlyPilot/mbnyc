const https = require('https');
const fs = require('fs');
const { execSync } = require('child_process');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Configuration
const config = {
  owner: 'RealFlyPilot',
  repo: 'mbnyc',
  workflow_id: 'wpe-deploy-dev.yml',
  pollInterval: 10000, // 10 seconds
  maxAttempts: 180, // 30 minutes total
  statusFile: 'workflow-status.json',
  githubToken: process.env.GITHUB_TOKEN // Read token from environment variable
};

// Get the latest commit SHA
const getLatestCommitSha = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (error) {
    console.log(`${colors.red}Unable to get latest commit SHA:${colors.reset}`, error.message);
    return null;
  }
};

// API request to GitHub
const requestGitHub = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path,
      headers: {
        'User-Agent': 'GitHub-Workflow-Monitor',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    // Add authentication if token is available
    if (config.githubToken) {
      options.headers['Authorization'] = `token ${config.githubToken}`;
    } else {
      console.log(`${colors.yellow}Warning: No GitHub token provided. Set GITHUB_TOKEN env variable for authenticated requests.${colors.reset}`);
    }

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });
  });
};

// Get workflow runs
const getWorkflowRuns = async () => {
  const path = `/repos/${config.owner}/${config.repo}/actions/workflows/${config.workflow_id}/runs`;
  return requestGitHub(path);
};

// Get specific workflow run
const getWorkflowRun = async (runId) => {
  const path = `/repos/${config.owner}/${config.repo}/actions/runs/${runId}`;
  return requestGitHub(path);
};

// Save status to file
const saveStatus = (status) => {
  try {
    fs.writeFileSync(config.statusFile, JSON.stringify(status, null, 2));
    console.log(`${colors.gray}Status saved to ${config.statusFile}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}Failed to save status:${colors.reset}`, error.message);
  }
};

// Create a status object
const createStatus = (run, message = null) => {
  return {
    timestamp: new Date().toISOString(),
    workflow_id: config.workflow_id,
    commit_sha: run ? run.head_sha : getLatestCommitSha(),
    status: run ? run.status : 'unknown',
    conclusion: run ? run.conclusion : null,
    url: run ? run.html_url : `https://github.com/${config.owner}/${config.repo}/actions/workflows/${config.workflow_id}`,
    message
  };
};

// Monitor workflow progress
const monitorWorkflow = async () => {
  console.log(`${colors.cyan}Monitoring workflow progress for${colors.reset} ${config.workflow_id}`);
  
  // Get latest commit SHA
  const commitSha = getLatestCommitSha();
  console.log(`${colors.gray}Latest commit:${colors.reset} ${commitSha}`);
  
  let attempts = 0;
  let found = false;
  
  // Initial check
  let workflowRun = null;
  try {
    const { workflow_runs } = await getWorkflowRuns();
    
    if (workflow_runs && workflow_runs.length > 0) {
      // Find the run for our commit
      workflowRun = workflow_runs.find(run => run.head_sha === commitSha);
      
      if (workflowRun) {
        found = true;
        console.log(`${colors.green}Workflow run found:${colors.reset} ${workflowRun.id}`);
        console.log(`${colors.blue}Status:${colors.reset} ${workflowRun.status}`);
        console.log(`${colors.blue}Conclusion:${colors.reset} ${workflowRun.conclusion || 'pending'}`);
        console.log(`${colors.blue}URL:${colors.reset} ${workflowRun.html_url}`);
        
        // Save initial status
        saveStatus(createStatus(workflowRun));
      } else {
        console.log(`${colors.yellow}No workflow run found for commit ${commitSha} yet. Waiting...${colors.reset}`);
        saveStatus(createStatus(null, 'Waiting for workflow to start'));
      }
    } else {
      console.log(`${colors.red}No workflow runs found.${colors.reset}`);
      saveStatus(createStatus(null, 'No workflow runs found'));
    }
  } catch (error) {
    console.log(`${colors.red}Error:${colors.reset}`, error.message);
    saveStatus(createStatus(null, `Error: ${error.message}`));
  }
  
  // Poll for updates if needed
  if (workflowRun && (workflowRun.status === 'completed')) {
    const conclusion = workflowRun.conclusion;
    if (conclusion === 'success') {
      console.log(`${colors.green}Workflow completed successfully!${colors.reset}`);
      saveStatus(createStatus(workflowRun, 'Workflow completed successfully'));
    } else {
      console.log(`${colors.red}Workflow completed with status: ${conclusion}${colors.reset}`);
      saveStatus(createStatus(workflowRun, `Workflow completed with status: ${conclusion}`));
    }
    return;
  }
  
  const checkInterval = setInterval(async () => {
    attempts++;
    
    try {
      if (!found) {
        // Still looking for the workflow run
        const { workflow_runs } = await getWorkflowRuns();
        if (workflow_runs && workflow_runs.length > 0) {
          workflowRun = workflow_runs.find(run => run.head_sha === commitSha);
          
          if (workflowRun) {
            found = true;
            console.log(`${colors.green}Workflow run found:${colors.reset} ${workflowRun.id}`);
            console.log(`${colors.blue}Status:${colors.reset} ${workflowRun.status}`);
            console.log(`${colors.blue}URL:${colors.reset} ${workflowRun.html_url}`);
            saveStatus(createStatus(workflowRun, 'Workflow run found'));
          }
        }
      } else {
        // Get the status of the found workflow
        const updatedRun = await getWorkflowRun(workflowRun.id);
        
        if (updatedRun.status !== workflowRun.status || 
            updatedRun.conclusion !== workflowRun.conclusion) {
          workflowRun = updatedRun;
          console.log(`${colors.yellow}Status updated:${colors.reset} ${workflowRun.status}`);
          console.log(`${colors.yellow}Conclusion:${colors.reset} ${workflowRun.conclusion || 'pending'}`);
          saveStatus(createStatus(workflowRun, 'Status updated'));
        }
        
        // Check if completed
        if (workflowRun.status === 'completed') {
          const conclusion = workflowRun.conclusion;
          let message = '';
          
          if (conclusion === 'success') {
            message = 'Workflow completed successfully! Your changes have been deployed and the reset scripts will run automatically when an admin logs in.';
            console.log(`${colors.green}Workflow completed successfully!${colors.reset}`);
            console.log(`${colors.green}✓ Your changes have been deployed and the reset scripts will run automatically when an admin logs in.${colors.reset}`);
          } else {
            message = `Workflow completed with status: ${conclusion}. Check the logs for more details.`;
            console.log(`${colors.red}Workflow completed with status: ${conclusion}${colors.reset}`);
            console.log(`${colors.yellow}Check the logs for more details: ${workflowRun.html_url}${colors.reset}`);
          }
          
          saveStatus(createStatus(workflowRun, message));
          clearInterval(checkInterval);
          return;
        }
      }
    } catch (error) {
      console.log(`${colors.red}Error during monitoring:${colors.reset}`, error.message);
      saveStatus(createStatus(workflowRun, `Error: ${error.message}`));
    }
    
    // Check if we've reached the maximum attempts
    if (attempts >= config.maxAttempts) {
      const message = 'Reached maximum monitoring duration. You can check the status manually.';
      console.log(`${colors.red}Reached maximum monitoring duration.${colors.reset}`);
      console.log(`${colors.yellow}You can check the status manually at:${colors.reset}`);
      console.log(`https://github.com/${config.owner}/${config.repo}/actions/workflows/${config.workflow_id}`);
      
      saveStatus(createStatus(workflowRun, message));
      clearInterval(checkInterval);
    }
  }, config.pollInterval);
};

// Add check-status feature
if (process.argv[2] === 'check') {
  try {
    if (fs.existsSync(config.statusFile)) {
      const status = JSON.parse(fs.readFileSync(config.statusFile, 'utf8'));
      console.log(`${colors.cyan}Workflow Status Report${colors.reset}`);
      console.log(`${colors.blue}Last Updated:${colors.reset} ${status.timestamp}`);
      console.log(`${colors.blue}Commit:${colors.reset} ${status.commit_sha}`);
      console.log(`${colors.blue}Status:${colors.reset} ${status.status}`);
      console.log(`${colors.blue}Conclusion:${colors.reset} ${status.conclusion || 'pending'}`);
      console.log(`${colors.blue}URL:${colors.reset} ${status.url}`);
      
      if (status.message) {
        console.log(`${colors.blue}Message:${colors.reset} ${status.message}`);
      }
      
      // If it's still in progress, suggest checking again
      if (status.status === 'in_progress' || !status.conclusion) {
        console.log(`\n${colors.yellow}Workflow is still in progress. Run 'node monitor-workflow.js' to continue monitoring.${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}No status file found. Run 'node monitor-workflow.js' first.${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}Error reading status:${colors.reset}`, error.message);
  }
} else {
  // Start monitoring
  monitorWorkflow();
} 