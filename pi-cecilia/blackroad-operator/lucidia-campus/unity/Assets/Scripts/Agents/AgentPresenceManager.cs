using System.Collections.Generic;
using UnityEngine;
using BlackRoad.LucidiaCampus.Bridge;

namespace BlackRoad.LucidiaCampus.Agents
{
    /// <summary>
    /// Manages the pool of 1,000 agent NPCs.
    /// Listens to bridge "campus.presence" events and updates NPC positions.
    /// Spawns/despawns NPCs as agents come online/offline.
    /// </summary>
    public class AgentPresenceManager : MonoBehaviour
    {
        [SerializeField] private GameObject agentNPCPrefab;
        [SerializeField] private Transform agentContainer;
        [SerializeField] private int maxAgents = 1000;

        private readonly Dictionary<string, AgentNPC> _activeAgents = new();

        private void OnEnable()
        {
            CampusBridgeClient.OnBridgeMessage += HandleBridgeMessage;
        }

        private void OnDisable()
        {
            CampusBridgeClient.OnBridgeMessage -= HandleBridgeMessage;
        }

        private void HandleBridgeMessage(string target, CampusBridgeClient.BridgeMessage msg)
        {
            if (target != "campus.presence") return;

            // Parse presence update payload
            var update = JsonUtility.FromJson<PresenceUpdate>(msg.data);
            if (update == null || string.IsNullOrEmpty(update.agentId)) return;

            if (update.online)
            {
                SpawnOrMoveAgent(update);
            }
            else
            {
                DespawnAgent(update.agentId);
            }
        }

        private void SpawnOrMoveAgent(PresenceUpdate update)
        {
            if (_activeAgents.TryGetValue(update.agentId, out AgentNPC existing))
            {
                // Move existing agent
                existing.SetTargetPosition(new Vector3(update.x, 0, update.z));
                existing.assignedZone = update.zone;
                return;
            }

            // Spawn new agent if under capacity
            if (_activeAgents.Count >= maxAgents)
            {
                Debug.LogWarning("[AgentPresence] Max agent capacity reached");
                return;
            }

            GameObject go = Instantiate(agentNPCPrefab, agentContainer);
            go.name = $"Agent_{update.agentId}";

            AgentNPC npc = go.GetComponent<AgentNPC>();
            npc.Initialize(update.agentId, update.name, update.genesisHash, update.zone,
                           50f, 100f);

            go.transform.position = new Vector3(update.x, 0, update.z);
            _activeAgents[update.agentId] = npc;
        }

        private void DespawnAgent(string agentId)
        {
            if (_activeAgents.TryGetValue(agentId, out AgentNPC npc))
            {
                _activeAgents.Remove(agentId);
                Destroy(npc.gameObject);
            }
        }

        [System.Serializable]
        public class PresenceUpdate
        {
            public string agentId;
            public string name;
            public string genesisHash;
            public string zone;
            public float x;
            public float z;
            public bool online;
        }
    }
}
