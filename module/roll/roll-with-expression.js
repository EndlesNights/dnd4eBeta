import {Helper} from "../helper.js";

/**
 * Roll that will also have a roll for the expression used to build the row, and highlighting for how elements correspond to formula numbers.
 *
 * When clicking on the resulting formula display, the pop out will now contain the original expression that was used to make that formula. (e.g. formula with the @variables)
 * If the expression can be supplied as an array parts (e.g. ["@wepAttack+@powerMod+@lvhalf", "@bonus"], then it can apply mouseOver highlighting matching each individual expression part to
 * the corresponding part of the formula.  This is relatively trivial for most roles, as most rolls are created as an array of parts, allowing additional option sub-expressions to be easily appended.
 *
 * A further level of highlighting is possible, but more difficult, because many expressions are substituted early in the lifecycle.  By supplying an additional field in the options object, highlighting can be done at the individual @variable level.
 * This requires that the additional formulaInnerData property be set in the options.
 *
 * See the documentation on the constructor for how the parameters have changed.
 *
 * It is highly recommended to use the static member {@link createRoll} method to create new instances of this class as that manages a lot of the constructor arguments for you.
 */
export class RollWithOriginalExpression extends Roll {

    /**
     * Has an enhanced Options object with 2 additional properties:
     * expression:  the original formula expression string, to handle cases where some variables have been replaced before it even gets here.
     * e.g. most 4E attack formula replace the base weapon formula before it even gets to the dice, so @wepAtk is already 3 + 1.  If this is not supplied it is defaulted to the formula.
     *
     * To just get the expression displayed, that is sufficient.  To apply highlighting to match variables to data, the following is needed:
     *
     * expressionArr as expression, but this time with terms in an array.  To make use of this the elements of the formula that correspond to each part of the expressionArr should be surrounded in brackets.
     * formulaInnerData a data object of key = value for any @variables that were pre-replaced before the roll was put in the formula.
     *
     * @param formula The formula to roll.  Each section that corresponds to an element in the options.expressionArr array must be surrounded in brackets and must be an outer bracket.
     * @param data The roll data object, unchanged from standard
     * @param options As regular roll options with 2 additional properties:
     * expressionArr as expression, but this time with terms in an array.  To make use of this the elements of the formula that correspond to each part of the expressionArr must be surrounded in brackets.
     * formulaInnerData a data object of key = value for any @variables that were pre-replaced before the roll was put in the formula.
     *
     * Example
     * Attack roll where the attack formula is @wepAtk + @enhance.  In the player form the player specifies a situation bonus of +1d6
     * This goes through formula conversion before getting to the roll converting @wepAtk + @enhance to "3 + 1"
     * When building this roll we have a formula parts array of ["3 + 1], "@bonus"], and expression parts array of ["@wepAtk + @enhance", "@bonus"] a regular roll data object of {"bonus" : "1d6"} and an extra data object of {wepAtk: 3, enhance: 1}
     * const bracketFormula = formulaParts.map(x => `(${x})`).join("+") = (3 + 1)+@bonus
     * new RollWithOriginalExpression(bracketFormula, {"bonus" : "1d6"}, {expressionArr: ["@wepAtk + @enhance", "@bonus"], formulaInnerData: {wepAtk: 3, enhance: 1}})
     */
    constructor (formula, data={}, options={}) {
        super(formula, data, foundry.utils.mergeObject({expression : formula, originalFormula: formula}, options));
        this.expression = options.expression ? options.expression : formula
    }

