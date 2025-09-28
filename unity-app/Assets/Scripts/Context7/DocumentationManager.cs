using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace BSI.Unity.Context7
{
    public class DocumentationManager : MonoBehaviour
    {
        [Header("UI References")]
        public GameObject documentationPanel;
        public TMP_InputField searchField;
        public TMP_Text documentationText;
        public Button searchButton;
        public Button clearButton;
        public TMP_Dropdown libraryDropdown;

        [Header("Configuration")]
        public float searchDelay = 0.5f;
        
        private Context7Integration context7;
        private MCPClient mcpClient;
        private Coroutine searchCoroutine;

        void Start()
        {
            context7 = GetComponent<Context7Integration>();
            mcpClient = GetComponent<MCPClient>();
            
            SetupUI();
            PopulateLibraryDropdown();
        }

        void SetupUI()
        {
            if (searchButton != null)
                searchButton.onClick.AddListener(OnSearchClicked);
            
            if (clearButton != null)
                clearButton.onClick.AddListener(OnClearClicked);
            
            if (searchField != null)
                searchField.onValueChanged.AddListener(OnSearchFieldChanged);
        }

        void PopulateLibraryDropdown()
        {
            if (libraryDropdown != null)
            {
                libraryDropdown.ClearOptions();
                libraryDropdown.AddOptions(new System.Collections.Generic.List<string>
                {
                    "Unity Engine",
                    "Sports Analytics",
                    "Python Data Science",
                    "Machine Learning",
                    "Computer Vision"
                });
            }
        }

        void OnSearchFieldChanged(string value)
        {
            if (searchCoroutine != null)
                StopCoroutine(searchCoroutine);
            
            if (!string.IsNullOrEmpty(value))
                searchCoroutine = StartCoroutine(DelayedSearch(value));
        }

        IEnumerator DelayedSearch(string query)
        {
            yield return new WaitForSeconds(searchDelay);
            PerformSearch(query);
        }

        void OnSearchClicked()
        {
            if (searchField != null)
                PerformSearch(searchField.text);
        }

        void OnClearClicked()
        {
            if (documentationText != null)
                documentationText.text = "";
            
            if (searchField != null)
                searchField.text = "";
        }

        async void PerformSearch(string query)
        {
            if (string.IsNullOrEmpty(query) || context7 == null)
                return;

            try
            {
                string libraryId = GetSelectedLibraryId();
                string result = await context7.GetLibraryDocs(libraryId, query, 5000);
                
                if (documentationText != null)
                {
                    documentationText.text = result ?? "No documentation found for the given query.";
                }
            }
            catch (Exception e)
            {
                Debug.LogError($"Documentation search failed: {e.Message}");
                if (documentationText != null)
                    documentationText.text = $"Error: {e.Message}";
            }
        }

        string GetSelectedLibraryId()
        {
            if (libraryDropdown == null)
                return "/unity/unity";

            return libraryDropdown.value switch
            {
                0 => "/unity/unity",
                1 => "/sports/analytics",
                2 => "/python/python",
                3 => "/ml/machine-learning",
                4 => "/cv/computer-vision",
                _ => "/unity/unity"
            };
        }

        public void ShowDocumentationPanel()
        {
            if (documentationPanel != null)
                documentationPanel.SetActive(true);
        }

        public void HideDocumentationPanel()
        {
            if (documentationPanel != null)
                documentationPanel.SetActive(false);
        }
    }
}