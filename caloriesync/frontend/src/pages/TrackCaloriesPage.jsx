import { useState } from 'react';
import {
  mockSearchFood,
  createEmptyMealListForToday,
} from '../services/mockApi.js';

export default function TrackCaloriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mealList, setMealList] = useState(createEmptyMealListForToday());
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualQty, setManualQty] = useState(1);

  const totalCalories = mealList.items.reduce(
    (sum, item) => sum + item.calories,
    0,
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const results = await mockSearchFood(searchTerm);
    setSearchResults(results);
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

  return (
    <div className="cs-container cs-track-root">
      <h1 className="cs-track-title">Track Calories</h1>
      <p className="cs-track-date">Today</p>

      <div className="cs-track-grid">
        {/* 左邊：Search + Manual Entry */}
        <div className="cs-card">
          <h2 className="cs-card-title">Search Food</h2>
          <p className="cs-card-subtitle">
            Search for food items using Nutritionix API (mocked for now)
          </p>

          <form className="cs-search-row" onSubmit={handleSearch}>
            <input
              className="cs-input"
              placeholder="e.g., chicken breast, apple, rice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="cs-btn cs-btn-dark" type="submit">
              🔍
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="cs-search-results">
              {searchResults.map((f) => (
                <div key={f.id} className="cs-search-item">
                  <div>
                    <div className="cs-search-item-name">
                      {f.food_name}
                    </div>
                    <div className="cs-search-item-sub">
                      {Math.round(f.nf_calories)} cal • {f.serving_qty}{' '}
                      {f.serving_unit}
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

          <h2 className="cs-card-title mt-4">Manual Entry</h2>
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
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  onClick={() =>
                    setManualQty((q) => Math.max(1, q - 1))
                  }
                >
                  –
                </button>
                <span>{manualQty}</span>
                <button
                  type="button"
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  onClick={() => setManualQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </label>

            <button
              type="button"
              className="cs-btn cs-btn-dark cs-btn-full"
              onClick={addManual}
            >
              + Add Manual Entry
            </button>
          </div>
        </div>

        {/* Right Side：Today's Meal List */}
        <div className="cs-card">
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
              No items added yet.
              <br />
              Search for foods or add manual entries to get started.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
