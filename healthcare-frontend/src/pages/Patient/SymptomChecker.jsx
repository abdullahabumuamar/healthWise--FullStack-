import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/common/ToastContainer";
import pageStyles from "../../assets/style/Page.module.css";
import styles from "../../assets/style/AIPages.module.css";
import { markdownToHtml } from "../../utils/markdownToHtml";

export default function SymptomChecker() {
  const { showToast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await api.get("/symptoms/history");
      if (response.data.success) {
        // Sort by most recent first
        const sorted = [...(response.data.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setHistory(sorted);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      showToast("Failed to load history", "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleHistory = () => {
    if (!showHistory && history.length === 0) {
      loadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this symptom check?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await api.delete(`/symptoms/${id}`);
      if (response.data.success) {
        showToast("Symptom check deleted successfully", "success");
        loadHistory();
      }
    } catch (error) {
      console.error("Error deleting symptom check:", error);
      showToast(
        error.response?.data?.message || "Failed to delete symptom check",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      showToast("Please enter your symptoms", "error");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await api.post("/symptoms/analyze", { symptoms });

      if (response.data.success) {
        setResult(response.data.data);
        showToast("Symptoms analyzed successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      showToast(
        error.response?.data?.message ||
          "Failed to analyze symptoms. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    if (severity === "high") return styles.severityHigh;
    if (severity === "medium") return styles.severityMedium;
    return styles.severityLow;
  };

  const toggleExpand = (id) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id) => expandedItems.has(id);

  const handleSave = async () => {
    if (!result || !symptoms.trim()) {
      showToast("No analysis to save", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post("/symptoms/save", {
        symptoms,
        analysis: result.analysis,
        recommendations: result.recommendations || result.analysis,
        severity: result.severity || "low",
      });

      if (response.data.success) {
        setIsSaved(true);
        showToast("Symptom check saved successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error saving symptom check:", error);
      showToast(
        error.response?.data?.message || "Failed to save symptom check",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`container ${pageStyles.wrap}`}>
      <div className={pageStyles.content}>
        <div className={styles.pageContainer}>
          <div className={styles.pageHeader}>
            <h1>Symptom Checker</h1>
            <p>Describe your symptoms and get AI-powered preliminary analysis</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formField}>
              <label htmlFor="symptoms" className={styles.formLabel}>
                Describe Your Symptoms
              </label>
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className={styles.formTextarea}
                placeholder="Example: I've been experiencing headaches for the past 3 days, along with nausea and sensitivity to light..."
                disabled={loading}
                rows={6}
              />
              <p className={styles.formHelperText}>
                Be as detailed as possible. Include duration, severity, and any
                other relevant information.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className={styles.submitButton}
            >
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </button>
          </form>

          {result && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>Analysis Results</h2>
                <div className={styles.resultsActions}>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isSaved}
                    className={isSaved ? styles.saveButtonSaved : styles.saveButton}
                  >
                    {isSaving
                      ? "Saving..."
                      : isSaved
                      ? "✓ Saved"
                      : "Save Analysis"}
                  </button>
                </div>
              </div>

              <div className={`${styles.severityBadge} ${getSeverityClass(result.severity)}`}>
                Severity: {result.severity?.toUpperCase() || "LOW"}
              </div>

              <div
                className={styles.analysisContent}
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(result.analysis),
                }}
              />

              <div className={styles.disclaimerBox}>
                <p className={styles.disclaimerText}>
                  <strong>Disclaimer:</strong> This analysis is for
                  informational purposes only and is not a substitute for
                  professional medical advice, diagnosis, or treatment. Always
                  seek the advice of your physician or other qualified health
                  provider with any questions you may have regarding a medical
                  condition.
                </p>
              </div>
            </div>
          )}

          <div className={styles.historySection}>
            <button
              onClick={handleToggleHistory}
              className={styles.historyToggleButton}
            >
              <span>
                {showHistory ? "Hide History" : "View My Symptom Check History"}
              </span>
              <span className={styles.historyToggleIcon}>
                {showHistory ? "▲" : "▼"}
              </span>
            </button>

            {showHistory && (
              <div className={styles.historyContainer}>
                <h3 className={styles.historyTitle}>Symptom Check History</h3>
                {loadingHistory ? (
                  <p className={styles.historyLoading}>Loading history...</p>
                ) : history.length === 0 ? (
                  <p className={styles.historyEmpty}>
                    No previous symptom checks found.
                  </p>
                ) : (
                  <div className={styles.historyList}>
                    {history.map((check) => (
                      <div key={check.id || check._id} className={styles.historyItem}>
                        <div className={styles.historyItemHeader}>
                          <div className={styles.historyItemHeaderLeft}>
                            <span className={styles.historyItemDate}>
                              {new Date(check.createdAt).toLocaleDateString()}
                            </span>
                            <span
                              className={`${styles.historyItemBadge} ${getSeverityClass(
                                check.severity || "low"
                              )}`}
                            >
                              {check.severity?.toUpperCase() || "LOW"}
                            </span>
                          </div>
                          <div className={styles.historyItemActions}>
                            <button
                              onClick={() => handleDelete(check.id || check._id)}
                              disabled={deletingId === (check.id || check._id)}
                              className={styles.deleteButton}
                            >
                              {deletingId === (check.id || check._id) ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                        <div className={styles.historyItemContent}>
                          <span className={styles.historyItemLabel}>Symptoms:</span>
                          <span className={styles.historyItemText}>
                            {check.symptoms}
                          </span>
                        </div>
                        <div
                          className={
                            isExpanded(check.id || check._id)
                              ? `${styles.historyItemAnalysis} ${styles.historyItemAnalysisExpanded}`
                              : styles.historyItemAnalysis
                          }
                          dangerouslySetInnerHTML={{
                            __html: markdownToHtml(check.aiAnalysis || check.recommendations),
                          }}
                        />
                        <div className={styles.historyItemFooter}>
                          <button
                            onClick={() => toggleExpand(check.id || check._id)}
                            className={styles.readMoreButton}
                          >
                            {isExpanded(check.id || check._id) ? "Show Less" : "Read More"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
