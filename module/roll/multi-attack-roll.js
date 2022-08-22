import { DND4EBETA } from "../config.js";

/**
 * An extension of the default Foundry Roll class for handling multiattack rolls and displaying them in a single chat message
 */
import {RollWithOriginalExpression} from "./roll-with-expression.js";

export class MultiAttackRoll extends Roll {
    constructor (formula, data={}, options={}) {
        super(formula, data, options);
        this.rollArray = [];
        this._multirollData = [];
    }

    /**
     * Custom chat template to handle multiroll attacks
     */
    static CHAT_TEMPLATE = "systems/dnd4e/templates/chat/roll-template-multiattack.html";

    get multirollData() {
        return this._multirollData;
    }

    /**
     * Adds a new roll to this multiroll expression.  This API is identical to {@link RollWithOriginalExpression#createRoll}
     *
     * Worked example:
     * Attack roll: which is 1d20 + @wepAttack+@powerMod+@lvhalf+@bonus   {wepAttack: "3 + 1", powerMod: 5, lvhalf: 1, bonus: "1d6" }
     * by the time this formula reaches out code it has become a parts array like so ["3 + 1 + 5 + 1", "@bonus"]  This is because entity.js calls Helper.commonReplace on the attack formula and performs all the substitutions required
     * the @bonus gets added as a new part by the roll helper in dice.js to capture the situational bonus added by the user
     * In order to get a nice expression with highlighting we need to call this method with the following parameters:
     * parts: ["3 + 1 + 5 + 1", "@bonus"]
     * expressionPartsReplacements: [{ target: "3 + 1 + 5 + 1", value: "@wepAttack + @powerMod + @lvhalf"}]
     * data: {bonus: "1d6" }
     * options {
     *     formulaInnerData: {
     *      wepAttack: "3 + 1",
     *      powerMod: 5,
     *      lvhalf: 1
     *    }
     * }
     * @param parts {String[]} The Formula to be rolled as an array of different expressions it is to be built from (e.g. ["2+3+5", "4", "-2", "@bonus"]
     * @param expressionPartsReplacements {Object[]} An array of replacement objects that can be used to find the original variables for any entry in the parts array that has already been substituted.
     * Each object requires 2 fields: target which must contain a string that exactly matches 1 element in the parts array, and value which is the expression that was used to create it: [{ target: "2+3+5", value: "@weapAttack + @enhance"}]
     * If this is not supplied then any pre-substituted formula will show up as their pre-subbed values in both the result and expression display
     * @param data {Object} The roll substitution data, as a normal roll
     * @param options {Object} The roll options.  If you have expressionPartsReplacements for certain parts, in order for highlighting to correctly highlight the individual variables in expressionPartsReplacements,
     * you must set the 'formulaInnerData' property of this to be an object of {name: value} where name is the variable name without the @ and value is the exact value it was substituted for.
     * If this is not supplied highlighting will be at the level of the parts array - mousing over a part of the parts array will highlight all of that part in the expression and result display.
     * Please note that this object is serialised and deserialised to JSON and stored with rolls, it is therefore advisable to keep this as small as possible and not to simply copy the entire contents of the data object.
     * @return {RollWithOriginalExpression} new a new Roll
     *
     */
    addNewRoll(parts, expressionPartsReplacements, data, options) {
        const roll = RollWithOriginalExpression.createRoll(parts, expressionPartsReplacements, data, options).roll({async : false});
        this.rollArray.push(roll);
        return roll;
    }


    /**
     * Populate data structure for each of the multiroll components
     * @param {Object} targDataArray
     * @param {Array} critStateArray
     */
    populateMultirollData(targDataArray, critStateArray) {
        for (let [i, r] of this.rollArray.entries()){
            let parts = r.dice.map(d => d.getTooltipData());
            let targName = targDataArray.targNameArray[i];
            let targDefVal = targDataArray.targDefValArray[i];
            let critState = critStateArray[i];

            let hitState = "";

	    if(game.settings.get("dnd4e", "automationCombat") && targDefVal !== undefined) {
                if (critState === " critical"){
                    hitState = game.i18n.localize("DND4EBETA.AttackRollHitCrit");
                    targDataArray.targetHit.push(targDataArray.targets[i]);
                } else if (critState === " fumble"){
                    hitState = game.i18n.localize("DND4EBETA.AttackRollMissCrit");
                    targDataArray.targetMissed.push(targDataArray.targets[i]);
                } else if (r._total >= targDefVal){
                    hitState = game.i18n.localize("DND4EBETA.AttackRollHit");
                    targDataArray.targetHit.push(targDataArray.targets[i]);
                } else {
                    hitState = game.i18n.localize("DND4EBETA.AttackRollMiss");
                    targDataArray.targetMissed.push(targDataArray.targets[i]);
                }
            }

            const chatData = r.getChatData(false)

            this._multirollData.push({
                formula : chatData.formula,
                expression: chatData.expression,
                total : r._total,
                parts : parts,
                tooltip : '',
                target : targName,
                hitstate : hitState,
                critstate : critState
            });
        };
    }

    /**
     * Render a Roll instance to HTML
     * @param {object} [chatOptions]      An object configuring the behavior of the resulting chat message.
     * @return {Promise<string>}          The rendered HTML template as a string
     *
     * Modified to include multirollData attribute and handle multirollData dice tooltips
     */
    async render(chatOptions={}) {
        chatOptions = foundry.utils.mergeObject({
            user: game.user.id,
            flavor: null,
            template: this.constructor.CHAT_TEMPLATE,
            blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;

        // Execute the roll, if needed
        if (!this._evaluated) await this.evaluate({async : true});

        for (let roll of this._multirollData) {
            let parts = roll.parts;
            roll.tooltip = await renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
        };

        // Define chat data
        const chatData = {
            formula: isPrivate ? ["???"] : this._formula,
            multirollData: isPrivate? ["???"] : this._multirollData,
            flavor: isPrivate ? null : chatOptions.flavor,
            user: chatOptions.user,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            total: isPrivate ? "?" : Math.round(this.total * 100) / 100
        };

        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

    /**
     * Modified from base to include _multirollData attribute
     * @returns {object}
     */
    toJSON() {
        return {
            class: this.constructor.name,
            options: this.options,
            dice: this._dice,
            formula: this._formula,
            multirollData: this._multirollData,
            terms: this.terms,
            total: this.total,
            evaluated: this._evaluated
        }
    }

    /**
     * Modified from base to handle multirollData attribute
     * @param {object} data
     * @returns
     */
    static fromData(data) {

        // Create the Roll instance
        const roll = new this(data.formula, data.data, data.options);

        // Expand terms
        roll.terms = []
        data.multirollData.forEach(multiTerm => {
            multiTerm.parts.forEach(diceTerm => {
                let dt = DiceTerm.fromData(diceTerm)
                if(dt.class === "DicePool" ) dt.class = "PoolTerm"; // backwards compatibility incase?
                dt.results = diceTerm.rolls.map( t => {
                    return {
                        result: t.result,
                        "active": true,
                        "indexThrow": 0
                    }
                })
                roll.terms.push(dt)
            });
        });

        // Repopulate evaluated state
        if ( data.evaluated ?? true ) {
            roll._total = data.total;
            roll._dice = (data.dice || []).map(t => DiceTerm.fromData(t));
            roll._multirollData = data.multirollData;
            roll._evaluated = true;
        }
        return roll;
    }
}

