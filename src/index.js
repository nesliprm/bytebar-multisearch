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

// Random Cocktail Button

document
  .getElementById("random-cocktail-btn")
  .addEventListener("click", showRandomCocktail);

function showRandomCocktail() {
  showBottomPanel();
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
function showSearchCocktail() {
  showBottomPanel();
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
}

// AI Search
