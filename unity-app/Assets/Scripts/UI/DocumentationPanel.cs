using UnityEngine;
using UnityEngine.UI;
using TMPro;
using BSI.Unity.Context7;
using System.Collections;
using System.Collections.Generic;

namespace BSI.Unity.UI
{
    /// <summary>
    /// UI Panel for displaying Context7 documentation.
    /// This component should NEVER make direct API calls - it only uses Context7Service.
    /// </summary>
    public class DocumentationPanel : MonoBehaviour
    {
        [Header("UI References")]
        public TMP_InputField searchInput;
        public TMP_Dropdown libraryDropdown;
        public TMP_InputField topicInput;
        public Slider tokenSlider;
        public TMP_Text tokenCountText;
        public Button searchButton;
        public ScrollRect contentScrollRect;
        public TMP_Text contentText;
        public Button clearButton;
        public TMP_Text statusText;

        [Header("UI Brand Colors - DO NOT MODIFY WITHOUT DESIGN REVIEW")]
        [SerializeField] private Color primaryColor = new Color(0f, 0.4f, 0.8f, 1f); // Blaze Blue
        [SerializeField] private Color secondaryColor = new Color(0.2f, 0.2f, 0.2f, 1f); // Blaze Dark
        [SerializeField] private Color accentColor = new Color(1f, 0.4f, 0f, 1f); // Blaze Orange

        [Header("Configuration")]
        [SerializeField] private int defaultTokens = 3000;
        [SerializeField] private int maxTokens = 8000;
        [SerializeField] private bool autoSearch = false;

        private List<string> searchHistory = new List<string>();
        private Context7Service context7Service;

        void Start()
        {
            InitializeUI();
            SetupEventListeners();
            PopulateLibraryDropdown();
            
            // Get reference to Context7Service
            context7Service = Context7Service.Instance;
            if (context7Service == null)
            {
                Debug.LogError("❌ Context7Service not found! Please ensure it's in the scene.");
                UpdateStatus("Context7Service not available", false);
            }
            else
            {
                UpdateStatus("Ready to search documentation", true);
            }
        }

        private void InitializeUI()
        {
            // Set up token slider
            if (tokenSlider != null)
            {
                tokenSlider.minValue = 500;
                tokenSlider.maxValue = maxTokens;
                tokenSlider.value = defaultTokens;
                UpdateTokenCount();
            }

            // Set up content text styling
            if (contentText != null)
            {
                contentText.text = "Search for documentation using the controls above.";
            }

            // Apply brand colors to UI elements
            ApplyBrandColors();
        }

        private void ApplyBrandColors()
        {
            // Apply brand colors to UI elements
            if (searchButton != null)
            {
                var colors = searchButton.colors;
                colors.normalColor = primaryColor;
                colors.highlightedColor = Color.Lerp(primaryColor, Color.white, 0.1f);
                searchButton.colors = colors;
            }

            if (clearButton != null)
            {
                var colors = clearButton.colors;
                colors.normalColor = secondaryColor;
                colors.highlightedColor = Color.Lerp(secondaryColor, Color.white, 0.1f);
                clearButton.colors = colors;
            }
        }

        private void SetupEventListeners()
        {
            if (searchButton != null)
                searchButton.onClick.AddListener(OnSearchClicked);
            
            if (clearButton != null)
                clearButton.onClick.AddListener(OnClearClicked);
            
            if (tokenSlider != null)
                tokenSlider.onValueChanged.AddListener(OnTokenSliderChanged);
            
            if (searchInput != null)
            {
                searchInput.onEndEdit.AddListener(OnSearchInputEndEdit);
            }
        }

        private void PopulateLibraryDropdown()
        {
            if (libraryDropdown == null) return;

            libraryDropdown.ClearOptions();
            
            var libraries = new List<string>
            {
                "Unity",
                "Sports Analytics", 
                "Python",
                "Biomechanics",
                "Machine Learning",
                "Data Visualization"
            };
            
            libraryDropdown.AddOptions(libraries);
        }

        private void OnSearchClicked()
        {
            PerformSearch();
        }

        private void OnClearClicked()
        {
            ClearContent();
        }

