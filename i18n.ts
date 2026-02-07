import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import "intl-pluralrules";

const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
  },
  home: {
    title: "My Cards",
    scan_card: "Add Card",
  },
  edit: {

    brand_label: "Brand Name",
    brand_placeholder: "Ex: Walmart, Target...",
    value_label: "Value (Barcode / QR Code)",
    value_placeholder: "Card number...",
    color_title: "Color",
    error_name: "Name is required",
    error_value: "Value is required",
    error_invalid_format: "This format does not support these characters. Switch to QR code.",
  },
  scan: {
    title: "Scan Barcode",
    instruction: "Place barcode in the frame",
    permission_denied: "Camera permission denied",
    permission_request: "We need your permission to show the camera",
    grant_permission: "Grant Permission",
    manual_button: "Enter Manually",
  },
};

const fr = {
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Valider",
    close: "Fermer",
  },
  home: {
    title: "Mes Cartes",
    scan_card: "Ajouter",
  },
  edit: {

    brand_label: "Enseigne",
    brand_placeholder: "Ex: Auchan, Fnac...",
    value_label: "Valeur (Code barre / QR Code)",
    value_placeholder: "Numéro de la carte...",
    color_title: "Couleur",
    error_name: "Le nom est obligatoire",
    error_value: "La valeur est obligatoire",
    error_invalid_format: "Ce format ne supporte pas ces caractères. Passez au QR code.",
  },
  scan: {
    title: "Scanner un code-barres",
    instruction: "Placez le code-barres dans le cadre",
    permission_denied: "Permission caméra refusée",
    permission_request: "Nous avons besoin de la permission pour utiliser la caméra",
    grant_permission: "Autoriser l'accès",
    manual_button: "Saisir manuellement",
  },
};

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

const deviceLanguage = getLocales()[0]?.languageCode ?? "en";

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage, // default language to use.
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
