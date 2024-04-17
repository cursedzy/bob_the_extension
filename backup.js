function ch_AbilityLabels() {
  const replacementRules = [
    ["STRENGTH", "СИЛА"],
    ["DEXTERITY", "ЛОВКОСТЬ"],
    ["CONSTITUTION", "ВЫНОСЛИВОСТЬ"],
    ["WISDOM", "МУДРОСТЬ"],
    ["INTELLIGENCE", "ИНТЕЛЕКТ"],
    ["CHARISMA", "ХАРИЗМА"]
  ];

  const targetClass = ".ddbc-ability-summary__label";
  const ab_Change = document.querySelectorAll(`span.${targetClass}`);

  spans.forEach((ab_Change) => {
    let newText = ab_Change.textContent;

    // Iterate through replacementRules and apply replacements
    replacementRules.forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern, "g");
      newText = newText.replace(regex, replacement);
    });

    // Update the text content of the span
    span.textContent = newText;
  });
}

// Call the function to change ability labels
ch_AbilityLabels();
//-----------------

async function changeAbilityLabels() {
  await Promise.all(abilityList.map(async (li) => {
    var abilityName = span.querySelector(".card-title").textContent;
    var abilityDescription = li.querySelector(".ability-description");
    var text = abilityDescription.textContent;
    var matches = [...text.matchAll(regex)];
    matches.forEach((match) => {
      var firstNumber = parseFloat(match[1].replace(",", "")) * rate[0] / rate[1];
      var secondNumber = parseFloat(match[3].replace(",", "")) * rate[0] / rate[1];
      if (secondNumber != 1 && !(/(?:\/|\.$|\)$)/.test(unit)))
        unit += "s";
      text = text.replace(match[0], firstNumber + match[2] + secondNumber + unit);
    });
    abilityDescription.innerHTML = DOMPurify.sanitize(text);
  }));
}

