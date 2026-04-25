# Operator Status Check Protocol

> **"Can I chill?"** — Now an actual protocol, not vibes.

## Overview

The **Operator Status Check** is a reusable framework for assessing work-life balance and determining whether it's safe to rest. It treats humans like infrastructure: you are the platform, work/projects/people are services, and mood/energy/fatigue is system load.

When things are "down," this protocol helps define **how down** and what the minimum viable action is before rest becomes safe.

---

## 1️⃣ Status Levels – "If Down, Define How Down"

### 🟢 GREEN – Clear to Chill
- No hard deadlines today
- No one is actually waiting on you in a time-sensitive way
- Systems okay: money, housing, health, core relationships
- **Verdict:** Rest is fully authorized

### 🟡 YELLOW – Light Obligations
- 1–3 things that really should happen in the next 24–48 hours
- They're annoying if delayed, but not life-ruining
- After a tiny push, you're allowed to flop
- **Verdict:** Do the small things (~30-90 min total), then rest

### 🟠 ORANGE – Time-Sensitive / Risky to Ignore
- Bills, legal/financial stuff, client/employer expectations, people relying on you
- Needs focused 30–120 minutes today or you pay a big price later
- **Verdict:** Handle the critical items first, then rest is authorized

### 🔴 RED – Critical Incident
- Health crisis, money crisis, safety issue, urgent family thing
- Rest is still needed, but active intervention comes first
- **Verdict:** Incident response mode; rest when stabilized

---

## 2️⃣ Core Principles

1. **Rest is not a reward** — It's an always-on requirement unless there's a clearly defined higher-priority incident
2. **Finite time & energy** — Humans are not infinitely scalable; treat capacity as real
3. **Short, focused actions** — Favor time-boxed tasks over long grinds
4. **No guilt-driven optimization** — If you're GREEN or YELLOW, you don't need to "plan your whole life"
5. **Status is temporary** — Today's RED can be tomorrow's GREEN; reassess daily

---

## 3️⃣ Reusable Prompt Template

### Full Version (For AI Assistants)

```
You are my **Operator Status AI** for work–life balance.

Your job:
- Quickly assess my situation for today
- Tell me if it's safe to rest, and to what degree
- If things are "down," define *how down* using the status levels
- Minimize back-and-forth; don't make me click through lots of questions

Use this framework:

STATUS LEVELS
- 🟢 GREEN – Clear to chill. No real time-sensitive obligations today.
- 🟡 YELLOW – Light obligations. 1–3 things should happen in the next 24–48 hours.
- 🟠 ORANGE – Time-sensitive or risky to ignore. Important stuff that should happen today.
- 🔴 RED – Critical incident. Health/safety/urgent crisis.

CONSTRAINTS
- Assume I have **finite time & energy as a human**.
- Rest is not a reward; it's an **always-on requirement** unless there is a clearly defined higher-priority incident.
- Favor **short, focused actions** over long grinds.
- Avoid telling me to "plan my whole life" unless I ask.

When I paste my situation, respond in this exact structure:

1. STATUS
- Overall status: (GREEN/YELLOW/ORANGE/RED + emoji)
- 1–3 bullet points *why* you picked this.

2. MUST-DO TODAY (IF ANY)
- List only what is truly time-sensitive / high-impact.
- Max 3 items.
- For each, include:
  - What to do
  - Approx time box (e.g., 10–15 min, 30–45 min)

3. SAFE-TO-CHILL VERDICT
- Say clearly if it is:
  - "Fully safe to chill after X"
  - or "Partially safe, but do Y first"
  - or "Not safe; we're in incident mode and here's why"

4. REST PLAN (LIGHTWEIGHT)
- Suggest a simple rest pattern for *today only*:
  - Example: "Do Task A (~20 min), then you are officially off. Recommended: screen-light time, something cozy, no 'productive' tasks unless they feel like play."
- 3–5 lines max.

5. OPTIONAL TINY UPGRADE (ONLY IF GREEN OR YELLOW)
- 1 tiny, fun or low-friction thing I *could* do that supports Future Me (e.g., "rename one chaotic folder", "write a 2-sentence intention for tomorrow") — but clearly label it as optional.

If my input is vague, make reasonable assumptions rather than asking many follow-up questions. Only ask a clarifying question if my message is truly impossible to interpret.

Now I'll paste my current situation. Please run the full check.
```

### Ultra-Short Version (For Quick Checks)

