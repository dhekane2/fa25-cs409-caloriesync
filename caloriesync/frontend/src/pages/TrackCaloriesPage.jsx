import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  searchUSDAFood,
  fetchMealsForDate,
  createOrReplaceMeal,
} from '../services/api.js';

export default function TrackCaloriesPage() {
  const nav = useNavigate();
  const location = useLocation();

  // --- date handling (supports /track?date=YYYY-MM-DD) ---
  const todayStr = new Date().toISOString().substring(0, 10);
  const searchParams = new URLSearchParams(location.search);
  const selectedDate = searchParams.get('date');
  const targetDate = selectedDate || todayStr;

  const isToday = targetDate === todayStr;
  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

const [userEmail] = useState(() => {
  try {
    const stored = localStorage.getItem('cs_profile');
    if (stored) {
      const p = JSON.parse(stored);
      return p.email || '';
    }
  } catch {
    // ignore parse errors
  }
  return '';
});

  // --- search + manual entry state ---
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // foods with _quantity, macros
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualQty, setManualQty] = useState(1);

  // --- meal list for this date ---
  const [mealList, setMealList] = useState([]); // array of entries
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // nutrition totals for summary cards
  const totalCalories = mealList.reduce((s, i) => s + (i.calories || 0), 0);
  const totalProtein = mealList.reduce((s, i) => s + (i.protein || 0), 0);
  const totalFat = mealList.reduce((s, i) => s + (i.fat || 0), 0);
  const totalCarbs = mealList.reduce((s, i) => s + (i.carbs || 0), 0);

  // --- load existing meals for this date (only when editing a specific date) ---
  useEffect(() => {
    // Only fetch from backend when editing an existing date via calendar
    if (!selectedDate) {
      setMealList([]);
      return;
    }

    async function load() {
      try {
        const data = await fetchMealsForDate(targetDate);
        const items = (data.items || []).map((item) => {
          const qty = item.quantity ?? 1;
          const totalCals = item.calorie_count ?? 0;
          const baseCalories = qty ? totalCals / qty : totalCals;

          return {
            id: item.id,
            food_name: item.item_name,
            calories: totalCals,
            protein: 0,
            fat: 0,
            carbs: 0,
            quantity: qty,
            serving_unit: 'serving',
            source: 'db',
            baseCalories,
          };
        });

        setMealList(items);
      } catch (err) {
        console.error('Failed to fetch meals for date:', err);
        setMealList([]);
      }
    }

    load();
  }, [selectedDate, targetDate]);

  // --- perform search function ---
  const performSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const rawResults = (await searchUSDAFood(trimmed)) || [];

      // enrich with quantity field to match layout
      const enriched = rawResults.map((f) => ({
        ...f,
        nf_protein: f.nf_protein ?? 0,
        nf_total_fat: f.nf_total_fat ?? 0,
        nf_total_carbohydrate: f.nf_total_carbohydrate ?? 0,
        _quantity: 1,
      }));
      setSearchResults(enriched);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // --- debounced search for food (triggers when user stops typing) ---
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    // Set up debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    // Clear any pending debounced search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Trigger search immediately on icon click
    await performSearch(searchTerm);
  };

  const handleResultQtyChange = (id, value) => {
    const q = Number(value);
    if (!q || q <= 0) return;
    setSearchResults((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, _quantity: q } : f,
      ),
    );
  };

  // --- add food from API result into meal list ---
  const addFood = (food) => {
    const qty = food._quantity || 1;
    const baseCal = food.nf_calories || 0;
    const baseProtein = food.nf_protein || 0;
    const baseFat = food.nf_total_fat || 0;
    const baseCarbs = food.nf_total_carbohydrate || 0;

    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      food_name: food.food_name,
      calories: Math.round(baseCal * qty),
      protein: Math.round(baseProtein * qty),
      fat: Math.round(baseFat * qty),
      carbs: Math.round(baseCarbs * qty),
      quantity: qty,
      serving_unit: food.serving_unit || 'serving',
      source: 'api',
      baseCalories: baseCal,
      baseProtein,
      baseFat,
      baseCarbs,
    };

    setMealList((prev) => [...prev, entry]);
  };

  // --- manual entry ---
  const addManual = () => {
    if (!manualName.trim() || !manualCalories) return;

    const base = parseFloat(manualCalories);
    if (!base || base <= 0) return;

    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      food_name: manualName,
      calories: Math.round(base * manualQty),
      protein: 0,
      fat: 0,
      carbs: 0,
      quantity: manualQty,
      serving_unit: 'serving',
      source: 'manual',
      baseCalories: base,
    };

    setMealList((prev) => [...prev, entry]);
    setManualName('');
    setManualCalories('');
    setManualQty(1);
  };

  // --- update quantity in meal list (keeps calories/macros in sync) ---
  const updateQty = (id, q) => {
    const quantity = Number(q);
    if (!quantity || quantity <= 0) return;

    setMealList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (item.source === 'api') {
          return {
            ...item,
            quantity,
            calories: Math.round((item.baseCalories || 0) * quantity),
            protein: Math.round((item.baseProtein || 0) * quantity),
            fat: Math.round((item.baseFat || 0) * quantity),
            carbs: Math.round((item.baseCarbs || 0) * quantity),
          };
        }

        // manual
        return {
          ...item,
          quantity,
          calories: Math.round((item.baseCalories || 0) * quantity),
        };
      }),
    );
  };

  const removeItem = (id) => {
    setMealList((prev) => prev.filter((i) => i.id !== id));
  };

  // --- save to localStorage for this date + user ---
  const handleSaveDailyLog = async () => {
    if (mealList.length === 0) {
      setSaveError('Please add at least one item before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const total = totalCalories;

      const loggedAt = targetDate; // YYYY-MM-DD
      await createOrReplaceMeal(mealList, loggedAt);

      // calorieData: summary per date
      const allCalorieData = JSON.parse(
        localStorage.getItem('calorieData') || '{}',
      );
      const userData = allCalorieData[userEmail] || [];

      const idx = userData.findIndex((d) => d.date === targetDate);
      if (idx >= 0) {
        userData[idx].consumed = total;
      } else {
        userData.push({
          date: targetDate,
          consumed: total,
          burned: 0,
        });
      }
      allCalorieData[userEmail] = userData;
      localStorage.setItem('calorieData', JSON.stringify(allCalorieData));

      // meals: detailed list per date
      const allMeals = JSON.parse(localStorage.getItem('meals') || '{}');
      const userMeals = allMeals[userEmail] || [];
      const filtered = userMeals.filter((m) => m.date !== targetDate);

      filtered.push({
        date: targetDate,
        timestamp: new Date().toISOString(),
        items: mealList,
        totalCalories: total,
      });

      allMeals[userEmail] = filtered;
      localStorage.setItem('meals', JSON.stringify(allMeals));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setSaveError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cs-track-page">
      <div className="cs-container">
        {/* Header row with back button + title + date */}
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
              <span className="cs-track-date-label">
                {isToday ? 'Today' : formattedDate}
              </span>
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
                    className="cs-input cs-input-search"
                    placeholder="e.g., chicken breast, apple, rice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="cs-search-btn"
                    type="submit"
                    aria-label="Search"
                  >
                    🔍
                  </button>
                </form>

                {isSearching && (
                  <div className="cs-search-status">Searching…</div>
                )}

                {searchResults.length > 0 && !isSearching && (
                  <div className="cs-search-results">
                    {searchResults.map((f) => (
                      <div key={f.id} className="cs-search-item-card">
                        <div className="cs-search-item-header">
                          <div>
                            <div className="cs-search-item-name">
                              {f.food_name}
                            </div>
                            <div className="cs-search-item-sub">
                              {Math.round(f.nf_calories)} cal •{' '}
                              {f.serving_qty} {f.serving_unit}
                            </div>
                          </div>
                        </div>

                        <div className="cs-search-macros-row">
                          <div className="cs-search-macro">
                            <div className="cs-search-macro-label">
                              Protein
                            </div>
                            <div className="cs-search-macro-value">
                              {Math.round(f.nf_protein || 0)}g
                            </div>
                          </div>
                          <div className="cs-search-macro">
                            <div className="cs-search-macro-label">Fat</div>
                            <div className="cs-search-macro-value">
                              {Math.round(f.nf_total_fat || 0)}g
                            </div>
                          </div>
                          <div className="cs-search-macro">
                            <div className="cs-search-macro-label">
                              Carbs
                            </div>
                            <div className="cs-search-macro-value">
                              {Math.round(
                                f.nf_total_carbohydrate || 0,
                              )}
                              g
                            </div>
                          </div>
                        </div>

                        <div className="cs-search-qty-row">
                          <span className="cs-search-qty-label">
                            Quantity
                          </span>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            className="cs-input cs-search-qty-input"
                            value={f._quantity}
                            onChange={(e) =>
                              handleResultQtyChange(
                                f.id,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="cs-btn cs-btn-xs cs-btn-outline"
                            onClick={() => addFood(f)}
                          >
                            Add
                          </button>
                        </div>
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
                      onChange={(e) =>
                        setManualCalories(e.target.value)
                      }
                    />
                  </label>

                  <label className="cs-field cs-field-qty">
                    <span className="cs-field-label">Quantity</span>
                    <div className="cs-qty-row">
                      <button
                        type="button"
                        className="cs-qty-btn"
                        onClick={() =>
                          setManualQty((q) => Math.max(0.5, q - 0.5))
                        }
                      >
                        –
                      </button>
                      <span className="cs-qty-value">{manualQty}</span>
                      <button
                        type="button"
                        className="cs-qty-btn"
                        onClick={() =>
                          setManualQty((q) => q + 0.5)
                        }
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

            {/* RIGHT: Meal list + nutrition summary */}
            <div className="cs-card cs-track-card">
              <div className="cs-card-header-row">
                <div>
                  <h2 className="cs-card-title">
                    {isToday ? "Today's Meal List" : "Meal List"}
                  </h2>
                  <p className="cs-card-subtitle">
                    {mealList.length} item(s) • {totalCalories} total
                    calories
                  </p>
                </div>
              </div>

              {mealList.length === 0 ? (
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
                    {mealList.map((item) => (
                      <div key={item.id} className="cs-meal-item">
                        <div className="cs-meal-main">
                          <div className="cs-search-item-name">
                            {item.food_name}
                          </div>
                          <div className="cs-meal-meta">
                            {item.calories} cal • {item.quantity}{' '}
                            {item.serving_unit || 'serving'}
                          </div>
                        </div>
                        <div className="cs-meal-actions">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            className="cs-input cs-input-qty"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(
                                item.id,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            className="cs-btn cs-btn-xs cs-btn-outline cs-meal-remove-btn"
                            onClick={() => removeItem(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nutrition summary */}
                  <div className="cs-nutrition-section">
                    <h3 className="cs-nutrition-title">
                      Nutrition Summary
                    </h3>
                    <div className="cs-nutrition-grid">
                      <div className="cs-nutrition-card cs-nutrition-card-calories">
                        <div className="cs-nutrition-label">
                          Total Calories
                        </div>
                        <div className="cs-nutrition-value">
                          {totalCalories} cal
                        </div>
                      </div>
                      <div className="cs-nutrition-card cs-nutrition-card-protein">
                        <div className="cs-nutrition-label">
                          Protein
                        </div>
                        <div className="cs-nutrition-value">
                          {totalProtein}g
                        </div>
                      </div>
                      <div className="cs-nutrition-card cs-nutrition-card-fat">
                        <div className="cs-nutrition-label">Fat</div>
                        <div className="cs-nutrition-value">
                          {totalFat}g
                        </div>
                      </div>
                      <div className="cs-nutrition-card cs-nutrition-card-carbs">
                        <div className="cs-nutrition-label">Carbs</div>
                        <div className="cs-nutrition-value">
                          {totalCarbs}g
                        </div>
                      </div>
                    </div>

                    {saveError && (
                      <div className="cs-error-text cs-save-error">
                        {saveError}
                      </div>
                    )}
                    {saveSuccess && (
                      <div className="cs-save-success">
                        ✓ Saved to your daily log
                      </div>
                    )}

                    <button
                      type="button"
                      className="cs-btn cs-btn-dark cs-btn-full cs-save-log-btn"
                      onClick={handleSaveDailyLog}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving…' : 'Save to Daily Log'}
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