        private void OnTokenSliderChanged(float value)
        {
            UpdateTokenCount();
        }

        private void OnSearchInputEndEdit(string text)
        {
            if (autoSearch && !string.IsNullOrEmpty(text))
            {
                PerformSearch();
            }
        }

        private void UpdateTokenCount()
        {
            if (tokenCountText != null && tokenSlider != null)
            {
                tokenCountText.text = $"Tokens: {Mathf.RoundToInt(tokenSlider.value)}";
            }
        }

        private async void PerformSearch()
        {
            if (context7Service == null)
            {
                UpdateStatus("Context7Service not available", false);
                return;
            }

            string searchTerm = searchInput?.text ?? "";
            string library = GetSelectedLibrary();
            string topic = topicInput?.text ?? "";
            int tokens = Mathf.RoundToInt(tokenSlider?.value ?? defaultTokens);

            if (string.IsNullOrEmpty(searchTerm))
            {
                UpdateStatus("Please enter a search term", false);
                return;
            }

            UpdateStatus("Searching documentation...", true);
            
            // Add to search history
            if (!searchHistory.Contains(searchTerm))
            {
                searchHistory.Add(searchTerm);
                if (searchHistory.Count > 10) // Keep only last 10 searches
                {
                    searchHistory.RemoveAt(0);
                }
            }

            // Use Context7Service to get documentation
            var response = await context7Service.GetLibraryDocumentation(library, topic, tokens);
            
            if (response.success)
            {
                DisplayContent(response.content);
                UpdateStatus($"Found documentation for: {searchTerm}", true);
            }
            else
            {
                DisplayContent($"Error: {response.error}");
                UpdateStatus($"Search failed: {response.error}", false);
            }
        }

        private string GetSelectedLibrary()
        {
            if (libraryDropdown == null) return "/unity/unity";
            
            string selected = libraryDropdown.options[libraryDropdown.value].text;
            
            return selected switch
            {
                "Unity" => "/unity/unity",
                "Sports Analytics" => "/sports/analytics",
                "Python" => "/python/python",
                "Biomechanics" => "/sports/biomechanics",
                "Machine Learning" => "/ml/tensorflow",
                "Data Visualization" => "/viz/chartjs",
                _ => "/unity/unity"
            };
        }

        private void DisplayContent(string content)
        {
            if (contentText != null)
            {
                // Format content with basic markdown-like styling
                contentText.text = FormatContent(content);
            }

            // Scroll to top
            if (contentScrollRect != null)
            {
                contentScrollRect.verticalNormalizedPosition = 1f;
            }
        }

        private string FormatContent(string content)
        {
            // Basic formatting for better readability
            content = content.Replace("\\n", "\n");
            content = content.Replace("**", "<b>");
            content = content.Replace("__", "<b>");
            content = content.Replace("*", "<i>");
            content = content.Replace("`", "<color=#ff6b00>");
            
            return content;
        }

        private void ClearContent()
        {
            if (contentText != null)
            {
                contentText.text = "Content cleared. Ready for new search.";
            }
            
            UpdateStatus("Content cleared", true);
        }

        private void UpdateStatus(string message, bool isSuccess)
        {
            if (statusText != null)
            {
                statusText.text = message;
                statusText.color = isSuccess ? Color.green : Color.red;
            }
        }

        // Public methods for external access
        public void SetSearchTerm(string term)
        {
            if (searchInput != null)
            {
                searchInput.text = term;
            }
        }

        public void SetLibrary(string library)
        {
            if (libraryDropdown != null)
            {
                for (int i = 0; i < libraryDropdown.options.Count; i++)
                {
                    if (libraryDropdown.options[i].text == library)
                    {
                        libraryDropdown.value = i;
                        break;
                    }
                }
            }
        }

        public void SetTokenCount(int tokens)
        {
            if (tokenSlider != null)
            {
                tokenSlider.value = Mathf.Clamp(tokens, tokenSlider.minValue, tokenSlider.maxValue);
                UpdateTokenCount();
            }
        }

        public List<string> GetSearchHistory()
        {
            return new List<string>(searchHistory);
        }
    }
}