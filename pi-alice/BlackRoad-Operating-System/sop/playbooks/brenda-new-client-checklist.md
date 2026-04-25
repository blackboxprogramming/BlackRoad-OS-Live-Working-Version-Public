# New Client Kickoff Checklist (Brenda Edition)

**For:** Operations, Customer Success, Account Managers
**Time:** 30 minutes of your time, 5-10 minutes of robot time
**Last Updated:** 2025-11-17

---

## What This Is

This is your **simple, step-by-step guide** for onboarding a new client after a deal closes. Most of the work happens automatically, but you need to:

1. Make sure everything kicks off correctly
2. Fill in a few details the robots can't know
3. Verify everything worked
4. Communicate with the customer

**No technical knowledge required.** If something breaks, there are clear instructions for who to ask for help.

---

## Before You Start

You'll need:

- [ ] Access to Salesforce
- [ ] Access to Asana
- [ ] Client's primary contact info (name, email, phone)
- [ ] Client's domain preference (if custom)
- [ ] Package type they purchased (OS / Console / Custom)

---

## The Checklist

### 📋 **Part 1: Mark the Deal Closed (Day 0)**

**Where:** Salesforce

1. Open the **Opportunity** record for this deal
2. Click **Edit**
3. Change **Stage** to: `Closed Won`
4. Fill in these fields if they're empty:
   - **Account Name:** Company name
   - **Primary Contact:** Main person at the company
   - **Domain/Subdomain:** What they want their site to be called (e.g., `acme-portal`)
   - **Package Type:** OS / Console / Custom (what they bought)
   - **Service Tier:** Starter / Pro / Enterprise
   - **Start Date:** Today (or agreed start date)
5. Click **Save**

**What happens next (automatically):**
- A **Project** record gets created in Salesforce (within 2 minutes)
- Repos appear in GitHub (within 5-10 minutes)
- An **Asana project** gets created with all tasks (within 5-10 minutes)
- You get a **Slack notification** in #ops saying everything is ready

**⏱️ Wait 10 minutes**, then move to Part 2.

---

### ✅ **Part 2: Verify the Magic Happened (Day 0)**

**Where:** Salesforce → Project record

1. Go back to the **Opportunity** in Salesforce
2. Scroll down to **Related** → **Projects**
3. You should see a new **Project** record with a name like `ACME-X7K9`

**Click into the Project record and check:**

- [ ] **Project Key** is filled in (e.g., `ACME-X7K9`)
- [ ] **Status** says: `Setup In Progress`
- [ ] **Backend Repo URL** is filled in (a GitHub link)
- [ ] **Frontend Repo URL** is filled in (a GitHub link)
- [ ] **Ops Repo URL** is filled in (a GitHub link)
- [ ] **Asana Project URL** is filled in (an Asana link)

**If any of these are empty after 15 minutes:**
→ Something broke. Skip to "Troubleshooting" section below.

**If everything is filled in:**
→ 🎉 You're golden! Move to Part 3.

---

### 📝 **Part 3: Add Client-Specific Details (Day 0)**

**Where:** Asana

1. Click the **Asana Project URL** from the Salesforce Project record (opens Asana)
2. You should see a project with sections: Discovery, Architecture, Build, Testing, Go-Live
3. Go to the **Discovery** section
4. Click the task: **"Confirm domain + DNS with client"**
5. Assign it to **yourself**
6. Add a comment with:
   - Client's preferred domain/subdomain
   - Any special requests (custom branding, integrations, etc.)
   - Primary contact info
7. Click the task: **"Gather branding assets"**
8. Assign it to **Design team**
9. Add a comment with:
   - "Client: [Company Name]"
   - "Contact: [Name, Email]"
   - "Need: Logo, brand colors, fonts"

**Where:** Salesforce Project

1. Go back to the **Project** record in Salesforce
2. Click **Edit**
3. Fill in:
   - **Primary Contact:** Lookup the Contact record
   - **Technical Owner:** Assign to a developer (or leave blank for now)
   - **Customer Notes:** Any special context about this client
4. Click **Save**

---

### 📧 **Part 4: Notify the Client (Day 0-1)**

**Where:** Email / Phone

Send the client a friendly kickoff message:

**Template:**

> Subject: Welcome to BlackRoad! Your Project is Live 🚀
>
> Hi [Client Name],
>
> Great news! We've kicked off your project. Here's what's happening:
>
> **Your Project:** [Project Key, e.g., ACME-X7K9]
> **Package:** [OS / Console / Custom]
> **Next Steps:**
> 1. Our team will reach out within 24 hours to confirm your domain and branding.
> 2. We'll send you a staging link within 3-5 business days for initial review.
> 3. Your primary point of contact is [Technical Owner Name] for technical questions, and me for everything else.
>
> **Need anything?**
> Just reply to this email or call me at [your number].
>
> Looking forward to building something great together!
>
> [Your Name]
> [Your Title]
> BlackRoad

---

### 👀 **Part 5: Monitor Progress (Ongoing)**

**Where:** Asana (check daily)

1. Open the **Asana project** for this client
2. Look at tasks:
   - ✅ **Green checkmarks** = Done automatically or by the team
   - ⏳ **In Progress** = Someone's working on it
   - 🔴 **Overdue** = Needs attention

**What to watch for:**

- Tasks marked "blocked" → Check the comments, see what's blocking, help unblock
- Tasks overdue by > 2 days → Ping the assignee in Slack or Asana
- Client reaches out with questions → Add a task in Asana under "Discovery" section

**Where:** Salesforce Project (check weekly)

