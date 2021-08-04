/**
 * An extension of the default Foundry Roll class for playing around with
 */
export class CustomRoll extends Roll{
	constructor (formula, data={}, options={}) {
		super(formula, data, options);
		this.rollArray = [];
		this._multirollData = [];
		this.tooltipArray = [];
		this.totalArray = [];
	}

	static CHAT_TEMPLATE = "systems/dnd4eBeta/templates/custom_roll_eval_template.html";

	get multirollData() {
		return this._multirollData;
	}

	addNewRoll(formula, data={}, options={}, targName='') {
		let r = new Roll(formula, data, options).roll();	
		this.rollArray.push(r);		
	}

	populateMultirollData(targNameArray) {
		for (let [i, r] of this.rollArray.entries()){
			let parts = r.dice.map(d => d.getTooltipData());
			let targName = targNameArray[i];
			this._multirollData.push({
				formula : r._formula,
				total : r._total,
				parts : parts,
				tooltip : '',
				target : targName
			});
		};
	}

	/**
	* Transform a Roll instance into a ChatMessage, displaying the roll result.
	* This function can either create the ChatMessage directly, or return the data object that will be used to create.
	*
	* @param {object} messageData          The data object to use when creating the message
	* @param {options} [options]           Additional options which modify the created message.
	* @param {string} [options.rollMode]   The template roll mode to use for the message from CONFIG.Dice.rollModes
	* @param {boolean} [options.create=true]   Whether to automatically create the chat message, or only return the
	*                                          prepared chatData object.
	* @return {Promise<ChatMessage>}       A promise which resolves to the created ChatMessage entity, if create is true
	*                                      or the Object of prepared chatData otherwise.
	*/
	async toMessage(messageData={}, {rollMode, create=true}={}) {

		// Perform the roll, if it has not yet been rolled
		if (!this._evaluated) await this.evaluate({async: true});
	
		// Prepare chat data
		messageData = foundry.utils.mergeObject({
		  user: game.user.id,
		  type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		  content: this.total,
		  sound: CONFIG.sounds.dice,
		}, messageData);
		messageData.roll = this;
	
		// Either create the message or just return the chat data
		const cls = getDocumentClass("ChatMessage");
		const msg = new cls(messageData);
		if ( rollMode ) msg.applyRollMode(rollMode);
	
		// Either create or return the data
		if ( create ) return cls.create(msg.data);
		else return msg.data;
	}

