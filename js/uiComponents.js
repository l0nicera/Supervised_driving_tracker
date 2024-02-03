import {
  translateDataToFrench,
  setCurrentDateTime,
  convertToDateTimeLocalFormat,
} from "./utils.js";
import { conditionsCategories } from "./data.js";

function createFieldset() {
  const fieldset = document.createElement("fieldset");
  return fieldset;
}

/**
 * Crée un nouveau dropdown et un fieldset depuis le jeu de donnée fourni.
 *
 * @param {string} className - Nom de la classe à appliquer au fieldset.
 * @param {Array} data - Jeu de données utilisé.
 * @param {string} parentElementId - ID de l'élément parent où le fieldset sera ajouté.
 * @param {boolean} [required=false] - Optionnel : true pour rendre required.
 */
function createDropdown(className, data, parentElementId, required = false) {
  if (typeof data === "undefined") {
    console.log(`Le jeu de donné fourni ` + data + " est vide ou n'existe pas");
  }
  const fieldset = createFieldset();
  fieldset.className = className + " dropdown";
  const selectList = document.createElement("select");
  selectList.name = Object.keys(data[1])[1];
  if (required) {
    selectList.setAttribute("required", "required");
  }
  selectList.appendChild(new Option("Sélectionner...", ""));
  data.forEach((item) => {
    selectList.appendChild(
      new Option(
        translateDataToFrench(item[Object.keys(item)[1]]),
        item[Object.keys(item)[0]]
      )
    );
  });
  document.getElementById(parentElementId).appendChild(fieldset);
  fieldset.appendChild(selectList);
}

/**
 * Crée des radios, leurs label et un fieldset depuis le jeu de donnée fourni.
 *
 * @param {string} className - Nom de la classe à appliquer au fieldset.
 * @param {Array} data - Jeu de données utilisé.
 * @param {string} parentElementId - ID de l'élément parent où le fieldset sera ajouté.
 * @param {boolean} [required=false] - Optionnel : true pour rendre required.
 */
function createRadio(className, data, parentElementId, required = false) {
  if (typeof data === "undefined") {
    console.log(`Le jeu de donné fourni ` + data + " est vide ou n'existe pas");
    return;
  }
  const fieldset = createFieldset();
  fieldset.className = className + " radio";
  data.forEach((item) => {
    const radioElement = document.createElement("input");
    radioElement.setAttribute("type", "radio");
    radioElement.setAttribute("id", item[Object.keys(item)[1]]);
    radioElement.setAttribute("name", Object.keys(data[1])[1]);
    radioElement.setAttribute("value", item[Object.keys(item)[0]]);
    if (required) {
      radioElement.setAttribute("required", "required");
    }

    const labelElement = document.createElement("label");
    labelElement.setAttribute("for", item[Object.keys(item)[1]]);
    labelElement.textContent = translateDataToFrench(
      item[Object.keys(item)[1]]
    );

    fieldset.appendChild(radioElement);
    fieldset.appendChild(labelElement);
  });

  document.getElementById(parentElementId).appendChild(fieldset);
}

/**
 * Crée des checkbox, leurs label et un fieldset depuis le jeu de donnée fourni.
 *
 * @param {string} className - Nom de la classe à appliquer au fieldset.
 * @param {Array} data - Jeu de données utilisé.
 * @param {string} parentElementId - ID de l'élément parent où le fieldset sera ajouté.
 * @param {boolean} [required=false] - Optionnel : true pour rendre required.
 */
function createCheckbox(className, data, parentElementId, required = false) {
  if (typeof data === "undefined") {
    console.log(`Le jeu de donné fourni ` + data + " est vide ou n'existe pas");
  }
  const fieldset = createFieldset();
  fieldset.className = className + " checkbox";
  data.forEach((item, index) => {
    const checkboxElement = document.createElement("input");
    checkboxElement.setAttribute("type", "checkbox");
    checkboxElement.setAttribute("id", item[Object.keys(item)[1]]);
    checkboxElement.setAttribute("name", Object.keys(data[1])[1]);
    checkboxElement.setAttribute("value", item[Object.keys(item)[0]]);
    if (required) {
      checkboxElement.setAttribute("required", "required");
    }

    const labelElement = document.createElement("label");
    labelElement.setAttribute("for", item[Object.keys(item)[1]]);
    labelElement.textContent = translateDataToFrench(
      item[Object.keys(item)[1]]
    );

    fieldset.appendChild(checkboxElement);
    fieldset.appendChild(labelElement);
  });

  document.getElementById(parentElementId).appendChild(fieldset);
}

function initialiseForm(formId) {
  createCheckbox("hazards", conditionsCategories.hazards, formId);
  createRadio("weather", conditionsCategories.weathers, formId);
  createCheckbox("roadTypes", conditionsCategories.roadTypes, formId);
  createCheckbox("parkingTypes", conditionsCategories.parkingTypes, formId);
  createCheckbox("manoeuvers", conditionsCategories.manoeuvers, formId);
}

function createTableHeader(session, table) {
  const thead = table.createTHead();
  const headerRow = thead.insertRow();
  Object.keys(session).forEach((key) => {
    const th = document.createElement("th");
    th.textContent = key;
    headerRow.appendChild(th);
  });
}

/** En fonction de l'index de <select>, offre plusieurs choix pour définir la date */
function sessionDateField(field) {
  let selectIndex = field.selectedIndex;
  let fieldId = field.id;

  if (selectIndex === 1 || selectIndex === 2) {
    // Génère un nouveau champ datetime à renseigner
    let fieldLabel = document.querySelector('label[for="' + fieldId + '"]');
    if (!fieldLabel) {
      console.error("Label associé introuvable pour le champ : " + fieldId);
      return;
    }

    if (!document.body.contains(field)) {
      console.error("Le champ n'est pas dans le DOM : " + fieldId);
      return;
    }

    console.log("Champ à transformer en date : " + fieldId);
    let newDatePicker = generateDatePicker(field, selectIndex, fieldId);
    fieldLabel.insertAdjacentElement("afterend", newDatePicker);
  }
}

function generateDatePicker(elemToReplace, index, id) {
  // suppression de l'élément initial
  elemToReplace.remove();

  // debug
  console.log("valeur passée dans insertDatePicker : " + id);

  // Création d'un champ input de type date
  let newDatePicker = document.createElement("input");
  newDatePicker.setAttribute("type", "datetime-local");
  newDatePicker.setAttribute("required", "true");

  // Attributs d'après l'id de l'élément remplacé
  newDatePicker.setAttribute("id", id);
  newDatePicker.setAttribute("name", id);

  // Si select = "Maintenant", affecte date actuelle
  if (index == 1) {
    newDatePicker.setAttribute("value", setCurrentDateTime());
  }

  return newDatePicker;
}

function updateInsertDatePicker(field, dateValue) {
  if (!field || !document.body.contains(field)) {
    console.error("L'élément n'est pas dans le DOM:", field);
    return;
  }

  console.log("Champ actuel:", field);

  // Créer un nouvel élément input de type datetime-local
  const newDatePicker = document.createElement("input");
  newDatePicker.setAttribute("type", "datetime-local");
  newDatePicker.setAttribute("id", field.id);
  newDatePicker.setAttribute("name", field.name);
  newDatePicker.value = convertToDateTimeLocalFormat(dateValue);

  // Remplacer le select par le nouvel input
  field.parentNode.replaceChild(newDatePicker, field);
}

export {
  createDropdown,
  createRadio,
  createCheckbox,
  initialiseForm,
  createTableHeader,
  updateInsertDatePicker,
  sessionDateField,
  //resetSessionDateField,
};
