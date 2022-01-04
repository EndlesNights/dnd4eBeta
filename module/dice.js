export class RollWithOriginalExpression extends Roll {
	constructor (formula, data={}, options={}) {
		super(formula, data, foundry.utils.mergeObject({expression : formula}, options));
		this.expression = options.expression ? options.expression : formula
	}

	/**
	 * Custom chat template to handle multiroll attacks
	 */
	static CHAT_TEMPLATE = "systems/dnd4e/templates/chat/roll-template-single.html";

	/**
	 * This is a copy of super.render with one change: the chatData has roll.expression added.
	 *
	 * @param chatOptions
	 * @return {Promise<string|*>}
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
		if ( !this._evaluated ) await this.evaluate({async: true});

		// Define chat data
		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : chatOptions.flavor,
			user: chatOptions.user,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			expression: this.expression
		};

		// Render the roll display template
		return renderTemplate(chatOptions.template, chatData);
	}

}

/**
 * An extension of the default Foundry Roll class for handling multiattack rolls and displaying them in a single chat message
 */
export class MultiAttackRoll extends Roll {
	constructor (formula, data={}, options={}) {
		super(formula, data, options);
		this.rollArray = [];
		this._multirollData = [];
		this.tooltipArray = [];
		this.totalArray = [];
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
	addNewRoll(formula, data={}, options={}) {
		let r = new RollWithOriginalExpression(formula, data, options).roll({async : false});
		this.rollArray.push(r);
		return r
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

			this._multirollData.push({
				formula : r._formula,
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


/**
 * A standardized helper function for managing core 4e "d20 rolls"
 *
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus
 *
 * @param {Array} parts            The dice roll component parts, excluding the initial d20
 * @param {Array} expressionParts  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Object} data            Actor or item data against which to parse the roll
 * @param {Event|object} event     The triggering event which initiated the roll
 * @param {string} rollMode        A specific roll mode to apply as the default for the resulting roll
 * @param {string|null} template   The HTML template used to render the roll dialog
 * @param {string|null} title      The dice roll UI window title
 * @param {Object} speaker         The ChatMessage speaker to pass when creating the chat
 * @param {string|null} flavor     Flavor text to use in the posted chat message
 * @param {Boolean} fastForward    Allow fast-forward advantage selection
 * @param {Function} onClose       Callback for actions to take when the dialog form is closed
 * @param {Object} dialogOptions   Modal dialog options
 * @param {number} critical        The value of d20 result which represents a critical success
 * @param {number} fumble          The value of d20 result which represents a critical failure
 * @param {number} targetValue     Assign a target value against which the result of this roll should be compared
 * @param {boolean} isAttackRoll   Is the roll for an attack?
 * @param {Object} options         {Roll} Options
 *
 * @return {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function d20Roll({parts=[],  expressionParts= [], data={}, event={}, rollMode=null, template=null, title=null, speaker=null,
								flavor=null, fastForward=null, onClose, dialogOptions, critical=20, fumble=1, targetValue=null,
								isAttackRoll=false, options=null,}={}) {

	// Handle input arguments
	flavor = flavor || title;
	speaker = speaker || ChatMessage.getSpeaker();
	parts = parts.concat(["@bonus"]);
	rollMode = rollMode || game.settings.get("core", "rollMode");
	const rollConfig = {parts, expressionParts, data, speaker, rollMode, flavor, critical, fumble, targetValue, isAttackRoll, options }

	// Determine whether the roll can be fast-forward
	if ( fastForward === null ) {
		fastForward = event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
	}

	// If fast-forward requested, perform the roll without a dialog
	if ( fastForward ) {
		return performRoll(null, rollConfig)
	}

	// Render modal dialog
	var targDataArray = {
		targNameArray: []
	}
	if (game.user.targets.size) {
		const numTargets = game.user.targets.size;
		const targetArr = Array.from(game.user.targets);
		targDataArray.hasTarget = true;
		for (let targ = 0; targ < numTargets; targ++) {
			let targName = targetArr[targ].data.name;
			targDataArray.targNameArray.push(targName);
		}
	} else {
		targDataArray.targNameArray.push('');
		targDataArray.hasTarget = false;
	}
	if (targDataArray.targNameArray.length === 1) {
		targDataArray.multiTargetCheck = false;
	} else {
		targDataArray.multiTargetCheck = true;
	}
	let newFlavor = "";
	template = template || "systems/dnd4e/templates/chat/roll-dialog.html";
	let dialogData = {
		formula: parts.join(" + "),
		data: data,
		rollMode: rollMode,
		rollModes: CONFIG.Dice.rollModes,
		config: CONFIG.DND4EBETA,
		flavor: newFlavor || flavor,
		isAttackRoll: isAttackRoll,
		isD20Roll: true,
		targetData: targDataArray
	};
	const html = await renderTemplate(template, dialogData);

	// Create the Dialog window
	let roll;
	return new Promise(resolve => {
		new Dialog({
			title: title,
			content: html,
			buttons: {
				normal: {
					label: game.i18n.localize("DND4EBETA.Roll"),
					callback: html => roll = performRoll(html[0].querySelector("form"), rollConfig)
				}
			},
			default: "normal",
			close: html => {
				if (onClose) onClose(html, parts, data);
				resolve(roll !== undefined ? roll : false) // check roll here as that was assigned on the active thread, not an async function
			}
		}, dialogOptions).render(true);
	})
}

async function performRoll(form, {parts, expressionParts, data, speaker, rollMode, flavor, critical, fumble, targetValue, isAttackRoll, options}) {
	/*
	 coming in the parts[] is in one of the following states:
	 - Empty
	 - containing some @variables (e.g. @ammo)
	 - containing some formula that have already been poked (1+2+3)
	 */


	// define if we are rolling a d20
	if(!parts.includes("@tool")) {
		// noinspection EqualityComparisonWithCoercionJS
		if(!form || !form.d20?.value || form.d20?.value == 1) { // type coercion is expected here!  It's a string value
			parts.unshift( `1d20`);
		} else if(form.d20?.value>0){
			parts.unshift( `${form.d20.value}d20kh`);
		} else if(form.d20.value<0) {
			parts.unshift(`${Math.abs(form.d20.value)}d20kl`);
		}
	}

	// sort out @bonus which was shoved onto the end of the expression to represent floating situational bonuses
	// either the user specified one, or we want to get rid of it.  Also prettifiy if they made their bonus +1d6 - strip out the leading +
	if ( form !== null ) {
		if (form.bonus.value) {
			// remove double +
			let trimmed = form.bonus.value.trim()
			if (trimmed.startsWith("+")) {
				trimmed = trimmed.substring(1)
			}
			data['bonus'] = trimmed
		}
		else {
			data['bonus'] = 0
		}
	}
	else{
		parts.pop()
	}

	let allRollsParts = []
	if (isAttackRoll && form !== null) {
		// populate the common attack bonuses into data
		Object.keys(CONFIG.DND4EBETA.commonAttackBonuses).forEach(function(key,index) {
			data[key] = CONFIG.DND4EBETA.commonAttackBonuses[key].value
		});

		const numberOfTargets = Math.max(1, game.user.targets.size)
		for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++ ) {
			const targetBonuses = []
			for ( let [k, v] of Object.entries(form) ) {
				if(v.checked) {
					let tabIndex = v.name.split(".")[0];
					if (parseInt(tabIndex) === targetIndex) {
						let bonusName = v.name.split(".")[1];
						targetBonuses.push(`@${bonusName}`)
					}
				}
			}
			allRollsParts.push(parts.concat(targetBonuses))
		}
	}
	else {
		allRollsParts.push(parts)
	}

	// if the form updated the roll flavor
	if (form?.flavor.value) {
		flavor = form.flavor.value || flavor;
	}

	// Optionally include an ability score selection (used for tool checks)
	// TODO: @Draconas : I think this is a 5e holdover and the entire tools section can be safely removed
	// also the form doesn't contain ability.
	const ability = form ? form.ability : null;
	if ( ability && ability.value ) {
		data.ability = ability.value;
		const abl = data.abilities[data.ability];
		if ( abl ) {
			data.mod = abl.mod;
			flavor += ` (${CONFIG.DND4EBETA.abilities[data.ability]})`;
		}
	}

	// time to actually do the roll
	let roll = new MultiAttackRoll(parts.join(" + "), data); // initial roll data is never going to be used, but makes foundry happy
	const targets = Array.from(game.user.targets);
	const targetData = {
		targNameArray: [],
		targDefValArray: []
	}
	const critStateArray = []

	for (let rollExpressionIdx = 0; rollExpressionIdx < allRollsParts.length; rollExpressionIdx++) {
		const rollExpression = allRollsParts[rollExpressionIdx]
		let subroll
		try {
			subroll = roll.addNewRoll(rollExpression.join("+"), data, {expression: createExpression(rollExpression, expressionParts)});
		}
		catch(err) {
			// let the user know what is going on if the roll doesn't evaluate.
			ui.notifications.error("Error trying to roll: " + rollExpression.join("+") + ":" + err)
			throw err
		}
		if (isAttackRoll && targets.length > rollExpressionIdx) {
			let targName = targets[rollExpressionIdx].data.name;
			let targDefVal = targets[rollExpressionIdx].document._actor.data.data.defences[options.attackedDef].value;
			targetData.targNameArray.push(targName);
			targetData.targDefValArray.push(targDefVal);
		}
		for (let dice of subroll.dice) {
			if (dice.faces === 20) {
				dice.options.critical = critical;
				dice.options.fumble = fumble;
				if (targetValue) dice.options.target = targetValue;
			}
		}
		// Unable to figure out how to use the `chat.highlightCriticalSuccessFailure` function to individually flag rolls in the list of outputs when multiroll
		// is used instead of a single Roll. Instead, this hacky way seems to work rather well. It has not failed me yet.
		if (subroll.dice.some(obj => obj.results.some(obj => obj.result >= critical)) && !subroll.dice.some(obj => obj.results.some(obj => obj.result <= fumble))) {
			critStateArray.push(" critical");
		} else if (!subroll.dice.some(obj => obj.results.some(obj => obj.result >= critical)) && subroll.dice.some(obj => obj.results.some(obj => obj.result <= fumble))) {
			critStateArray.push(" fumble");
		} else {
			critStateArray.push("");
		}
	}
	// if there is only 1 roll, it's not a multi roll
	if (!isAttackRoll || roll.rollArray.length <= 1) {
		roll = roll.rollArray[0]
	}
	else {
		roll.populateMultirollData(targetData, critStateArray);
	}

	// Convert the roll to a chat message and return the roll
	rollMode = form ? form.rollMode.value : rollMode;

	roll.toMessage({
		speaker: speaker,
		flavor: flavor,
	}, { rollMode });
	return roll;
}

function createExpression(parts, expressionParts) {
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

	return result.join("+")
}


/* -------------------------------------------- */

/**
 * A standardized helper function for managing core 4e "d20 rolls"
 *
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Critical, or no bonus respectively
 *
 * @param {Array} parts           The dice roll component parts
 * @param {Array} partsCrit       The dice roll component parts for a criticalhit
 * @param {Array} partsMiss 	  The dice roll component parts for a miss
 * @param {Array} partsExpression  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsCritExpression  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsMissExpression  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Actor} actor           The Actor making the damage roll
 * @param {Object} data           Actor or item data against which to parse the roll
 * @param {Event|object}[event    The triggering event which initiated the roll
 * @param {string} rollMode       A specific roll mode to apply as the default for the resulting roll
 * @param {String} template       The HTML template used to render the roll dialog
 * @param {String} title          The dice roll UI window title
 * @param {Object} speaker        The ChatMessage speaker to pass when creating the chat
 * @param {string} flavor         Flavor text to use in the posted chat message
 * @param {boolean} allowCritical Allow the opportunity for a critical hit to be rolled
 * @param {Boolean} critical      Flag this roll as a critical hit for the purposes of fast-forward rolls
 * @param {Boolean} fastForward   Allow fast-forward advantage selection
 * @param {Function} onClose      Callback for actions to take when the dialog form is closed
 * @param {Object} dialogOptions  Modal dialog options
 *
 * @return {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function damageRoll({parts, partsCrit, partsMiss, partsExpression= [], partsCritExpression= [], partsMissExpression= [], actor, data, event={},
									 rollMode=null, template, title, speaker, flavor,
	allowCritical=true, critical=false, fastForward=null, onClose, dialogOptions, healingRoll}) {
	// Handle input arguments
	flavor = flavor || title;
	speaker = speaker || ChatMessage.getSpeaker();
	rollMode = game.settings.get("core", "rollMode");
	let formula = '';
	// Define inner roll function
	const _roll = function(parts, partsCrit, partsMiss, hitType, form) {
		if(form){data['bonus'] = form.bonus.value || 0;}
		
		let roll;
		
		if(hitType === 'normal'){
			roll = new RollWithOriginalExpression(parts.filterJoin("+"), data, {expression: createExpression(parts, partsExpression)});
		}
		else if (hitType === 'crit') {
			roll = new RollWithOriginalExpression(partsCrit.filterJoin("+"), data, {expression: createExpression(partsCrit, partsCritExpression)})
			flavor = `${flavor} (${game.i18n.localize("DND4EBETA.Critical")})`;
		}
		else if (hitType === 'miss') {
			roll = new RollWithOriginalExpression(partsMiss.filterJoin("+"), data, {expression: createExpression(partsMiss, partsMissExpression)});
			flavor = `${flavor} (${game.i18n.localize("DND4EBETA.Miss")})`;
		}
		else if (hitType === 'heal') {
			roll = new RollWithOriginalExpression(parts.filterJoin("+"), data, {expression: createExpression(parts, partsExpression)});
			flavor = `${flavor} (${game.i18n.localize("DND4EBETA.Healing")})`;
		} else {
			roll = new RollWithOriginalExpression(parts.filterJoin("+"), data, {expression: createExpression(parts, partsExpression)});
		}

		critical = (hitType === 'crit');

		if(form?.flavor.value){
			flavor = form.flavor.value || flavor;
		}

		// Convert the roll to a chat message
		rollMode = form ? form.rollMode.value : rollMode;
		roll.toMessage({
			speaker: speaker,
			flavor: flavor
		}, { rollMode });
		return roll;
	};

	// Determine whether the roll can be fast-forward
	if ( fastForward === null ) {
		fastForward = event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
	}

	// Modify the roll and handle fast-forwarding
	if ( fastForward ) {
		// console.log(critical || event.altKey);
		// return _roll(parts, partsCrit, critical || event.altKey);
		return _roll(parts, partsCrit, critical || event.altKey);
		// return _roll(parts, partsCrit, true, html[0].querySelector("form"))
	}
	// else parts = critical ? partsCrit.concat(["@bonus"]) : parts.concat(["@bonus"]);
	parts = parts.concat(["@bonus"]);
	partsCrit = partsCrit?.concat(["@bonus"]);
	partsMiss = partsMiss?.concat(["@bonus"]);

	formula = parts.join(" + ");
	// Render modal dialog
	template = template || "systems/dnd4e/templates/chat/roll-dialog.html";
	let dialogData = {
		formula: "@damage + @bonus",
		data: data,
		rollMode: rollMode,
		rollModes: CONFIG.Dice.rollModes
	};
	const html = await renderTemplate(template, dialogData);

	// Create the Dialog window
	let roll;

	if(healingRoll){
		return new Promise(resolve =>{
			new Dialog({
				title: title,
				content: html,
				buttons: {
					normal: {
						label: game.i18n.localize("DND4EBETA.Healing"),
						callback: html => roll = _roll(parts, partsCrit, partsMiss, 'heal', html[0].querySelector("form"))
					}
				},
				default: "normal",
				close: html => {
					if (onClose) onClose(html, parts, data);
					resolve(roll !== undefined ? roll : false);
				}				
			}, dialogOptions).render(true);
		});
	} else {
		return new Promise(resolve => {

			const buttons = {
				critical: {
					condition: allowCritical,
					label: game.i18n.localize("DND4EBETA.CriticalHit"),
					callback: html => roll = _roll(parts, partsCrit, partsMiss, 'crit', html[0].querySelector("form"))
				},
				normal: {
					label: game.i18n.localize(allowCritical ? "DND4EBETA.Normal" : "DND4EBETA.Roll"),
					callback: html => roll = _roll(parts, partsCrit, partsMiss, 'normal', html[0].querySelector("form"))
				}
			}

			if(data.item.miss.formula){
				buttons.miss = {
					label: game.i18n.localize(allowCritical ? "DND4EBETA.Miss" : "DND4EBETA.Roll"),
					callback: html => roll = _roll(parts, partsCrit, partsMiss, 'miss', html[0].querySelector("form"))
				}
			}

			new Dialog({
				title: title,
				content: html,
				buttons: buttons,
				default: "normal",
				close: html => {
					if (onClose) onClose(html, parts, data);
					resolve(roll !== undefined ? roll : false);
				}
			}, dialogOptions).render(true);
		});
	}

}
