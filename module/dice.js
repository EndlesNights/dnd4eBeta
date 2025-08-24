import {MultiAttackRoll} from "./roll/multi-attack-roll.js";
import {RollWithOriginalExpression} from "./roll/roll-with-expression.js";
import { Helper } from "./helper.js"

/**
 * A standardized helper function for managing core 4e "d20 rolls"
 *
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus
 *
 * @param {Array} parts            The dice roll component parts, excluding the initial d20
 * @param {Array} partsExpressionReplacements  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
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
export async function d20Roll({parts=[],  partsExpressionReplacements = [], data={}, event={}, rollMode=null, template=null, title=null, speaker=null,
								  flavor=null, fastForward=null, onClose, dialogOptions, critical=20, fumble=1, targetValue=null, actor,
								  isAttackRoll=false, options={}}={}) {
	critical = critical || 20; //ensure that critical always has a value
	const isCharge = options?.variance?.isCharge || false;
	const isOpp = options?.variance?.isOpp || false;
	const userStatus = actor?.statuses || {};
	const rollConfig = {parts, partsExpressionReplacements, data, speaker, rollMode, flavor, critical, fumble, targetValue, isAttackRoll, fastForward, options, isCharge, isOpp, userStatus }
	// handle input arguments
	mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, rollMode, title, speaker, flavor, fastForward)
	// If fast-forward requested, perform the roll without a dialog
	if ( rollConfig.fastForward ) {
		return performD20RollAndCreateMessage(null, rollConfig)
	}

	// Render modal dialog
	var targDataArray = {
		'targNameArray': [],
		'targets': []
	}
	
	if (game.user.targets.size) {
		const numTargets = game.user.targets.size;
		const targetArr = Array.from(game.user.targets);
		targDataArray.hasTarget = true;
		if (game.settings.get("dnd4e","markAutomation")) {
			targDataArray.ignoringMark = userStatus.has('mark_1') && !targetArr.some(t => (t.actor.uuid === data.marker));
		}
		for (let targ = 0; targ < numTargets; targ++) {
			const targName = targetArr[targ].name;
			targDataArray.targNameArray.push(targName);
			//console.debug(data);
			targDataArray.targets.push({
				'name': targetArr[targ].name,
				'status': targetArr[targ].actor.statuses,
				'attackMod': data?.item?.attack?.ability || 'str',
				'attackDef': options.attackedDef || 'ac',
				'immune': targetArr[targ].actor.system.defences[options.attackedDef]?.none || false
			});
		}
	} else {
		targDataArray.targNameArray.push('');
		targDataArray.targets.push({
			'name':'',
			'status':[],
			'attackMod': data?.item?.attack?.ability || 'str',
			'attackDef': data?.item?.attack?.def || 'ac',
			'immune': false
		});
		targDataArray.hasTarget = false;
	}
	if (targDataArray.targets.length === 1) {
		targDataArray.multiTargetCheck = false;
	} else {
		targDataArray.multiTargetCheck = true;
	}
		
	let newFlavor = "";
	template = template || "systems/dnd4e/templates/chat/roll-dialog.html";
	let dialogData = {
		'formula': parts.join(" + "),
		'data': data,
		'rollMode': rollConfig.rollMode,
		'rollModes': CONFIG.Dice.rollModes,
		'config': CONFIG.DND4E,
		'flavor': newFlavor || flavor,
		'isAttackRoll': isAttackRoll,
		'isD20Roll': true,
		'isCharge': isCharge,
		'isOpp': isOpp,
		'userStatus': userStatus,
		'targetData': targDataArray
	};
	const html = await renderTemplate(template, dialogData);

	// Create the Dialog window
	let roll;
	return new Promise(resolve => {
		new Dialog({
			'title': title,
			'content': html,
			'buttons': {
				'normal': {
					'label': game.i18n.localize("DND4E.Roll"),
					'callback': html => roll = performD20RollAndCreateMessage(html[0].querySelector("form"), rollConfig)
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

// Get the bonus for an attack roll 
export function getAttackRollBonus({parts=[], partsExpressionReplacements = [], data={}, options= {}}){
	const roll = new MultiAttackRoll(parts.filterJoin(" + "), data, {});
	if(roll.isDeterministic){
		roll.evaluateSync();
		return roll.total
	}

	return roll.formula;
}

async function performD20RollAndCreateMessage(form, {parts, partsExpressionReplacements, data, speaker, rollMode, flavor, critical, fumble, targetValue, isAttackRoll, options, userStatus, fastForward}) {
	/*
	 coming in the parts[] is in one of the following states:
	 - Empty
	 - containing some @variables (e.g. @ammo)
	 - containing some formula that have already been expanded (1+2+3)
	 */

	// define if we are rolling a d20
	if(!parts.includes("@tool") && !parts.includes("@ritual")) {
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
	manageBonusInParts(parts, form, data)

	let allRollsParts = []
	const numberOfTargets = Math.max(1, game.user.targets.size);
	//console.debug(data);
	let targetDefArray = [], targetAtkModArray = [];
	
	if (isAttackRoll && form !== null) {
		// populate the common attack bonuses into data
		Object.keys(data.commonAttackBonuses).forEach(function(key,index) {
			data[key] = data.commonAttackBonuses[key].value
		});
		const individualAttack = (Object.entries(form)[7][1].value === "true");
		for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++ ) {
			const targetBonuses = []
			for ( let [k, v] of Object.entries(form) ) {
				if(v.checked) {
					let tabIndex = v.name.split(".")[0];
					if((individualAttack && parseInt(tabIndex) === targetIndex) // check if Individual Attack Bonuses
					|| !individualAttack ) { //otherwise just use Unified Attack Bonuses
						let bonusName = v.name.split(".")[1];
						targetBonuses.push(`@${bonusName}`)
					}
				}
				if(!individualAttack && k > 21){
					break;
				}
			}
			if (game.settings.get("dnd4e", "collapseSituationalBonus")) {
				let total = 0;
				targetBonuses.forEach(bonus => total += data.commonAttackBonuses[bonus.substring(1)].value)
				allRollsParts.push(parts.concat([total]))
			}
			else {
				allRollsParts.push(parts.concat(targetBonuses))
			}
		}
		
		//Get per-target defence and ability mod
		let attackDef;
		let attackMod;
		for (let [k, v] of Object.entries(form)){
			if (v.classList.contains('attackDef')) {
				attackDef = (individualAttack || !attackDef) ? v.value : attackDef;
				targetDefArray.push(attackDef);
			}
			if (v.classList.contains('attackMod')) {
				attackMod = (individualAttack || !attackMod) ? v.value : attackMod;
				targetAtkModArray.push(attackMod);
			}
		}
		//console.debug(targetDefArray);
		//console.debug(targetAtkModArray);
	}
	else if (isAttackRoll && fastForward) {
	// Logic to infer common bonuses based on user and target status under fast-forward conditions
		const theTargets = Array.from(game.user.targets);
		
		// populate the common attack bonuses into data
		Object.keys(data.commonAttackBonuses).forEach(function(key,index) {
			data[key] = data.commonAttackBonuses[key].value
		});
				
		const userStatBonuses = [];
		// User conditions
		if(userStatus.has('prone')) userStatBonuses.push('@prone');
		if(userStatus.has('restrained')) userStatBonuses.push('@restrained');
		if(userStatus.has('running')) userStatBonuses.push('@running');
		if(userStatus.has('squeezing')) userStatBonuses.push('@squeez');
		if(userStatus.has('comAdv')) userStatBonuses.push('@comAdv');
		if(options?.variance?.isCharge) userStatBonuses.push('@charge');
		if(game.settings.get("dnd4e","markAutomation") && userStatus.has('mark_1') && !theTargets.some(t => (t.actor.uuid === data.marker))) userStatBonuses.push('@marked');
				
		for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++) {

			targetDefArray.push(data.item.attack.def); targetAtkModArray.push(data.item.attack.ability);
			
			const targetBonuses = userStatBonuses;
			if(theTargets.length > 0){
				const targetStatus = Array.from(theTargets[targetIndex].actor.statuses);
				
				//Target conditions
				if(targetStatus.filter(element => ['blinded','dazed','dominated','helpless','restrained','stunned','surprised','squeezing','running','grantingCA'].includes(element)).length > 0) targetBonuses.push('@comAdv');
				
				if(targetStatus.includes('bloodied')) targetBonuses.push('@bloodied');

				if(targetStatus.includes('concealed')) targetBonuses.push('@conceal');		
				
				if(targetStatus.includes('concealedTotal')) targetBonuses.push('@concealTotal');
				
				if(targetStatus.includes('cover')) targetBonuses.push('@cover');		
				
				if(targetStatus.includes('coverSup')) targetBonuses.push('@coverSup');
					
			}
			if (game.settings.get("dnd4e", "collapseSituationalBonus")) {
				let total = 0;
				targetBonuses.forEach(bonus => total += data.commonAttackBonuses[bonus.substring(1)].value)
				allRollsParts.push(parts.concat([total]));
			}
			else {
				allRollsParts.push(parts.concat(targetBonuses));
			}
		}
		
	}
	else {
		allRollsParts = Array(numberOfTargets).fill(parts);
	}

	// if the form updated the roll flavor
	if (form?.flavor.value) {
		flavor = form.flavor.value || flavor;
	}

	// Optionally include an ability score selection (used for tool checks)
	// TODO: @Draconas : I think this is a 5e holdover and the entire tools section can be safely removed
	// also the form doesn't contain ability.
	// @FoxLee : Can this be repurposed to allow per-use ability mod switching on attacks/skills (eg Deft Blade feat?)
	const ability = form ? form.attackMod : null;
	if ( ability && ability.value ) {
		data.ability = ability.value;
		const abl = data.abilities[data.ability];
		if ( abl ) {
			data.mod = abl.mod;
		}
	}
	//console.debug(`Selected ability is ${ability}`);

	// time to actually do the roll
	let roll = await new MultiAttackRoll(parts.filterJoin(" + "), data, {}); // initial roll data is never going to be used, but makes foundry happy
	const targets = Array.from(game.user.targets);
	const targetData = {
		targNameArray: [],
		targDefValArray: [],
		targDefArray: targetDefArray,
		targAtkModArray: targetAtkModArray,
		targImmArray: [],
		targets: [],
		targetHit: [],
		targetMissed: []
	}
	const critStateArray = []

	for (let rollExpressionIdx = 0; rollExpressionIdx < allRollsParts.length; rollExpressionIdx++) {
		const rollExpression = allRollsParts[rollExpressionIdx];
		let subroll
		try {
			subroll = await roll.addNewRoll(rollExpression, partsExpressionReplacements, data, options);
		}
		catch(err) {
			// let the user know what is going on if the roll doesn't evaluate.
			ui.notifications.error("Error trying to roll: " + rollExpression.join("+") + ":" + err);
			throw err;
		}

		let targImmune = false;

		if (isAttackRoll && targets.length > rollExpressionIdx) {
			const attackedDef = targetData.targDefArray[rollExpressionIdx];
			let targName = targets[rollExpressionIdx].name;
			let targDefVal = targets[rollExpressionIdx].document.actor.system.defences[attackedDef]?.value;
			targImmune = targets[rollExpressionIdx].document.actor.system.defences[attackedDef]?.none;
			targetData.targNameArray.push(targName);
			targetData.targDefValArray.push(targDefVal);
			targetData.targImmArray.push(targImmune);
			targetData.targets.push(targets[rollExpressionIdx]);
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
		if (targImmune){
			critStateArray.push("immune");
		} else if(subroll.terms[0].total >= critical) {
			critStateArray.push("critical");
		} else if (subroll.terms[0].total <= fumble) {
			critStateArray.push("fumble");
		} else {
			critStateArray.push("");
		}
	}
	
	// if there is only 1 roll, it's not a multi roll
	if (!isAttackRoll || game.user.targets.size < 1) {
		roll = roll.rollArray[0];
	}
	else {		
		roll.populateMultirollData(targetData, critStateArray);			
		Hooks.callAll("dnd4e.rollAttack", data.item, targetData, speaker);
	
		if(game.settings.get("dnd4e", "autoApplyEffects")){
			if(targetData.targetHit.length){
				Helper.applyEffectsToTokens(options.powerEffects, targetData.targetHit, "hit", options.parent);
				Helper.applyEffectsToTokens(options.powerEffects, targetData.targetHit, "hitOrMiss", options.parent);
				Helper.applyEffectsToTokens(options.powerEffects, [options.parent], "selfHit", options.parent);
			}
			if(targetData.targetMissed.length){
				Helper.applyEffectsToTokens(options.powerEffects, targetData.targetMissed, "miss", options.parent);
				Helper.applyEffectsToTokens(options.powerEffects, targetData.targetMissed, "hitOrMiss", options.parent);
				Helper.applyEffectsToTokens(options.powerEffects, [options.parent], "selfMiss", options.parent);
			}
		}
	}

	// Move this so that it only gets called when attacks are made, not all d20 rolls?
	if(options.powerEffects && game.settings.get("dnd4e", "autoApplyEffects")) {
		// Always apply these effects after the attack, even if the player forgot to select targets
		Helper.applyEffectsToTokens(options.powerEffects, [options.parent], "selfAfterAttack", options.parent);
	}

	// Convert the roll to a chat message and return the roll
	rollMode = form ? form.rollMode.value : rollMode;

	await roll.toMessage({
		speaker: speaker,
		flavor: flavor,
		flags: options?.flags
	}, { rollMode });
	return roll;
}

