import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/common/ToastContainer";
import pageStyles from "../../assets/style/Page.module.css";
import styles from "../../assets/style/AIPages.module.css";
import { markdownToHtml } from "../../utils/markdownToHtml";

export default function ActiveAI() {
  const { showToast } = useToast();
  const [fitnessGoals, setFitnessGoals] = useState("");
  const [currentFitnessLevel, setCurrentFitnessLevel] = useState("");
  const [preferences, setPreferences] = useState("");
  const [restrictions, setRestrictions] = useState("");
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
      const response = await api.get("/exercise/history");
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
    if (!window.confirm("Are you sure you want to delete this exercise plan?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await api.delete(`/exercise/${id}`);
      if (response.data.success) {
        showToast("Exercise plan deleted successfully", "success");
        loadHistory();
      }
    } catch (error) {
      console.error("Error deleting exercise plan:", error);
      showToast(
        error.response?.data?.message || "Failed to delete exercise plan",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fitnessGoals.trim()) {
      showToast("Please enter your fitness goals", "error");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await api.post("/exercise/recommendations", {
        fitnessGoals,
        currentFitnessLevel,
        preferences,
        restrictions,
      });

      if (response.data.success) {
        setResult(response.data.data);
        showToast("Exercise recommendations generated successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error getting exercise recommendations:", error);
      showToast(
        error.response?.data?.message ||
          "Failed to get exercise recommendations. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
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
    if (!result || !fitnessGoals.trim()) {
      showToast("No recommendations to save", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post("/exercise/save", {
        fitnessGoals,
        currentFitnessLevel,
        preferences,
        restrictions,
        recommendations: result.recommendations || result.workoutPlan,
      });

      if (response.data.success) {
        setIsSaved(true);
        showToast("Exercise plan saved successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error saving exercise plan:", error);
      showToast(
        error.response?.data?.message || "Failed to save exercise plan",
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
            <h1>Exercise & Sports Recommendations</h1>
            <p>
              Get personalized exercise and sports recommendations based on your fitness goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formField}>
              <label htmlFor="fitnessGoals" className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Fitness Goals
              </label>
              <textarea
                id="fitnessGoals"
                value={fitnessGoals}
                onChange={(e) => setFitnessGoals(e.target.value)}
                className={styles.formTextarea}
                placeholder="Example: I want to build muscle, improve cardiovascular health, and increase flexibility..."
                disabled={loading}
                required
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="currentFitnessLevel" className={styles.formLabel}>
                Current Fitness Level (Optional)
              </label>
              <input
                id="currentFitnessLevel"
                type="text"
                value={currentFitnessLevel}
                onChange={(e) => setCurrentFitnessLevel(e.target.value)}
                className={styles.formInput}
                placeholder="Example: Beginner, Intermediate, Advanced"
                disabled={loading}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="preferences" className={styles.formLabel}>
                Exercise Preferences (Optional)
              </label>
              <input
                id="preferences"
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                className={styles.formInput}
                placeholder="Example: Prefer outdoor activities, enjoy swimming and running, etc."
                disabled={loading}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="restrictions" className={styles.formLabel}>
                Physical Restrictions (Optional)
              </label>
              <input
                id="restrictions"
                type="text"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className={styles.formInput}
                placeholder="Example: Knee injury, back problems, etc."
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !fitnessGoals.trim()}
              className={styles.submitButton}
            >
              {loading
                ? "Generating Recommendations..."
                : "Get Exercise Recommendations"}
            </button>
          </form>

          {result && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>
                  Your Personalized Exercise Plan
                </h2>
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
                      : "Save Plan"}
                  </button>
                </div>
              </div>

              <div
                className={styles.analysisContent}
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(result.recommendations),
                }}
              />

              <div className={styles.disclaimerBox}>
                <p className={styles.disclaimerText}>
                  <strong>Disclaimer:</strong> These recommendations are general
                  guidelines. Consult with a healthcare professional or certified
                  fitness trainer before starting any new exercise program,
                  especially if you have health concerns or physical restrictions.
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
                {showHistory ? "Hide History" : "View My Exercise Plan History"}
              </span>
              <span className={styles.historyToggleIcon}>
                {showHistory ? "▲" : "▼"}
              </span>
            </button>

            {showHistory && (
              <div className={styles.historyContainer}>
                <h3 className={styles.historyTitle}>Exercise Plan History</h3>
                {loadingHistory ? (
                  <p className={styles.historyLoading}>Loading history...</p>
                ) : history.length === 0 ? (
                  <p className={styles.historyEmpty}>
                    No previous exercise plans found.
                  </p>
                ) : (
                  <div className={styles.historyList}>
                    {history.map((plan) => (
                      <div key={plan.id || plan._id} className={styles.historyItem}>
                        <div className={styles.historyItemHeader}>
                          <div className={styles.historyItemHeaderLeft}>
                            <span className={styles.historyItemDate}>
                              {new Date(plan.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className={styles.historyItemActions}>
                            <button
                              onClick={() => handleDelete(plan.id || plan._id)}
                              disabled={deletingId === (plan.id || plan._id)}
                              className={styles.deleteButton}
                            >
                              {deletingId === (plan.id || plan._id) ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                        <div className={styles.historyItemContent}>
                          <span className={styles.historyItemLabel}>Fitness Goals:</span>
                          <span className={styles.historyItemText}>
                            {plan.fitnessGoals}
                          </span>
                        </div>
                        {plan.currentFitnessLevel && (
                          <div className={styles.historyItemContent}>
                            <span className={styles.historyItemLabel}>Fitness Level:</span>
                            <span className={styles.historyItemText}>
                              {plan.currentFitnessLevel}
                            </span>
                          </div>
                        )}
                        {plan.preferences && (
                          <div className={styles.historyItemContent}>
                            <span className={styles.historyItemLabel}>Preferences:</span>
                            <span className={styles.historyItemText}>
                              {plan.preferences}
                            </span>
                          </div>
                        )}
                        {plan.restrictions && (
                          <div className={styles.historyItemContent}>
                            <span className={styles.historyItemLabel}>Restrictions:</span>
                            <span className={styles.historyItemText}>
                              {plan.restrictions}
                            </span>
                          </div>
                        )}
                        <div
                          className={
                            isExpanded(plan.id || plan._id)
                              ? `${styles.historyItemAnalysis} ${styles.historyItemAnalysisExpanded}`
                              : styles.historyItemAnalysis
                          }
                          dangerouslySetInnerHTML={{
                            __html: markdownToHtml(plan.aiRecommendations || plan.workoutPlan),
                          }}
                        />
                        <div className={styles.historyItemFooter}>
                          <button
                            onClick={() => toggleExpand(plan.id || plan._id)}
                            className={styles.readMoreButton}
                          >
                            {isExpanded(plan.id || plan._id) ? "Show Less" : "Read More"}
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
