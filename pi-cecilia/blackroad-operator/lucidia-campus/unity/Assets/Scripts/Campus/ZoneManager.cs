using System;
using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.LucidiaCampus.Campus
{
    /// <summary>
    /// Manages the six campus zones: loads/unloads zone content,
    /// tracks which zone the player/camera is in, and dispatches zone events.
    /// </summary>
    public class ZoneManager : MonoBehaviour
    {
        public enum Zone
        {
            CentralPlaza,       // Zone 1
            KnowledgeQuarter,   // Zone 2
            DevelopmentDistrict, // Zone 3
            InnovationPark,     // Zone 4
            OperationsCenter,   // Zone 5
            ResidentialRing     // Zone 6
        }

        [SerializeField] private CampusConfig config;
        [SerializeField] private Zone currentZone = Zone.CentralPlaza;

        public static event Action<Zone, Zone> OnZoneChanged; // (from, to)

        public Zone CurrentZone => currentZone;

        private readonly Dictionary<Zone, Rect> _zoneBounds = new();

        private void Awake()
        {
            if (config == null)
            {
                Debug.LogError("[ZoneManager] CampusConfig not assigned!");
                return;
            }

            _zoneBounds[Zone.CentralPlaza] = config.zone1CentralPlaza;
            _zoneBounds[Zone.KnowledgeQuarter] = config.zone2KnowledgeQuarter;
            _zoneBounds[Zone.DevelopmentDistrict] = config.zone3DevelopmentDistrict;
            _zoneBounds[Zone.InnovationPark] = config.zone4InnovationPark;
            _zoneBounds[Zone.OperationsCenter] = config.zone5OperationsCenter;
            // Residential Ring = entire perimeter (not a single rect)
        }

        /// <summary>
        /// Determine which zone a world position falls into.
        /// </summary>
        public Zone GetZoneAtPosition(Vector3 worldPosition)
        {
            Vector2 tilePos = new(
                worldPosition.x / config.tileSize,
                worldPosition.z / config.tileSize
            );

            foreach (var kvp in _zoneBounds)
            {
                if (kvp.Value.Contains(tilePos))
                    return kvp.Key;
            }

            // Default: perimeter positions are Residential Ring
            return Zone.ResidentialRing;
        }

        /// <summary>
        /// Call each frame with the player/camera position to check for zone transitions.
        /// </summary>
        public void UpdatePlayerPosition(Vector3 position)
        {
            Zone newZone = GetZoneAtPosition(position);
            if (newZone != currentZone)
            {
                Zone previous = currentZone;
                currentZone = newZone;
                OnZoneChanged?.Invoke(previous, newZone);
                Debug.Log($"[ZoneManager] Zone transition: {previous} -> {newZone}");
            }
        }
    }
}
