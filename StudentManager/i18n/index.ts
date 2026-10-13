import * as Localization from "expo-localization";

import vi from "./vi";
import en from "./en";

const language = Localization.getLocales()[0]?.languageCode;

const translations = language === "vi" ? vi : en;

export default translations;
