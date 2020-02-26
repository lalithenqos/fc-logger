"use strict";
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//var i18n2 = require("@types/i18n");
const i18n_1 = __importDefault(require("i18n"));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bkNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pMThuQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztHQUlHOzs7OztBQUdILHFDQUFxQztBQUNyQyxnREFBd0I7QUFFeEIsTUFBcUIsVUFBVTtJQUUzQixZQUFZLGVBQXVCO1FBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0lBQzNDLENBQUM7SUFDRCxPQUFPLENBQUMsSUFBWTtRQUNoQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxPQUFPLEdBQUc7WUFDVixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7WUFDZixRQUFRLEVBQUUsU0FBUztZQUNuQixhQUFhLEVBQUUsSUFBSTtZQUNuQixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyx3QkFBd0I7U0FDM0QsQ0FBQTtRQUNELGNBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEIsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBaEJELDZCQWdCQztBQUVEOzs7Ozs7Ozs7Ozs7O0lBYUkifQ==