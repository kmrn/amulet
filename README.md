# AMULET - Auto Magical Universal Label Excellent Translator

AMULET is a NodeJS script I created for when you need to make an app with international support but don't currenlty have the resources to get everything professionally translated. Using the Google Cloud Translate API and a certain i18n JSON format (shown below), AMULET will step through all your default labels, translating each one without needing any involvement from you other than setting up running the script.

## config/i18nConfig.json
```
{
  "i18nConfig": {
    "default": "en",
    "cultures": [
      {
        "language": "Spanish",
        "name": "es_us",
        "isoCode": "es"
      },
      {
        "language": "French",
        "name": "fr_fr",
        "isoCode": "fr"
      },
    ],
    "files": [
      "sandwiches",
      "lables"
    ]
  }
}
```

## default/sandwiches.json
```
{
  "sandwiches": {
    "breads": {
      "white": "White",
      "wheat": "Wheat",
      "multigrain": "Multigrain",
      "glutenFreeBread": "Gluten Free Bread"
    },
    "meats": {
      "ham": "Ham",
      "turkey": "Turkey"
  }
}
```

## Original README included in auto_translate.js:

Before running AMULET you need to specify your gcloud keyfile location in the environment using `export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"`. Then set the location for the i18n config file (relative to auto_translate.js) using `export I18N_CONFIG_DIR="[PATH]"`.

Then, all you need to do to update all of the i18n labels is run `node auto_translate` or `npm run translate` if you have it set up as an NPM script. Auto translate should take care of the rest.

AMULET is designed to NOT change any existing i18n labels in order to preserve professionally translated text. It will only translate and add missing i18n labels. It takes a decent amount of time generating entire new translation files, depending on the size of the file it will seem like it hangs but this is normal as the script waits for each translation.

DO NOT add any strings to the i18n JSON unless it is in the correct language.

See https://cloud.google.com/translate/docs/languages for a list of supported languages and their ISO-639-1 codes. New languages can be added to i18n/config/i18nConfig.json
