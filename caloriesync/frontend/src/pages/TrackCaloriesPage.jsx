import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mockSearchFood, // later you can swap this to your real API
  createEmptyMealListForToday,
} from '../services/mockApi.js';

export default function TrackCaloriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mealList, setMealList] = useState(createEmptyMealListForToday());
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const nav = useNavigate();

  const totalCalories = mealList.items.reduce(
    (sum, item) => sum + item.calories,
    0,
  );

  /* ---------------------------------------------------
   * Debounced search
   * --------------------------------------------------- */
  useEffect(() => {
    const trimmed = searchTerm.trim();

    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await mockSearchFood(trimmed);
        setSearchResults(results || []); // API can now return top 5 items
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    try {
      setIsSearching(true);
      const results = await mockSearchFood(trimmed);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addFood = (food) => {
    setMealList((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `${Date.now()}-${Math.random()}`,
          source: 'api',
          food_name: food.food_name,
          calories: Math.round(food.nf_calories),
          quantity: 1,
        },
      ],
    }));
  };

  const addManual = () => {
    if (!manualName.trim() || !manualCalories) return;
    const base = parseFloat(manualCalories);
    setMealList((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `${Date.now()}-${Math.random()}`,
          source: 'manual',
          food_name: manualName,
          calories: Math.round(base * manualQty),
          quantity: manualQty,
        },
      ],
    }));
    setManualName('');
    setManualCalories('');
    setManualQty(1);
  };

  const updateQty = (id, q) => {
    if (q <= 0) return;
    setMealList((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: q,
              calories: Math.round(
                (item.calories / item.quantity) * q,
              ),
            }
          : item,
      ),
    }));
  };

  const removeItem = (id) => {
    setMealList((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  const handleSubmitMeal = async () => {
    if (mealList.items.length === 0) {
      setSubmitError('Please add at least one item before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      // TODO: replace this with your real backend API call
      // const result = await logMeal(mealList.items);

      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // clear meal list on success
      setMealList(createEmptyMealListForToday());
      setSubmitSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(
        err.message || 'Failed to submit meal. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cs-track-page">
      <div className="cs-container">
        {/* Header row with back button */}
        <div className="cs-track-header-row">
          <button
            type="button"
            className="cs-track-back-btn"
            onClick={() => nav('/dashboard')}
          >
            ←
          </button>

          <div>
            <h1 className="cs-track-title">Track Calories</h1>
            <div className="cs-track-date-row">
              <span className="cs-track-date-icon">📅</span>
              <span className="cs-track-date-label">Today</span>
            </div>
          </div>
        </div>

        <div className="cs-track-root">
          <div className="cs-track-grid">
            {/* LEFT: Search + Manual cards stacked */}
            <div className="cs-track-left">
              {/* Search card */}
              <div className="cs-card cs-track-card">
                <h2 className="cs-card-title">Search Food</h2>
                <p className="cs-card-subtitle">
                  Search for food items using API
                </p>

                <form
                  className="cs-search-row"
                  onSubmit={handleSearchSubmit}
                >
                  <input
                    className="cs-input"
                    placeholder="e.g., chicken breast, apple, rice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="cs-search-btn" type="submit">
                    🔍
                  </button>
                </form>

                {isSearching && (
                  <div className="cs-search-status">Searching…</div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="cs-search-results">
                    {searchResults.map((f) => (
                      <div key={f.id} className="cs-search-item">
                        <div>
                          <div className="cs-search-item-name">
                            {f.food_name}
                          </div>
                          <div className="cs-search-item-sub">
                            {Math.round(f.nf_calories)} cal •{' '}
                            {f.serving_qty} {f.serving_unit}
                          </div>
                        </div>
                        <button
                          className="cs-btn cs-btn-xs cs-btn-outline"
                          type="button"
                          onClick={() => addFood(f)}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual entry card */}
              <div className="cs-card cs-track-card">
                <h2 className="cs-card-title">Manual Entry</h2>
                <p className="cs-card-subtitle">
                  Add food with approximate calories
                </p>

                <div className="cs-manual-form">
                  <label className="cs-field">
                    <span className="cs-field-label">Food Name</span>
                    <input
                      className="cs-input"
                      placeholder="e.g., Homemade pasta"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                    />
                  </label>

                  <label className="cs-field">
                    <span className="cs-field-label">
                      Approximate Calories (per serving)
                    </span>
                    <input
                      className="cs-input"
                      placeholder="e.g., 350"
                      type="number"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                    />
                  </label>

                  <label className="cs-field cs-field-qty">
                    <span className="cs-field-label">Quantity</span>
                    <div className="cs-qty-row">
                      <button
                        type="button"
                        className="cs-qty-btn"
                        onClick={() =>
                          setManualQty((q) => Math.max(1, q - 1))
                        }
                      >
                        –
                      </button>
                      <span className="cs-qty-value">{manualQty}</span>
                      <button
                        type="button"
                        className="cs-qty-btn"
                        onClick={() => setManualQty((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>
                  </label>

                  <button
                    type="button"
                    className="cs-btn cs-btn-dark cs-btn-full cs-track-add-btn"
                    onClick={addManual}
                  >
                    + Add Manual Entry
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT: Today’s meal list + Submit section */}
            <div className="cs-card cs-track-card">
              <div className="cs-card-header-row">
                <div>
                  <h2 className="cs-card-title">Today&apos;s Meal List</h2>
                  <p className="cs-card-subtitle">
                    {mealList.items.length} item(s) • {totalCalories} total
                    calories
                  </p>
                </div>
              </div>

              {mealList.items.length === 0 ? (
                <div className="cs-empty-state">
                  <div className="cs-empty-title">
                    No items added yet
                  </div>
                  <div className="cs-empty-subtitle">
                    Search for foods or add manual entries to get started
                  </div>
                </div>
              ) : (
                <>
                  <div className="cs-meal-list">
                    {mealList.items.map((item) => (
                      <div key={item.id} className="cs-meal-item">
                        <div>
                          <div className="cs-search-item-name">
                            {item.food_name}
                          </div>
                          <div className="cs-search-item-sub">
                            {item.calories} cal • {item.quantity}x
                          </div>
                        </div>
                        <div className="cs-meal-actions">
                          <input
                            type="number"
                            min="1"
                            className="cs-input cs-input-qty"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(
                                item.id,
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="cs-btn cs-btn-xs cs-btn-outline"
                            onClick={() => removeItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Meal Button + messages (your addition) */}
                  <div
                    style={{
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e0e0e0',
                    }}
                  >
                    {submitError && (
                      <div
                        className="cs-error-text"
                        style={{ marginBottom: '0.75rem' }}
                      >
                        {submitError}
                      </div>
                    )}
                    {submitSuccess && (
                      <div
                        style={{
                          color: '#10b981',
                          marginBottom: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                        }}
                      >
                        ✓ Meal submitted successfully!
                      </div>
                    )}
                    <button
                      type="button"
                      className="cs-btn cs-btn-dark cs-btn-full"
                      onClick={handleSubmitMeal}
                      disabled={
                        isSubmitting || mealList.items.length === 0
                      }
                      style={{
                        opacity:
                          isSubmitting || mealList.items.length === 0
                            ? 0.6
                            : 1,
                        cursor:
                          isSubmitting || mealList.items.length === 0
                            ? 'not-allowed'
                            : 'pointer',
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Meal'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
