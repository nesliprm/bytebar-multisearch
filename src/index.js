const displayCocktailDetails = (drink) => {
  const cocktailName = drink.strDrink;
  const instructions = drink.strInstructions;

  // Create a list of ingredients and measurements
  let ingredients = "";
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      ingredients += `- ${measure ? measure : ""} ${ingredient}<br>`;
    }
  }

  // Display the cocktail name, ingredients, and instructions
  document.getElementById("cocktail-details").innerHTML = `
        <h1>${cocktailName}</h1><br>
        <div>${ingredients}</div><br>
        <div>${instructions}</div>
    `;
};

// Function to show the bottom panel with transition
const showBottomPanel = () => {
  const bottomPanel = document.querySelector(".bottom-panel");
  bottomPanel.classList.remove("show"); // Remove the class
  void bottomPanel.offsetWidth; // Trigger reflow to reset the animation
  bottomPanel.classList.add("show"); // Add the class again
};

// Typewriter script reusable function
function showTypewriterLoading() {
  document.getElementById("cocktail-details").innerHTML = ""; // clear previous content
  new Typewriter("#cocktail-details", {
    strings: [
      "thinking...",
      "crafting...",
      "mixing...",
      "pouring...",
      "garnishing...",
    ],
    autoStart: true,
    delay: 20,
    cursor: null,
    loop: true,
  });
}
// END Typewriter script reusable function

// Random Cocktail Button

document
  .getElementById("random-cocktail-btn")
  .addEventListener("click", showRandomCocktail);

function showRandomCocktail(event) {
  event.preventDefault();
  showBottomPanel();
  showTypewriterLoading();

  fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then((response) => response.json())
    .then((data) => {
      const drink = data.drinks[0];
      displayCocktailDetails(drink);
    })
    .catch((error) => console.error("Error fetching cocktail:", error));
}

// Search Cocktail by Ingredient
document
  .getElementById("search-cocktail-btn")
  .addEventListener("click", showSearchCocktail);
function showSearchCocktail(event) {
  event.preventDefault();
  showBottomPanel();
  showTypewriterLoading();

  const ingredient = document.getElementById("ingredient-input").value;
  fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.drinks && data.drinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.drinks.length);
        const cocktailId = data.drinks[randomIndex].idDrink;

        // Fetch cocktail details by ID
        fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${cocktailId}`
        )
          .then((response) => response.json())
          .then((detailsData) => {
            const drink = detailsData.drinks[0];
            displayCocktailDetails(drink);
          })
          .catch((error) =>
            console.error("Error fetching cocktail details:", error)
          );
      } else {
        document.getElementById("cocktail-details").innerHTML =
          "No cocktails found.";
      }
    })
    .catch((error) => console.error("Error fetching cocktails:", error));

  if (!ingredient.trim()) {
    document.getElementById("cocktail-details").innerHTML =
      "Please enter an ingredient.";
    return;
  }
}

// AI Search /////////////////////////////////////////////////////

document
  .getElementById("ai-cocktail-btn")
  .addEventListener("click", generateAiCocktail);

function displayAiCocktail(response) {
  console.log(response.data.answer);
  document.querySelector("#cocktail-details").innerHTML = response.data.answer;
}

function generateAiCocktail(event) {
  event.preventDefault();
  showBottomPanel();
  showTypewriterLoading();

  let userInput = document.querySelector("#ingredient-input");
  let apiKey = API_KEY;
  let prompt = `Create and display a logical cocktail recipe drinkable by humans that has ${userInput.value} as ingredients in it.`;
  let context =
    "You are an HTML generator for a cocktail app. Output only raw HTML and nothing else. Do NOT use <ul>, <li>, <p>, or any indentation. Instead, use this format exactly:\n<h1>Cocktail Name</h1><br><div>- ingredient 1<br>- ingredient 2<br>- ingredient 3<br></div><br><div>Instructions go here as plain text with no formatting tags.</div>\nDO NOT add images, styles, or extra tags. DO NOT use tabs or indentations.";

  let apiURL = `https://api.shecodes.io/ai/v1/generate?prompt=${encodeURIComponent(
    prompt
  )}&context=${encodeURIComponent(context)}&key=${apiKey}`;

  axios.get(apiURL).then(displayAiCocktail);
}
