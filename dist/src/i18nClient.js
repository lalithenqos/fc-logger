"use strict";
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
//var i18n2 = require("@types/i18n");
const i18n_1 = (0, tslib_1.__importDefault)(require("i18n"));
class I18nClient {
    constructor(localesFilePath) {
        this.localesFilePath = localesFilePath;
    }
    connect(lang) {
        let anyObject = {};
        let options = {
            locales: [lang],
            register: anyObject,
            defaultLocale: lang,
            directory: this.localesFilePath //__dirname + '/locales'
        };
        i18n_1.default.configure(options);
        return anyObject;
    }
}
exports.default = I18nClient;
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
//# sourceMappingURL=i18nClient.js.map