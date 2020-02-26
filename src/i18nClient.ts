/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


//var i18n2 = require("@types/i18n");
import i18n from 'i18n';

export default class I18nClient {
    localesFilePath: string
    constructor(localesFilePath: string) {
        this.localesFilePath = localesFilePath;
    }
    connect(lang: string) {
        let anyObject = {};
        let options = {
            locales: [lang],
            register: anyObject,
            defaultLocale: lang,
            directory: this.localesFilePath //__dirname + '/locales'
        }
        i18n.configure(options);
        return anyObject;
    }
}

/* function i18nClient(localesFilePath) {
    this.localesFilePath = localesFilePath;
}
i18nClient.prototype.connect = function (lang: string) {
    let anyObject = {};
    let options = {
        locales: [lang],
        register: anyObject,
        defaultLocale: lang,
        directory: this.localesFilePath //__dirname + '/locales'
    }
    i18n.configure(options);
    return anyObject;
} */
