export const salesforceConfig = {
  org: "securianfinancial-dev-ed",
  instanceUrl: "https://securianfinancial-dev-ed.my.salesforce.com",
  apiVersion: "v59.0",
};

export const dialerConfig = {
  name: "BlackRoad Dialer",
  callsPerHour: 30,
  dispositions: [
    { code: "CONNECTED", label: "Connected", nextAction: "log_call" },
    { code: "VOICEMAIL", label: "Left Voicemail", nextAction: "schedule_followup" },
    { code: "NO_ANSWER", label: "No Answer", nextAction: "retry_queue" },
    { code: "BUSY", label: "Busy", nextAction: "retry_queue" },
    { code: "WRONG_NUMBER", label: "Wrong Number", nextAction: "update_record" },
    { code: "DNC", label: "Do Not Call", nextAction: "remove_from_list" },
    { code: "CALLBACK", label: "Callback Requested", nextAction: "schedule_callback" },
    { code: "QUALIFIED", label: "Qualified Lead", nextAction: "create_opportunity" },
    { code: "NOT_INTERESTED", label: "Not Interested", nextAction: "nurture_sequence" },
  ],
  retryRules: {
    NO_ANSWER: { maxAttempts: 3, delayHours: 24 },
    BUSY: { maxAttempts: 5, delayHours: 2 },
    VOICEMAIL: { maxAttempts: 2, delayHours: 48 },
  },
};

export const dialerQueues = [
  { id: "hot_leads", name: "Hot Leads", priority: 1, soql: "SELECT Id, Name, Phone, Company FROM Lead WHERE Status = 'Hot' AND Phone != null" },
  { id: "warm_leads", name: "Warm Leads", priority: 2, soql: "SELECT Id, Name, Phone, Company FROM Lead WHERE Status = 'Warm' AND Phone != null" },
  { id: "callbacks", name: "Scheduled Callbacks", priority: 1, soql: "SELECT Id, Name, Phone FROM Task WHERE Subject LIKE 'Callback%' AND ActivityDate = TODAY" },
  { id: "reengagement", name: "Re-engagement", priority: 3, soql: "SELECT Id, Name, Phone FROM Contact WHERE LastActivityDate < LAST_N_DAYS:90" },
];

export const callScripts = {
  opener: "Hi, this is {agent_name} from BlackRoad. Is this {contact_name}?",
  pitch: "I'm reaching out because we're helping companies like {company} with AI-powered operations...",
  objections: {
    "not_interested": "I totally understand. Quick question before I let you go - what's your biggest operational challenge right now?",
    "no_time": "I hear you, you're busy. When would be a better time for a 5-minute call?",
    "send_info": "Absolutely. What email should I send that to? And what specifically would be most useful for you?",
  },
  close: "Great talking with you. I'll {next_action} and follow up {followup_timing}.",
};

export const twilioConfig = {
  // Fill in when ready
  accountSid: "",
  authToken: "",
  fromNumber: "",
};
