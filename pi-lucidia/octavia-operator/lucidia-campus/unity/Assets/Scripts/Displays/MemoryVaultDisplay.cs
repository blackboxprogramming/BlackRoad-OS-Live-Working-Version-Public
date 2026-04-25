using System.Collections.Generic;
using UnityEngine;
using TMPro;
using BlackRoad.LucidiaCampus.Bridge;

namespace BlackRoad.LucidiaCampus.Displays
{
    /// <summary>
    /// Memory Vault Archive - Append-Only Chamber display.
    /// Shows live Lucidia journal entries scrolling on a central pillar.
    /// Rolling window of 100 entries to prevent overflow.
    ///
    /// Listens to bridge target: "vault.journal"
    /// </summary>
    public class MemoryVaultDisplay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro journalDisplay;
        [SerializeField] private Transform scrollContainer;

        [Header("Settings")]
        [SerializeField] private int maxVisibleEntries = 100;
        [SerializeField] private float scrollSpeed = 20f;
        [SerializeField] private float entryHeight = 0.15f;

        private readonly Queue<JournalEntry> _entries = new();
        private bool _needsRedraw = false;

        private void OnEnable()
        {
            CampusBridgeClient.OnBridgeMessage += HandleBridgeMessage;
        }

        private void OnDisable()
        {
            CampusBridgeClient.OnBridgeMessage -= HandleBridgeMessage;
        }

        private void Update()
        {
            if (_needsRedraw)
            {
                RedrawJournal();
                _needsRedraw = false;
            }
        }

        private void HandleBridgeMessage(string target, CampusBridgeClient.BridgeMessage msg)
        {
            if (target != "vault.journal") return;

            var entry = JsonUtility.FromJson<JournalEntry>(msg.data);
            if (entry == null) return;

            _entries.Enqueue(entry);

            // Trim to rolling window
            while (_entries.Count > maxVisibleEntries)
                _entries.Dequeue();

            _needsRedraw = true;
        }

        private void RedrawJournal()
        {
            if (journalDisplay == null) return;

            var sb = new System.Text.StringBuilder();
            foreach (var entry in _entries)
            {
                sb.AppendLine($"<color=#00FFFF>{entry.timestamp}</color>  " +
                              $"<color=#AAAAAA>{entry.agentId}</color>  " +
                              $"<color=#F5A623>{entry.truthStateHash}</color>");
            }

            journalDisplay.text = sb.ToString();
        }

        [System.Serializable]
        private class JournalEntry
        {
            public string timestamp;
            public string agentId;
            public string truthStateHash;
            public string content;
        }
    }
}
