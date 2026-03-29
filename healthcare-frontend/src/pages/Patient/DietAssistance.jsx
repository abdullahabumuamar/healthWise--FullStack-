import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../components/common/ToastContainer";
import pageStyles from "../../assets/style/Page.module.css";
import styles from "../../assets/style/AIPages.module.css";
import { markdownToHtml } from "../../utils/markdownToHtml";

export default function DietAssistance() {
  const { showToast } = useToast();
  const [healthGoals, setHealthGoals] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState("");
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
      const response = await api.get("/diet/history");
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
    if (!window.confirm("Are you sure you want to delete this diet plan?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await api.delete(`/diet/${id}`);
      if (response.data.success) {
        showToast("Diet plan deleted successfully", "success");
        loadHistory();
      }
    } catch (error) {
      console.error("Error deleting diet plan:", error);
      showToast(
        error.response?.data?.message || "Failed to delete diet plan",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!healthGoals.trim()) {
      showToast("Please enter your health goals", "error");
      return;
    }

    setLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const response = await api.post("/diet/recommendations", {
        healthGoals,
        dietaryPreferences,
        restrictions,
      });

      if (response.data.success) {
        setResult(response.data.data);
        showToast("Diet recommendations generated successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error getting diet recommendations:", error);
      showToast(
        error.response?.data?.message ||
          "Failed to get diet recommendations. Please try again.",
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
    if (!result || !healthGoals.trim()) {
      showToast("No recommendations to save", "error");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post("/diet/save", {
        healthGoals,
        dietaryPreferences,
        restrictions,
        recommendations: result.recommendations || result.mealPlan,
      });

      if (response.data.success) {
        setIsSaved(true);
        showToast("Diet plan saved successfully", "success");
        if (showHistory) {
          loadHistory();
        }
      }
    } catch (error) {
      console.error("Error saving diet plan:", error);
      showToast(
        error.response?.data?.message || "Failed to save diet plan",
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
            <h1>Diet Assistance</h1>
            <p>
              Get personalized dietary recommendations based on your health goals
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formField}>
              <label htmlFor="healthGoals" className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Health Goals
              </label>
              <textarea
                id="healthGoals"
                value={healthGoals}
                onChange={(e) => setHealthGoals(e.target.value)}
                className={styles.formTextarea}
                placeholder="Example: I want to lose weight, improve my energy levels, and manage my blood sugar..."
                disabled={loading}
                required
                rows={4}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="dietaryPreferences" className={styles.formLabel}>
                Dietary Preferences (Optional)
              </label>
              <input
                id="dietaryPreferences"
                type="text"
                value={dietaryPreferences}
                onChange={(e) => setDietaryPreferences(e.target.value)}
                className={styles.formInput}
                placeholder="Example: Vegetarian, Mediterranean diet, etc."
                disabled={loading}
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="restrictions" className={styles.formLabel}>
                Dietary Restrictions (Optional)
              </label>
              <input
                id="restrictions"
                type="text"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className={styles.formInput}
                placeholder="Example: No nuts, lactose intolerant, etc."
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !healthGoals.trim()}
              className={styles.submitButton}
            >
              {loading
                ? "Generating Recommendations..."
                : "Get Recommendations"}
            </button>
          </form>

          {result && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultsHeader}>
                <h2 className={styles.resultsTitle}>
                  Your Personalized Diet Plan
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

              <div className={`${styles.disclaimerBox} ${styles.disclaimerBoxBlue}`}>
                <p className={`${styles.disclaimerText} ${styles.disclaimerTextBlue}`}>
                  <strong>Note:</strong> These recommendations are general
                  guidelines. Consult with a registered dietitian or healthcare
                  provider for personalized medical nutrition therapy.
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
                {showHistory ? "Hide History" : "View My Diet Plan History"}
              </span>
              <span className={styles.historyToggleIcon}>
                {showHistory ? "▲" : "▼"}
              </span>
            </button>

            {showHistory && (
              <div className={styles.historyContainer}>
                <h3 className={styles.historyTitle}>Diet Plan History</h3>
                {loadingHistory ? (
                  <p className={styles.historyLoading}>Loading history...</p>
                ) : history.length === 0 ? (
                  <p className={styles.historyEmpty}>
                    No previous diet plans found.
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
                          <span className={styles.historyItemLabel}>Health Goals:</span>
                          <span className={styles.historyItemText}>
                            {plan.healthGoals}
                          </span>
                        </div>
                        {plan.dietaryPreferences && (
                          <div className={styles.historyItemContent}>
                            <span className={styles.historyItemLabel}>Preferences:</span>
                            <span className={styles.historyItemText}>
                              {plan.dietaryPreferences}
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
                            __html: markdownToHtml(plan.aiRecommendations || plan.mealPlan),
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
