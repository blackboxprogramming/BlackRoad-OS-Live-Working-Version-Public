using UnityEngine;

namespace BlackRoad.LucidiaCampus.Campus
{
    /// <summary>
    /// Global campus configuration — zone boundaries, brand colors, scale constants.
    /// Scriptable object: create via Assets > Create > BlackRoad > Campus Config.
    /// </summary>
    [CreateAssetMenu(fileName = "CampusConfig", menuName = "BlackRoad/Campus Config")]
    public class CampusConfig : ScriptableObject
    {
        [Header("Campus Scale")]
        [Tooltip("Total campus size in tiles (one axis)")]
        public int campusSizeTiles = 200;

        [Tooltip("Tile size in Unity world units")]
        public float tileSize = 1f;

        [Tooltip("Maximum concurrent agent NPCs")]
        public int maxAgentNPCs = 1000;

        [Header("Zone Boundaries (tile coordinates, origin = bottom-left)")]
        public Rect zone1CentralPlaza = new(80, 80, 40, 40);
        public Rect zone2KnowledgeQuarter = new(60, 150, 80, 50);
        public Rect zone3DevelopmentDistrict = new(150, 60, 50, 80);
        public Rect zone4InnovationPark = new(0, 60, 50, 80);
        public Rect zone5OperationsCenter = new(60, 0, 80, 50);

        [Header("Brand Colors (BlackRoad Design System)")]
        public Color brandBlack = new(0f, 0f, 0f, 1f);
        public Color brandWhite = new(1f, 1f, 1f, 1f);
        public Color brandAmber = new(0.961f, 0.651f, 0.137f, 1f);       // #F5A623
        public Color brandHotPink = new(1f, 0.114f, 0.424f, 1f);         // #FF1D6C
        public Color brandElectricBlue = new(0.161f, 0.475f, 1f, 1f);    // #2979FF
        public Color brandViolet = new(0.612f, 0.153f, 0.69f, 1f);       // #9C27B0

        [Header("LOD Distances (tiles)")]
        [Tooltip("Full animation rig distance")]
        public float lodFullDistance = 50f;

        [Tooltip("Simplified sprite distance")]
        public float lodSpriteDistance = 100f;

        [Header("Day/Night Cycle")]
        [Tooltip("Duration of one full day cycle in real seconds")]
        public float dayCycleDurationSeconds = 1440f; // 24 min = 1 day

        [Header("Golden Ratio Spacing")]
        public float spaceXS = 8f;
        public float spaceSM = 13f;
        public float spaceMD = 21f;
        public float spaceLG = 34f;
        public float spaceXL = 55f;
    }
}
