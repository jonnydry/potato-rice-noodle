/* Curated local dishes for Potato.Rice.Noodle. No accounts, no API. */
(() => {
const bases = window.PRN_PARTS;

function checkBases(list) {
  const rungs = ["quick", "a bit more", "the longer way"];
  const seen = new Set();
  if (!list || list.length !== 3) throw new Error("expected 3 bases");
  for (const base of list) {
    if (!base.id || !base.name || !base.whisper || !base.intro) throw new Error("base is missing copy");
    if (!base.families || base.families.length < 2) throw new Error(base.id + " needs families");
    for (const family of base.families) {
      if (!family.note || family.recipes.length !== 3) throw new Error(family.id + " should be a ladder of 3");
      let previous = 0;
      family.recipes.forEach((recipe, index) => {
        if (recipe.rung !== rungs[index]) throw new Error(recipe.id + " is on the wrong rung");
        if (recipe.minutes <= previous) throw new Error(recipe.id + " should take longer than the rung before it");
        previous = recipe.minutes;
        for (const key of ["title", "blurb", "serves"]) {
          if (!recipe[key]) throw new Error(recipe.id + " missing " + key);
        }
        if (!recipe.ingredients || recipe.ingredients.length < 2) throw new Error(recipe.id + " needs ingredients");
        if (!recipe.steps || recipe.steps.length < 2) throw new Error(recipe.id + " needs steps");
        if (seen.has(recipe.id)) throw new Error("duplicate id " + recipe.id);
        seen.add(recipe.id);
      });
    }
  }
}

checkBases(bases);
window.PRN_BASES = bases;
})();