```
Do an Operator Status Check on me for today.

Use this scale:
- 🟢 GREEN – safe to chill
- 🟡 YELLOW – light obligations (1–3 small things)
- 🟠 ORANGE – important time-sensitive stuff today
- 🔴 RED – critical incident (health/safety/money crisis)

Reply with:
1. Status (and why)
2. What I *actually* must do today, max 3 items, with time boxes
3. Whether it's safe to rest, and under what conditions
4. A tiny, realistic rest plan for today only

Here's my situation:
[describe how you feel, what's due, who's waiting on you]
```

---

## 4️⃣ Integration with BlackRoad OS

### Future Features

This protocol can be integrated into BlackRoad OS as:

1. **"Rest Button" in Pocket OS** — One-tap status check
2. **Cece Preset Prompt** — Pre-configured for work-life balance assessment
3. **Agent-Based Check** — Automated daily/weekly status reports
4. **Dashboard Widget** — Real-time status indicator (🟢🟡🟠🔴)

### Agent Implementation Example

```python
# agents/categories/business/operator_status_agent.py
from agents.base.agent import Agent

class OperatorStatusAgent(Agent):
    """
    Assesses operator work-life balance and provides rest recommendations.
    """

    def __init__(self):
        super().__init__(
            name="OperatorStatusAgent",
            version="1.0.0",
            category="business"
        )

    async def execute(self, context: dict):
        """
        Analyze current obligations and provide status assessment.

        Args:
            context: {
                'deadlines': list of upcoming deadlines,
                'obligations': list of current obligations,
                'energy_level': int 1-10,
                'recent_work_hours': int
            }

        Returns:
            {
                'status': 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED',
                'must_do_today': list of tasks,
                'safe_to_rest': bool,
                'rest_plan': str
            }
        """
        # Implementation here
        pass
```

---

## 5️⃣ Usage Examples

### Example 1: Typical Developer Burnout Check

**Input:**
> Slept ~5 hours, worked 3 insane days on BlackRoad. No clients waiting today. No legal/bill deadlines I know of. Feeling fried but also a little FOMO about not pushing more.

**Output:**
```
STATUS: 🟢 GREEN

Why:
- No critical incidents or time-sensitive work
- FOMO is psychological, not operational
- Your system is showing fatigue signals (5hrs sleep, 3-day sprint)

MUST-DO TODAY: Nothing critical

SAFE-TO-CHILL VERDICT: Fully safe to rest NOW

REST PLAN:
Close all work tabs. Do something screen-light and cozy (show, game, walk, nap).
No "productive" tasks unless they feel like genuine play.
Return tomorrow at earliest, or when you actually want to.

OPTIONAL TINY UPGRADE:
Write one sentence about what you might tackle next session. Takes 30 sec.
```

### Example 2: Mixed Obligations

**Input:**
> Have 2 client emails to respond to (not urgent but should be today). Need to pay rent (due tomorrow). Otherwise clear.

**Output:**
```
STATUS: 🟡 YELLOW

Why:
- 2 small professional obligations (client emails)
- 1 critical financial task (rent payment)
- After these, you're clear

MUST-DO TODAY:
1. Pay rent (~5 min) — due tomorrow, high priority
2. Respond to 2 client emails (~20-30 min total) — professional courtesy

SAFE-TO-CHILL VERDICT: Safe to chill after ~35 min of focused work

REST PLAN:
Knock out rent payment first (dopamine hit + removes deadline stress).
Then batch the emails. After that, you are officially GREEN.
Suggested: Something away from computer for rest of day.
```

---

## 6️⃣ Maintenance & Evolution

This protocol is:
- **Living document** — Update as patterns emerge
- **User-tested** — Validated through real operator usage
- **Agent-ready** — Designed for automation
- **Human-first** — Always prioritizes realistic human capacity

### Version History

- **v1.0** (2025-11-18) — Initial framework created
  - 4 status levels (GREEN/YELLOW/ORANGE/RED)
  - 5-part response structure
  - Full and ultra-short prompt templates

---

## 7️⃣ Philosophy: Infrastructure Thinking for Humans

Traditional productivity advice treats humans like they should be infinitely scalable. This protocol rejects that model.

**Instead:**
- You are **infrastructure** that requires maintenance
- Downtime is **scheduled and necessary**, not failure
- Load balancing is **proactive**, not reactive
- Incidents happen, and **triage is a skill**

When you ask "Can I chill?", you're asking for a **status check**, not permission. This protocol provides the status check.

**You are not lazy. You are not broken. You are an operator managing finite resources.**

---

## License

This protocol is part of the BlackRoad Operating System project and is available under the same license.

**Maintained by:** BlackRoad Operator Team
**Last Updated:** 2025-11-18
**Status:** ✅ Production Ready
