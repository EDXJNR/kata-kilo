export type MealPlan = {
  id: string
  name: string
  tagline: string
  category: 'keto' | 'mediterranean' | 'low-fat' | 'vegetarian' | 'high-protein'
  imageUrl: string
  prepMin: number
  calories: number
  proteinG: number
  ingredients: string[]
  steps: string[]
}

export const MEAL_PLANS: MealPlan[] = [
  {
    id: 'keto-salmon-bowl',
    name: 'Keto salmon bowl',
    tagline: 'Avocado, greens, and omega-3 fats',
    category: 'keto',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    prepMin: 25,
    calories: 520,
    proteinG: 38,
    ingredients: ['Salmon fillet', 'Avocado', 'Mixed greens', 'Olive oil', 'Lemon'],
    steps: ['Pan-sear salmon 4 min per side.', 'Plate greens and avocado.', 'Drizzle olive oil and lemon.', 'Top with salmon.']
  },
  {
    id: 'med-grill',
    name: 'Mediterranean plate',
    tagline: 'Grilled fish, rice, and green beans',
    category: 'mediterranean',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    prepMin: 30,
    calories: 480,
    proteinG: 35,
    ingredients: ['White fish', 'Brown rice', 'Green beans', 'Tomatoes', 'Herbs'],
    steps: ['Cook rice.', 'Steam beans.', 'Grill fish with herbs.', 'Serve with tomato salad.']
  },
  {
    id: 'lean-chicken',
    name: 'Lean chicken & veg',
    tagline: 'Low fat, high volume',
    category: 'low-fat',
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-5524d3a77138?w=800&q=80',
    prepMin: 35,
    calories: 410,
    proteinG: 42,
    ingredients: ['Chicken breast', 'Potatoes', 'Zucchini', 'Arugula'],
    steps: ['Roast potatoes and zucchini.', 'Grill chicken.', 'Slice and plate with arugula.']
  },
  {
    id: 'veg-buddha',
    name: 'Vegetarian buddha bowl',
    tagline: 'Quinoa, roasted veg, tahini',
    category: 'vegetarian',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    prepMin: 28,
    calories: 450,
    proteinG: 18,
    ingredients: ['Quinoa', 'Chickpeas', 'Broccoli', 'Carrots', 'Tahini'],
    steps: ['Cook quinoa.', 'Roast chickpeas and veg.', 'Drizzle tahini dressing.']
  },
  {
    id: 'protein-oats',
    name: 'Protein power breakfast',
    tagline: 'Eggs, berries, and oats',
    category: 'high-protein',
    imageUrl: 'https://images.unsplash.com/photo-1494859802809-d069cc594607?w=800&q=80',
    prepMin: 15,
    calories: 400,
    proteinG: 28,
    ingredients: ['Eggs', 'Oats', 'Berries', 'Greek yogurt'],
    steps: ['Cook oats.', 'Soft boil eggs.', 'Top with yogurt and berries.']
  }
]