    /**
     * Convenience method for creating a RollWithOriginalExpression.
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
    static createRoll(parts, expressionPartsReplacements, data = {}, options = {}) {
        // filter out empty entries
        let tempExpression =  parts.filter(part => !!part)

        // do not surround with more brackets if they haven't asked for highlighting as it looks gash
        if (game.settings.get("dnd4e", "showRollExpression")) {
            // regex -> english = look for (ANYTHING)[ANYTHING] - basically it must start with a term in brackets and end with a term in square brackets.
            // The bracketed term and the square bracketed term can only be separated by 0 or more spaces
            const regex = new RegExp('\\(.+\\)[ ]*\\[.+\\]')
            tempExpression = tempExpression.map(part => {
                /*
                 This is for damage rolls primarily, where we rely on the roll flavour to give us damage types
                 and from damage types work out resistances. - e.g. (1d6 + 5)[fire]
                 However Foundry's formula parser does not like flavour inside brackets.  e.g. ((1d6 + 5)[fire])
                 And the flavour is dropped entirely, which breaks the resistance calculation.

                 So perform a check to try and determine if the part is entirely a flavoured damage expression.
                 First basic check:
                 - If the part starts with a ( and ends with a ] it is probably a flavoured damage expression.
                 - then perform that godawful regex to make sure that it is the right shape and not someone using [] for random flavouring/clarity

                  There are probably edge-cases here that I am not covering, but worst that happens is the highlighting looks a little weird / doesn't work.
                 */
                const trimmedPart = ("" + part).trim() // remember part may be a number.  Very occasionally not everything is a string!
                if (trimmedPart.indexOf("(") === 0 && trimmedPart.indexOf(']') === trimmedPart.length - 1) {
                    if (regex.test(trimmedPart)) {
                        return part
                    }
                }
                return `(${part})`
            })
        }
        const expression = tempExpression.join(" + ")
        options.parts = parts
        options.expressionArr = this._createExpression(parts, expressionPartsReplacements)
        options.expression = options.expressionArr.join(" + ")
        return new RollWithOriginalExpression(expression, data, options)
    }

    static _createExpression(parts, expressionParts) {
        const result = [...parts]
        //n^2, but simple and n will always be small
        for(let i = 0; i<result.length; i++) {
            const toReplace = result[i]
            expressionParts.forEach(element => {
                if (element.target === toReplace) {
                    result[i] = element.value
                }
            })
        }

        return result
    }

    /**
     * Custom chat template to handle displaying the expression attacks
     */
    static CHAT_TEMPLATE = "systems/dnd4e/templates/chat/roll-template-single.html";

    async render(chatOptions={}) {
        chatOptions = foundry.utils.mergeObject({
            user: game.user.id,
            flavor: null,
            template: this.constructor.CHAT_TEMPLATE,
            blind: false
        }, chatOptions);
        const isPrivate = chatOptions.isPrivate;

        // Execute the roll, if needed
        if ( !this._evaluated ) await this.evaluate({async: true});

        let formulaData = this.getChatData(isPrivate);

        // Define chat data
        const chatData = {
            formula: isPrivate ? "???" : formulaData.formula,
            flavor: isPrivate ? null : chatOptions.flavor,
            user: chatOptions.user,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
            expression: isPrivate? "???" : formulaData.expression,
            hitTypeDamage: this.options?.hitTypeDamage,
            hitTypeHealing: this.options?.hitTypeHealing,
        };
        // Render the roll display template
        return renderTemplate(chatOptions.template, chatData);
    }

   getChatData(isPrivate = false) {
       if (!isPrivate && game.settings.get("dnd4e", "showRollExpression")) {
           return this.surroundFormulaWithExpressionSpanTags(this._formula, this.options.expressionArr)
       }
       else {
           return {
               formula : this._formula,
               expression : ""
           }
       }
   }

    /**
     * Written by @Draconas
     * In order to highlight the bits of the formula when you mouse over them,
     * I need to crack the formula string open and surround the bits that match to expressions with <span> tags
     *
     * Overall and ingeneral case this is actually a very hard operation!  There are a lot of possible edge cases
     * Because a given section (specifically the inital @formula) is a string that may contain many variables, which may themselves be variables or expressions
     *
     * Fortunately I an break some cases down:
     * When I combined the formula parts array into a single string, I surrounded each element with brackets
     * Therefore I know that outer-most brackets correspond 1-1 with elements in the @parts array
     *
     * @param formula {string} the formula to be worked on
     * @param expressionParts the array of individual parts of the expression that created the formula
     * @return {{expression: string, formula: string}}
     */
    surroundFormulaWithExpressionSpanTags(formula, expressionParts) {
        try {
            const tag = randomID(16) + "." // a random id prefix for the spans so we can refer to them by id in a chat log with many rolls

            let newFormula = "" //the formula to return
            let newExpression = "" // the expression to return

            let openBracket = 0; //current number of unclosed ( we have encountered
            let expressionIdx = 0; // the index of which part of the expression array is being processed
            let workingFormula = "" // the piece of the formula string we are actively processing
            for (let i = 0; i < formula.length; i++) {
                const char = formula.charAt(i)
                if (char === '(') {
                    if (openBracket === 0) {
                        // this is a new outer-most bracket, and therefore corresponds to the active part of the expression array
                        // set up a new set of wrapped spans and re-initalise all the active variables

                        newFormula += workingFormula // append any existing formula to the one we will return
                        workingFormula = "" // reset the working formula - diliberately not including the bracket that corresponding to expression parts
                    }
                    else {
                        workingFormula += char // this was an inner bracket, so is part of the formula, include it
                    }
                    openBracket++
                    continue
                }
                if (char === ')') {
                    openBracket--
                    if (openBracket === 0) {
                        const spanId = `${tag}${expressionIdx}`
                        // this is an outer most bracket, so corresponds  to the active part of the expression array
                        // it is time to append the formula and expression we have been actively working on to the return results, wrapping them in the appropreate spans.
                        // call the secondary replacer for if the expression was itself multiple variables (e.g. the inital formula)
                        const formData = this.replaceInnerVariables(workingFormula, expressionParts[expressionIdx], spanId)

                        // check to see if this was a synthetic bracket or a bracket around a damage type term that functioned like a synthetic bracket for us
                        formData.formula = this.includeOuterBracketsIfFormulaIsFlavoured(formula, i, formData.formula)

                        // if the helper has done a load of work to the expression and formula, just use that
                        if (formData.changed) {
                            newFormula += formData.formula
                            newExpression += formData.expression
                        }
                        else {
                            // otherwise wrap our active strings in appropreate spans and set them
                            newFormula += `<span id="form${spanId}">`
                            newFormula += formData.formula
                            newFormula += `</span>`

                            newExpression += `<span id="exp${spanId}" onmouseenter="mouseEnter('${spanId}')" onmouseleave="mouseLeave('${spanId}')">`
                            newExpression += formData.expression
                            newExpression += `</span>`
                        }
                        // reset things because we have completed a part of this formula
                        newExpression += " + "
                        workingFormula = '' // note we are not including the ) for a synthetic bracket that only denotes expression-parts
                        expressionIdx++
                    }
                    else {
                        workingFormula += char // append the ) as it is part of a formula
                    }
                    continue
                }
                workingFormula += char // its a non bracket, append it to the current working substring
            }

            return {
                formula: newFormula + workingFormula, // return the new formula
                expression: newExpression.substring(0, newExpression.length - 3) // trim a trailing " + " off the end
            }
        }
        catch (e) {
            // do not allow errors to propagate here, as they will kill the chat / flow
            // they are probably old chat messages
            console.log(e)
            return {
                formula: formula,
                expression: this.expression ? this.expression : formula
            }
        }
    }

    /**
     * Out brackets should be included iff the next term is a [flavour] term.  Otherwise they were purely synthetic
     * @param fullFormula The full formula expression
     * @param currentIndex The index we are currently processing (the index of the closing bracket)
     * @param currentWorkingFormula The piece of the formula that is currently being processed for display
     * @return {string} A new currentWorkingFormula which will be bracketed if it's a flavour part, and not otherwise.
     */
    includeOuterBracketsIfFormulaIsFlavoured(fullFormula, currentIndex, currentWorkingFormula) {
        if (currentIndex < fullFormula.length && fullFormula.charAt(currentIndex + 1) === '[') {
            return '(' + currentWorkingFormula + ')'
        }
        return currentWorkingFormula
    }

    /**
     * Deals with an inner string that may contain several variables.
     *
     * This is not an exact science, and after several attempts I concluded there is no way to do this perfectly without replacing huge chunks of code.
     *
     * So what this is going to do is check to see if there are multiple @variables, and if there are, attempt to find them and each of their values using search and replace
     * so if we have an expression of '@str + @bonus', a formula of '3 + 2' and data of { str: 3, bonus: 2} then by finding that @str = 3, we can do
     * formula.replace('3','<span>3</span>') and expression.replace('@str', '<span>@str</span>')
     * There are several edge cases:
     * Firstly that @bonus values may be the same, so will make multiple matches:
     * expression: '@str + @bonus', a formula of '2 + 2' and data of { str: 2, bonus: 2}, both str and bonus will match either value, and matcht he value after a replacement, so could end up with <span id=1><span id=2>2</span>2</span>
     *
     * Secondly that constant terms may match bonuses
     * expression: '@str + 2 + @bonus', a formula of '3 + 2 + 2' and data of { str: 3, bonus: 2}
     * In the current implementation this will become the formula: '<span id=0>3</span> + <span id=1>2</span + 2' with the expression '<span id=0>@str</span> + 2 + <span id=1>@bonus</span>'
     * which is not ideal, re-ordering the terms, but it will not lose accuracy, and sorting ordering requires a much more intensive parser
     *
     * In the instance that this formula encounters an unexpected condition it will terminate and leave with the default highlighting
     *
     * @param formula the formula string
     * @param expression the expression string (aka with @variables)
     * @param mainIndex The main span index id that is is being used in the outer loop
     * @return {expression, formula, changed: boolean} the new expression string, the new formula string and whether any changes were performed
     */
    replaceInnerVariables(formula, expression, mainIndex) {

        // expression may be a number - do not try to call string methods on a number
        // Check that there is at least 1 variable.
        // edge cases checking here:
        // expression = "12 + @bonus" <-- perform a substitution around @bonus
        if ((("" + expression).match(/@/g) || []).length > 0) {
            try {
                const regex = Helper.variableRegex
                let newFormula = ""
                // I need to remove the things I have <span>ed such that they do not trigger later matches - e.g. @wepAttack = (2 + 1) @bonus = 1, the @bonus will match the trailing part of @wepAttack!
                let activeFormula = formula
                let activeExpression = expression
                const vars = expression.match(regex)
                // if the entire expression is just a variable - e.g. "@bonus" then don't bother faffing about here, the top level replacer will solve it
                // edge case check:
                // expression = "@bonus" <-- don't substitute
                if (!(vars.length === 1 && vars[0] === expression)) {
                    for (let innerIndex = 0; innerIndex < vars.length; innerIndex++) {
                        const variable = vars[innerIndex]
                        const spanId = mainIndex + "." + innerIndex
                        if (!this.options.formulaInnerData) {
                            throw `D&D4eBeta | Roll did not have formulaInnerData set in its options, so cannot substitute and will fall back to expression parts level replacement`
                        }
                        let replacementStr = this.options.formulaInnerData[variable.substring(1)]
                        if (!replacementStr) {
                            // may be a complex replacement: e.g. details.level
                            replacementStr = Helper.replaceData(variable, this.options.formulaInnerData)
                            if (!replacementStr) {
                                throw `D&D4eBeta | Unable to find a value for variable '${variable}' that was part of the formula expression.  It was not added to the rolls data object`
                            }
                        }
                        // replace the expression variable with the span and mouseover tags
                        activeExpression = activeExpression.replace(variable, `<span id="exp${spanId}" onmouseenter="mouseEnter('${spanId}')" onmouseleave="mouseLeave('${spanId}')">${variable}</span>`)

                        // find the value
                        const indexOfReplacement = activeFormula.indexOf(replacementStr)
                        if (indexOfReplacement === -1) {
                            // could not find, error out and fall back to default
                            throw `D&D4eBeta | Unable to find the variable value '${replacementStr}' for variable '${variable}' in remaining part '${activeFormula}' of formula ${formula}`
                        }

                        // add in everything prior to the variable
                        newFormula += activeFormula.substring(0, indexOfReplacement)
                        // add in the variable span-et-ised
                        newFormula += `<span id="form${spanId}">${replacementStr}</span>`

                        // remove everything up to the end of the replacement from our working string
                        // if the replacement is just a number javascript makes it a number and refuses to length it so force it back to a string
                        activeFormula = activeFormula.substring(indexOfReplacement + ("" + replacementStr).length)
                    }
                    // get the rest
                    newFormula += activeFormula

                    return {
                        formula: newFormula,
                        expression: activeExpression,
                        changed: true
                    }
                }
            }
            catch (e) {
                // if we encountered an error, log it, but carry on with the more generic fallback
                console.log(e)
            }
        }
        return {
            formula: formula,
            expression: expression,
            changed: false
        }
    }


}
