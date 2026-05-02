import { Helper } from "../helper.js";

export default class Roll4e extends Roll {
  static parse(formula="", data={}) {
    if (data.isActor) formula = Roll.replaceFormulaData(formula, data);
    return super.parse(formula, data);
  }
}