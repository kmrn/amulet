/**
 * auto_translate.js
 * AMULET - Auto Magical Universal Label Excellent Translator
 * Author: Kamran Payne
 * 
 * Before running AMULET you need to specify your gcloud keyfile location in the
 * environment using `export GOOGLE_APPLICATION_CREDENTIALS="[PATH]"`. Then set the
 * location for the i18n config file (relative to auto_translate.js) using `export I18N_CONFIG_DIR="[PATH]"`.
 * 
 * Then, all you need to do to update all of the i18n labels is run `npm run translate`
 * Auto translate should take care of the rest.
 * 
 * AMULET is designed to NOT change any existing i18n labels in order to preserve
 * professionally translated text. It will only translate and add missing i18n labels. 
 * It takes a decent amount of time generating entire new translation files, depending
 * on the size of the file it will seem like it hangs but this is normal as the script waits
 * for each translation.
 * 
 * DO NOT add any strings to the i18n JSON unless it is in the correct language.
 * 
 * See https://cloud.google.com/translate/docs/languages for a list of supported languages
 * and their ISO-639-1 codes. New languages can be added to i18n/config/i18nConfig.json
 * 
 */

const { promisify } = require('util');
const request = require('request');

const fs = require('fs');
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const Translate = require('@google-cloud/translate');
const translator = new Translate();

const diff = require('deep-diff');

const { i18nConfig } = require(process.env.I18N_CONFIG_DIR);

const autoTranslate = {

    i18nPath: 'i18n/',

    translateString: async function(string, language) {
        try {
            const results = await translator.translate(string, language);
            return results[0];
        } catch (err) {
            console.error('ERROR:', err);
            throw(err);
        }
    },

    translateDiff: async function(original, translation, isoCode) {
        try {
            const changeset = diff.diff(original, translation);
            let index = 0;

            for (change of changeset)  {
                if (change.kind === 'D') {
                    if (typeof change.lhs === 'string') {
                        if (change.path.length === 3) {
                            translation[change.path[0]][change.path[1]][change.path[2]] = await this.translateString(change.lhs, isoCode);
                        } else if (change.path.length === 4) {
                            translation[change.path[0]][change.path[1]][change.path[2]][change.path[3]] = await this.translateString(change.lhs, isoCode);
                        }
                    } else {
                        const diffKeys = Object.keys(change.lhs);
                        for (key of diffKeys) {
                            if (change.path.length === 2) {
                                if (translation[change.path[0]][change.path[1]] === undefined) {
                                    translation[change.path[0]][change.path[1]] = {};
                                }
                                if (typeof change.lhs[key] !== 'string') {
                                    translation[change.path[0]][change.path[1]][key] = {};

                                    const subDiffKeys = Object.keys(change.lhs[key]);
                                    for (subKey of subDiffKeys) {
                                        translation[change.path[0]][change.path[1]][key][subKey] = await this.translateString(change.lhs[key][subKey], isoCode);
                                    }
                                } else {
                                    translation[change.path[0]][change.path[1]][key] = await this.translateString(change.lhs[key], isoCode);
                                }
                            } else if (change.path.length === 3) {
                                if (translation[change.path[0]][change.path[1]][change.path[2]] === undefined) {
                                    translation[change.path[0]][change.path[1]][change.path[2]] = {};
                                }
                                translation[change.path[0]][change.path[1]][change.path[2]][key] = await this.translateString(change.lhs[key], isoCode);
                            }
                        }
                    }
                }

                if (index < changeset.length - 1) {
                    index++;
                } else {
                    return translation;
                }
            }
        } catch (err) {
            console.error("ERROR: ", err);
            throw(err);
        }
    },

    run: async function() {
        console.log("Translating. This might take a while...");
        try {
            for (culture of i18nConfig.cultures) {
                if (! await exists(this.i18nPath + culture.name)) {
                    await mkdir(this.i18nPath + culture.name);
                }
                for (file of i18nConfig.files) {
                    const input = JSON.parse(await readFile(this.i18nPath + 'default/' + file + '.json', 'utf8'));
                    const filename = this.i18nPath + culture.name + '/' + file + '.json';
                    let current = {};

                    if (await exists(filename)) {
                        current = JSON.parse(await readFile(filename, 'utf8'));
                    } else {
                        current[file] = {};
                    }

                    const translation = await this.translateDiff(input, current, culture.isoCode);
                    await writeFile(filename, JSON.stringify(translation, null, '    '), 'utf8');
                    console.log(' > ' + filename);
                }
            }
        } catch (err) {
            console.error('ERROR: ', err);
            throw(err);
        } finally {
            console.log("Done");
        }
    }
}

autoTranslate.run();
