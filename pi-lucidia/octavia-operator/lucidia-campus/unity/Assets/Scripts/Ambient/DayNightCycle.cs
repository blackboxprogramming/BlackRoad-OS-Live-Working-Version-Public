using UnityEngine;

namespace BlackRoad.LucidiaCampus.Ambient
{
    /// <summary>
    /// Controls the campus day/night cycle.
    /// Rotates the directional light, adjusts ambient color, and
    /// activates/deactivates lamppost lights based on time of day.
    ///
    /// Phases: Day (6-18) -> Dusk (18-20) -> Night (20-6) -> Dawn (5-7)
    /// </summary>
    public class DayNightCycle : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Light directionalLight;
        [SerializeField] private Material skyboxMaterial;
        [SerializeField] private GameObject[] lampposts;

        [Header("Timing")]
        [Tooltip("Duration of one full day in real seconds")]
        [SerializeField] private float dayCycleDuration = 1440f; // 24 real minutes

        [Header("Colors")]
        [SerializeField] private Gradient ambientColorGradient;
        [SerializeField] private Gradient lightColorGradient;
        [SerializeField] private AnimationCurve lightIntensityCurve;

        [Header("State")]
        [SerializeField] [Range(0f, 24f)] private float currentHour = 12f;

        public float CurrentHour => currentHour;

        public enum DayPhase { Dawn, Day, Dusk, Night }

        public DayPhase CurrentPhase
        {
            get
            {
                if (currentHour >= 5f && currentHour < 7f) return DayPhase.Dawn;
                if (currentHour >= 7f && currentHour < 18f) return DayPhase.Day;
                if (currentHour >= 18f && currentHour < 20f) return DayPhase.Dusk;
                return DayPhase.Night;
            }
        }

        private void Update()
        {
            // Advance time
            float hoursPerSecond = 24f / dayCycleDuration;
            currentHour += hoursPerSecond * Time.deltaTime;
            if (currentHour >= 24f) currentHour -= 24f;

            float t = currentHour / 24f;

            // Rotate sun
            if (directionalLight != null)
            {
                float sunAngle = (t * 360f) - 90f;
                directionalLight.transform.rotation = Quaternion.Euler(sunAngle, 170f, 0f);
                directionalLight.color = lightColorGradient.Evaluate(t);
                directionalLight.intensity = lightIntensityCurve.Evaluate(t);
            }

            // Ambient color
            RenderSettings.ambientLight = ambientColorGradient.Evaluate(t);

            // Lampposts: on during dusk/night, off during day/dawn
            bool lampsOn = currentHour >= 18f || currentHour < 6f;
            if (lampposts != null)
            {
                foreach (var lamp in lampposts)
                {
                    if (lamp != null)
                        lamp.SetActive(lampsOn);
                }
            }
        }
    }
}
