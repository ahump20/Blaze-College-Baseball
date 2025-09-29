using System;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;
using System.Text;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace BSI.Unity.Context7
{
    [System.Serializable]
    public class MCPRequest
    {
        public string method;
        public Dictionary<string, object> parameters;
    }

    [System.Serializable]
    public class MCPResponse
    {
        public string result;
        public string error;
        public bool success;
    }

    public class MCPClient : MonoBehaviour
    {
        [Header("MCP Server Configuration")]
        public string serverUrl = "http://localhost:8080";
        public string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
        
        private HttpClient httpClient;
        private bool isConnected = false;

        void Start()
        {
            httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            TestConnection();
        }

        async void TestConnection()
        {
            try
            {
                var response = await httpClient.GetAsync($"{serverUrl}/health");
                isConnected = response.IsSuccessStatusCode;
                
                if (isConnected)
                {
                    Debug.Log("Context7 MCP Server connected successfully");
                }
                else
                {
                    Debug.LogWarning("Context7 MCP Server connection failed");
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"MCP Server connection error: {e.Message}");
                isConnected = false;
            }
        }

        public async Task<MCPResponse> SendRequest(string method, Dictionary<string, object> parameters = null)
        {
            if (!isConnected)
            {
                Debug.LogWarning("MCP Server not connected");
                return new MCPResponse { success = false, error = "Server not connected" };
            }

            try
            {
                var request = new MCPRequest
                {
                    method = method,
                    parameters = parameters ?? new Dictionary<string, object>()
                };

                string json = JsonConvert.SerializeObject(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await httpClient.PostAsync($"{serverUrl}/mcp", content);
                response.EnsureSuccessStatusCode();
                
                string responseBody = await response.Content.ReadAsStringAsync();
                var mcpResponse = JsonConvert.DeserializeObject<MCPResponse>(responseBody);
                
                return mcpResponse;
            }
            catch (Exception e)
            {
                Debug.LogError($"MCP Request failed: {e.Message}");
                return new MCPResponse { success = false, error = e.Message };
            }
        }

        public async Task<string> GetDocumentation(string library, string topic = "", int maxTokens = 5000)
        {
            var parameters = new Dictionary<string, object>
            {
                ["library"] = library,
                ["topic"] = topic,
                ["maxTokens"] = maxTokens
            };

            var response = await SendRequest("get_documentation", parameters);
            return response.success ? response.result : response.error;
        }

        public bool IsConnected => isConnected;

        void OnDestroy()
        {
            httpClient?.Dispose();
        }
    }
}