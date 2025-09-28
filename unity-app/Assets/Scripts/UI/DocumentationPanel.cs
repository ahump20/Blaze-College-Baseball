using UnityEngine;
using UnityEngine.UI;
using TMPro;
using BSI.Unity.Context7;

namespace BSI.Unity.UI
{
    public class DocumentationPanel : MonoBehaviour
    {
        [Header("UI References")]
        public GameObject panel;
        public TMP_InputField searchInput;
        public TMP_Text documentationDisplay;
        public Button searchButton;
        public Button closeButton;
        public TMP_Dropdown libraryDropdown;
        public ScrollRect scrollRect;
        public TMP_Text statusText;

        [Header("Configuration")]
        public float searchDelay = 0.5f;
        public int maxDisplayLength = 5000;

        private DocumentationManager docManager;
        private bool isSearching = false;

        void Start()
        {
            SetupUI();
            docManager = FindObjectOfType<DocumentationManager>();
        }

        void SetupUI()
        {
            if (searchButton != null)
                searchButton.onClick.AddListener(OnSearchClicked);
            
            if (closeButton != null)
                closeButton.onClick.AddListener(OnCloseClicked);
            
            if (searchInput != null)
                searchInput.onValueChanged.AddListener(OnSearchInputChanged);
        }

        void OnSearchInputChanged(string value)
        {
            if (isSearching) return;
            
            if (!string.IsNullOrEmpty(value))
            {
                Invoke(nameof(PerformSearch), searchDelay);
            }
        }

        void OnSearchClicked()
        {
            if (searchInput != null)
                PerformSearch(searchInput.text);
        }

        void OnCloseClicked()
        {
            if (panel != null)
                panel.SetActive(false);
        }

        void PerformSearch()
        {
            if (searchInput == null || docManager == null) return;
            
            string query = searchInput.text;
            if (string.IsNullOrEmpty(query)) return;

            StartCoroutine(SearchCoroutine(query));
        }

        System.Collections.IEnumerator SearchCoroutine(string query)
        {
            isSearching = true;
            UpdateStatus("Searching...");

            // Simulate search delay
            yield return new WaitForSeconds(0.1f);

            try
            {
                // This would normally call the actual search method
                // For now, we'll simulate a response
                string result = SimulateDocumentationSearch(query);
                
                if (documentationDisplay != null)
                {
                    documentationDisplay.text = result;
                }
                
                UpdateStatus("Search completed");
            }
            catch (System.Exception e)
            {
                UpdateStatus($"Search failed: {e.Message}");
                if (documentationDisplay != null)
                    documentationDisplay.text = $"Error: {e.Message}";
            }
            finally
            {
                isSearching = false;
            }
        }

        string SimulateDocumentationSearch(string query)
        {
            // Simulate different responses based on query
            string lowerQuery = query.ToLower();
            
            if (lowerQuery.Contains("unity") || lowerQuery.Contains("gameobject"))
            {
                return @"Unity GameObject Documentation
                
A GameObject is the fundamental object in Unity scenes. Every object in your scene is a GameObject.

Key Properties:
- Transform: Position, rotation, and scale
- Components: Scripts and built-in components
- Tag: Identifier for grouping objects
- Layer: Used for rendering and physics

Common Methods:
- GameObject.Find(string name)
- GameObject.Instantiate(GameObject prefab)
- gameObject.SetActive(bool active)
- gameObject.GetComponent<T>()

Example Usage:
```csharp
// Create a new GameObject
GameObject newObject = new GameObject("MyObject");

// Add a component
Rigidbody rb = newObject.AddComponent<Rigidbody>();

// Set position
newObject.transform.position = Vector3.zero;
```";
            }
            else if (lowerQuery.Contains("sports") || lowerQuery.Contains("biomechanics"))
            {
                return @"Sports Analytics & Biomechanics Documentation
                
Biomechanical analysis in sports involves measuring and analyzing human movement patterns to improve performance and reduce injury risk.

Key Metrics:
- Hip-Shoulder Separation: Critical for power generation
- Elbow Valgus Angle: Injury risk indicator
- Pelvis Rotation Velocity: Energy transfer efficiency
- Ground Contact Time: Load phase duration

Data Processing Pipeline:
1. Pose Detection (MediaPipe/OpenPose)
2. Feature Extraction
3. Biomechanical Analysis
4. Performance Scoring
5. Visualization

Example Implementation:
```csharp
public class BiomechanicsAnalyzer : MonoBehaviour
{
    public float CalculateHipShoulderSeparation(Vector3 hip, Vector3 shoulder)
    {
        Vector3 separation = shoulder - hip;
        return Vector3.Angle(separation, Vector3.forward);
    }
}
```";
            }
            else
            {
                return $"Documentation search results for: '{query}'\n\nNo specific documentation found. Please try searching for:\n- Unity scripting\n- Sports analytics\n- Biomechanics\n- Machine learning\n- Computer vision";
            }
        }

        void UpdateStatus(string message)
        {
            if (statusText != null)
                statusText.text = message;
        }

        public void ShowPanel()
        {
            if (panel != null)
                panel.SetActive(true);
        }

        public void HidePanel()
        {
            if (panel != null)
                panel.SetActive(false);
        }

        public void TogglePanel()
        {
            if (panel != null)
                panel.SetActive(!panel.activeSelf);
        }
    }
}