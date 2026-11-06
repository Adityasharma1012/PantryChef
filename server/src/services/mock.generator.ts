import crypto from "node:crypto";
import type {
  Recipe,
  RecipeIngredient,
  RecipeRequest,
  RegenerateRequest,
} from "@pantrychef/shared";
import type { RecipeGenerator } from "./generator.interface.js";

interface RecipeTemplate {
  titlePrefix: string;
  style: string;
  baseSteps: string[];
  staples: { name: string; quantity: string }[];
}

const TEMPLATES: RecipeTemplate[] = [
  {
    titlePrefix: "Rustic Skillet Sauté",
    style: "Mediterranean / Homestyle",
    staples: [
      { name: "Extra virgin olive oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "3 cloves, minced" },
      { name: "Sea salt & black pepper", quantity: "to taste" },
    ],
    baseSteps: [
      "Heat olive oil in a wide heavy skillet over medium-high heat until shimmering.",
      "Add aromatic garlic and sauté for 60 seconds until fragrant.",
      "Introduce your pantry ingredients in order of cooking density, searing evenly for 6-8 minutes.",
      "Season thoroughly with sea salt and cracked pepper, tossing to combine.",
      "Lower heat to medium, cover, and let simmer for 5 minutes until tender. Serve warm.",
    ],
  },
  {
    titlePrefix: "Aromatic Fragrant Bowl",
    style: "Fusion Grain & Veggie Bowl",
    staples: [
      { name: "Toasted sesame oil", quantity: "1 tbsp" },
      { name: "Soy sauce or tamari", quantity: "2 tbsp" },
      { name: "Fresh ginger", quantity: "1 tsp, grated" },
    ],
    baseSteps: [
      "Prepare your primary pantry ingredients by dicing into bite-sized uniform pieces.",
      "Whisk together sesame oil, soy sauce, and grated ginger in a small bowl.",
      "Heat a pan over medium heat, add the prepared ingredients, and toss continuously for 7 minutes.",
      "Pour the ginger-soy reduction over the ingredients and stir until evenly glazed.",
      "Divide into bowls and garnish with a drizzle of pan juices. Enjoy immediately.",
    ],
  },
  {
    titlePrefix: "Crispy Oven Bake",
    style: "Sheet Pan Roast",
    staples: [
      { name: "Cooking oil or butter", quantity: "2 tbsp" },
      { name: "Smoked paprika & thyme", quantity: "1 tsp each" },
      { name: "Flaky salt", quantity: "1/2 tsp" },
    ],
    baseSteps: [
      "Preheat the oven to 400°F (200°C) and line a large baking sheet with parchment paper.",
      "Spread your pantry ingredients in a single even layer across the sheet pan.",
      "Drizzle generously with oil and toss with smoked paprika, dried thyme, and flaky salt.",
      "Roast for 20-25 minutes, flipping halfway through, until caramelized and golden on the edges.",
      "Remove from oven, let rest for 2 minutes, and portion out warm.",
    ],
  },
  {
    titlePrefix: "Golden Simmer Stew",
    style: "Hearty Comfort Pot",
    staples: [
      { name: "Vegetable broth", quantity: "2 cups" },
      { name: "Onion", quantity: "1 medium, diced" },
      { name: "Ground cumin & coriander", quantity: "1/2 tsp each" },
    ],
    baseSteps: [
      "Sweat diced onions in a deep pot over medium heat until translucent (about 4 minutes).",
      "Stir in ground spices and toast for 30 seconds to release aromatic oils.",
      "Add your pantry ingredients along with vegetable broth, bringing to a gentle boil.",
      "Reduce heat to low, partially cover, and simmer for 15-20 minutes until rich and flavorful.",
      "Taste, adjust seasoning with salt, and ladle into bowls.",
    ],
  },
  {
    titlePrefix: "Zesty Herb Medley",
    style: "Fresh Quick Toss",
    staples: [
      { name: "Lemon juice", quantity: "1 tbsp" },
      { name: "Chopped fresh parsley", quantity: "2 tbsp" },
      { name: "Olive oil", quantity: "1 tbsp" },
    ],
    baseSteps: [
      "Chop all pantry ingredients into crisp, neat pieces.",
      "Lightly steam or flash-sauté in olive oil for 4 minutes to retain vibrant color and crunch.",
      "Whisk fresh lemon juice with chopped parsley and a pinch of salt.",
      "Toss warm ingredients in the lemon-herb dressing until glistening.",
      "Plate and serve immediately for peak freshness.",
    ],
  },
];

export class MockRecipeGenerator implements RecipeGenerator {
  public async generateRecipes(request: RecipeRequest): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    const usedTitles = new Set<string>(request.exclude || []);

    for (let i = 0; i < 3; i++) {
      const template = TEMPLATES[i % TEMPLATES.length];
      const primaryIngredient =
        request.ingredients[i % request.ingredients.length] || "Garden";
      const capitalizedPrimary =
        primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1);

      let title = `${capitalizedPrimary} ${template.titlePrefix}`;
      let suffix = 2;
      while (usedTitles.has(title)) {
        title = `${capitalizedPrimary} ${template.titlePrefix} (Variation ${suffix})`;
        suffix++;
      }
      usedTitles.add(title);

      const targetMinutes = request.maxMinutes
        ? Math.min(request.maxMinutes, 15 + i * 10)
        : 20 + i * 10;

      recipes.push(
        this.buildRecipe(
          title,
          template,
          request.ingredients,
          targetMinutes,
          request.servings,
          request.cuisine,
          request.diets
        )
      );
    }

    return recipes;
  }

  public async regenerateRecipe(request: RegenerateRequest): Promise<Recipe> {
    const excludeSet = new Set<string>([
      ...(request.exclude || []),
      request.replaceTitle,
    ]);

    // Pick a template that produces a distinct title
    for (let index = 0; index < 10; index++) {
      const template = TEMPLATES[(index + 2) % TEMPLATES.length];
      const primary =
        request.ingredients[index % request.ingredients.length] || "Chef's Special";
      const capitalized = primary.charAt(0).toUpperCase() + primary.slice(1);
      const title = `Deluxe ${capitalized} ${template.titlePrefix} Twist ${index + 1}`;

      if (!excludeSet.has(title) && title !== request.replaceTitle) {
        const targetMinutes = request.maxMinutes
          ? Math.min(request.maxMinutes, 25)
          : 25;

        return this.buildRecipe(
          title,
          template,
          request.ingredients,
          targetMinutes,
          request.servings,
          request.cuisine,
          request.diets
        );
      }
    }

    // Fallback guaranteed unique title
    const uniqueTitle = `Custom Pantry Creation #${Date.now().toString().slice(-4)}`;
    return this.buildRecipe(
      uniqueTitle,
      TEMPLATES[0],
      request.ingredients,
      request.maxMinutes || 30,
      request.servings,
      request.cuisine,
      request.diets
    );
  }

  private buildRecipe(
    title: string,
    template: RecipeTemplate,
    userIngredients: string[],
    timeMinutes: number,
    servings: number,
    cuisine: string,
    diets: string[]
  ): Recipe {
    const userIngredientsSet = new Set(
      userIngredients.map((ing) => ing.toLowerCase())
    );

    const recipeIngredients: RecipeIngredient[] = [];

    // Add user ingredients with haveIt: true
    userIngredients.forEach((ing, idx) => {
      recipeIngredients.push({
        name: ing,
        quantity: idx === 0 ? "1 cup" : "1/2 cup",
        haveIt: true,
      });
    });

    // Add 2-3 staples, checking if user already provided them
    template.staples.forEach((staple) => {
      const isAlreadyProvided = userIngredientsSet.has(
        staple.name.toLowerCase()
      );
      if (!isAlreadyProvided) {
        recipeIngredients.push({
          name: staple.name,
          quantity: staple.quantity,
          haveIt: false,
        });
      }
    });

    const cuisineDesc =
      cuisine && cuisine.toLowerCase() !== "any" ? `${cuisine}-inspired ` : "";
    const dietsDesc =
      diets && diets.length > 0 ? ` (${diets.join(", ")})` : "";

    const summary = `A delicious ${cuisineDesc}${template.style.toLowerCase()} highlighting ${userIngredients.slice(0, 3).join(", ")}${dietsDesc}. Perfectly portioned for ${servings} ${servings === 1 ? "serving" : "servings"}.`;

    return {
      id: crypto.randomUUID(),
      title,
      summary,
      timeMinutes,
      servings,
      ingredients: recipeIngredients,
      steps: template.baseSteps.map((step, idx) => `${idx + 1}. ${step}`),
    };
  }
}
