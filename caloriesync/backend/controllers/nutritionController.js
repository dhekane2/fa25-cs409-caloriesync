import axios from 'axios';

// USDA FoodData Central search:
//   GET https://api.nal.usda.gov/fdc/v1/foods/search?query=<term>&api_key=<key>

export async function usdaSearch(req, res) {
  const { query } = req.query;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res
      .status(400)
      .json({ message: 'Query parameter \"query\" is required.' });
  }

  const USDA_API_KEY = process.env.USDA_API_KEY;
  if (!USDA_API_KEY) {
    return res
      .status(500)
      .json({ message: 'USDA API key is not configured on the server.' });
  }

  const searchTerm = query.trim();
  const apiUrl = 'https://api.nal.usda.gov/fdc/v1/foods/search';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        query: searchTerm,
        api_key: USDA_API_KEY,
        pageSize: 5
      }
    });

    const data = response.data || {};
    const foods = Array.isArray(data.foods) ? data.foods : [];

    const mapped = foods
      .map((food) => {
        const nutrients = Array.isArray(food.foodNutrients)
          ? food.foodNutrients
          : [];

        const caloriesNutrient = nutrients.find(
          (n) =>
            n &&
            (n.nutrientId === 1008 ||
              n.nutrientNumber === '208' ||
              (typeof n.nutrientName === 'string' &&
                n.nutrientName.toLowerCase() === 'energy'))
        );

        if (!caloriesNutrient || caloriesNutrient.value == null) {
          return null;
        }

        return {
          description: food.description || null,
          brandName: food.brandName || null,
          fdcId: food.fdcId || null,
          serving_size: food.servingSize ?? null,
          serving_size_unit: food.servingSizeUnit ?? null,
          calories: caloriesNutrient.value,
          calories_unit: caloriesNutrient.unitName || 'kcal'
        };
      })
      .filter((item) => item !== null)
      .slice(0, 10);

    if (mapped.length === 0) {
      return res.json({ message: 'NOT_FOUND', data: null });
    }

    return res.json({ message: 'FOUND', data: mapped });
  } catch (err) {
    console.error(
      'Error calling USDA FoodData Central API:',
      err?.message || err
    );
    return res.status(502).json({
      message: 'Failed to fetch nutrition data from USDA FoodData.'
    });
  }
}
