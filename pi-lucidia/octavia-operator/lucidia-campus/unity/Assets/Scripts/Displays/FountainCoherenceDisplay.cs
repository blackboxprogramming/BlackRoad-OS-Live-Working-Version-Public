using UnityEngine;
using TMPro;
using BlackRoad.LucidiaCampus.Bridge;

namespace BlackRoad.LucidiaCampus.Displays
{
    /// <summary>
    /// Central Plaza fountain display.
    /// Shows the Z-framework equation (Z := yx - w) as a rotating hologram
    /// and the current C(t) coherence value as floating text.
    ///
    /// Listens to bridge target: "fountain.coherence"
    /// </summary>
    public class FountainCoherenceDisplay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private TextMeshPro coherenceText;
        [SerializeField] private TextMeshPro equationText;
        [SerializeField] private Transform hologramPivot;
        [SerializeField] private ParticleSystem fountainParticles;

        [Header("Animation")]
        [SerializeField] private float rotationSpeed = 15f;
        [SerializeField] private float floatAmplitude = 0.3f;
        [SerializeField] private float floatFrequency = 0.5f;

        [Header("State")]
        [SerializeField] private float currentCoherence = 0f;
        [SerializeField] private bool isOnline = true;

        private Vector3 _hologramBasePosition;

        private void Awake()
        {
            if (equationText != null)
                equationText.text = "Z := yx - w";

            if (hologramPivot != null)
                _hologramBasePosition = hologramPivot.localPosition;
        }

        private void OnEnable()
        {
            CampusBridgeClient.OnBridgeMessage += HandleBridgeMessage;
            CampusBridgeClient.OnConnectionChanged += HandleConnectionChanged;
        }

        private void OnDisable()
        {
            CampusBridgeClient.OnBridgeMessage -= HandleBridgeMessage;
            CampusBridgeClient.OnConnectionChanged -= HandleConnectionChanged;
        }

        private void Update()
        {
            // Rotate hologram
            if (hologramPivot != null)
            {
                hologramPivot.Rotate(Vector3.up, rotationSpeed * Time.deltaTime);

                // Float up and down
                Vector3 pos = _hologramBasePosition;
                pos.y += Mathf.Sin(Time.time * floatFrequency * Mathf.PI * 2f) * floatAmplitude;
                hologramPivot.localPosition = pos;
            }
        }

        private void HandleBridgeMessage(string target, CampusBridgeClient.BridgeMessage msg)
        {
            if (target != "fountain.coherence") return;

            var data = JsonUtility.FromJson<CoherenceData>(msg.data);
            if (data == null) return;

            currentCoherence = data.value;
            UpdateDisplay();
        }

        private void HandleConnectionChanged(bool connected)
        {
            isOnline = connected;
            UpdateDisplay();
        }

        private void UpdateDisplay()
        {
            if (coherenceText == null) return;

            if (!isOnline)
            {
                coherenceText.text = "C(t) = OFFLINE";
                coherenceText.color = Color.gray;
                return;
            }

            coherenceText.text = $"C(t) = {currentCoherence:F4}";

            // Color based on coherence level
            if (currentCoherence >= 0.9f)
                coherenceText.color = Color.green;
            else if (currentCoherence >= 0.7f)
                coherenceText.color = Color.yellow;
            else
                coherenceText.color = Color.red;
        }

        [System.Serializable]
        private class CoherenceData
        {
            public float value;
            public long timestamp;
        }
    }
}
