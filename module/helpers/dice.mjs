import * as utils from "../utils/utils.mjs";
import MultiAttackRoll from "../rolls/multi-attack-roll.mjs";
import Roll4e from "../rolls/roll.mjs";
import { RollDialog } from "../applications/apps/dice/_module.mjs";
import RollWithOriginalExpression from "../rolls/roll-with-expression.mjs";
import Item4e from "../documents/item.mjs";
import Actor4e from "../documents/actor.mjs";

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
 * @param {string} messageMode     A specific message mode to apply as the default for the resulting roll
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
 * @returns {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function d20Roll({ parts = [], partsExpressionReplacements = [], item = null, weaponUse = null, data = {}, event = {}, messageMode = null, template = null, title = null, speaker = null,
	flavor = null, fastForward = null, onClose, dialogOptions, critical = 20, fumble = 1, targetValue = null, actor,
	isAttackRoll = false, options = {} } = {}) {
	critical = critical || 20; //ensure that critical always has a value
	const isCharge = options?.variance?.isCharge || false;
	const isOpp = options?.variance?.isOpp || false;
	const userStatus = actor?.statuses || {};
	const rollConfig = { parts, partsExpressionReplacements, item, weaponUse, data, speaker, messageMode, flavor, critical, fumble, targetValue, actor, isAttackRoll, fastForward, options, isCharge, isOpp, userStatus };
	// handle input arguments
	mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, messageMode, title, speaker, flavor, fastForward);
	// If fast-forward requested, perform the roll without a dialog
	if (rollConfig.fastForward) {
		return performD20RollAndCreateMessage(null, rollConfig);
	}

	// Render modal dialog
	var targDataArray = {
		targNameArray: [],
		targets: [],
	};
	
	if (actor && game.user.targets.size) {
		const userBonuses = Object.keys(CONFIG.DND4E.commonAttackBonuses).reduce((bonuses, bonus) => {
			bonuses[bonus] = {
				shouldApply: false,
				value: actor.system.commonAttackBonuses[bonus].value,
			};
			return bonuses;
		}, {});
		const numTargets = game.user.targets.size;
		const targetArr = Array.from(game.user.targets);
		targDataArray.hasTarget = true;
		if (game.settings.get("dnd4e", "markAutomation") && actor.system?.marker) {
			targDataArray.ignoringMark = !targetArr.some(t => (t.actor.uuid === data.marker));
			userBonuses.ignoringMark.shouldApply = true;
		}
		// User conditions
		if (userStatus.has("prone")) userBonuses.prone.shouldApply = true;
		if (userStatus.has("restrained")) userBonuses.restrained.shouldApply = true;
		if (userStatus.has("running")) userBonuses.running.shouldApply = true;
		if (userStatus.has("squeezing")) userBonuses.squeez.shouldApply = true;
		if (userStatus.has("comAdv")) userBonuses.comAdv.shouldApply = true;
		if (isCharge) userBonuses.charge.shouldApply = true;
		for (let targ = 0; targ < numTargets; targ++) {
			const targetBonuses = foundry.utils.deepClone(userBonuses);
			const targName = targetArr[targ].name;
			targDataArray.targNameArray.push(targName);
			const targetStatus = Array.from(targetArr[targ].actor.statuses);
				
			//Target conditions
			if (targetStatus.filter(element => ["blinded", "dazed", "dominated", "helpless", "restrained", "stunned", "surprised", "squeezing", "running", "grantingCA"].includes(element)).length) targetBonuses.comAdv.shouldApply = true;
			const targetDist = utils.computeDistance(actor, targetArr[targ]);
			//console.debug(data);
			if (targetArr[targ].actor.statuses.has("prone") && (["melee", "touch", "reach"].includes(item?.system.rangeType) || ((item?.system.rangeType === "weapon") && (weaponUse?.system.weaponType.slice(-1) === "M")))) {
				let meleeVsProne = true;
				if (item?.system.rangeType === "weapon") {
					if (weaponUse?.system.properties.thv || weaponUse?.system.properties.tlg) {
						const meleeRange = weaponUse.system.properties.rch ? 2 : 1;
						if (targetDist > meleeRange) {
							//Not in melee range so it must have been thrown
							meleeVsProne = false;
						}
					}
				}
				if (meleeVsProne) targetBonuses.comAdv.shouldApply = true;
			}
			if (((item?.system.rangeType === "range") && item?.system.range.long && (targetDist > item?.system.rangePower)) || ((item?.system.rangeType === "weapon") && weaponUse?.system.range.long && (targetDist > weaponUse?.system.range.value))) {
				targetBonuses.longRange.shouldApply = true;
			}
			if (utils.computeFlankingStatus(utils.tokenForActor(actor), targetArr[targ])) {
				targetBonuses.comAdv.shouldApply = true;
			}
			if (targetStatus.includes("bloodied")) targetBonuses.bloodied.shouldApply = true;
			if (targetStatus.includes("concealed")) targetBonuses.conceal.shouldApply = true;	
			if (targetStatus.includes("concealedTotal")) targetBonuses.concealTotal.shouldApply = true;
			if (targetStatus.includes("cover")) targetBonuses.cover.shouldApply = true;		
			if (targetStatus.includes("coverSup")) targetBonuses.coverSup.shouldApply = true;
            
			const attacker = utils.tokenForActor(actor);
			const target = targetArr[targ];
			for (const actorItem of [...actor.items]) {
				if (actorItem.system.macro.launchOrder === "comBon") {
					const func = new Function("source", "item", "attacker", "target", "bonuses", actorItem.system.macro.command);
					func(actorItem, item, attacker, target, targetBonuses);
				}
			}
			Hooks.callAll("dnd4e.evaluateCommonAttackBonuses", item, attacker, target, targetBonuses);
			targDataArray.targets.push({
				name: targetArr[targ].name,
				status: targetArr[targ].actor.statuses,
				attackMod: data?.item?.attack?.ability || "",
				attackDef: options.attackedDef || "ac",
				immune: targetArr[targ].actor.system.defences[options.attackedDef]?.none || false,
				targetBonuses,
			});
		}
	} else {
		targDataArray.targNameArray.push("");
		targDataArray.targets.push({
			name: "",
			status: [],
			attackMod: data?.item?.attack?.ability || "",
			attackDef: data?.item?.attack?.def || "ac",
			immune: false,
		});
		targDataArray.hasTarget = false;
	}
	if (targDataArray.targets.length === 1) {
		targDataArray.multiTargetCheck = false;
	} else {
		targDataArray.multiTargetCheck = true;
	}
		
	let dialogData = {
		formula: parts.join(" + "),
		data: data,
		messageMode: rollConfig.messageMode,
		messageModes: CONFIG.ChatMessage.modes,
		config: CONFIG.DND4E,
		flavor: flavor ?? "",
		isAttackRoll: isAttackRoll,
		isD20Roll: true,
		isCharge: isCharge,
		isOpp: isOpp,
		userStatus: userStatus,
		targetData: targDataArray,
	};
	let buttons = [{
		action: "normal",
		icon: "fa-solid fa-dice-d20",
		label: _loc("DND4E.Roll"),
		type: "submit",
	}];
	rollConfig.targDataArray = targDataArray;
	return RollDialog.asPromise({ dialogData, rollConfig, buttons, window: { title }, callbackFn: performD20RollAndCreateMessage });
}

