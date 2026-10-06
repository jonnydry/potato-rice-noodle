const bases = window.PRN_BASES;

const app = document.querySelector("#app");

function h(tag, props, ...kids) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else node.setAttribute(key, String(value));
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

function brand() {
  return h(
    "span",
    {},
    "Potato",
    h("span", { class: "dot", "aria-hidden": "true" }, "."),
    "Rice",
    h("span", { class: "dot", "aria-hidden": "true" }, "."),
    "Noodle",
  );
}

function shell(...content) {
  return h(
    "div",
    { class: "wrap" },
    h(
      "header",
      { class: "top" },
      h("a", { class: "brand", href: "#/", "aria-label": "Potato.Rice.Noodle, home" }, brand()),
      h("p", { class: "tagline" }, "You can always rely on Potato.Rice.Noodle."),
    ),
    h("main", {}, ...content),
  );
}

function findBase(id) {
  return bases.find((base) => base.id === id) || null;
}

function findRecipe(base, id) {
  for (const family of base.families) {
    const recipe = family.recipes.find((item) => item.id === id);
    if (recipe) return { family, recipe };
  }
  return null;
}

function allRecipes(base) {
  return base.families.flatMap((family) => family.recipes);
}

function fastest(base) {
  return Math.min(...allRecipes(base).map((recipe) => recipe.minutes));
}

function formatTime(minutes) {
  if (minutes < 60) return minutes + " min";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? hours + " hr " + rest + " min" : hours + " hr";
}

function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  const [path, query = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query);
  return {
    baseId: parts[0] || null,
    recipeId: parts[1] || null,
    surprise: params.get("surprise") === "1",
  };
}

function renderHome() {
  return shell(
    h("h1", {}, "Which one is in the kitchen?"),
    h(
      "p",
      { class: "lede" },
      "Pick a base. We’ll climb from the quickest comfort to a version with a little more plot. Hunger can sit down.",
    ),
    h(
      "ul",
      { class: "bases" },
      bases.map((base) =>
        h(
          "li",
          {},
          h(
            "a",
            { class: "base-choice", href: "#/" + base.id },
            h("span", { class: "base-name" }, base.name),
            h("span", { class: "base-meta" }, "from " + fastest(base) + " min"),
            h("span", { class: "base-whisper" }, base.whisper),
          ),
        ),
      ),
    ),
  );
}

function renderSurprise(base, quiet) {
  return h(
    "div",
    { class: "surprise-row" },
    h(
      "button",
      {
        class: quiet ? "surprise quiet" : "surprise",
        type: "button",
        "data-surprise": base.id,
      },
      "Surprise me",
    ),
    h("p", { class: "surprise-note" }, "Still " + base.name.toLowerCase() + ". I’ll choose the dish."),
  );
}

function renderBase(base) {
  return shell(
    h("a", { class: "crumb", href: "#/" }, "All bases"),
    h("h1", {}, base.name + "."),
    h("p", { class: "lede" }, base.intro),
    renderSurprise(base, false),
    base.families.map((family) =>
      h(
        "section",
        { class: "family" },
        h("h2", {}, family.name),
        h("p", { class: "note" }, family.note),
        h(
          "ol",
          { class: "ladder" },
          family.recipes.map((recipe) =>
            h(
              "li",
              {},
              h(
                "a",
                { class: "idea", href: "#/" + base.id + "/" + recipe.id },
                h(
                  "span",
                  { class: "idea-top" },
                  h("span", { class: "idea-rung" }, recipe.rung),
                  h("span", { class: "idea-time" }, formatTime(recipe.minutes)),
                ),
                h("span", { class: "idea-title" }, recipe.title),
                h("span", { class: "idea-blurb" }, recipe.blurb),
              ),
            ),
          ),
        ),
      ),
    ),
    renderSurprise(base, true),
  );
}

function renderRecipe(base, family, recipe, surprise) {
  const index = family.recipes.findIndex((item) => item.id === recipe.id);
  const softer = family.recipes[index - 1];
  const richer = family.recipes[index + 1];

  return shell(
    h("a", { class: "crumb", href: "#/" + base.id }, "All " + base.name.toLowerCase() + " ideas"),
    h(
      "p",
      { class: "kicker" },
      family.name + " · " + recipe.rung + " · " + formatTime(recipe.minutes) + " · serves " + recipe.serves,
    ),
    surprise ? h("p", { class: "volunteered" }, "This one volunteered.") : null,
    h("h1", {}, recipe.title),
    h("p", { class: "recipe-blurb" }, recipe.blurb),
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "Ingredients"),
      h(
        "ul",
        { class: "ingredients" },
        recipe.ingredients.map((item) =>
          h(
            "li",
            {},
            h("label", { class: "ingredient" }, h("input", { type: "checkbox" }), h("span", {}, item)),
          ),
        ),
      ),
    ),
    h(
      "section",
      { class: "panel" },
      h("h2", {}, "Steps"),
      h(
        "ol",
        { class: "steps" },
        recipe.steps.map((step) => h("li", {}, h("span", {}, step))),
      ),
    ),
    softer || richer
      ? h(
          "nav",
          { class: "siblings", "aria-label": "Other versions of this idea" },
          softer
            ? h(
                "a",
                { class: "sibling", href: "#/" + base.id + "/" + softer.id },
                h("span", {}, "A softer version"),
                h("strong", {}, softer.title),
              )
            : null,
          richer
            ? h(
                "a",
                { class: "sibling", href: "#/" + base.id + "/" + richer.id },
                h("span", {}, "A richer version"),
                h("strong", {}, richer.title),
              )
            : null,
        )
      : null,
    renderSurprise(base, true),
  );
}

function renderMissing() {
  return shell(
    h("h1", {}, "That page wandered off."),
    h(
      "p",
      { class: "lede" },
      "The kitchen is still here. Potato, rice, or noodle will get you fed.",
    ),
    h("a", { class: "crumb", href: "#/" }, "Back to the bases"),
  );
}

function render() {
  if (!bases) {
    app.replaceChildren(
      shell(
        h("h1", {}, "The recipes did not load."),
        h("p", { class: "lede" }, "Refresh the page. The dishes live in this folder, not on a server."),
      ),
    );
    return;
  }

  const route = parseHash();
  let view;
  if (!route.baseId) {
    document.title = "Potato.Rice.Noodle";
    view = renderHome();
  } else {
    const base = findBase(route.baseId);
    if (!base) {
      document.title = "Potato.Rice.Noodle";
      view = renderMissing();
    } else if (!route.recipeId) {
      document.title = base.name + " · Potato.Rice.Noodle";
      view = renderBase(base);
    } else {
      const found = findRecipe(base, route.recipeId);
      if (!found) {
        document.title = "Potato.Rice.Noodle";
        view = renderMissing();
      } else {
        document.title = found.recipe.title + " · Potato.Rice.Noodle";
        view = renderRecipe(base, found.family, found.recipe, route.surprise);
      }
    }
  }

  const heading = view.querySelector("h1");
  if (heading) heading.tabIndex = -1;
  app.replaceChildren(view);
}

function surprise(baseId) {
  const base = findBase(baseId);
  if (!base) return;
  const recipes = allRecipes(base);
  const current = parseHash().recipeId;
  const pool = recipes.filter((recipe) => recipe.id !== current);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  location.hash = "#/" + base.id + "/" + pick.id + "?surprise=1";
}

window.addEventListener("hashchange", () => {
  render();
  window.scrollTo(0, 0);
  document.querySelector("h1")?.focus();
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-surprise]");
  if (!button) return;
  surprise(button.getAttribute("data-surprise"));
});

render();