1. Open the **Project** record
2. Look at **Last Deploy At** field:
   - Should update every few days (means engineers are deploying)
   - If it's been > 1 week with no deploys → Ask in #ops "Is [Project Key] blocked?"

---

### 🎯 **Part 6: Final Review & Go-Live (Day 14-30)**

**Where:** Asana → "Go-Live" section

When you see the task **"Final client walkthrough"** assigned to you:

1. Schedule a 30-minute call with the client
2. Walk them through their staging environment
3. Get their final approval:
   - [ ] Design looks good
   - [ ] Functionality works as expected
   - [ ] They're ready to go live
4. In the Asana task, add a comment: "Client approved on [Date]. Ready for production."
5. Assign the task **"Deploy to production"** to **DevOps**

**What happens next (automatically):**
- Engineers deploy to production
- Your Asana task auto-completes when deploy succeeds
- Salesforce updates with production URL
- You get a Slack notification: "✅ [Project Key] is live!"

**Where:** Email the client

Send the go-live notification:

> Subject: You're Live! 🎉
>
> Hi [Client Name],
>
> Exciting news – your BlackRoad site is now **live in production**!
>
> **Your URL:** https://[their-domain].blackroad.app
> **Login credentials:** [sent separately via secure method]
>
> **What's next:**
> - We'll monitor the site 24/7 for the first week
> - If you notice anything unusual, email support@blackroad.com or reply here
> - We'll check in with you in 1 week to see how things are going
>
> Congratulations! 🚀
>
> [Your Name]

---

## Troubleshooting

### Problem: "Project record was created, but repos/Asana are empty after 15 minutes"

**Fix:**

1. Go to the **Project** record in Salesforce
2. Copy the **Project Key** (e.g., `ACME-X7K9`)
3. Go to GitHub: https://github.com/blackboxprogramming
4. Search for repos with that Project Key in the name
5. **If repos exist but URLs aren't in Salesforce:**
   - Manually copy the repo URLs into the Salesforce Project fields
   - Post in #ops: "Automation hiccup for [Project Key] – repos created but didn't sync to Salesforce"
6. **If repos DON'T exist:**
   - Post in #ops: "Urgent: GitHub repos not created for [Project Key]. Need manual setup."
   - Tag @devops

---

### Problem: "Asana project was never created"

**Fix:**

1. Manually create an Asana project:
   - Go to Asana
   - Click **+ New Project**
   - Name it: `[Account Name] - [Project Key]`
   - Choose **Board** view
2. Copy the project URL
3. Paste it into the Salesforce **Project** record → **Asana Project URL** field
4. Add these sections manually:
   - Discovery
   - Architecture
   - Build
   - Testing
   - Go-Live
5. Post in #ops: "Asana automation failed for [Project Key] – created manually"

---

### Problem: "Engineers are asking me technical questions I don't understand"

**Fix:**

1. **Don't guess.** It's okay to say "I don't know, let me find out."
2. Ask the client for clarification
3. Post the question + client's answer in the **Asana project** under the relevant task
4. Tag the engineer who asked

---

### Problem: "Client is frustrated / things are taking too long"

**Fix:**

1. Look at the **Asana project** → find which tasks are overdue
2. Post in #ops: "[Project Key] is delayed – [Task Name] is overdue. Can someone help?"
3. Schedule a call with the client to explain:
   - What's blocking us
   - New timeline
   - What we're doing to unblock
4. Follow up in **Salesforce** → Project record → add a note in **Customer Notes**

---

## Pro Tips

**Tip 1: Check Asana every morning**
Spend 5 minutes scanning all your active client projects. Catch issues early.

**Tip 2: Use Slack for quick questions**
If a task is blocked, post in #ops or #dev with the Asana task link. Much faster than email.

**Tip 3: Keep clients in the loop**
Send a quick "Hey, we deployed X this week" update every Friday. Clients love visibility.

**Tip 4: Use the Salesforce Activity feed**
Log every client call, email, or decision in Salesforce. Future-you will thank you.

**Tip 5: Trust the automation**
The robots are good at their job. If something doesn't auto-complete, it's probably because it's waiting on something manual (like your approval or client input). Check the task comments.

---

## Quick Reference

| I need to... | Go here... |
|-------------|-----------|
| Mark a deal closed | Salesforce → Opportunity → Change Stage to "Closed Won" |
| Check if automation worked | Salesforce → Project record → Check if URLs are filled |
| See what tasks need doing | Asana → Open the project for that client |
| Find GitHub repos | Salesforce → Project record → Click the repo URL links |
| See latest deploys | Salesforce → Project record → "Last Deploy At" field |
| Report a broken automation | Slack → #ops → Tag @devops |
| Ask a technical question | Slack → #dev → Include Asana task link |

---

## Who to Ask for Help

| If you need... | Ask... | Where... |
|---------------|--------|----------|
| Automation isn't working | @devops | Slack #ops |
| Task is blocked / unclear | The task assignee | Asana comment or Slack |
| Client has technical questions | @technical-owner (from Salesforce Project) | Slack or tag in Asana |
| Client is unhappy / escalation | Your manager | Slack DM or meeting |

---

## Remember

**You are the glue between the client and the robots.**

Your job is NOT to understand how GitHub Actions work or what a "CI pipeline" is.

Your job IS to:
- Make sure clients feel heard and informed
- Catch things that fall through the cracks
- Keep Asana and Salesforce up to date with client context
- Escalate technical issues to technical people

**The system is designed to make your life easier.** If it's not, tell us and we'll fix it.

---

**Questions?**
Post in #ops or email ops@blackroad.com