/**
 * Gets the bonus for an attack roll.
 * @param {Object} options
 * @param {string[]} options.parts
 * @param {Object} options.data
 * @param {Object} options.options
 * @returns {number|string}
 */
export function getAttackRollBonus({ parts = [], data = {}, options = {} }) {
	const roll = new MultiAttackRoll(parts.filterJoin(" + "), data, options);
	if (roll.isDeterministic) {
		roll.evaluateSync();
		return roll.total;
	}

	return roll.formula;
}

/**
 * Rolls a d20 roll and prints it to chat.
 * @param {Object} form 
 * @param {Object} options
 * @param {string[]} options.parts
 * @param {Object[]} options.partsExpressionReplacements
 * @param {Item4e} options.item
 * @param {Item4e} options.weaponUse
 * @param {Object} options.data
 * @param {Object} options.speaker
 * @param {string} options.messageMode
 * @param {string} options.flavor
 * @param {number} options.critical
 * @param {number} options.fumble
 * @param {number} options.targetValue
 * @param {Actor4e} options.actor
 * @param {boolean} options.isAttackRoll
 * @param {Object} options.options
 * @param {Set<string>} options.userStatus
 * @param {Object[]} options.targDataArray
 * @param {boolean} options.fastForward
 * @returns 
 */
async function performD20RollAndCreateMessage(form, { parts, partsExpressionReplacements, item, weaponUse, data, speaker, messageMode, flavor, critical, fumble, targetValue, actor, isAttackRoll, options, userStatus, targDataArray, fastForward }) {
	/*
	 coming in the parts[] is in one of the following states:
	 - Empty
	 - containing some @variables (e.g. @ammo)
	 - containing some formula that have already been expanded (1+2+3)
	 */

	// define if we are rolling a d20
	if (!parts.includes("@tool") && !parts.includes("@ritual")) {
		// noinspection EqualityComparisonWithCoercionJS
		if (!form || !form.d20?.value || (form.d20?.value == 1)) { // type coercion is expected here!  It's a string value
			parts.unshift("1d20");
		} else if (form.d20?.value > 0) {
			parts.unshift(`${form.d20.value}d20kh`);
		} else if (form.d20.value < 0) {
			parts.unshift(`${Math.abs(form.d20.value)}d20kl`);
		}
	}

	// sort out @bonus which was shoved onto the end of the expression to represent floating situational bonuses
	// either the user specified one, or we want to get rid of it.  Also prettifiy if they made their bonus +1d6 - strip out the leading +
	manageBonusInParts(parts, form, data);

	let allRollsParts = [];
	const numberOfTargets = Math.max(1, game.user.targets.size);
	//console.debug(data);
	let targetDefArray = [], targetAtkModArray = [], targetBonusArray = [];
	
	if (isAttackRoll && (form !== null)) {
		const individualAttack = (form.querySelector("#multibonus-toggle")?.value === "true");
		for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++) {
			const targetBonuses = [];
			for (let [k, v] of Object.entries(form)) {
				if (v.checked !== undefined) {
					let tabIndex = v.name.split(".")[0];
					if ((individualAttack && (parseInt(tabIndex) === targetIndex)) // check if Individual Attack Bonuses
					|| !individualAttack) { //otherwise just use Unified Attack Bonuses
						let bonusName = v.name.split(".")[1];
						if (v.checked) {
							targetBonuses.push(`@${bonusName}`);
							targDataArray.targets[targetIndex].targetBonuses[bonusName].shouldApply = true;
						}
                        targDataArray.targets[targetIndex].targetBonuses[bonusName].shouldApply = v.checked;
				}
				if (!individualAttack && (k > 21)) {
					break;
				}
			}
			if (game.settings.get("dnd4e", "collapseSituationalBonus")) {
				let total = 0;
				targetBonuses.forEach(bonus => total += targDataArray.targets[targetIndex].targetBonuses[bonus.substring(1)].value);
				const partsToPush = total ? parts.concat([total]) : parts;
				allRollsParts.push(partsToPush);
			}
			else {
				const partsToPush = targetBonuses.length ? parts.concat(targetBonuses) : parts;
				allRollsParts.push(partsToPush);
			}
		}
		
		//Get per-target defence and ability mod
		let attackDef;
		let attackMod;
		for (let [k, v] of Object.entries(form)) {
			if (v.classList.contains("attackDef")) {
				attackDef = (individualAttack || !attackDef) ? v.value : attackDef;
				targetDefArray.push(attackDef);
			}
			if (v.classList.contains("attackMod")) {
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
				
		let hasComAdv = false;
		const userStatBonuses = Object.keys(CONFIG.DND4E.commonAttackBonuses).reduce((bonuses, bonus) => {
			bonuses[bonus] = {
				shouldApply: false,
				value: data.commonAttackBonuses[bonus].value,
			};
			return bonuses;
		}, {});

		// User conditions
		if (userStatus.has("prone")) userStatBonuses.prone.shouldApply = true;
		if (userStatus.has("restrained")) userStatBonuses.restrained.shouldApply = true;
		if (userStatus.has("running")) userStatBonuses.running.shouldApply = true;
		if (userStatus.has("squeezing")) userStatBonuses.squeez.shouldApply = true;
		if (userStatus.has("comAdv")) hasComAdv = true;
		if (options?.variance?.isCharge) userStatBonuses.charge.shouldApply = true;
		
		if (game.settings.get("dnd4e", "markAutomation") && data?.marker) {
			if (!theTargets.some(t => (t.actor.uuid === data.marker))) userStatBonuses.marked.shouldApply = true;
		}
				
		for (let targetIndex = 0; targetIndex < numberOfTargets; targetIndex++) {

			targetDefArray.push(data.item.attack.def); targetAtkModArray.push(data.item.attack.ability);
			
			const targetBonuses = foundry.utils.deepClone(userStatBonuses);
			if (theTargets.length > 0) {
				const targetStatus = Array.from(theTargets[targetIndex].actor.statuses);
				
				//Target conditions
				if (targetStatus.filter(element => ["blinded", "dazed", "dominated", "helpless", "restrained", "stunned", "surprised", "squeezing", "running", "grantingCA"].includes(element)).length) hasComAdv = true;
				
				const targetDist = utils.computeDistance(actor, theTargets[targetIndex]);
				if (targetStatus.includes("prone") && (["melee", "touch", "reach"].includes(item?.system.rangeType) || ((item?.system.rangeType === "weapon") && (weaponUse?.system.weaponType.slice(-1) === "M")))) {
					let isThrown = false;
					if (item?.system.rangeType === "weapon") {
						if (weaponUse?.system.properties.thv || weaponUse?.system.properties.tlg) {
							const meleeRange = weaponUse.system.properties.rch ? 2 : 1;
							if (targetDist > meleeRange) {
								//Not in melee range so it must have been thrown
								isThrown = true;
							}
						}
					}
					if (!isThrown) {
						hasComAdv = true;
					}
				}

				if (utils.computeFlankingStatus(utils.tokenForActor(actor), theTargets[targetIndex])) {
					hasComAdv = true;
				}

				if (((item?.system.rangeType === "range") && item?.system.range.long && (targetDist > item?.system.rangePower)) || ((item?.system.rangeType === "weapon") && weaponUse?.system.range.long && (targetDist > weaponUse?.system.range.value))) {
					targetBonuses.longRange.shouldApply = true;
				}

				if (targetStatus.includes("bloodied")) targetBonuses.bloodied.shouldApply = true;
				if (targetStatus.includes("concealed")) targetBonuses.conceal.shouldApply = true;	
				if (targetStatus.includes("concealedTotal")) targetBonuses.concealTotal.shouldApply = true;
				if (targetStatus.includes("cover")) targetBonuses.cover.shouldApply = true;		
				if (targetStatus.includes("coverSup")) targetBonuses.coverSup.shouldApply = true;
			}
			if (hasComAdv) targetBonuses.comAdv.shouldApply = true;
			const attacker = utils.tokenForActor(actor);
			const target = theTargets[targetIndex];
			for (const actorItem of [...actor.items]) {
				if (actorItem.system.macro.launchOrder === "comBon") {
					const func = new Function("source", "item", "attacker", "target", "bonuses", actorItem.system.macro.command);
					func(actorItem, item, attacker, target, targetBonuses);
				}
			}
			Hooks.callAll("dnd4e.evaluateCommonAttackBonuses", item, attacker, target, targetBonuses);
			if (game.settings.get("dnd4e", "collapseSituationalBonus")) {
				const total = Object.values(targetBonuses).filter((bon) => bon.shouldApply).map((bon) => bon.value).reduce((acc, curr) => acc + curr);
				allRollsParts.push(parts.concat([total]));
			}
			else {
				allRollsParts.push(parts.concat(Object.entries(targetBonuses).filter((bon) => bon[1].shouldApply).map((bon) => `@${bon[0]}`)));
				targetBonusArray.push(targetBonuses);
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
	if (ability && ability.value) {
		data.ability = ability.value;
		const abl = data.abilities[data.ability];
		if (abl) {
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
		targetMissed: [],
	};
	const critStateArray = [];

	const itemData = item?.getRollData({ variance: options.variance }).item;
	const weaponData = weaponUse?.getRollData().item;
	for (let rollExpressionIdx = 0; rollExpressionIdx < allRollsParts.length; rollExpressionIdx++) {
		const rollExpression = allRollsParts[rollExpressionIdx];
		let subroll;
		try {
			let targetOptions = foundry.utils.deepClone(options);
			const targetActor = targets[rollExpressionIdx]?.document.actor;
			const IS_TARGET = true;
			if (targetActor) await utils.applyEffects({ ...data, ...options.variance }, targetActor, itemData, weaponData, "attack", null, IS_TARGET, targetOptions);
			// populate the common attack bonuses into data
			const commonAttackBonuses = targDataArray ? targDataArray.targets[rollExpressionIdx].targetBonuses : (targetBonusArray ? targetBonusArray[rollExpressionIdx] : null);
			if (commonAttackBonuses) {
				Object.keys(data.commonAttackBonuses).forEach(function(key, index) {
					data[key] = commonAttackBonuses[key].value;
				});
			}
			const attacker = utils.tokenForActor(actor);
			const target = targets[rollExpressionIdx];
			for (const actorItem of [...actor.items]) {
				if (actorItem.system.macro.launchOrder === "preAttack") {
					const func = new Function("source", "item", "attacker", "target", "rollConfig", actorItem.system.macro.command);
					func(actorItem, item, attacker, target, { rollExpression, partsExpressionReplacements, commonAttackBonuses, targetOptions });
				}
			}
			Hooks.callAll("dnd4e.preAttackRoll", item, attacker, target, { rollExpression, partsExpressionReplacements, commonAttackBonuses, targetOptions });
			subroll = await roll.addNewRoll(rollExpression, partsExpressionReplacements, data, targetOptions);
		}
		catch(err) {
			// let the user know what is going on if the roll doesn't evaluate.
			ui.notifications.error("Error trying to roll: " + rollExpression.join("+") + ":" + err);
			throw err;
		}

		let targImmune = false;

		if (isAttackRoll && (targets.length > rollExpressionIdx)) {
			const attackedDef = targetData.targDefArray[rollExpressionIdx];
			let targName = targets[rollExpressionIdx].name;
			let targDefVal = targets[rollExpressionIdx].document.actor.system.defences[attackedDef]?.value;
			let defOptions = { bonuses: foundry.utils.deepClone(Roll4e.DEFAULT_OPTIONS.bonuses) };
			await utils.applyEffects({ ...data, ...options.variance }, targets[rollExpressionIdx].actor, itemData, weaponData, "defence", null, null, defOptions);

			let bonusesTotal = 0;
			for (const [type, bonuses] of Object.entries(defOptions.bonuses)) {
				if (bonuses.length) {
					bonuses.push(actor.system.defences[attackedDef][type]);
					const bonus = type == "untyped" ? bonuses.reduce((acc, curr) => acc + parseInt(curr), 0) : bonuses.reduce((max, curr) => Math.max(max, parseInt(curr)), -Infinity);
					let currentBonus = 0;
					if (type !== "untyped") {
						const thisDefenceBonus = targets[rollExpressionIdx].document.actor.system.defences[attackedDef][type];
						const globalDefenceBonus = targets[rollExpressionIdx].document.actor.system.modifiers.defences[type];
						currentBonus = Math.max(thisDefenceBonus, globalDefenceBonus);
					}
					bonusesTotal += Math.max((bonus - currentBonus), 0);
				}
			}
			targDefVal += bonusesTotal;
			const meleeRange = weaponUse?.system.properties.rch ? 2 : 1;
			const dist = utils.computeDistance(actor, targets[rollExpressionIdx]);
			const isThrown = (weaponUse?.system.properties.thv || weaponUse?.system.properties.tlg) && (dist > meleeRange);
			if (targets[rollExpressionIdx].document.actor.statuses.has("prone") && ((item?.system.rangeType === "range") || ((item?.system.rangeType === "weapon") && ((weaponUse?.system.weaponType.slice(-1) === "R") || isThrown))) && (dist > 1)) {
				const proneDefenseBonusVsRanged = 2; // TODO Make this configurable somehow?
				targDefVal += proneDefenseBonusVsRanged;
			}
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
		if (targImmune) {
			critStateArray.push("immune");
		} else if (subroll.terms[0].total >= critical) {
			critStateArray.push("critical");
		} else if (subroll.terms[0].total <= fumble) {
			critStateArray.push("fumble");
		} else {
			critStateArray.push("");
		}
	}
	
	const attacker = await fromUuid(options.parent);
	
	// if there is only 1 roll, it's not a multi roll
	if (!isAttackRoll || (game.user.targets.size < 1)) {
		roll = roll.rollArray[0];
	}
	else {		
		roll.populateMultirollData(targetData, critStateArray);			
		Hooks.callAll("dnd4e.rollAttack", data.item, targetData, speaker);
	
		if (options.powerEffects && game.settings.get("dnd4e", "autoApplyEffects")) {
			if (targetData.targetHit.length) {
				utils.applyEffectsToTokens(options.powerEffects, targetData.targetHit, "hit", attacker);
				utils.applyEffectsToTokens(options.powerEffects, targetData.targetHit, "hitOrMiss", attacker);
				utils.applyEffectsToTokens(options.powerEffects, [attacker], "selfHit", attacker);
			}
			if (targetData.targetMissed.length) {
				utils.applyEffectsToTokens(options.powerEffects, targetData.targetMissed, "miss", attacker);
				utils.applyEffectsToTokens(options.powerEffects, targetData.targetMissed, "hitOrMiss", attacker);
				utils.applyEffectsToTokens(options.powerEffects, [attacker], "selfMiss", attacker);
			}
		}
	}

	// Move this so that it only gets called when attacks are made, not all d20 rolls?
	if (options.powerEffects && game.settings.get("dnd4e", "autoApplyEffects")) {
		// Always apply these effects after the attack, even if the player forgot to select targets
		utils.applyEffectsToTokens(options.powerEffects, [attacker], "selfAfterAttack", attacker);
	}

	// Convert the roll to a chat message and return the roll
	messageMode = form ? form.messageMode.value : messageMode;

	await roll.toMessage({
		speaker: speaker,
		flavor: flavor,
		flags: options?.flags,
	}, { messageMode });
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
 * @param {Array} partsExpressionReplacements  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsCritExpressionReplacement  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Array} partsMissExpressionReplacement  Optional Array of replacement values for the parts array to create a formula to display where bonuses came from.
 *                                 Each element should be in the form of { target: 'Text To Replace', value: 'text to replace with' }
 * @param {Actor} actor           The Actor making the damage roll
 * @param {Object} data           Actor or item data against which to parse the roll
 * @param {Event|object} event    The triggering event which initiated the roll
 * @param {string} messageMode    A specific message mode to apply as the default for the resulting roll
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
 * @returns {Promise}              A Promise which resolves once the roll workflow has completed
 */
export async function damageRoll({ parts, partsCrit, partsMiss, partsExpressionReplacements = [], partsCritExpressionReplacement = [], partsMissExpressionReplacement = [], actor,
	data, event = {}, messageMode = null, template, title, speaker, flavor, allowCritical = true,
	critical = false, fastForward = null, onClose, dialogOptions, healingRoll, options }) {
									
	// First configure the Roll
	const rollConfig = { parts, partsCrit, partsMiss, data, flavor, messageMode, partsExpressionReplacements, partsCritExpressionReplacement, partsMissExpressionReplacement, speaker, hitType: "normal", fastForward, options };

	// handle input arguments
	mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, messageMode, title, speaker, flavor, fastForward);

	// crit and miss need a @bonus as well as parts
	rollConfig.partsCrit = partsCrit?.concat(["@bonus"]);
	rollConfig.partsMiss = partsMiss?.concat(["@bonus"]);

	// Modify the roll and handle fast-forwarding
	if (rollConfig.fastForward) {
		if (healingRoll) {
			rollConfig.hitType = "heal";
		}
		return performDamageRollAndCreateChatMessage(null, rollConfig);
	}

	// If they didn't want fast forward, then we need to display the rolls bonus input dialog.

	// Render modal dialog
	let dialogData = {
		formula: "@damage + @bonus",
		data: data,
		messageMode: messageMode,
		messageModes: CONFIG.ChatMessage.modes,
	};

	// common dialog configuration
	const dialogConfig = {
		window: { title },
		position: { width: 500 },
	};
	const buttons = [];
	// add the buttons
	if (healingRoll) {
		buttons.push({
			action: "heal",
			// icon: "fa-solid fa-dice-d20",
			label: _loc("DND4E.Healing"),
			type: "submit",
		});
	}
	else {
		if (allowCritical && partsCrit?.length) {
			buttons.push({
				action: "crit",
				// icon: "fa-solid fa-dice-d20",
				label: _loc("DND4E.CriticalHit"),
				type: "submit",
			});
		}
		buttons.push({
			action: "normal",
			// icon: "fa-solid fa-dice-d20",
			label: _loc((partsCrit?.length || partsMiss?.length) ? "DND4E.Normal" : "DND4E.Roll"),
			type: "submit",
		});
		if (partsMiss?.length) {
			buttons.push({
				action: "miss",
				// icon: "fa-solid fa-dice-d20",
				label: _loc("DND4E.Miss"),
				type: "submit",
			});
		}
	}
	return RollDialog.asPromise({ dialogData, rollConfig, buttons, ...dialogConfig, callbackFn: performDamageRollAndCreateChatMessage });
}

/**
 * Rolls a damage roll and prints it to chat.
 * @param {Object} form 
 * @param {Object} options
 * @param {string[]} options.parts
 * @param {string[]} options.partsCrit
 * @param {string[]} options.partsMiss
 * @param {Object} options.data
 * @param {string} options.hitType
 * @param {string} options.flavor
 * @param {string} options.messageMode
 * @param {Object[]} options.partsExpressionReplacements
 * @param {Object[]} options.partsCritExpressionReplacement
 * @param {Object[]} options.partsMissExpressionReplacement
 * @param {Object} options.speaker
 * @param {Object} options.options
 * @param {boolean} options.fastForward
 * @returns 
 */
async function performDamageRollAndCreateChatMessage(form, { parts, partsCrit, partsMiss, data, hitType, flavor, messageMode, partsExpressionReplacements, partsCritExpressionReplacement, partsMissExpressionReplacement, speaker, options, fastForward }) {
	manageBonusInParts(parts, form, data);
	manageBonusInParts(partsCrit, form, data);
	manageBonusInParts(partsMiss, form, data);

	if (data.bonus) { //stopgap fix because bonus damage type is not being recorded properly
		if (parts[parts.length - 1] === "@bonus") {
			let index = data.bonus.lastIndexOf("[");
			if (index >= 0) {
				parts[parts.length - 1] = "(" + data.bonus.slice(0, index) + ")" + data.bonus.slice(index);
			} else {
				parts[parts.length - 1] = "(" + data.bonus + ")";
			}
		}
	} else {
		if (!fastForward) parts.pop();
	}
	//console.debug(parts);

	let roll;
	if (hitType === "immune") {
		options.hitTypeDamage = false;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacements, data, options);
		flavor = `${flavor} (${_loc("DND4E.Immune")})`;
	}
	else if (hitType === "normal") {
		options.hitTypeDamage = true;
		options.hitType = hitType;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacements, data, options);
	}
	else if (hitType === "crit") {
		options.hitTypeDamage = true;
		options.hitType = hitType;
		roll = RollWithOriginalExpression.createRoll(partsCrit, partsCritExpressionReplacement, data, options);
		flavor = `${flavor} (${_loc("DND4E.Critical")})`;
	}
	else if (hitType === "miss") {
		options.hitTypeDamage = true;
		options.hitType = hitType;
		roll = RollWithOriginalExpression.createRoll(partsMiss, partsMissExpressionReplacement, data, options);
		flavor = `${flavor} (${_loc("DND4E.Miss")})`;
	}
	else if (hitType === "heal") {
		options.hitTypeHealing = true;
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacements, data, options);
		flavor = `${flavor} (${_loc("DND4E.Healing")})`;
	} else {
		roll = RollWithOriginalExpression.createRoll(parts, partsExpressionReplacements, data, options);
	}

	if (form?.flavor.value) {
		flavor = form.flavor.value || flavor;
	}
	// Convert the roll to a chat message
	messageMode = form ? form.messageMode.value : messageMode;
	roll.toMessage({
		speaker,
		flavor,
	}, { messageMode });
	return roll;
}

/**
 * General helper functions for both attack and damage rolls
 * @param {Object} rollConfig 
 * @param {string[]} parts 
 * @param {MouseEvent} event
 * @param {string} messageMode 
 * @param {string} title 
 * @param {Object} speaker 
 * @param {string} flavor 
 * @param {boolean} fastForward 
 * @returns 
 */
function mergeInputArgumentsIntoRollConfig(rollConfig, parts, event, messageMode, title, speaker, flavor, fastForward) {
	// Handle input arguments
	rollConfig.flavor = flavor || title;
	rollConfig.speaker = speaker || ChatMessage.getSpeaker();
	rollConfig.parts = parts.concat(["@bonus"]);
	rollConfig.messageMode = messageMode || game.settings.get("core", "messageMode");

	// Determine whether the roll can be fast-forward, make explicit comparison here as it might be set as false, so no falsey checks
	if ((fastForward === null) || (fastForward === undefined)) {
		// rollConfig.fastForward = utils.isUsingFastForwardKey(event);
		rollConfig.fastForward = utils.isRollFastForwarded(event);
		if (rollConfig.options?.fastForward) {
			rollConfig.fastForward = rollConfig.options.fastForward;
		}
	}
	return rollConfig;
}

/**
 * sort out @bonus which was shoved onto the end of the expression to represent floating situational bonuses
 * either the user specified one, or we want to get rid of it.  Also prettifiy if they made their bonus +1d6 - strip out the leading +
 * @param parts The parts of the formula we were given, will have @bonus as the last element
 * @param form The user input form (may be null)
 * @param data The roll data
 */
function manageBonusInParts(parts, form, data) {
	if (form !== null) {
		if (form.bonus.value) {
			// remove double +
			let trimmed = form.bonus.value.trim();
			if (trimmed.startsWith("+")) {
				trimmed = trimmed.substring(1);
			}
			data["bonus"] = trimmed;
		}
		else {
			data["bonus"] = 0;
		}
	}
	else {
		if (parts?.length) {
			if (parts[parts.length - 1] === "@bonus") {
				parts.pop();
			}
		}
	}
}
