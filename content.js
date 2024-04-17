let currentBrowser;
if (typeof chrome === 'undefined') {
  currentBrowser = browser;
} else {
  currentBrowser = chrome;
}

const fractionMap = [
  [/(\d*)\s*\xBD/g, 0.5],
  [/(\d*)\s*\xBC/g, 0.25],
  [/(\d*)\s*\xBE/g, 0.75]
];

const wordMap = [
  ["STRENGTH", "СИЛА"],
  ["DEXTERITY", "ЛОВКОСТЬ"],
  ["CONSTITUTION", "ВЫНОСЛИВОСТЬ"],
  ["WISDOM", "МУДРОСТЬ"],
  ["INTELLIGENCE", "ИНТЕЛЕКТ"],
  ["CHARISMA", "ХАРИЗМА"]
];

const regexDict = [
  [
    [
      [" ft\\.?", " м."],
      ["-ft\\.?", "-м."],
      [" feet", " метров"],
      [" foot", " метров"],
      ["-\\s*foot", "-метров"]
    ],
    [30, 100]
  ],
  [
    [
      [" miles?", " километров"],
      ["-\\s*mile", "-километров"],
      [" or more miles", " или более км."],
      [" mph", " км/ч"]
    ],
    [150, 100]
  ],
  [
    [
      [" inch(?:es)?", " сантиметров"],
      ["-\\s*inch(?:es)?", "-сантиметров"],
      [" in\\.?", " см."]
    ],
    [250, 100]
  ],
  [
    [
      [" cubic foot", " кубических метров"],
      [" cubic feet", " кубических метров"]
    ],
    [30, 1000]
  ],
  [
    [
      [" sq\\. yd\\.", " квадратных метров"],
    ],
    [1, 1]
  ],
  [
    [
      [" lb\\.?", " кг."],
      [" pounds?", " килограмов"],
      ["-\\s*pounds?", "-килограмов"],
      [" pints?", " liter"],
      [" degrees Fahrenheit", "градусов Цельсия"]
    ],
    [1000, 2000]
  ],
  [
    [
      [" ounces?", " грам"],
      ["-ounces?", "-грам"]
    ],
    [300, 10]
  ],
  [
    [
      [" gallons?", " литров"],
      ["-gallons?", "-литров"]
    ],
    [700, 200]
  ]
];

