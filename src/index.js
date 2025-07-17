isRandomSearch = false;

// Display cocktail
const displayCocktailDetails = (drink) => {
  const cocktailName = drink.strDrink;
  const instructions = drink.strInstructions;

  //// Create a list of ingredients and measurements
  let ingredients = "";
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];
    if (ingredient) {
      ingredients += `- ${measure ? measure : ""} ${ingredient}<br>`;
    }
  }

  //// Conditional message in case of random search
  let message = "";
  if (isRandomSearch) {
    message =
      '<h3><i class="fa-solid fa-wand-magic-sparkles"></i> Your cocktail of the moment:</h3>';
    isRandomSearch = false;
  }

  //// Display the cocktail name, ingredients, and instructions
  document.getElementById("cocktail-details").innerHTML = `
        ${message}
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

// Random Cocktail Button
document
  .getElementById("random-cocktail-btn")
  .addEventListener("click", showRandomCocktail);

function showRandomCocktail(event) {
  event.preventDefault();
  isRandomSearch = true;
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

// Search cocktail by ingredient
document
  .getElementById("search-cocktail-btn")
  .addEventListener("click", showSearchCocktail);

function showSearchCocktail(event) {
  event.preventDefault();

  const ingredient = document.getElementById("ingredient-input").value;
  if (!ingredient.trim()) {
    document.getElementById("cocktail-details").innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> Please enter an ingredient.';
    return;
  }

  showBottomPanel();
  showTypewriterLoading();

  fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data.drinks) && data.drinks.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.drinks.length);
        const cocktailId = data.drinks[randomIndex].idDrink;

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
          '<i class="fa-solid fa-triangle-exclamation"></i> This doesn’t look like a real ingredient, please enter a valid one.';
      }
    })
    .catch((error) => console.error("Error fetching cocktails:", error));
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

  let userInput = document.querySelector("#ingredient-input").value.trim();
  if (!userInput) {
    document.getElementById("cocktail-details").innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> Please enter an ingredient.';
    showBottomPanel();
    return;
  }

  showBottomPanel();
  showTypewriterLoading();

  let apiKey =
    "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";

  const messages = [
    {
      role: "system",
      content:
        "You are an HTML generator for a cocktail app. Output only raw HTML and nothing else. Do NOT use <ul>, <li>, <p>, or any indentation. Instead, use this format exactly:\n<h1>Cocktail Name</h1><br><div>- ingredient 1<br>- ingredient 2<br>- ingredient 3<br></div><br><div>Instructions go here as plain text with no formatting tags.</div>\nDO NOT add images, styles, or extra tags. DO NOT use tabs or indentations.",
    },
    {
      role: "user",
      content: `You are a quirky mixologist. Invent a unique cocktail recipe using ${userInput} as one of the ingredients. Make it creative but drinkable by humans.`,
    },
  ];

  //// Timeout function
  const timeout = setTimeout(() => {
    document.getElementById("cocktail-details").innerHTML =
      '<i class="fa-solid fa-triangle-exclamation"></i> This is taking too long... something might be wrong.';
    showBottomPanel();
  }, 8000);

  //// Weird input check for AI search
  const tooWeird =
    userInput.length > 3 &&
    !/[aeiou]/i.test(userInput) &&
    /^[a-zA-Z\s]+$/.test(userInput);

  if (tooWeird) {
    document.getElementById("cocktail-details").innerHTML =
      '<i class="fa-solid fa-comment-dots"></i> This doesn’t look like a typical ingredient, but let’s see what the AI comes up with...';
    showBottomPanel();
  }

  //// API call
  axios
    .post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.8,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      clearTimeout(timeout);
      const aiHTML = response.data.choices[0].message.content;
      document.getElementById("cocktail-details").innerHTML = aiHTML;
      showBottomPanel();
    })
    .catch((error) => {
      clearTimeout(timeout);
      console.error("OpenAI API error:", error);
      document.getElementById("cocktail-details").innerHTML =
        '<i class="fa-solid fa-triangle-exclamation"></i> Something went wrong with the AI cocktail. Please try again.';
      showBottomPanel();
    });
}
