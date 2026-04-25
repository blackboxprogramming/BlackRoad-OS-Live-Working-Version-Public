using System;
using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.LucidiaCampus.Bridge
{
    /// <summary>
    /// WebSocket client connecting to the Campus Data Bridge.
    /// Receives NATS-relayed events and dispatches them to campus display systems.
    ///
    /// Attach to a persistent GameObject in the scene root.
    /// </summary>
    public class CampusBridgeClient : MonoBehaviour
    {
        [Header("Connection")]
        [SerializeField] private string bridgeUrl = "ws://192.168.4.38:9100";
        [SerializeField] private float reconnectDelay = 2f;
        [SerializeField] private float maxReconnectDelay = 16f;

        [Header("Status")]
        [SerializeField] private bool isConnected;
        [SerializeField] private int messagesReceived;

        /// <summary>
        /// Fired when a bridge message arrives. Key = target (e.g. "fountain.coherence").
        /// </summary>
        public static event Action<string, BridgeMessage> OnBridgeMessage;

        /// <summary>
        /// Fired when connection state changes.
        /// </summary>
        public static event Action<bool> OnConnectionChanged;

        private NativeWebSocket.WebSocket _ws;
        private float _currentReconnectDelay;
        private readonly Queue<string> _messageQueue = new();

        [Serializable]
        public class BridgeMessage
        {
            public string target;
            public long timestamp;
            public string data; // JSON string — consumers parse per target
        }

        private async void Start()
        {
            _currentReconnectDelay = reconnectDelay;
            await Connect();
        }

        private async System.Threading.Tasks.Task Connect()
        {
            _ws = new NativeWebSocket.WebSocket(bridgeUrl);

            _ws.OnOpen += () =>
            {
                Debug.Log($"[CampusBridge] Connected to {bridgeUrl}");
                isConnected = true;
                _currentReconnectDelay = reconnectDelay;
                OnConnectionChanged?.Invoke(true);
            };

            _ws.OnMessage += (bytes) =>
            {
                string json = System.Text.Encoding.UTF8.GetString(bytes);
                lock (_messageQueue)
                {
                    _messageQueue.Enqueue(json);
                }
            };

            _ws.OnClose += (code) =>
            {
                Debug.LogWarning($"[CampusBridge] Disconnected (code: {code})");
                isConnected = false;
                OnConnectionChanged?.Invoke(false);
                ScheduleReconnect();
            };

            _ws.OnError += (error) =>
            {
                Debug.LogError($"[CampusBridge] Error: {error}");
            };

            await _ws.Connect();
        }

        private void Update()
        {
            _ws?.DispatchMessageQueue();

            // Process queued messages on main thread
            lock (_messageQueue)
            {
                while (_messageQueue.Count > 0)
                {
                    string json = _messageQueue.Dequeue();
                    ProcessMessage(json);
                }
            }
        }

        private void ProcessMessage(string json)
        {
            try
            {
                var msg = JsonUtility.FromJson<BridgeMessage>(json);
                if (msg != null && !string.IsNullOrEmpty(msg.target))
                {
                    messagesReceived++;
                    OnBridgeMessage?.Invoke(msg.target, msg);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[CampusBridge] Failed to parse message: {ex.Message}");
            }
        }

        private async void ScheduleReconnect()
        {
            await System.Threading.Tasks.Task.Delay(
                (int)(_currentReconnectDelay * 1000)
            );

            // Exponential backoff
            _currentReconnectDelay = Mathf.Min(
                _currentReconnectDelay * 2f,
                maxReconnectDelay
            );

            Debug.Log("[CampusBridge] Attempting reconnect...");
            await Connect();
        }

        private async void OnDestroy()
        {
            if (_ws != null)
            {
                await _ws.Close();
            }
        }
    }
}