const regexExceptions = [
  [
    pa_zone,
    [
      [/\(range\s*((?:\d+,)*\d+(?:.\d+)?)(\/)((?:\d+,)*\d+(?:.\d+)?)\)/g, " m.)", "(range "],
      [/range\s*((?:\d+,)*\d+(?:.\d+)?)(\/)((?:\d+,)*\d+(?:.\d+)?)\s+ft\./g, " m.", "range "]
    ],
    [30, 100]
  ],
  [
    pa_exect_match,
    [
      [/4’8"/g, "1.45 м."],
      [/4 feet 8 inches/g, "1.45 м."],
      [/5 feet 8 inches/g, "1.75 м."],
      [/3’8"/g, "1.10 м."],
      [/4’(?!\d)/g, "1.20 м."],
      [/4’6"/g, "1.40 м."],
      [/4’5"/g, "1.35 м."],
      [/2’7"/g, "0.80 м."],
      [/5’6"/g, "1.70 м."],
      [/2’11"/g, "0.90 м."],
      [/4’9"/g, "1.50 м."],
      [/4’10"/g, "1.55 м."],
      [/\(12 × 3\)/g, "(12 × 3 / 2)"]
    ],
    []
  ],
  [
    pa_dice_unit,
    [
      ["lb\\.", " / 2 кг."],
      ["pounds", " / 2 килограм"],
      ["inches", " × 2.5 сантиметров"],
      ["in\\.", " × 2.5 см."],
      ["miles", " × 1.5 километров"],
      ["ounces", " × 30 грам"],
      ["gallons", " × 3.5 литров"],
      [/^((?:[+×])\(?\d+d\d+)\)?$/g, " × 2.5 см."]
    ],
    []
  ]
];

function ch_to_meters_one(element) {
  if (element.classList.contains("ddbc-combat-attack__range-value-long")) {
    element.textContent = "(" + (parseFloat(element.textContent.match(/\d+/)) * 30) / 100 + ")";
  } else {
    element.textContent = (parseFloat(element.textContent) * 30) / 100;
  }
}

//----------------
function changeAbilityLabels(wordMap) {
    const labelElements = document.querySelectorAll('.ddbc-ability-summary__label');

    labelElements.forEach((element) => {
        const text = element.textContent.trim(); // Get the text content and remove leading/trailing whitespace
        const words = text.split(' '); // Split the text into an array of words

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (wordMap[word]) {
                words[i] = wordMap[word]; // If the word exists in the wordMap, replace it with its corresponding value
            }
        }

        element.textContent = words.join(' '); // Set the modified text content back to the element
        element.innerHTML = DOMPurify.sanitize(text);
        console.log('did something')
    });
}


//---------------

function ch_to_meters() {
  let distancesNumber, distancesUnit, numberOfDistances;

  if (document.querySelector(".ddbc-distance-number")) {
    distancesNumber = document.querySelectorAll(".ddbc-distance-number__number");
    distancesUnit = document.querySelectorAll(".ddbc-distance-number__label");
    numberOfDistances = distancesNumber.length;

    for (var i = 0; i < numberOfDistances; i++) {
      if (distancesUnit[i].textContent == 'ft.') {
        if (distancesNumber[i].textContent != "--") {
          ch_to_meters_one(distancesNumber[i]);
        }
        distancesUnit[i].textContent = 'м.';
      }
    }
  }
  if (document.querySelector(".ddbc-combat-attack__range-value-close")) {
    distancesNumber = document.querySelectorAll(".ddbc-combat-attack__range-value-close");
    distancesUnit = document.querySelectorAll(".ddbc-combat-attack__range-value-long");
    numberOfDistances = distancesNumber.length;

    for (var i = 0; i < numberOfDistances; i++) {
      if (!distancesNumber[i].classList.contains("converted")) {
        ch_to_meters_one(distancesNumber[i]);
        ch_to_meters_one(distancesUnit[i]);
        distancesNumber[i].classList.add("converted");
      }
    }
  }
  ch_item_range();
}

function ch_item_range() {
  if (document.querySelector(".ddbc-note-components__component")) {
    var regexItem = /\((\d+)\/(\d+)\)/g;
    var itemRange = document.querySelectorAll(".ddbc-note-components__component");
    var text, firstNumber, secondNumber;
    itemRange.forEach((element) => {
      if (!element.classList.contains("converted")) {
        text = element.textContent;
        var matches = [...text.matchAll(regexItem)];
        if (matches.length != 0) {
          matches.forEach((match) => {
            firstNumber = (parseFloat(match[1]) * 30) / 100;
            secondNumber = (parseFloat(match[2]) * 30) / 100;
            text = text.replace(regexItem, "(" + firstNumber + "/" + secondNumber + ")");
          });
          element.textContent = text;
          element.classList.add("converted");
        }
      }
    });
  }
}

function ch_to_kg_one(elementNumber, elementUnit) {
  elementNumber.textContent = (parseFloat(elementNumber.textContent) * 1000) / 2000;
  elementUnit.textContent = "кг.";
}

function ch_to_kg() {

  if (document.querySelector(".ddbc-weight-number")) {
    var weightNumber = document.querySelectorAll(".ddbc-weight-number__number");
    var weightUnit = document.querySelectorAll(".ddbc-weight-number__label");
    weightNumber.forEach((element, index) => {
      if (weightUnit[index].textContent == 'lb.') {
        ch_to_kg_one(element, weightUnit[index]);
      }
    });
  }

  if (document.querySelector(".ct-equipment__container-weight-capacity")) {
    weightContainerCapacity = document.querySelectorAll(".ct-equipment__container-weight-capacity");
    var regexWeightContainerCapacity = /\(((?:\d+,)*\d+(?:\.\d+)?)\/((?:\d+,)*\d+(?:\.\d+)?)\s*lb\.?\)/g;
    var text, matches, firstNumber, secondNumber;
    weightContainerCapacity.forEach((element) => {
      text = element.textContent;
      matches = [...text.matchAll(regexWeightContainerCapacity)];
      if (matches.length != 0) {
        matches.forEach((match) => {
          firstNumber = (parseFloat(match[1]) * 1000) / 2000;
          secondNumber = (parseFloat(match[2]) * 1000) / 2000;
          text = text.replace(match[0], "(" + firstNumber + "/" + secondNumber + " kg.)");
        });
        element.textContent = text;
      }
    });
  }
}

function ch_in_text(divList) {
  var currDiv;
  for (let i = 0; i < divList.length; i++) {
    currDiv = document.querySelectorAll(divList[i]);
    if (!currDiv)
      continue;
    for (let j = 0; j < currDiv.length; j++) {
      if (currDiv[j].classList.contains("checked"))
        continue;
      pa_in_text(currDiv[j]);
      currDiv[j].classList.add("checked");
    }
  }
}

function pa_in_text(element) {
  regexExceptions.forEach((parsePackage) => {
    parsePackage[0](element, parsePackage[1], parsePackage[2], true);
  });
  pa_fraction(element);
  pa_fraction_symbol(element);
  regexDict.forEach((parsePackage) => {
    pa_zone(element, parsePackage[0], parsePackage[1]);
    pa_unit(element, parsePackage[0], parsePackage[1]);
  });
}

function pa_zone(element, regex, rate, regOverride = false) {
  var text = element.innerHTML;
  var matches, firstNumber, secondNumber, unit, reg, prefix = "";
  regex.forEach((regexElement) => {
    if (regOverride) {
      reg = regexElement[0];
      prefix = regexElement[2];
    }
    else {
      reg = new RegExp("((?:\\d+,)*\\d+(?:\\.\\d+)?)(\\s*(?:by|to|and)(?:\\s*over)?\\s*)((?:\\d+,)*\\d+(?:\\.\\d+)?)" + regexElement[0], "g");
    }
    matches = [...text.matchAll(reg)];
    if (matches.length != 0) {
      matches.forEach((match) => {
        unit = regexElement[1];
        firstNumber = (parseFloat(match[1].replace(",", "")) * rate[0]) / rate[1];
        secondNumber = (parseFloat(match[3].replace(",", "")) * rate[0]) / rate[1];
        if (secondNumber != 1 && !(/(?:\/|\.$|\)$)/.test(unit)))
          unit += "s";
        text = text.replace(match[0], prefix + firstNumber + match[2] + secondNumber + unit);
      });
      // Sanitizing the text before adding it to the page
      element.innerHTML = DOMPurify.sanitize(text);
    }
  });
}

function pa_unit(element, regex, rate, regOverride = false) {
  var text = element.innerHTML;
  var matches, number, unit, reg, prefix = "";
  regex.forEach((regexElement) => {
    if (regOverride) {
      reg = regexElement[0];
      prefix = regexElement[2];
    }
    else {
      reg = new RegExp("((?:\\d+,)*\\d+(?:\\.\\d+)?)" + regexElement[0], "g");
    }
    matches = [...text.matchAll(reg)];
    if (matches.length != 0) {
      matches.forEach((match) => {
        unit = regexElement[1];
        number = (parseFloat(match[0].replace(",", "")) * rate[0]) / rate[1];
        if (number != 1 && !(/(?:\/|\.$|\)$)/.test(unit)))
          unit += "s";
        text = text.replace(match[0], prefix + number + unit);
      });
      // Sanitizing the text before adding it to the page
      element.innerHTML = DOMPurify.sanitize(text);
    }
  });
}

function pa_fraction(element) {
  var text = element.innerHTML;
  var matches = [...text.matchAll(/(\d+)\/(\d+)([^\)]\s*(?:lb|pounds?|pints?|gallons?|ft|feet|foot|cubic|square|miles?|in\.|inch(?:es)?))/g)];
  if (matches.length != 0) {
    matches.forEach((match) => {
      text = text.replace(match[0], (((parseFloat(match[1]) * 100) / parseFloat(match[2])) / 100) + match[3]);
    });
    // Sanitizing the text before adding it to the page
    element.innerHTML = DOMPurify.sanitize(text);
  }
}

function pa_fraction_symbol(element) {
  var text = element.innerHTML;
  var matches, mainNumber;
  fractionMap.forEach((fractionSymbol) => {
    matches = [...text.matchAll(fractionSymbol[0])];
    if (matches.length != 0) {
      matches.forEach((match) => {
        mainNumber = parseFloat(match[1]) + fractionSymbol[1];
        text = text.replace(match[0], mainNumber);
      });
      // Sanitizing the text before adding it to the page
      element.innerHTML = DOMPurify.sanitize(text);
    }
  });
}

function pa_exect_match(element, regex, rate) {
  var text = element.innerHTML;
  var matches, unit, reg;
  regex.forEach((regexElement) => {
    reg = regexElement[0];
    matches = [...text.matchAll(reg)];
    if (matches.length != 0) {
      matches.forEach((match) => {
        unit = regexElement[1];
        text = text.replace(match[0], unit);
      });
      // Sanitizing the text before adding it to the page
      element.innerHTML = DOMPurify.sanitize(text);
    }
  });
}

function pa_dice_unit(element, regex, rate) {
  var text = element.innerHTML;
  var matches, unit, reg;
  regex.forEach((regexElement) => {
    if (typeof regexElement[0] === "object")
      reg = regexElement[0];
    else
      reg = new RegExp("((?:[+×])?\\(?\\d+d\\d+)\\)?\\s*" + regexElement[0], "g");
    matches = [...text.matchAll(reg)];
    if (matches.length != 0) {
      matches.forEach((match) => {
        unit = regexElement[1];
        match[1] = match[1].replace("(", "");
        text = text.replace(match[0], match[1] + unit);
      });
      // Sanitizing the text before adding it to the page
      element.innerHTML = DOMPurify.sanitize(text);
    }
  });
}

function ch_in_monster() {
  const monsterPageDivs = [
    ".mon-stat-block p",
    ".mon-details__description-block p",
    '.mon-stat-block span[class$="-data"]'
  ];
  ch_in_text(monsterPageDivs);
}

function ch_in_encounter() {
  const encounterPageDivs = [
    ".mon-stat-block p",
    ".mon-details__description-block p",
    '.mon-stat-block span[class$="-data"]',
    '.line-item__value'
  ];
  ch_in_text(encounterPageDivs);
}

function ch_in_other() {
  const otherPageDivs = [
    ".ddb-statblock-item-value",
    ".more-info-content p",
    ".more-info-content li",
    ".p-article-content p",
    ".p-article-content li",
    ".p-article-content td"
  ];
  ch_in_text(otherPageDivs);
}

function ch_in_character() {
  const characterPageDivs = [
    ".ct-senses__summary",
    ".jsx-parser p",
    ".ddbc-html-content p",
    ".ddbc-html-content li",
    ".ct-sidebar__pane p",
    '.ct-sidebar__pane .ddbc-creature-block span[class$="-data"]',
    ".ddbc-item-name",
    ".ct-preferences-pane__field-description",
    ".ddbc-property-list__property-content",
    ".ddbc-ability-summary__label",
  ];
  ch_to_meters();
  ch_to_kg();
  ch_in_text(characterPageDivs);
  changeAbilityLabels(wordMap)
  console.log("running");
}

function observe_when_ready() {
  let observedNode = document.querySelector("body");
  if (!observedNode) {
    window.setTimeout(addObserverIfDesiredNodeAvailable, 500);
    return;
  }
  let url = window.location.href;
  if (url.match(/characters\//g)) {
    const observer = new MutationObserver(ch_in_character);
    observer.observe(observedNode, { childList: true, subtree: true });
  } else if (url.match(/monsters\//g)) {
    ch_in_monster();
  } else if (url.match(/(?:encounters|combat-tracker)\//g)) {
    const observer = new MutationObserver(ch_in_encounter);
    observer.observe(observedNode, { childList: true, subtree: true });
  } else {
    ch_in_other();
  }

}

function load_and_run(result) {
  if (result.state == "disabled") {
    console.log("Bob is disabled");
  }
  else {
    observe_when_ready();
  }
}

function on_error(error) {
  console.log(`Error: ${error}`);
}

const getting = currentBrowser.storage.local.get("state");
getting.then(load_and_run, on_error);
  