	/**
   	* Render a Roll instance to HTML
   	* @param {object} [chatOptions]      An object configuring the behavior of the resulting chat message.
   	* @return {Promise<string>}          The rendered HTML template as a string
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
		if (!this._evaluated) this.evaluate();

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

	toJSON() {
		return {
		  class: this.constructor.name,
		  options: this.options,
		  dice: this._dice,
		  formula: this._formula,
		  multirollData: this._multirollData,
		  terms: this.terms,
		  total: this._total,
		  evaluated: this._evaluated
		}
	}
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
 * This chooses the default options of a normal attack with no bonus, Advantage, or Disadvantage respectively
 *
 * @param {Array} parts            The dice roll component parts, excluding the initial d20
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
 * @param {boolean} advantage      Apply advantage to the roll (unless otherwise specified)
 * @param {boolean} disadvantage   Apply disadvantage to the roll (unless otherwise specified)
 * @param {number} critical        The value of d20 result which represents a critical success
 * @param {number} fumble          The value of d20 result which represents a critical failure
 * @param {number} targetValue     Assign a target value against which the result of this roll should be compared
 * @param {boolean} elvenAccuracy  Allow Elven Accuracy to modify this roll?
 * @param {boolean} halflingLucky  Allow Halfling Luck to modify this roll?
 * @param {boolean} reliableTalent Allow Reliable Talent to modify this roll?
 *
 * @return {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function d20Roll({parts=[], data={}, event={}, rollMode=null, template=null, title=null, speaker=null,
	flavor=null, fastForward=null, onClose, dialogOptions,
	advantage=null, disadvantage=null, critical=20, fumble=1, targetValue=null,
	elvenAccuracy=false, halflingLucky=false, reliableTalent=false, isAttackRoll=false, isFinal=true}={}) {

//	console.log(isFinal)
	// Handle input arguments
	flavor = flavor || title;
	speaker = speaker || ChatMessage.getSpeaker();
	parts = parts.concat(["@bonus"]);
	rollMode = rollMode || game.settings.get("core", "rollMode");
	let rolled = false;
	// Define inner roll function
	const _roll = function(parts, adv, form=null) {

		// Determine the d20 roll and modifiers
		// if(!parts.includes("@power") && !parts.includes("@tool")) parts.unshift(`1d20`);
		if(!parts.includes("@tool")) {
			if(!form) {
				parts.unshift(`1d20`);
			} else if(!form.d20?.value && form.d20?.value !== 0) {
				parts.unshift(`${form.d20.value}d20`);
			} else if(form.d20?.value>0){
				parts.unshift(`${form.d20.value}d20kh`);
			} else if(form.d20.value<0) {
				parts.unshift(`${Math.abs(form.d20.value)}d20kl`);
			}
		}


		// if(form.d20.value) {
		// 	console.log(form.d20.value)
		// 	data['d20'] = `${form.d20.value}d20`
		// }

		// Optionally include a situational bonus
		if ( form !== null ) data['bonus'] = form.bonus.value;
		if(isAttackRoll) {
			for ( let [k, v] of Object.entries(form) ) {	
				if(v.checked) {
					data['bonus'] += `${form.bonus.value? "+":""} ${CONFIG.DND4EBETA.commonAttackBonuses[v.name].value}`;
				}
			}
		}
		if ( !data["bonus"] ) parts.pop();

		// data.commonAttackBonuses = CONFIG.DND4EBETA.commonAttackBonuses;
		// console.log(data)
		if(form?.flavor.value){
			flavor = form.flavor.value || flavor;
		}	
		// Optionally include an ability score selection (used for tool checks)
		const ability = form ? form.ability : null;
		if ( ability && ability.value ) {
			data.ability = ability.value;
			const abl = data.abilities[data.ability];
			if ( abl ) {
				data.mod = abl.mod;
				flavor += ` (${CONFIG.DND4EBETA.abilities[data.ability]})`;
			}
		}

		// Execute the roll and flag critical thresholds on the d20
		let roll;
		if (game.user.targets.size){
			const numTargets = game.user.targets.size;
			roll = new CustomRoll(parts.join(" + "), data);

			const targetArr = Array.from(game.user.targets);
			var targNameArray = []
			for (let targ = 0; targ < numTargets; targ++) {
				let targName = targetArr[targ].data.name;
				targNameArray.push(targName);
				roll.addNewRoll(parts.join(" + "), data);
			}

			if (roll.rollArray.length === numTargets && roll.rollArray.every(obj => obj._evaluated)) {
				roll._evaluated = true;
			}
			
			// Flag d20 options for any 20-sided dice in the roll
			for ( let subroll of roll.rollArray ) {
				for ( let d of subroll.dice ) {
					if (d.faces === 20 ) {
						d.options.critical = critical;
						d.options.fumble = fumble;
						if ( targetValue ) d.options.target = targetValue;
					}
				}
			}

			roll.populateMultirollData(targNameArray);

			// If reliable talent was applied, add it to the flavor text
			let reliableFlavor = false;
			for ( let subroll of roll.rollArray ) {
				if ( reliableTalent && subroll.dice[0].total < 10 ) {
					reliableFlavor = true;
				}
			}
			if (reliableFlavor) {flavor += ` (${game.i18n.localize("DND4EBETA.FlagsReliableTalent")})`};
		
		} else {
			roll = new Roll(parts.join(" + "), data).roll();

			// Flag d20 options for any 20-sided dice in the roll
			for ( let d of roll.dice ) {
				if (d.faces === 20 ) {
					d.options.critical = critical;
					d.options.fumble = fumble;
					if ( targetValue ) d.options.target = targetValue;
				}
			}

			// If reliable talent was applied, add it to the flavor text
			if ( reliableTalent && roll.dice[0].total < 10 ) {
				flavor += ` (${game.i18n.localize("DND4EBETA.FlagsReliableTalent")})`;
			}
		}

		// Convert the roll to a chat message and return the roll
		rollMode = form ? form.rollMode.value : rollMode;

		roll.toMessage({
			speaker: speaker,
			flavor: flavor
		}, { rollMode });
		rolled = true;
		return roll;
	};

	// Determine whether the roll can be fast-forward
	if ( fastForward === null ) {
		fastForward = event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
	}

	// Optionally allow fast-forwarding to specify advantage or disadvantage
	if ( fastForward ) {
		if ( advantage || event.altKey ) return _roll(parts, 1);
		else if ( disadvantage || event.ctrlKey || event.metaKey ) return _roll(parts, -1);
		else return _roll(parts, 0);
	}

	// Render modal dialog
	let newFlavor = "";
	template = template || "systems/dnd4eBeta/templates/chat/roll-dialog.html";
	let dialogData = {
		formula: parts.join(" + "),
		data: data,
		rollMode: rollMode,
		rollModes: CONFIG.Dice.rollModes,
		config: CONFIG.DND4EBETA,
		flavor: newFlavor || flavor,
		isAttackRoll: isAttackRoll,
		isD20Roll: true
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
					callback: html => roll = _roll(parts, 0, html[0].querySelector("form"))
				}

			},
			default: "normal",
			close: html => {
				if (onClose) onClose(html, parts, data);
				resolve(rolled ? roll : false)
			}
		}, dialogOptions).render(true);
	})
}

/* -------------------------------------------- */

/**
 * A standardized helper function for managing core 5e "d20 rolls"
 *
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Critical, or no bonus respectively
 *
 * @param {Array} parts           The dice roll component parts, excluding the initial d20
 * @param {Array} partsCrit       The dice roll component parts for a criticalhit
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
export async function damageRoll({parts, partsCrit, actor, data, event={}, rollMode=null, template, title, speaker, flavor,
	allowCritical=true, critical=false, fastForward=null, onClose, dialogOptions, healingRoll}) {
	// Handle input arguments
	flavor = flavor || title;
	speaker = speaker || ChatMessage.getSpeaker();
	rollMode = game.settings.get("core", "rollMode");
	let rolled = false;
	// Define inner roll function
	const _roll = function(parts, partsCrit, crit, form) {
		data['bonus'] = form.bonus.value || 0;
		let roll = crit ? new Roll(partsCrit.filterJoin("+"), data) : new Roll(parts.filterJoin("+"), data);

		critical = crit;

		if(form.flavor.value){
			flavor = form.flavor.value || flavor;
		}

		// Modify the damage formula for critical hits
		if ( crit === true ) {
			// let add = (actor && actor.getFlag("dnd4eBeta", "savageAttacks")) ? 1 : 0;
			// let mult = 2;
			// roll.alter(add, mult);
			flavor = `${flavor} (${game.i18n.localize("DND4EBETA.Critical")})`;
		}
		// Convert the roll to a chat message
		rollMode = form ? form.rollMode.value : rollMode;
		roll.toMessage({
			speaker: speaker,
			flavor: flavor
		}, { rollMode });
		rolled = true;
		return roll;
	};

	// Determine whether the roll can be fast-forward
	if ( fastForward === null ) {
		fastForward = event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
	}

	// Modify the roll and handle fast-forwarding
	if ( fastForward ) return _roll(parts, partsCrit, critical || event.altKey);
	// else parts = critical ? partsCrit.concat(["@bonus"]) : parts.concat(["@bonus"]);
	parts = parts.concat(["@bonus"]);
	partsCrit = partsCrit?.concat(["@bonus"]);

	// Render modal dialog
	template = template || "systems/dnd4eBeta/templates/chat/roll-dialog.html";
	let dialogData = {
		formula: critical ? partsCrit.join(" + ") : parts.join(" + "),
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
						callback: html => roll = _roll(parts, partsCrit, false, html[0].querySelector("form"))
					}
				},
				default: "normal",
				close: html => {
					if (onClose) onClose(html, parts, data);
					resolve(rolled ? roll : false);
				}				
			}, dialogOptions).render(true);
		});
	} else {
		return new Promise(resolve => {
			new Dialog({
				title: title,
				content: html,
				buttons: {
					critical: {
						condition: allowCritical,
						label: game.i18n.localize("DND4EBETA.CriticalHit"),
						callback: html => roll = _roll(parts, partsCrit, true, html[0].querySelector("form"))
					},
					normal: {
						label: game.i18n.localize(allowCritical ? "DND4EBETA.Normal" : "DND4EBETA.Roll"),
						callback: html => roll = _roll(parts, partsCrit, false, html[0].querySelector("form"))
					},
				},
				default: "normal",
				close: html => {
					if (onClose) onClose(html, parts, data);
					resolve(rolled ? roll : false);
				}
			}, dialogOptions).render(true);
		});
	}

}
