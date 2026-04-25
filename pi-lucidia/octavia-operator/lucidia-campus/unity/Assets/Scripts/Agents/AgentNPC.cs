using UnityEngine;

namespace BlackRoad.LucidiaCampus.Agents
{
    /// <summary>
    /// Represents a single agent NPC on campus.
    /// Handles pathfinding to assigned zone, LOD switching, idle behaviors.
    ///
    /// LOD strategy (from CampusConfig):
    ///   - Within 50 tiles: full animation rig
    ///   - 50-100 tiles: simplified sprite
    ///   - Beyond 100 tiles: colored dot
    /// </summary>
    public class AgentNPC : MonoBehaviour
    {
        [Header("Identity")]
        public string agentId;
        public string agentName;
        public string genesisHash;
        public string assignedZone;

        [Header("Visual")]
        [SerializeField] private GameObject fullModel;
        [SerializeField] private SpriteRenderer spriteRenderer;
        [SerializeField] private MeshRenderer dotRenderer;

        [Header("State")]
        [SerializeField] private AgentLOD currentLOD = AgentLOD.Full;
        [SerializeField] private AgentState currentState = AgentState.Idle;

        public enum AgentLOD { Full, Sprite, Dot }
        public enum AgentState { Idle, Walking, Working, Sitting, Chatting }

        private Transform _cameraTransform;
        private float _lodFullDistance = 50f;
        private float _lodSpriteDistance = 100f;

        public void Initialize(string id, string name, string genesis, string zone,
                               float lodFull, float lodSprite)
        {
            agentId = id;
            agentName = name;
            genesisHash = genesis;
            assignedZone = zone;
            _lodFullDistance = lodFull;
            _lodSpriteDistance = lodSprite;
        }

        private void Start()
        {
            _cameraTransform = Camera.main?.transform;
        }

        private void Update()
        {
            if (_cameraTransform == null) return;

            float distance = Vector3.Distance(
                transform.position, _cameraTransform.position
            );

            UpdateLOD(distance);
        }

        private void UpdateLOD(float distanceToCamera)
        {
            AgentLOD targetLOD;

            if (distanceToCamera <= _lodFullDistance)
                targetLOD = AgentLOD.Full;
            else if (distanceToCamera <= _lodSpriteDistance)
                targetLOD = AgentLOD.Sprite;
            else
                targetLOD = AgentLOD.Dot;

            if (targetLOD == currentLOD) return;

            currentLOD = targetLOD;

            if (fullModel != null) fullModel.SetActive(currentLOD == AgentLOD.Full);
            if (spriteRenderer != null) spriteRenderer.enabled = currentLOD == AgentLOD.Sprite;
            if (dotRenderer != null) dotRenderer.enabled = currentLOD == AgentLOD.Dot;
        }

        /// <summary>
        /// Update agent position from NATS presence event.
        /// </summary>
        public void SetTargetPosition(Vector3 target)
        {
            currentState = AgentState.Walking;
            // NavMeshAgent pathfinding would be set here
            // For now, lerp toward target
        }

        /// <summary>
        /// Set idle state when agent arrives at destination.
        /// </summary>
        public void SetIdle()
        {
            currentState = AgentState.Idle;
        }
    }
}
