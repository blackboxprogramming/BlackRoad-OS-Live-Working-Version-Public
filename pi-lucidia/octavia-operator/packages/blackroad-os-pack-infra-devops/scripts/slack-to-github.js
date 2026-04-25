/**
 * slack-to-github.js
 * 
 * Webhook handler that creates GitHub issues from Slack messages.
 * Deploy as: Cloudflare Worker, Vercel Function, or any serverless platform.
 * 
 * Trigger: Slack slash command or bot mention
 * Example: /issue Fix the login redirect bug
 * Example: @blackroad-bot create issue: Add dark mode toggle
 * 
 * Setup:
 * 1. Create a Slack App with slash commands or bot
 * 2. Set the request URL to your deployed function
 * 3. Set environment variables: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, SLACK_SIGNING_SECRET
 */

// For Cloudflare Workers
export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};

// For Vercel/other platforms, use:
// export default async function handler(req, res) { ... }

async function handleRequest(request, env) {
  // Verify this is a POST request
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Parse the Slack payload
    const formData = await request.formData();
    const payload = Object.fromEntries(formData);

    // For slash commands, the text is in payload.text
    // For bot mentions, you'd parse payload differently
    const text = payload.text || '';
    const userId = payload.user_id || 'unknown';
    const userName = payload.user_name || 'unknown';
    const channelId = payload.channel_id || '';

    if (!text.trim()) {
      return slackResponse('Please provide an issue title. Usage: `/issue Fix the login bug`');
    }

    // Parse priority from text if included
    let priority = 'P2';
    let title = text;
    
    const priorityMatch = text.match(/\b(p[0-3])\b/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toUpperCase();
      title = text.replace(priorityMatch[0], '').trim();
    }

    // Detect if this should be an agent task
    const isAgentTask = text.toLowerCase().includes('[agent]') || 
                        text.toLowerCase().includes('--agent');
    title = title.replace(/\[agent\]/gi, '').replace(/--agent/gi, '').trim();

    // Detect if this is a bug
    const isBug = text.toLowerCase().includes('[bug]') || 
                  text.toLowerCase().includes('--bug');
    title = title.replace(/\[bug\]/gi, '').replace(/--bug/gi, '').trim();

    // Build labels
    const labels = [];
    if (isBug) {
      labels.push('bug');
    } else if (isAgentTask) {
      labels.push('agent-task', 'automated');
    } else {
      labels.push('task');
    }

    // Add priority label
    switch (priority) {
      case 'P0': labels.push('p0-now'); break;
      case 'P1': labels.push('p1-today'); break;
      case 'P2': labels.push('p2-week'); break;
      case 'P3': labels.push('p3-backlog'); break;
    }

    // Build title prefix
    let fullTitle = title;
    if (isBug) {
      fullTitle = `[BUG] ${title}`;
    } else if (isAgentTask) {
      fullTitle = `[AGENT] ${title}`;
    } else {
      fullTitle = `[TASK] ${title}`;
    }

    // Create the GitHub issue
    const issue = await createGitHubIssue({
      title: fullTitle,
      body: `Created from Slack by @${userName}\n\nChannel: <#${channelId}>`,
      labels: labels,
      env: env
    });

    // Send success response back to Slack
    return slackResponse(
      `✅ Issue created: <${issue.html_url}|#${issue.number} ${title}>\n` +
      `Priority: ${priority} | Labels: ${labels.join(', ')}`
    );

  } catch (error) {
    console.error('Error:', error);
    return slackResponse(`❌ Failed to create issue: ${error.message}`);
  }
}

async function createGitHubIssue({ title, body, labels, env }) {
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BlackRoad-Slack-Bot'
      },
      body: JSON.stringify({
        title,
        body,
        labels
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }

  return response.json();
}

function slackResponse(text) {
  return new Response(
    JSON.stringify({
      response_type: 'in_channel', // visible to everyone, or 'ephemeral' for private
      text: text
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Environment variables needed:
 * 
 * GITHUB_TOKEN - Personal access token with repo scope
 * GITHUB_OWNER - Your GitHub username or org
 * GITHUB_REPO  - Repository name
 * SLACK_SIGNING_SECRET - (optional) For verifying Slack requests
 * 
 * To verify Slack requests (recommended for production):
 * 
 * async function verifySlackRequest(request, signingSecret) {
 *   const timestamp = request.headers.get('x-slack-request-timestamp');
 *   const signature = request.headers.get('x-slack-signature');
 *   const body = await request.text();
 *   
 *   const baseString = `v0:${timestamp}:${body}`;
 *   const hmac = crypto.createHmac('sha256', signingSecret);
 *   hmac.update(baseString);
 *   const computed = `v0=${hmac.digest('hex')}`;
 *   
 *   return crypto.timingSafeEqual(
 *     Buffer.from(signature),
 *     Buffer.from(computed)
 *   );
 * }
 */
