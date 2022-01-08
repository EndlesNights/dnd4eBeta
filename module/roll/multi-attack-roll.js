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
     * Push a new roll instance to the multiroll master array
     * @param {string} formula
     * @param {object} data
     * @param {object} options
     * @return {RollWithOriginalExpression} the roll
     */
    createRoll(parts, expressionParts, data, options) {
        const roll = RollWithOriginalExpression.createRoll(parts, expressionParts, data, options).roll({async : false});
        this.rollArray.push(roll);
        return roll;
    }


    /**
     * Populate data strucutre for each of the multiroll components
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

            if(game.settings.get("dnd4e", "automationCombat")){
                if (critState === " critical"){
                    hitState = "Critical Hit!"
                } else if (critState === " fumble"){
                    hitState = "Critical Miss!"
                } else if (r._total >= targDefVal){
                    hitState = "Probable Hit!";
                } else {
                    hitState = "Probable Miss!";
                }
            }

            const chatData = r.getChatData()

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
        roll.terms = data.terms.map(t => {
            if ( t.class ) {
                if ( t.class === "DicePool" ) t.class = "PoolTerm"; // backwards compatibility
                return RollTerm.fromData(t);
            }
            return t;
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

