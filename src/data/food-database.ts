export type FoodItem = {
  id: string
  name: string
  category: string
  /** Macros per serving */
  servingLabel: string
  servingG: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

/** Calories from macros: 4 kcal/g protein & carbs, 9 kcal/g fat */
export function caloriesFromMacros(protein_g: number, carbs_g: number, fat_g: number): number {
  return Math.round(protein_g * 4 + carbs_g * 4 + fat_g * 9)
}

export function macrosForFood(food: FoodItem, servings: number) {
  const protein_g = Math.round(food.protein_g * servings * 10) / 10
  const carbs_g = Math.round(food.carbs_g * servings * 10) / 10
  const fat_g = Math.round(food.fat_g * servings * 10) / 10
  const calories = caloriesFromMacros(protein_g, carbs_g, fat_g)
  return { protein_g, carbs_g, fat_g, calories }
}

export const FOOD_DATABASE: FoodItem[] = [
  { id: 'chicken-breast', name: 'Chicken breast', category: 'Protein', servingLabel: '100 g', servingG: 100, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
  { id: 'salmon', name: 'Salmon', category: 'Protein', servingLabel: '100 g', servingG: 100, protein_g: 25, carbs_g: 0, fat_g: 13 },
  { id: 'eggs', name: 'Eggs', category: 'Protein', servingLabel: '2 large', servingG: 100, protein_g: 13, carbs_g: 1, fat_g: 11 },
  { id: 'greek-yogurt', name: 'Greek yogurt', category: 'Dairy', servingLabel: '170 g cup', servingG: 170, protein_g: 17, carbs_g: 6, fat_g: 0.7 },
  { id: 'whey-shake', name: 'Whey protein shake', category: 'Supplements', servingLabel: '1 scoop', servingG: 30, protein_g: 24, carbs_g: 3, fat_g: 1.5 },
  { id: 'rice-white', name: 'White rice (cooked)', category: 'Carbs', servingLabel: '1 cup', servingG: 158, protein_g: 4, carbs_g: 45, fat_g: 0.4 },
  { id: 'rice-brown', name: 'Brown rice (cooked)', category: 'Carbs', servingLabel: '1 cup', servingG: 195, protein_g: 5, carbs_g: 45, fat_g: 1.8 },
  { id: 'oats', name: 'Oats', category: 'Carbs', servingLabel: '1 cup dry', servingG: 80, protein_g: 10, carbs_g: 54, fat_g: 5 },
  { id: 'sweet-potato', name: 'Sweet potato', category: 'Carbs', servingLabel: '1 medium', servingG: 130, protein_g: 2, carbs_g: 26, fat_g: 0.1 },
  { id: 'banana', name: 'Banana', category: 'Fruit', servingLabel: '1 medium', servingG: 118, protein_g: 1.3, carbs_g: 27, fat_g: 0.4 },
  { id: 'apple', name: 'Apple', category: 'Fruit', servingLabel: '1 medium', servingG: 182, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
  { id: 'broccoli', name: 'Broccoli', category: 'Vegetables', servingLabel: '1 cup', servingG: 91, protein_g: 2.5, carbs_g: 6, fat_g: 0.3 },
  { id: 'avocado', name: 'Avocado', category: 'Fats', servingLabel: '1/2 fruit', servingG: 100, protein_g: 2, carbs_g: 8.5, fat_g: 15 },
  { id: 'almonds', name: 'Almonds', category: 'Fats', servingLabel: '28 g handful', servingG: 28, protein_g: 6, carbs_g: 6, fat_g: 14 },
  { id: 'peanut-butter', name: 'Peanut butter', category: 'Fats', servingLabel: '2 tbsp', servingG: 32, protein_g: 8, carbs_g: 6, fat_g: 16 },
  { id: 'olive-oil', name: 'Olive oil', category: 'Fats', servingLabel: '1 tbsp', servingG: 14, protein_g: 0, carbs_g: 0, fat_g: 14 },
  { id: 'whole-bread', name: 'Whole wheat bread', category: 'Carbs', servingLabel: '2 slices', servingG: 56, protein_g: 8, carbs_g: 24, fat_g: 2 },
  { id: 'pasta', name: 'Pasta (cooked)', category: 'Carbs', servingLabel: '1 cup', servingG: 140, protein_g: 7, carbs_g: 43, fat_g: 1.3 },
  { id: 'beef-lean', name: 'Lean beef', category: 'Protein', servingLabel: '100 g', servingG: 100, protein_g: 26, carbs_g: 0, fat_g: 8 },
  { id: 'tuna', name: 'Tuna (canned)', category: 'Protein', servingLabel: '100 g', servingG: 100, protein_g: 26, carbs_g: 0, fat_g: 1 },
  { id: 'cottage-cheese', name: 'Cottage cheese', category: 'Dairy', servingLabel: '1 cup', servingG: 226, protein_g: 28, carbs_g: 6, fat_g: 2.3 },
  { id: 'lentils', name: 'Lentils (cooked)', category: 'Protein', servingLabel: '1 cup', servingG: 198, protein_g: 18, carbs_g: 40, fat_g: 0.8 },
  { id: 'protein-bar', name: 'Protein bar', category: 'Supplements', servingLabel: '1 bar', servingG: 60, protein_g: 20, carbs_g: 22, fat_g: 8 },
  { id: 'milk', name: 'Milk (2%)', category: 'Dairy', servingLabel: '1 cup', servingG: 244, protein_g: 8, carbs_g: 12, fat_g: 5 }
]

export const FOOD_CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  Protein: { bg: 'bg-primary/15', border: 'border-primary/40', text: 'text-primary', dot: '#4ade80' },
  Carbs: { bg: 'bg-cyan/15', border: 'border-cyan/40', text: 'text-cyan', dot: '#22D3EE' },
  Dairy: { bg: 'bg-violet/15', border: 'border-violet/40', text: 'text-violet', dot: '#A78BFA' },
  Fruit: { bg: 'bg-pink/15', border: 'border-pink/40', text: 'text-pink', dot: '#F472B6' },
  Vegetables: { bg: 'bg-amber/15', border: 'border-amber/40', text: 'text-amber', dot: '#FBBF24' },
  Fats: { bg: 'bg-accent/15', border: 'border-accent/40', text: 'text-accent', dot: '#FF6B6B' },
  Supplements: { bg: 'bg-cyan/10', border: 'border-cyan/30', text: 'text-cyan', dot: '#06B6D4' }
}

export const FOOD_CATEGORIES = [...new Set(FOOD_DATABASE.map((f) => f.category))]

export function searchFoods(query: string, category?: string) {
  const q = query.toLowerCase().trim()
  return FOOD_DATABASE.filter((f) => {
    if (category && f.category !== category) return false
    if (!q) return true
    return f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
  })
}

/** Cheapest way to nudge someone toward their goal: same food category
 * (so it's a plausible swap, not a random suggestion), meaningfully
 * lower calories per serving. Returns null if there's nothing better. */
export function suggestLowerCalorieAlternative(food: FoodItem): FoodItem | null {
  const currentCals = caloriesFromMacros(food.protein_g, food.carbs_g, food.fat_g)
  const candidates = FOOD_DATABASE.filter((f) => f.category === food.category && f.id !== food.id)
    .map((f) => ({ food: f, calories: caloriesFromMacros(f.protein_g, f.carbs_g, f.fat_g) }))
    .filter((c) => c.calories < currentCals * 0.85)
    .sort((a, b) => a.calories - b.calories)

  return candidates[0]?.food ?? null
}