/* -------------------------------------------- */

/**
 * A standardized helper function for managing core 4e damage rolls
 *
 * Holding SHIFT, ALT, or CTRL when the attack is rolled will "fast-forward".
 * This chooses the default options of a normal attack with no bonus, Critical, or no bonus respectively
 *
 * @param {Array} parts           The dice roll component parts
 * @param {Array} partsCrit       The dice roll component parts for a criticalhit
 * @param {Array} partsMiss      The dice roll component parts for a miss
 * @param {Array} partsExpressionReplacement  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsCritExpressionReplacement  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsMissExpressionReplacement  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Actor} actor           The Actor making the damage roll
 * @param {Object} data           Actor or item data against which to parse the roll
 * @param {Event|object} event    The triggering event which initiated the roll
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
 * @param {boolean} healingRoll   If the roll is a healing roll rather than a damage roll.
 * @param {Object } options		  The Roll Options
 *
 * @return {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function damageRoll({parts, partsCrit, partsMiss, partsExpressionReplacement  = [], partsCritExpressionReplacement= [], partsMissExpressionReplacement= [], actor,
								data, event={}, rollMode=null, template, title, speaker, flavor, allowCritical=true,
								critical=false, fastForward=null, onClose, dialogOptions, healingRoll, options}) {
									
	// First configure the Roll
	const rollConfig = {parts, partsCrit, partsMiss, data, flavor, rollMode, partsExpressionReplacement, partsCritExpressionReplacement, partsMissExpressionReplacement, speaker, hitType: 'normal', fastForward, options}

	// handle input arguments
	mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, rollMode, title, speaker, flavor, fastForward)

	// crit and miss need a @bonus as well as parts
	rollConfig.partsCrit = partsCrit?.concat(["@bonus"]);
	rollConfig.partsMiss = partsMiss?.concat(["@bonus"]);

	// Modify the roll and handle fast-forwarding
	if ( rollConfig.fastForward ) {
		if (healingRoll) {
			rollConfig.hitType = 'heal'
		}
		return performDamageRollAndCreateChatMessage(null, rollConfig);
	}

	// If they didn't want fast forward, then we need to display the rolls bonus input dialog.

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
	// this roll object will be set if any of the buttons are pressed
	let roll;
	// helper function for running the roll, as all the dialogs do basically the same thing
	const doRoll = (html, hitType) =>  {
		rollConfig.hitType = hitType
		return performDamageRollAndCreateChatMessage(html[0].querySelector("form"), rollConfig)
	}
	// common dialog configuration
	const dialogConfig = {
		title: title,
		content: html,
		buttons: {
		},
		default: "normal"
	}
	// add the buttons
	if (healingRoll) {
		dialogConfig.buttons = {
			normal: {
				label: game.i18n.localize("DND4E.Healing"),
				callback: html => roll = doRoll(html, 'heal')
			}
		}
	}
	else {
		dialogConfig.buttons = {
			critical: {
				condition: allowCritical,
				label: game.i18n.localize("DND4E.CriticalHit"),
				callback: html => roll = doRoll(html, 'crit')
			},
			normal: {
				label: game.i18n.localize(allowCritical ? "DND4E.Normal" : "DND4E.Roll"),
				callback: html => roll = doRoll(html, 'normal')
			}
		}
		if(data.item.miss.formula){
			dialogConfig.buttons.miss = {
				label: game.i18n.localize(allowCritical ? "DND4E.Miss" : "DND4E.Roll"),
				callback:  html => roll = doRoll(html, 'miss')
			}
		}
	}
	// render the dialog
	return new Promise(resolve => {
		dialogConfig.close = html => {
			if (onClose) onClose(html, parts, data);
			resolve(roll !== undefined ? roll : false);
		}

		new Dialog(dialogConfig, dialogOptions).render(true);
	});
}

async function performDamageRollAndCreateChatMessage(form, {parts, partsCrit, partsMiss, data, hitType, flavor, rollMode, partsExpressionReplacement, partsCritExpressionReplacement, partsMissExpressionReplacement, speaker, options, fastForward}) {
	manageBonusInParts(parts, form, data)
	manageBonusInParts(partsCrit, form, data)
	manageBonusInParts(partsMiss, form, data)

	if(data.bonus){ //stopgap fix because bonus damage type is not being recorded properly
		if(parts[parts.length-1] === "@bonus"){
			let index = data.bonus.lastIndexOf('[');
			if(index >=0) {
				parts[parts.length-1] = '(' + data.bonus.slice(0,index) + ')' + data.bonus.slice(index);
			} else {
				parts[parts.length-1] = '(' + data.bonus + ')';
			}
		}
	} else {
		if(!fastForward) parts.pop();
	}
	//console.debug(parts);

	let roll;
	if(hitType === 'immune'){
		options.hitTypeDamage = false;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacement, data, options);
		flavor = `${flavor} (${game.i18n.localize("DND4E.Immune")})`;
	}
	else if(hitType === 'normal'){
		options.hitTypeDamage = true;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacement, data, options);
	}
	else if (hitType === 'crit') {
		options.hitTypeDamage = true;
		roll = RollWithOriginalExpression.createRoll(partsCrit, partsCritExpressionReplacement, data, options)
		flavor = `${flavor} (${game.i18n.localize("DND4E.Critical")})`;
	}
	else if (hitType === 'miss') {
		options.hitTypeDamage = true;
		roll = RollWithOriginalExpression.createRoll(partsMiss, partsMissExpressionReplacement, data, options);
		flavor = `${flavor} (${game.i18n.localize("DND4E.Miss")})`;
	}
	else if (hitType === 'heal') {
		options.hitTypeHealing = true;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacement, data, options);
		flavor = `${flavor} (${game.i18n.localize("DND4E.Healing")})`;
	} else {
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacement, data, options)
	}

	if (form?.flavor.value) {
		flavor = form.flavor.value || flavor;
	}
	// Convert the roll to a chat message
	rollMode = form ? form.rollMode.value : rollMode;
	roll.toMessage({
		speaker,
		flavor
	}, { rollMode });
	return roll;
}


// General helper functions for both attack and damage rolls

function mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, rollMode, title, speaker, flavor, fastForward) {
	// Handle input arguments
	rollConfig.flavor = flavor || title;
	rollConfig.speaker = speaker || ChatMessage.getSpeaker();
	rollConfig.parts = parts.concat(["@bonus"]);
	rollConfig.rollMode = rollMode || game.settings.get("core", "rollMode");

	// Determine whether the roll can be fast-forward, make explicit comparison here as it might be set as false, so no falsey checks
	if ( fastForward === null || fastForward === undefined) {
		// rollConfig.fastForward = Helper.isUsingFastForwardKey(event);
		rollConfig.fastForward = Helper.isRollFastForwarded(event);
		if(rollConfig.options?.fastForward){
			rollConfig.fastForward = rollConfig.options.fastForward;
		}
	}
	return rollConfig
}

/**
 * sort out @bonus which was shoved onto the end of the expression to represent floating situational bonuses
 * either the user specified one, or we want to get rid of it.  Also prettifiy if they made their bonus +1d6 - strip out the leading +
 * @param parts The parts of the formula we were given, will have @bonus as the last element
 * @param form The user input form (may be null)
 * @param data The roll data
 */
function manageBonusInParts(parts, form, data) {
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
	else {
		if (parts && parts.length > 0) {
			if (parts[parts.length - 1] === "@bonus") {
				parts.pop()
			}
		}
	}
}
