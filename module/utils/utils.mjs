import { ActiveEffect4e, Actor4e, Item4e, TokenDocument4e } from "../documents/_module.mjs";
import Roll4e from "../rolls/roll.mjs";
import Token4e from "../canvas/placeables/token.mjs";

/**
 * Helper function to perform synchronous evaluation of a user-input formula
 * User-input formulas may throw if blank or otherwise contain invalid terms.
 * @param {string} formula                         The roll formula. May be blank or otherwise invalid.
 * @param {object} [rollData]                      The roll data for parsing.
 * @param {object} [options]                       Options for this method to forward.
 * @param {boolean} [options.strict=false]         Forwarded to {@linkcode Roll.evaluateSync}.
 * @param {boolean} [options.suppressError=false]  Whether or not to suppress the error message.
 * @param {boolean} [options.allowStrings=true]    Forwarded to {@linkcode Roll.evaluateSync}.
 * @param {string} [options.contextName]           Helpful string put into the error message.
 * @returns {number} Returns the total, or 0 if it failed to evaluate.
 */
export function evaluateFormula(formula, rollData = {}, { strict = false, suppressError = false, allowStrings = true, contextName = "unknown" } = {}) {
	if (typeof formula === "number") return formula;
	let result = 0;
	try {
		const evaluatedResult = new Roll(formula || "0", rollData).evaluateSync({ strict, allowStrings }).total;
		result = evaluatedResult;
	}
	catch (e) {
		if (!suppressError) console.error(`Failed to evaluate formula ${formula} in ${contextName}`, e);
	}
	return result;
}

/**
 * Returns true if the variable is defined and is not an empty string.
 * @param {string} str the object to check, could be a string, could be any other object
 * @returns {boolean} if the object is defined (non null) and is not the empty string.
 */
export function isNonEmpty(str) {
	return str && (str !== "");
}

/* -------------------------------------------- */
/**
* Refrence a nested object by string.
* @param {string} s the string that holds the targeted nested adress
* @param {object} o the root object, defaulting to object.data
*/
export function byString(s, o) {
	s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
	s = s.replace(/^\./, ""); // strip a leading dot
	var a = s.split(".");
	for (var i = 0, n = a.length; i < n; ++i) {
		var k = a[i];
		if (k in o) {
			o = o[k];
		} else {
			return;
		}
	}
	return o;
}

/**
 * Surrounds the given object in brackets
 * @param {string} str The object
 * @return {string} "({str})"
 */
export function bracketed (str) {
	return `(${str})`;
}

/**
 * Find A suitable weapon to use with the power.
 * Either the specified weapon, or a weapon that matches the itemData.weaponType category if itemData.weaponUse is set to default
 * @param {CharacterData} itemData The Power being used
 * @param {Actor4e} actor The actor that owns the power
 * @returns {Item4e|null} The weapon details or null if either no suitable weapon is found or itemData.weaponUse is set to none.
 */
export function getWeaponUse(itemData, actor) {
	if (!itemData || (itemData.weaponUse === "none") || ((itemData.weaponType === "none") && (actor.itemTypes.weapon.length === 0))) return null;
	let weaponUse = itemData.weaponUse ? actor.items.get(itemData.weaponUse) : null;
	//If default weapon is in use, find a sutable weapon
	if ((itemData.weaponUse === "default") || (itemData.weaponUse === "defaultOH")) {
		let setMelee = ["melee", "simpleM", "militaryM", "superiorM", "improvM", "naturalM", "siegeM"];
		let setRanged = ["ranged", "simpleR", "militaryR", "superiorR", "improvR", "naturalR", "siegeR"];
		return actor.itemTypes.weapon.sort(i => i.system.weaponHand === "hOff" ? 1 : -1).find((i) =>	{ // Flush off-hand to the end
			if (i.system.equipped) {

				if (itemData.weaponType === "any") {
					return i;
				}
					
				if (itemData.weaponType === "meleeRanged") {
					if (setMelee.includes(i.system.weaponType) || setRanged.includes(i.system.weaponType))
						if ((itemData.weaponUse === "defaultOH") && (i.system.weaponHand === "hOff"))
							return i;
						else if (itemData.weaponUse === "default")
							return i;
				}
				else if (itemData.weaponType === "melee") {
					if (setMelee.includes(i.system.weaponType))
						if ((itemData.weaponUse === "defaultOH") && (i.system.weaponHand === "hOff"))
							return i;
						else if (itemData.weaponUse === "default") 
							return i;
				}
				else if (itemData.weaponType === "ranged") {
					if (setRanged.includes(i.system.weaponType) || i.system.properties.tlg || i.system.properties.thv)
						if ((itemData.weaponUse === "defaultOH") && (i.system.weaponHand === "hOff"))
							return i;
						else if (itemData.weaponUse === "default")
							return i;
				}
				else if (itemData.weaponType === "implement") {
					if (i.system.properties.imp || i.system.properties.impA || i.system.properties.impD)
						if ((itemData.weaponUse === "defaultOH") && (i.system.weaponHand === "hOff"))
							return i;
						else if (itemData.weaponUse === "default")
							return i;
				}
				// else if(itemData.weaponType === "implementA") {
				// if(i.system.properties.imp || i.system.properties.impA )
				// if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
				// return i;
				// else if(itemData.weaponUse === "default")
				// return i;
				// }
				// else if(itemData.weaponType === "implementD") {
				// if(i.system.properties.imp || i.system.properties.impD )
				// if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
				// return i;
				// else if(itemData.weaponUse === "default")
				// return i;
				// }
			}
		}, {});
	}
	return weaponUse;
}

/**
 * Returns true if we should error out because the power needs a weapon equipped and the character doesn't have one
 * @param itemData The data object of the Power being used
 * @param weaponUse The details of the weapon being used for the power from getWeaponUse
 * @returns {boolean} True if the character lacks a suitable weapon to use the power
 */
export function lacksRequiredWeaponEquipped(itemData, weaponUse) {
	// a power needs a weapon equipped to roll attack if a weapon type has been specified that is not None or Implement And weaponUse is not none.
	const powerNeedsAWeapon = itemData.weaponType && !["none", "implement", "any"].includes(itemData.weaponType) && (itemData.weaponUse !== "none");
	return !weaponUse && powerNeedsAWeapon;
}

export const variableRegex = new RegExp(/@([a-z.0-9_-]+)/gi);

/**
 * Applies custom bonuses from active effects
 * @param {object} rollData The data object of the roll being performed
 * @param {Actor4e} actor The actor whose active effects should be checked
 * @param {CharacterData} powerData Roll data for the power being used
 * @param {CharacterData} weaponData Roll data for the weapon being used
 * @param {string} effectType What type of thing the compiled bonuses should be applied to: "attack", "damage", or "defence"
 * @param {Array} extraDamage An array that extra damage dice terms are added to
 * @param {boolean} target Whether or not the provided actor is the target of the power in use
 * @param {object} options An object containing the bonuses that can be applied; item, feat, race, etc.
 */
export async function applyEffects(rollData, actor, powerData = {}, weaponData = null, effectType, extraDamage = [], target = false, options = {}) {
	const debug = game.settings.get("dnd4e", "debugEffectBonus") ? "D&D4e |" : "";
	if (!actor) return;
	const actorEffects = [...actor.allApplicableEffects()];
	if (actorEffects.length) {
		let enhValue = weaponData?.enhance || 0;
		if (debug) {
			console.log(`${debug} Debugging ${effectType} effects for ${powerData.name}.	Supplied Weapon: ${weaponData?.name}`);
		}
			
		//Using inherent enhancements?
		if (game.settings.get("dnd4e", "inhEnh")) {
			//If our enhancement is lower than the inherent level, adjust it upward
			enhValue = Math.max(weaponData?.enhance || 0, findKeyScale(actor.system.details.level, CONFIG.DND4E.SCALE.basic, 1));
			debugLog(`Checked inherent atk/dmg enhancement of +'${findKeyScale(actor.system.details.level, CONFIG.DND4E.SCALE.basic, 1)}' for this level against weapon value of +${weaponData?.enhance})`);
		}

		const effectsToProcess = [];
		const effectTargets = [];
		if (target) {
			effectTargets.push("grants");
		} else {
			effectTargets.push("power");
			if (weaponData) effectTargets.push("weapon");
		}
		actorEffects.forEach((effect) => {
			effect.system.changes.forEach((change => {
				for (const effectTarget of effectTargets) {
					if (change.key.startsWith(`${effectTarget}.${effectType}`)) {
						effectsToProcess.push({
							name: effect.name,
							key: change.key,
							value: change.value,
							itemUuid: effect.item.uuid,
						});
						break;
					}
				}
			}));
		});
			
		//Dummy up some extra effects to represent global atk/damage bonuses
		const globalMods = actor.system.modifiers;
		if (globalMods[effectType]?.value) {
			for (const [key, value] of Object.entries(globalMods[effectType])) {
				//No way to sort bonus array types, so we'll combine them with untyped before checks.
				const adjValue = (key == "untyped" ? value + globalMods[effectType].bonusValue : value);
				if (!["value", "bonus", "warn", "bonusValue", "label"].includes(key) && (adjValue != 0)) {
					effectsToProcess.push({
						name: `Global ${effectType} modifier`,
						key: `modifiers.${effectType}.global.${key}`,
						value: adjValue,
					});
				}
			}
		}			
			
		if (effectsToProcess.length > 0) {
			if (debug) {
				console.log(`${debug} Found the following possible active effects`);
				effectsToProcess.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`));
			}

			const suitableKeywords = ["global"];
			_addKeywords(suitableKeywords, powerData.damageType);
			_addKeywords(suitableKeywords, powerData.effectType);
			if (weaponData) {
				_addKeywords(suitableKeywords, weaponData.weaponGroup);
				_addKeywords(suitableKeywords, weaponData.properties);
				_addKeywords(suitableKeywords, weaponData.damageType);
				_addKeywords(suitableKeywords, weaponData.implement); // implement group for implement powers.	Bad naming of property, sorry -Drac
				if (weaponData.weaponBaseType) {
					suitableKeywords.push(weaponData.weaponBaseType);
				}
				options.weaponUuid = weaponData.uuid;
			}

			if (powerData.powersource) {
				suitableKeywords.push(powerData.powersource);
			}
			if (powerData.secondPowersource) {
				suitableKeywords.push(powerData.secondPowersource);
			}
			if (powerData.weaponType) {
				//Tool-based keywords like implement and weapon belong to the power, so in most cases we do not need to check the weapon to know which ones to use. Melee/ranged weapons and "any" are the exceptions, so we check the equipped weapon just for those.
					
				switch (powerData.weaponType) {
					case "none": break;
					case "implement":
						suitableKeywords.push("usesImplement");
						break;
					case "melee":
						suitableKeywords.push("weapon");
						suitableKeywords.push("melee");
						suitableKeywords.push("meleeWeapon");
						break;
					case "ranged":
						suitableKeywords.push("weapon");
						suitableKeywords.push("ranged");
						suitableKeywords.push("rangedWeapon");
						break;
					default:
						if (weaponData) {
							if (weaponData.WeaponType === "implement") {
								suitableKeywords.push("usesImplement");
							} else if (weaponData.isRanged) {
								suitableKeywords.push("weapon");
								suitableKeywords.push("rangedWeapon");
								suitableKeywords.push("ranged");
							} else {
								suitableKeywords.push("weapon");
								suitableKeywords.push("meleeWeapon");
								suitableKeywords.push("melee");
							}
						}
						break;
				}
					
				//Check for proficiency with tool
				switch (powerData.weaponType) {
					case "none": break;
					case "implement":
						if (weaponData) {
							if (weaponData.proficientI) suitableKeywords.push("proficient");
						}
						break;
					case "any":
						if (weaponData) {
							if (weaponData.WeaponType === "implement") {
								if (weaponData.proficientI) suitableKeywords.push("proficient");
							}
						}
						break;
					default:
						if (weaponData) {
							if (weaponData.proficient) suitableKeywords.push("proficient");
						}
				}
			}
				
			if (powerData.rangeType) {
				switch (powerData.rangeType) {
					case "closeBurst":
						suitableKeywords.push("close");
						suitableKeywords.push("burst");
						suitableKeywords.push("closeBurst");
						break;
					case "closeBlast":
						suitableKeywords.push("close");
						suitableKeywords.push("blast");
						suitableKeywords.push("closeBlast");
						break;
					case "range":
						suitableKeywords.push("ranged");
						break;
					case "rangeBurst":
						suitableKeywords.push("area");
						suitableKeywords.push("burst");
						suitableKeywords.push("areaBurst");
						break;
					case "rangeBlast":
						suitableKeywords.push("area");
						suitableKeywords.push("blast");
						suitableKeywords.push("areaBlast");
						break;
					case "wall":
						suitableKeywords.push("area");
						break;
					case "melee":
					case "reach":
					case "touch":
						suitableKeywords.push("melee");
						break;
				}
			}
				
			//Special case for detecting one-handed weapons
			if (weaponData) {
				if (!weaponData.properties.two) { //Skip if it's tagged two-handed
					//Make sure it's some kind of weapon
					const wpnGroupValues = Object.values(weaponData.weaponGroup);
					const isWeapon = wpnGroupValues.some(function(element) {
						return element;
					});
					if (isWeapon) {
						suitableKeywords.push("one");
					}
				}
			}
				
			if (powerData.attack?.def) {
				switch (powerData.attack.def) {
					case "ac":
						suitableKeywords.push("vsAC");
						break;
					case "fort":
						suitableKeywords.push("vsFort");
						break;
					case "ref":
						suitableKeywords.push("vsRef");
						break;
					case "will":
						suitableKeywords.push("vsWill");
						break;
				}
			}
				
			if (powerData.attack?.isBasic) {
				suitableKeywords.push("basic");
				if (suitableKeywords.includes("melee")) suitableKeywords.push("mBasic");
				if (suitableKeywords.includes("ranged")) suitableKeywords.push("rBasic");
			}
				
			if (powerData.attack?.isCharge || rollData?.isCharge) suitableKeywords.push("charge");
			if (powerData.attack?.isOpp || rollData?.isOpp) suitableKeywords.push("opp");				
			if (powerData.attack?.def) suitableKeywords.push(`vs${powerData.attack.def.capitalize()}`);
			if (powerData.attack?.ability) suitableKeywords.push(`uses${powerData.attack.ability.capitalize()}`);
				
			if (powerData?.keywordsCustom) {
				const customKeys = powerData.keywordsCustom.split(";");
				customKeys.forEach((item) => suitableKeywords.push(item));
			}

			// Can be done with already with a global bonus of some multiple of @bloodied, but useful for defence bonuses like the Deva's Astral Majesty
			if (rollData?.details?.isBloodied) {
				suitableKeywords.push("bloodied");
			}

			if (debug) {
				console.debug(rollData);
				console.debug(`${debug} based on power source, effect type, damage type and (if weapon) weapon group and properties the following effect keys are suitable`);
				console.debug(suitableKeywords.sort());
				console.debug(`${debug} ${suitableKeywords.join(", ")}`);
			}

			await _applyEffectsInternal(effectsToProcess, suitableKeywords, actor, effectType, debug, extraDamage, options);
		}
	}
}

/** 
 * A pared down version of applyEffects suitable for determining bonuses to saving throws against effects or the DCs of effects. Only needs to know
 * about effect keywords and statuses inflicted by the effect. effectType can be `save` or `saveDC`.
 * @param {object} rollData The data object of the roll being performed
 * @param {Actor4e} actor The actor whose active effects should be checked
 * @param {object} effectData Data object for the active effect in question
 * @param {string} effectType What type of thing the compiled bonuses should be applied to: "attack", "damage", or "defence"
 * @param {object} options An object containing the bonuses that can be applied; item, feat, race, etc.
 */
export async function applySaveEffects(rollData, actor, effectData, effectType, options = {}) {
	const debug = game.settings.get("dnd4e", "debugEffectBonus") ? "D&D4e |" : "";
	if (actor.effects) {
		if (debug) {
			debugLog(`${debug} Debugging ${effectType} effects for ${effectData?.name}.`);
		}

		const effectsToProcess = [];
		const effects = actor.getActiveEffects().filter((effect) => effect.disabled === false);
		effects.forEach((effect) => {
			effect.system.changes.forEach((change => {
				if (change.key.startsWith(`effect.${effectType}`)) {
					effectsToProcess.push({
						name: effect.name,
						key: change.key,
						value: change.value,
					});
				}
			}));
		});
			
		// No global bonuses to save DCs
		if (effectType === "save") {
			//Dummy up some extra effects to represent global save bonuses
			const globalMods = actor.system.details.saves;
			if (globalMods.value) {
				for (const [key, value] of Object.entries(globalMods)) {
					//No way to sort bonus array types, so we'll combine them with untyped before checks.
					const adjValue = (key == "untyped" ? value + globalMods.bonusValue : value);
					if (!["value", "bonus", "warn", "bonusValue", "label", "cssClass", "selected"].includes(key) && (adjValue != 0)) {
						effectsToProcess.push({
							name: "Global save modifier",
							key: `effect.save.global.${key}`,
							value: adjValue,
						});
					}
				}
			}
		}		
			
		if (effectsToProcess.length > 0) {
			if (debug) {
				console.log(`${debug} Found the following possible active effects`);
				effectsToProcess.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`));
			}

			const suitableKeywords = ["global"];
			let keywords = effectData?.system.keywords;
			if (keywords) {
				keywords.forEach((k) => suitableKeywords.push(k));
			}
				
			let customKeywords = effectData?.system.keywordsCustom;
			if (customKeywords) {
				const customKeys = customKeywords.split(";");
				customKeys.forEach((k) => suitableKeywords.push(k));
			}

			let statuses = effectData?.statuses;
			if (statuses?.size) {
				statuses.forEach((s) => suitableKeywords.push(s));
			}

			if (effectData?.system.dots.length) {
				suitableKeywords.push("ongoing");
				effectData.system.dots.forEach((d) => {
					d.types.forEach((t) => {
						suitableKeywords.push(t);
						// Since game text describes this as "untyped" let's allow users to use that language in effect keys.
						if (t === "physical") suitableKeywords.push("untyped");
					});
				});
			}

			if (debug) {
				console.debug(rollData);
				console.debug(`${debug} based on effect keywords the following effect keys are suitable`);
				console.debug(suitableKeywords.sort());
				console.debug(`${debug} ${suitableKeywords.join(", ")}`);
			}

			await _applyEffectsInternal(effectsToProcess, suitableKeywords, actor, effectType, debug, null, options);
		}
	}
}

async function _applyEffectsInternal(effectsToProcess, suitableKeywords, actor, effectType, debug, extraDamage = [], options = {}) {
	// filter out to just the relevant effects by keyword
	const matchingEffects = effectsToProcess.filter((effect) => {
		const keyParts = effect.key.split(".");
		if ((keyParts.length >= 4) && (keyParts[1] === effectType)) {
			const keywords = keyParts.slice(2, -1);
			for (const keyword of keywords) {
				if (keyword === "self") {
					if (options.weaponUuid === effect.itemUuid) {
						continue;
					} else {
						return false;
					}
				} 
				if (!suitableKeywords.includes(keyword)) {
					return false;
				}
			}
			return true;
		}
	});

	if (debug) {
		console.log(`${debug} The following effects were deemed suitable by keyword filter`);
		matchingEffects.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`));
	}

	for (const effect of matchingEffects) {
		const keyParts = effect.key.split(".");
		if (keyParts.length >= 4) {
			const bonusType = keyParts[keyParts.length - 1];
			const effectValueString = Roll.replaceFormulaData(String(effect.value), actor.getRollData());
			const effectDice = await rollWithErrorHandling(effectValueString, { context: effect.key });
			const effectValue = effectDice.total;
			if (bonusType === "roll") {
				let rollBonus = new Roll(effectValueString);
				rollBonus.terms.forEach(term => {
					if (term instanceof foundry.dice.terms.ParentheticalTerm) {
						extraDamage.push(term.formula);
					}
					else if ((term instanceof foundry.dice.terms.DiceTerm) || (typeof term.total === "number")) {
						let termString = "";
						if (term.flavor) termString = `(${term.expression})[${term.flavor}]`;
						else termString = `(${term.expression})`;
						extraDamage.push(termString);
					}
				});
			}
			else {
				if (("bonuses" in options) && (bonusType in options.bonuses)) options.bonuses[bonusType].push(effectValue);
			}
		}
		else {
			ui.notifications.warn(`Tried to process a bonus effect that had too few .'s in it: ${effect.key}: ${effect.value}`);
			debugLog(`Tried to process a bonus effect that had too few .'s in it: ${effect.key}: ${effect.value}`);
		}
	}
}

function _addKeywords(suitableKeywords, keywordsActive) {
	if (keywordsActive) {
		for (const [key, value] of Object.entries(keywordsActive)) {
			if (value === true) {
				suitableKeywords.push(key);
			}
		}
	}
}

/**
 * Perform replacement of @variables in the formula involving a power.	This is a recursive function with 2 modes of operation!
 *
 * @param formula The formula to examine and perform replacements on.
 * @param rollData Roll data from the actor or item to use to resolve variables.
 * @return {object} An object of {variable = value}.
 */
export function getDataObject(formula, rollData) {
	const result = {};
	const variables = formula?.match(variableRegex);
	if (variables) {
		variables.forEach(variable => {
			// get the value for that variable - call this method with just the variable and with return data off
			result[variable.substring(1)] = Roll.replaceFormulaData(variable, rollData); // trim off the leading @
		});
	}
	return result;
}

/**
 * Create and evaluate a roll based on the given roll expression string.	If no expression has been provided, evaluate a roll of 0.
 * In the event that the string fails to evaluate, display an error and return a roll of 0.
 *
 * Note this uses the async roll API so returns a Promise<Roll>
 *
 * @param {String} rollString				The roll expression.
 * @param {String} errorMessageKey			The key that will be localised for the error message if the roll fails.
 * @param {String} context				    Context on the source of the roll string / where it is being used
 * @returns {Promise<Roll>}					The evaluated Roll instance as a promise
 */
export async function rollWithErrorHandling(rollString, { errorMessageKey = "DND4E.InvalidRollExpression", context = "" }) {
	if (!errorMessageKey) {
		errorMessageKey = "DND4E.InvalidRollExpression";
	}
	if (rollString) {
		const roll = new Roll(`${rollString}`);
		// return roll.roll({async : true}).catch(err => {
		return roll.roll().catch(err => {
			let msg = context ? `${_loc(errorMessageKey)} (in ${context}) : ${rollString}` : `${_loc(errorMessageKey)} : ${rollString}`;
			ui.notifications.error(msg);
			debugLog(msg);
			debugLog(err);
			// return new Roll("0").roll({async : true});
			return new Roll("0").roll();
		});
	}
	else {
		// return new Roll("0").roll({async : true});
		return new Roll("0").roll();
	}
}

function _rangeValue(range, actorData) {
	if (range) {
		const areaForm = evaluateFormula(`${range}`, actorData, { strict: true, contextName: "areaValue" });
		return areaForm;
	} else {
		return	0;
	}
}

/**
 * Creates HTML-formatted text for use in power cards
 * @param {object} chatData				    Output of item.getChatData() for the power
 * @param {CharacterData|null} actorData	Roll data for the actor the power is on
 * @param {number|string|null} attackTotal  Total attack bonus for th power
 * @returns {string}					    Formatted power card text
 */
export function preparePowerCardData(chatData, actorData = null, attackTotal = null) {
		
	let powerDetail = "<div class=\"basics\">"; //Open the white section between flavour and effects
		
	let powerSource = (chatData.powersource) ? `${CONFIG.DND4E.powerSource[`${chatData.powersource}`]}` : "";
	powerDetail += `<span class="usage">${CONFIG.DND4E.powerUseType[`${chatData.useType}`]}</span>`;
	let tag = [];
		
	if (chatData.powersource) tag.push(powerSource);

	if (["melee", "meleeRanged", "ranged"].includes(chatData.weaponType)) {
		tag.push("Weapon");
	} 
	else if (chatData.weaponType === "implement") {
		tag.push("Implement");
	}

	if (chatData.powersource && chatData.secondPowersource && (chatData.secondPowersource != chatData.powersource)) {
		tag.push(`${CONFIG.DND4E.powerSource[`${chatData.secondPowersource}`]}`);
	}
		
	if (chatData.weaponDamageType) {
		for (let [damage, d] of Object.entries(chatData.weaponDamageType)) {
			if (d && CONFIG.DND4E.damageTypes[damage]) tag.push(CONFIG.DND4E.damageTypes[damage]);
		}
	}
	else if (chatData.damageType) {
		for (let [damage, d] of Object.entries(chatData.damageType)) {
			if (d && CONFIG.DND4E.damageTypes[damage]) tag.push(CONFIG.DND4E.damageTypes[damage]);
		}
	}

	if (chatData.effectType) {
		for (let [effect, e] of Object.entries(chatData.effectType)) {
			if (e && CONFIG.DND4E.effectTypes[effect]) tag.push(CONFIG.DND4E.effectTypes[effect]);
		}
	}
		
	if (chatData?.keywordsCustom) {
		const customKeys = chatData.keywordsCustom.split(";");
		customKeys.forEach((item) => tag.push(item));
	}
		
	tag.sort();
		
	if (tag.length > 0) powerDetail += `<span class="sep">&#10022;</span><span class="keywords">${tag.join(", ")}</span>`;
		
	powerDetail += `<br /><span class="action">${CONFIG.DND4E.abilityActivationTypes[chatData.actionType].label}</span> <span class="sep">&nbsp;</span>`;

	if (chatData.rangeType === "weapon") {
		powerDetail += ` <span class="range-type weapon">${CONFIG.DND4E.weaponType[chatData.weaponType]}</span>`;
		if (chatData.rangePower) powerDetail += ` <span class="range-value">${_rangeValue(chatData.rangePower ?? null, actorData)}</span>`;
	}
	else if (chatData.rangeType === "melee") {
		powerDetail += ` <span class="range-type melee">${_loc("DND4E.Melee")}</span> <span class="range-size">${_rangeValue(chatData.rangePower ?? null, actorData)}</span>`;
	}
	else if (chatData.rangeType === "reach") {
		powerDetail += ` <span class="range-type reach">${_loc("DND4E.rangeReach")}</span> <span class="range-size">${_rangeValue(chatData.rangePower ?? null, actorData)}</span>`;
	}
	else if (chatData.rangeType === "range") {
		powerDetail += ` <span class="range-type ranged">${_loc("DND4E.rangeRanged")}</span> <span class="range-size">${_rangeValue(chatData.rangePower ?? null, actorData)}</span>`;
		if (chatData.range?.long) powerDetail += `/<span class="range-long">${_rangeValue(chatData.range.long ?? null, actorData)}</span>`;
	}
	else if (["closeBurst", "closeBlast"].includes(chatData.rangeType)) {
		powerDetail += ` <span class="range-type close">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span> <span class="range-size">${_rangeValue(chatData.area ?? null, actorData)}</span>`;
	}
	else if (["rangeBurst", "rangeBlast", "wall"].includes(chatData.rangeType)) {
		powerDetail += ` <span class="range-type area">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span> <span class="range-size">${_rangeValue(chatData.area ?? null, actorData)}</span> <span class="label-within">${_loc("DND4E.RangeWithin")}</span> <span class="range-within">${chatData.rangePower}</span>`;
	}
	else if (chatData.rangeType === "personal") {
		powerDetail += ` <span class="range-type personal">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span>`;
	}
	else if (chatData.rangeType === "special") {
		powerDetail += ` <span class="range-type special">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span>`;
	}
	else if (chatData.rangeType === "touch") {
		powerDetail += ` <span class="range-type melee">${_loc("DND4E.Melee")}</span> <span class="range-size touch">${_loc("DND4E.DistTouch")}</span>`;
	}
	else {
		powerDetail += "</span>";
	}
	powerDetail += "</span>";
	powerDetail += "</div>"; //Close basics

	if (chatData.requirement) {
		powerDetail += `<p class="requirement"><strong>${_loc("DND4E.Requirement")}:</strong> ${chatData.requirement}</p>`;
	}

	if (chatData.trigger) {
		powerDetail += `<p class="trigger"><strong>${_loc("DND4E.Trigger")}:</strong> ${chatData.trigger}</p>`;
	}

	if (chatData.target && (typeof chatData.target === "string")) { //target can sometimes be an object for things that did not have a dropdown
		powerDetail += `<p class="target"><strong>${_loc("DND4E.Target")}:</strong> ${chatData.target}</p>`;
	}

	if (!chatData.postEffect && chatData.effect.detail) {
		powerDetail += `<p class="effect alt"><strong>${_loc("DND4E.Effect")}:</strong> ${chatData.effect.detail}</p>`;
	}
		
	if (!chatData.postSpecial && chatData.special) {
		powerDetail += `<p class="special"><strong>${_loc("DND4E.Special")}:</strong> ${chatData.special}</p>`;
		for (let [i, entry] of Object.entries(chatData.specialAdd.parts)) {
			powerDetail += `<p class="special multi">${entry}</p>`;
		}
	}

	if (chatData.attack.isAttack) {
		let attackForm = chatData.attack.formula;
		attackForm = chatData.attack.formula.replaceAll("@powerMod", `@${chatData.attack?.ability}Mod`);
		const attackValues = Roll.replaceFormulaData(attackForm, actorData);
		if (!(attackTotal == undefined)) {
			//if does not start with a number sign add one
			attackTotal = attackTotal.toString();
			if (!(attackTotal.startsWith("+") || attackTotal.startsWith("-"))) {
				attackTotal = "+" + attackTotal;
			}
		} else if (chatData.attack.ability) {
			attackTotal = CONFIG.DND4E.abilities[chatData.attack.ability];
		} else {
			attackTotal = _loc("DND4E.Attack");
		}
			
		if (chatData.attack.detail) {
			let attackDetail = chatData.attack.detail.replaceAll("@attackValues", `${attackValues}`);
			attackDetail = attackDetail.replaceAll("@attackTotal", `${attackTotal}`);
			powerDetail += `<p class="attack"><strong>${_loc("DND4E.Attack")}:</strong> ${attackDetail}</p>`;
		}
		else {
			if (chatData.attack.ability === "form") {				
				powerDetail += `<p class="attack"><strong>${_loc("DND4E.Attack")}:</strong> <a class="attack-bonus" data-tooltip="${attackValues}">${attackTotal}</a>`;
			}
			else if (chatData.attack.ability) {
				powerDetail += `<p class="attack"><strong>${_loc("DND4E.Attack")}</strong>: <a class="attack-bonus" data-tooltip="`;		
				if (game.settings.get("dnd4e", "cardAtkDisplay") == "bonus") {
					powerDetail += `${CONFIG.DND4E.abilities[chatData.attack.ability]} (${attackValues})">${attackTotal}</a>`;
				} else if (game.settings.get("dnd4e", "cardAtkDisplay") == "both") {
					powerDetail += `(${attackValues})">${CONFIG.DND4E.abilities[chatData.attack.ability]} (${attackTotal})</a>`;
				} else {
					powerDetail += `${attackTotal} (${attackValues})">${CONFIG.DND4E.abilities[chatData.attack.ability]}</a>`;
				}
			} else {
				powerDetail += `<p class="attack"><strong>${_loc("DND4E.Attack")}</strong>: ${_loc("DND4E.Attack")}`;
			}
			powerDetail += ` ${_loc("DND4E.VS")} ${CONFIG.DND4E.defensives[chatData.attack.def].labelShort}</p>`;
		}
	}

	if (chatData.hit.detail) {
		powerDetail += `<p class="hit alt-highlight"><strong>${_loc("DND4E.Hit")}:</strong> ${chatData.hit.detail}</p>`;
	}

	if (chatData.miss.detail) {
		powerDetail += `<p class="miss alt-highlight"><strong>${_loc("DND4E.Miss")}:</strong> ${chatData.miss.detail}</p>`;
	}

	if (chatData.postEffect && chatData.effect.detail) {
		powerDetail += `<p class="effect alt-highlight"><strong>${_loc("DND4E.Effect")}:</strong> ${paragraphTrim(chatData.effect.detail)}</p>`;
	}
	if (chatData.postSpecial && chatData.special) {
		powerDetail += `<p class="special alt-highlight"><strong>${_loc("DND4E.Special")}:</strong> ${chatData.special}</p>`;
		for (let [i, entry] of Object.entries(chatData.specialAdd.parts)) {
			powerDetail += `<p>${entry}</p>`;
		}
	}

	if ((chatData.sustain?.actionType !== "none") && chatData.sustain?.actionType) {
		powerDetail += `<p class="sustain alt-highlight"><strong>${_loc("DND4E.Sustain")} ${CONFIG.DND4E.abilityActivationTypes[chatData.sustain.actionType].labelShort}:</strong> ${chatData.sustain.detail}</p>`;
	}
		
	return powerDetail;
}

/**
 * Trims a string of <p> tags
 * @param {string} string           String to be trimmed
 * @returns {string}                Trimmed string
 */
export function paragraphTrim(string) {
	// Check if the string starts with <p>
	if (string.startsWith("<p>")) {
		// Remove the first occurrence of <p> and </p>
		string = string.replace(/<p>(.*?)<\/p>/, "$1");
	}
	if (string.endsWith("</p>")) {
		// Removes the last four characters if they are '</p>'
		string = string.slice(0, -4); 
	}
	return string;
}

/**
 * Tests a string and returns whether or not it's a number
 * @param {string} str              String to test
 * @returns {boolean}               Whether or not the string is a number
 */
export function isNumber(str) {
	return /^-?\d+$/.test(str);
}

/**
 * Recharges an actor's item that have one of an array of valid recharge types
 * @param {Actor4e} actor                   Actor whose items to recharge
 * @param {string[]} targetArray            Array of recharge types to recharge
 */
export async function rechargeItems(actor, targetArray) {

	const items = actor.items.filter(item => targetArray.includes(item.system.uses?.per));
	const updateItems = items.map(item => {
		return {
			_id: item.id,
			"system.uses.value": item.system.preparedMaxUses,
		};
	});

	if (updateItems) await actor.updateEmbeddedDocuments("Item", updateItems);
}

/**
 * Ends an actor's effects that have one of an array of valid expiries
 * @param {*} actor                         Actor whose effects to end
 * @param {string[]} targetArray            Array of effect expiries
 */
export async function endEffects(actor, targetArray) {
	const effects = [];
	for (let e of actor.effects) {
		if (targetArray.includes(e.system.durationType)) {
			effects.push(e.id);
		}
	}
	if (effects) await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
}

/**
 * Returns combat initiative for a given token
 * @param {string} id                       Token id
 * @returns {number}                        Token's initiative
 */
export function getInitiativeByToken(id) {
	if (!game.combat) return 0;
	for (let t of game.combat.turns) {
		if (t.tokenId === id) {
			return t.initiative;
		}
	}

	return game.combat.turns[game.combat.turn]?.initiative || -1;
}

/**
 * Returns the token id of a linked actor
 * @param {Actor4e} actor                   Actor to get the token for
 * @returns {string}                        Token id for the actor
 */
export function getTokenIdForLinkedActor(actor) {
	if (actor.token?.id) {
		return actor.token.id;
	}

	const actorId = actor.id;

	if (canvas.tokens.controlled) {
		for (let t of canvas.tokens.controlled) {
			if (t.actor.id === actorId) {
				return t.id;
			}
		}
	}

	if (!game.combat) return null;
		
	if (game.combat.turns[game.combat.turn].actor.id === actorId) {
		return game.combat.turns[game.combat.turn].id;
	}

	for (let t of game.combat.turns) {
		if (t.actor.id === actorId) {
			return t.id;
		}
	}
}

/**
 * Returns the current initiative of an active combat
 * @returns {number}                        Current initiative
 */
export function getCurrentTurnInitiative() {
	return game.combat ? game.combat.turns[game.combat.turn]?.initiative : 0;
}

/**
 * Converts actor roll data into actual values to be used in the passed in effect
 * @param {ActiveEffect4e} effect            Active effect to convert values for
 * @param {Actor4e} parentActor              Actor whose roll data to use
 */
export async function solidifyEffectActorData(effect, parentActor) {
	debugLog(effect);
	debugLog(parentActor);
	const regex = /\$solidify\((.*?)\)/g;

	//dots
	for (const dot of effect.system.dots) {
		if (regex.test(dot.amount)) {    
			foundry.utils.logCompatibilityWarning("Use of $solidify() in Active Effect values is deprecated since 0.8.0; manage this behavior via the \"Use Source Actor Data\" setting on the Active Effect.");
			// dot.amount = await parseSolidify(dot.amount, parentActor);
			dot.amount = dot.amount.toString().replace(/\$solidify\((.*?)\)/g, (match, value) => {
				return Roll.replaceFormulaData(value, parentActor.getRollData());
			});
		} else if ((typeof dot.amount === "string") && effect.system.useSourceActorData) {
			dot.amount = Roll.replaceFormulaData(dot.amount, parentActor.getRollData());
		}
	}

	//changes
	for (const change of effect.system.changes) {
		if (regex.test(change.value)) {
			foundry.utils.logCompatibilityWarning("Use of $solidify() in Active Effect values is deprecated since 0.8.0; manage this behavior via the \"Use Source Actor Data\" setting on the Active Effect.");
			// change.value = parseSolidify(change.value, parentActor);
			change.value = change.value.replace(/\$solidify\((.*?)\)/g, (match, value) => {
				return Roll.replaceFormulaData(value, parentActor.getRollData());
			});
			debugLog(change.value);
		} else if ((typeof change.value === "string") && effect.system.useSourceActorData) {
			change.value = Roll.replaceFormulaData(change.value, parentActor.getRollData());
		}
	}

}

// export async function parseSolidify(inputString, parentActor){
// 	const newVal =  inputString.replace(/\$solidify\((.*?)\)/g, (match, value) => {
// 		return commonReplace(value, parentActor);
// 	});
// 	return newVal;
// }

/**
 * 
 * @param {EmbeddedCollection<ActiveEffect4e>} effectMap    Collection of effects to apply
 * @param {Token4e[]} tokenTarget                           Array of tokens to apply effects to  
 * @param {string} condition                                Effect application condition ("hit", "miss", etc.)
 * @param {Actor4e} parent                                  Actor originating the effects
 */
export async function applyEffectsToTokens(effectMap, tokenTarget, condition, parent) {
	const combat = game.combat;
	for (let effect of effectMap) {
		let e = effect.toObject(); // This is to avoid editing the source effect
		if (e.system.powerEffectType === condition) {
			for (let t of tokenTarget) {
				// let effectData = e.data;
				// e.sourceName = parent.name;

				// Perform data replacement on effect description; target values can be accessed with @target.[normal property path].
				let description = e.description ? e.description : "";
				if (typeof description === "string") {
					const sourceItem = fromUuidSync(e.origin);
					const rollData = sourceItem?.getRollData() ?? parent?.getRollData();
					const targetData = t?.actor?.getRollData();
					if (rollData && targetData) rollData.target = targetData;
					rollData.effect = { name: e.name };
					description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(description, { rollData: rollData });
				}

				e.origin = parent.uuid;
				solidifyEffectActorData(e, parent);
				const flags = e.flags;

				const newEffectData = {
					name: e.name,
					type: e.type,
					description: description,
					img: e.img,
					origin: e.origin,
					sourceName: parent.name,
					system: e.system,
					statuses: e.statuses,
					tint: e.tint,
					flags: flags,
					changesID: e.uuid,
					showIcon: e.showIcon,
				};

				if (parent && newEffectData.system.saveDC) {
					let dcBonus = 0;
					const rollData = parent.getRollData();
					let options = { bonuses: foundry.utils.deepClone(Roll4e.DEFAULT_OPTIONS.bonuses) };
					await applySaveEffects(rollData, parent, newEffectData, "saveDC", options);
					const bonusRoll = await new Roll4e("0", null, options).evaluate();
					dcBonus += bonusRoll?.total;
					newEffectData.system.saveDC = String(Number(newEffectData.system.saveDC) + dcBonus);
				}

				if (e.statuses[0] && game.settings.get("dnd4e", "markAutomation")) {
					const marks = new Set(["mark_1", "mark_2", "mark_3", "mark_4", "mark_5", "mark_6", "mark_7"]);
					const hasMark = marks.intersection(new Set(e.statuses)).size;
						
					if (hasMark) {
						// If the effect already has `system.marker` assume it's for a reason
						if (!e.system.changes.some(c => c.key === "system.marker")) {
							const changeData = {
								key: "system.marker",
								mode: 5,
								value: e.origin,
								priority: null,
							};							
							newEffectData.system.changes.push(changeData);
						}
							
						if (t?.actor?.allApplicableEffects) {
							for (let effect of t.actor.allApplicableEffects()) {
								if (marks.intersection(effect.statuses).size) effect.delete();
							}
						}
					}
				}

				let actor;
				if (t?.actor) {
					actor = t.actor;
				} else { //extra condition for when actors this linked data target self
					actor = parent;
				}

				if (actor.isOwner || game.user.isGM) {
					await actor.createEmbeddedDocuments("ActiveEffect", [newEffectData]);
				} else {
					game.socket.emit("system.dnd4e", {
						actorID: actor.id,
						tokenID: t?.id || null,
						operation: "applyTokenEffect",
						user: game.user.id,
						scene: canvas.scene.id,
						effectData: newEffectData,
					});
				}
					
				debugLog(`Effect setup fired for ${e.name} on ${actor.name}.`);
			}
		}
	}
}

/**
 * Applies effects to all current user targets
 * @param {EmbeddedCollection<ActiveEffect4e>} effects          Collection of effects to apply
 * @param {Actor4e} actor                                       Actor originating the effects
 */
export async function applyEffectsToTargets(effects, actor) {
	applyAllXEffectsToTokens(effects, actor, game.user.targets);
}

/**
 * Apply All / Ally / Enemy effects to the selection
 * @param {EmbeddedCollection<ActiveEffect4e>} effects The powers effects
 * @param {Actor4e} actor The source actor
 * @param {Set<Token4e} selection the Tokens to apply to
 */
export async function applyAllXEffectsToTokens(effects, actor, selection) {
	if (selection?.size) {
		await applyEffectsToTokens(effects, selection, "all", actor);
		const parentDisposition = actor.token?.disposition || actor.prototypeToken.disposition || null;
		await applyEffectsToTokens(effects, filterTokenSetByDisposition(selection, parentDisposition), "allies", actor);
		await applyEffectsToTokens(effects, filterTokenSetByDisposition(selection, parentDisposition, false), "enemies", actor);
	}
}

/**
 * Determine if a fastForward key was held during the given click event.
 * @param {Event} event A click event
 * @returns {boolean} if the click was done while holding down a fastForward key
 */
export function isUsingFastForwardKey(event) {
	return event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
}

/**
 * Determine if a roll should be fast forwarded.
 * @param {Event} event A click event
 * @returns {boolean} Whether or not the roll should be fast forwarded
 */
export function isRollFastForwarded(event) {
	const isModKeyPressed = isUsingFastForwardKey(event);
	return game.settings.get("dnd4e", "fastFowardSettings") ? !isModKeyPressed : isModKeyPressed;
}
	
/**
 * Function to determine the owner of a document - 
 * favouring players and falling back to a GM
 * (pinched from the 5e system for use in the combat loop)
 * @param {Document} doc                Document to check ownership of
 * @param {boolean} idOnly              Whether or not to just return user id
 * @returns {User|string}               The user object, or the user's ID if called with idOnly set to "true"
 */
export function firstOwner(doc, idOnly = false) {
	// null docs could mean an empty lookup, null docs are not owned by anyone
	if (!doc) return false;

	//const playerOwners = owners.filter(([id, level]) => (!game.users.get(id)?.isGM && game.users.get(id)?.active) && level === 3).map(([id, level])=> id);
	let found;
		
	//First check for an assigned character (but player must be active!)
	game.users.forEach(function (player) {
		if (player.active && (player.character?.id === doc.id)) {
			//debugLog(`Player found for ${doc.name}: ${player.id}`);
			found = (idOnly ? player.id : player);
			return;
		}
	});
	if (found) return found;
		
	//If all players have ownership, the GM fallback will be used
	if (doc.ownership["default"] != 3) {
		//If no assigned character, check for specific (active) player owner
		const owners = Object.entries(doc.ownership);
		for (const [i, owner] of Object.entries(owners)) {
			if (i !== 0) {
				const ownerData = game.users?.get(owner[0]);
				if (!ownerData?.isGM && ownerData?.active && (owner[1] === 3)) {
					//debugLog(`Owner of ${doc.name}: ${ownerData.name}`);
					found = (idOnly ? owner : ownerData);
				}
			}
		}
	}
	if (found) return found;

	// If we have no valid player, fall back to first GM
	//debugLog(`No valid owner found for ${doc.name}, using GM fallback`);
	const firstGM = game.users.find(u => u.isGM && u.active);
	return (idOnly ? firstGM.id : firstGM);
}
	
/**
 * Function to return the sum of the highest positive value 
 * and the lowest negative value in a given set.
 * Intended for getting the correct value from multiple 
 * resistances and vulnerabilities.
 * @param {number[]} values                 Array of values
 * @returns {number}                        Highest positive value minus lowest negative value
 */
export function sumExtremes(values = []) {
	if (!values.length) return;
	let negatives = [0], positives = [0];
	for (let v of values) {
		if (v === 0) continue;
		if (v < 0) {
			//debugLog(`negative: ${v}`)
			negatives.push(v);
		} else {
			//debugLog(`positive: ${v}`)
			positives.push(v);
		}
	}
	return Math.max(...positives) + Math.min(...negatives);
}

/**
 * Filters a set of tokens and returns only the ones matching a certain disposition
 * @param {Set<Token4e>} actorSet Actors
 * @param {string} disposition disposition value to keep
 * @param {boolean} same match based on same or diffrent disposition
 * @returns {Set<Token4e>} New set of actors matching disposition
 */
export function filterTokenSetByDisposition(actorSet, disposition, same = true) {
	if (disposition === null) {
		return [];
	}
	const filteredSet = new Set();
	for (const actor of actorSet) {
		if ((actor.document?.disposition === disposition) === same) {
			filteredSet.add(actor);
		}
	}
	return filteredSet;
}

/**
 * Returns whether or not a power has effects matching the given effect types
 * @param {Item4e} power                The power to check
 * @param {string[]} effectTypes        Array of power effect types to check
 * @returns {boolean}                   Whether or not any matching effects were found
 */
export function hasEffects(power, effectTypes) {
	const foundEffects = power.item.effects.contents.filter(e => effectTypes.includes(e.system.powerEffectType));
	return foundEffects.length > 0;
}
	
/**
 * Use to find the value in a given scale as stored using JavaScript Object Notation.
 *
 * @param {number} input an input value as a number, usely a character or item level
 * @param {object} scale an scale in object format, with keys being the miniume level required for each step
 * @param {number} offsetNumber offset value to increase the input to adjust the scale. default value to zero
 * @returns {result} New set of matching disposition
 */
export function findKeyScale(input, scale, offsetNumber = 0) {
	input -= offsetNumber;
	let result = 0;
	// Iterate through the keys of the scale object
	for (let key in scale) {
		// Convert key to a number
		let currentKey = parseInt(key);
		// Check if input is equal to or higher than current key
		if (input >= currentKey) {
			// Check if there's a next key
			let nextKey = null;
			for (let next in scale) {
				let nextNum = parseInt(next);
				if (nextNum > currentKey) {
					nextKey = nextNum;
					break;
				}
			}
			// If there's no next key or input is lower than the next key, assign result
			if (!nextKey || (input < nextKey)) {
				result = scale[key];
				break;
			}
		}
	}
	return `${result}`;
}

/**
 * Wrapper for findKeyScale(level, CONFIG.DND4E.SCALE.basic) for use in dice formulas.
 *
 * @param {number} level Level to scale from, as we don't have access to any rollData in here. Default 1.
 * @param {number} offset Offset value to increase the input to adjust the scale. Default 0.
 * @returns {result} New set of matching disposition
 */
export function scaleFn(level = 1, offset = 1) {
	return findKeyScale(level, CONFIG.DND4E.SCALE.basic, offset - 1);
}
	
/**
 * Helper function to convert an initiative with decimal points to a human-friendly round number with tooltip.
 * @param {string} initiative			The roll result
 * @returns {string|void}
 */
export function initTooltip(init = null) {
	if (!init) return "";
		
	try {
		let rollparts = init.toString().split(".");
			
		if (rollparts.length != 2) return init;
			
		rollparts[2] = rollparts[1].substr(2, 2);
		rollparts[1] = rollparts[1].substr(0, 2);
		const tiebreaker = game.settings.get("dnd4e", "initiativeDexTiebreaker");
		let html = `<span class="init-tiebroken" data-tooltip="${_loc("DND4EUI.Tiebreaker")}: `;
			
		if (tiebreaker === "system") {
			html += `[${_loc("DND4E.InitiativeScore")}] ${rollparts[1]}, `;
		} else if (tiebreaker === "dex") {
			html += `[${_loc("DND4E.AbilityDex")}] ${rollparts[1]}, `;
		}
		html += `[${_loc("SETTINGS.4eInitTBRand")}] ${rollparts[2]}">${rollparts[0]}</span>`;
			
		return html;
	} catch(e) {
		console.warn(`Failed to create initiative tooltip: ${e}`);
		return "";
	}
}

/**
 * Returns an actor's tokens, prioritizing controlled tokens
 * @param {Actor4e} actor                   Actor to get tokens for
 * @returns {Token4e[]|undefined}           Array of tokens that belong to the actor, prioritizing controlled tokens, or undefined if empty
 */
export function tokensForActor(actor) {
	if (!(actor instanceof Actor4e))
		return undefined;
	if (actor.token)
		return [actor.token.object];
	const tokens = actor.getActiveTokens();
	if (!tokens.length)
		return undefined;
	const controlled = tokens.filter(t => t.controlled);
	return controlled.length ? controlled : tokens;
}

/**
 * Returns an actor's first token
 * @param {Actor4e} actor                   Actor to get token for
 * @returns {Token4e|undefined}             First token belonging to the actor, or undefined if none
 */
export function tokenForActor(actor) {
	const tokens = tokensForActor(actor);
	if (!tokens)
		return undefined;
	return tokens[0];
}

/**
 * Returns a token for a given entity
 * @param {Token4e|ActiveEffect4e|Actor4e|Item4e|TokenDocument4e} tokenRef      Entity to get a token for
 * @returns {Token4e|undefined}                                                 Highest priority token relevant to the given entity, or undefined if none
 */
export function getToken(tokenRef) {
	if (!tokenRef)
		return undefined;
	if (tokenRef instanceof Token4e)
		return tokenRef;
	if (tokenRef instanceof TokenDocument4e)
		return tokenRef.object ?? undefined;
	let entity = tokenRef;
	if (typeof tokenRef === "string") {
		entity = fromUuidSync(tokenRef);
	}
	if (entity instanceof Token4e)
		return entity;
	if (entity instanceof TokenDocument4e)
		return entity.object ?? undefined;
	if (entity instanceof Actor4e)
		return tokenForActor(entity);
	if ((entity instanceof Item4e) && (entity.parent instanceof Actor4e))
		return tokenForActor(entity.parent);
	if ((entity instanceof ActiveEffect4e) && (entity.parent instanceof Actor4e))
		return tokenForActor(entity.parent);
	if ((entity instanceof ActiveEffect4e) && (entity.parent instanceof Item4e))
		return tokenForActor(entity.parent?.parent);
	return undefined;
}

/**
 * Returns a placeable object from a given entity
 * @param {any} tokenRef                            Entity to get placeable for
 * @returns {foundry.canvas.placeables.PlaceableObject}                       Highest priority token relevant to the given entity, or undefined if none
 */
export function getPlaceable(tokenRef) {
	if (!tokenRef)
		return undefined;
	if (tokenRef instanceof foundry.canvas.placeables.PlaceableObject)
		return tokenRef;
	let entity = tokenRef;
	if (typeof tokenRef === "string") {
		entity = fromUuidSync(tokenRef);
	}
	if (entity instanceof foundry.canvas.placeables.PlaceableObject)
		return entity;
	if (entity.object instanceof foundry.canvas.placeables.PlaceableObject)
		return entity.object;
	if (entity instanceof Actor4e)
		return tokenForActor(entity);
	if ((entity instanceof Item4e) && (entity.parent instanceof Actor4e))
		return tokenForActor(entity.parent);
	if ((entity instanceof ActiveEffect4e) && (entity.parent instanceof Actor4e))
		return tokenForActor(entity.parent);
	if ((entity instanceof ActiveEffect4e) && (entity.parent instanceof Item4e))
		return tokenForActor(entity.parent?.parent);
	return undefined;
}

/**
 * Measure total distance from segments
 * @param {Ray[]} segments              Array of segments
 * @param {object} options              Options object
 * @returns {number}                    Diagonal rule-aware total distance
 */
export function measureDistances(segments, options = {}) {
	let isGridless = canvas?.grid?.constructor.name === "GridlessGrid";
	if (!isGridless || !options.gridSpaces || !canvas?.grid) {
		return segments.map(s => canvas?.grid?.measurePath([s.ray.A, s.ray.B])).map(d => d.distance);
	}
	if (!canvas?.grid) return 0;
	const diagonals = game.settings.get("core", "gridDiagonals");
	const canvasGridProxy = new Proxy(canvas.grid, {
		get: function (target, prop, receiver) {
			if (foundry.grid.SquareGrid.prototype[prop] instanceof Function) {
				return foundry.grid.SquareGrid.prototype[prop].bind(canvasGridProxy);
			}
			else if (prop === "diagonals") {
				return diagonals;
			}
			else if (prop === "isSquare")
				return true;
			else if (prop === "isGridless")
				return false;
			else if (prop === "isHex")
				return false;
			return Reflect.get(target, prop);
		},
	});
	const GridDiagonals = CONST.GRID_DIAGONALS;
	// First snap the poins to the nearest center point for equidistant/1,2,1/2,1,2
	// I expected this would happen automatically in the proxy call - but didn't and not sure why.
	if ([GridDiagonals.APPROXIMATE, GridDiagonals.EQUIDISTANT, GridDiagonals.ALTERNATING_1, GridDiagonals.ALTERNATING_2].includes(diagonals)) {
		segments = segments.map(s => {
			const gridPosA = canvasGridProxy.getOffset(s.ray.A);
			const aCenter = canvasGridProxy.getCenterPoint(gridPosA);
			const gridPosB = canvasGridProxy.getOffset(s.ray.B);
			const bCenter = canvasGridProxy.getCenterPoint(gridPosB);
			return { ray: new foundry.canvas.geometry.Ray(aCenter, bCenter) };
		});
	}
	let distances = segments.map(s => canvasGridProxy.measurePath([s.ray.A, s.ray.B], {}));
	return distances = distances.map(d => {
		let distance = d.distance;
		switch (diagonals) {
			case GridDiagonals.EQUIDISTANT:
			case GridDiagonals.ALTERNATING_1:
			case GridDiagonals.ALTERNATING_2:
				// already fudged by snapping so no extra adjustment
				break;
			case GridDiagonals.EXACT:
			case GridDiagonals.RECTILINEAR:
				distance = Math.max(0, d.distance);
				break;
			case GridDiagonals.APPROXIMATE:
				if (d.diagonals > 0)
					distance = Math.max(0, d.distance);
				break;
			case GridDiagonals.ILLEGAL:
			default:
				distance = d.distance;
		}
		return distance;
	});
}

/** takes two tokens of any size and calculates the distance between them
 * gets the shortest distance betwen two tokens taking into account both tokens size
 * if wallblocking is set then wall are checked
 * @param {Token4e} t1                  First token
 * @param {Token4e} t2                  Second token
 * @param {boolean} [wallsBlock=false]  Whether or not walls should stop the distance measurement
 * @returns {number}                    Distance between the tokens, obeys diagonal rule
 */
export function computeDistance(t1, t2, wallsBlock = false) {
	if (!canvas || !canvas.scene)
		return -1;
	if (!canvas.grid || !canvas.dimensions)
		return -1;
	t1 = getPlaceable(t1);
	t2 = getPlaceable(t2);
	if (!t1 || !t2)
		return -1;
	if (!canvas || !canvas.grid || !canvas.dimensions)
		return -1;
	let t1DocWidth = t1.document.width ?? 1;
	let t1DocHeight = t1.document.height ?? 1;
	let t2DocWidth = t2.document.width ?? 1;
	let t2DocHeight = t2.document.height ?? 1;
	const t1StartX = t1DocWidth >= 1 ? 0.5 : t1DocWidth / 2;
	const t1StartY = t1DocHeight >= 1 ? 0.5 : t1DocHeight / 2;
	const t2StartX = t2DocWidth >= 1 ? 0.5 : t2DocWidth / 2;
	const t2StartY = t2DocHeight >= 1 ? 0.5 : t2DocHeight / 2;
	var x, x1, y, y1, d, r, segments = [], rdistance, distance;
	if (!(t2.document instanceof WallDocument)) {
		for (x = t1StartX; x < t1DocWidth; x++) {
			for (y = t1StartY; y < t1DocHeight; y++) {
				if (y === t1StartY + 1) {
					if ((x > t1StartX) && (x < t1DocWidth - t1StartX)) {
						// skip to the last y position;
						y = t1DocHeight - t1StartY;
					}
				}
				let origin;
				const point = canvas.grid.getCenterPoint({ x: Math.round(t1.document.x + (canvas.dimensions.size * x)), y: Math.round(t1.document.y + (canvas.dimensions.size * y)) });
				origin = new PIXI.Point(point.x, point.y);
				for (x1 = t2StartX; x1 < t2DocWidth; x1++) {
					for (y1 = t2StartY; y1 < t2DocHeight; y1++) {
						if (y1 === t2StartY + 1) {
							if ((x1 > t2StartX) && (x1 < t2DocWidth - t2StartX)) {
								// skip to the last y position;
								y1 = t2DocHeight - t2StartY;
							}
						}
						const point = canvas.grid.getCenterPoint({ x: Math.round(t2.document.x + (canvas.dimensions.size * x1)), y: Math.round(t2.document.y + (canvas.dimensions.size * y1)) });
						let dest = new PIXI.Point(point.x, point.y);
						const r = new foundry.canvas.geometry.Ray(origin, dest);
						if (wallsBlock) {
							let collisionCheck;
							collisionCheck = CONFIG.Canvas.polygonBackends.move.testCollision(origin, dest, { source: t1.document, mode: "any", type: "move" });
							if (collisionCheck)
								continue;
						}
						segments.push({ ray: r });
					}
				}
			}
		}
		if (segments.length === 0) {
			return -1;
		}
		rdistance = segments.map(ray => measureDistances([ray], { gridSpaces: true }));
		distance = Math.min(...rdistance);
	}
	else {
		const w = t2.document;
		let closestPoint = foundry.utils.closestPointToSegment(t1.center, w.object.edge.a, w.object.edge.b);
		distance = measureDistances([{ ray: new foundry.canvas.geometry.Ray(t1.center, closestPoint) }], { gridSpaces: true });
	}
	return Math.max(distance, 0);
}

/**
 * Returns whether or not a token is a valid target.
 * @param {Token4e} target          Token to check
 * @returns {boolean}               Whether or not the token is valid target
 */
export function isValidTarget(target /*Token*/) {
	if (!target.actor)
		return false; // Tokens without actors are not valid targets
	if (target.actor.type === "Hazard")
		return false;
	if (target.document?.isSecret)
		return false;
	if (target.isSecret)
		return false;
	return true;
}

/**
 * Converts disposition string to numeric disposition
 * @param {string|number} disposition       Localized disposition or numeric disposition
 * @returns                                 Numeric disposition
 */
export function mapTokenString(disposition /*string | number*/) {
	if (typeof disposition === "number") return disposition;
	if (disposition.toLocaleLowerCase().trim() === _loc("TOKEN.DISPOSITION.FRIENDLY")?.toLocaleLowerCase()) return 1;
	else if (disposition.toLocaleLowerCase().trim() === _loc("TOKEN.DISPOSITION.HOSTILE")?.toLocaleLowerCase()) return -1;
	else if (disposition.toLocaleLowerCase().trim() === _loc("TOKEN.DISPOSITION.NEUTRAL")?.toLocaleLowerCase()) return 0;
	else if (disposition.toLocaleLowerCase().trim() === _loc("TOKEN.DISPOSITION.SECRET")?.toLocaleLowerCase()) return -2;
	else if (disposition.toLocaleLowerCase().trim() === _loc("all")?.toLocaleLowerCase()) return null;
	const validStrings = ["TOKEN.DISPOSITION.FRIENDLY", "TOKEN.DISPOSITION.HOSTILE", "TOKEN.DISPOSITION.NEUTRAL", "TOKEN.DISPOSITION.SECRET", "all"].map(s => _loc(s));
	throw new Error(`findNearby ${disposition} is invalid. Disposition must be one of "${validStrings}"`);
}

/**
 * Finds all tokens within range of a given token that match the given criteria
 * @param {string|string[]|number|number[]} disposition         Disposition or array of dispositions to check against
 * @param {Token4e|string} token                                Token to get tokens near to, or its uuid
 * @param {number} distance                                     Range within which to check for tokens
 * @param {number|undefined} options.maxSize                    Maximum size to check, or undefined to ignore
 * @param {boolean} options.includeToken                        Whether or not to include the given token in the returned array
 * @param {boolean} options.relative                            Whether or not the disposition should be checked relative to the given token
 * @returns {Token4e[]}                                         Array of tokens that match the criteria
 */
export function findNearby(disposition, token, distance, options = { maxSize: undefined, includeToken: false, relative: true }) {
	token = getToken(token);
	if (!token)
		return [];
	if (!canvas || !canvas.scene)
		return [];
	try {
		if (!(token instanceof Token4e)) {
			throw new Error("find nearby token is not of type token or the token uuid is invalid");
		}
		let relative = options.relative ?? true;
		let targetDisposition;
		if (disposition instanceof Array) {
			if (disposition.some(s => s === "all"))
				disposition = [-1, 0, 1];
			else
				disposition = disposition.map(s => mapTokenString(s) ?? 0);
			targetDisposition = disposition.map(i => (typeof i === "number") && [-1, 0, 1].includes(i) && relative ? token.document.disposition * i : i);
		}
		else if ((typeof disposition === "number") && [-1, 0, 1].includes(disposition)) {
			targetDisposition = relative ? [token.document.disposition * disposition] : [disposition];
		}
		else
			targetDisposition = [CONST.TOKEN_DISPOSITIONS.HOSTILE, CONST.TOKEN_DISPOSITIONS.NEUTRAL, CONST.TOKEN_DISPOSITIONS.FRIENDLY];
		const canvasPlaceables = canvas.tokens?.placeables ?? [];
		let nearby = canvasPlaceables?.filter(t => {
			const tDocument = t.document;
			if (!isValidTarget(t))
				return false;
			if (options.maxSize && ((tDocument.height ?? 1) * (tDocument.width ?? 1) > options.maxSize))
				return false;
			let inRange = false;
			if (t.actor &&
					((t.id !== token.id) || options?.includeToken) && // not the token
					((disposition === null) || targetDisposition.includes(t.document.disposition))) {
				const tokenDistance = computeDistance(t, token, { wallsBlock: true });
				inRange = (0 <= tokenDistance) && (tokenDistance <= distance);
			}
			else
				return false; // wrong disposition
			return inRange;
		});
		return nearby ?? [];
	}
	catch (err) {
		console.error(err);
		return [];
	}
}

/**
 * Measures distance between an arbitrary point and a token
 * @param {object} point                Point
 * @param {number} point.x              Point x coordinate
 * @param {number} point.y              Point y coordinate 
 * @param {Token4e} token               Token
 * @returns {number|undefined}          Distance between token and point, or undefined if invalid
 */
export function distancePointToken({ x, y }, token) {
	if (!canvas || !canvas.scene)
		return undefined;
	if (!canvas.grid || !canvas.dimensions)
		undefined;
	if (!token || (x === undefined) || (y === undefined))
		return undefined;
	if (!canvas || !canvas.grid || !canvas.dimensions)
		return undefined;
	const t2StartX = -Math.max(0, token.document.width / 2 - 0.5);
	const t2StartY = -Math.max(0, token.document.height / 2 - 0.5);
	//  const [row, col] = canvas.grid?.getGridPositionFromPixels(x, y) || [0, 0];
	//  const [xBase, yBase] = canvas.grid?.getPixelsFromGridPosition(row, col) || [0, 0];
	let xc, yc;
	let distance = +Infinity;
	for (let xStep = t2StartX; xStep < token.document.width / 2; xStep += 1) {
		for (let yStep = t2StartY; yStep < token.document.height / 2; yStep += 1) {
			const xBase = xStep * canvas.grid.size + token.center.x;
			const yBase = yStep * canvas.grid.size + token.center.y;
			({ x: xc, y: yc } = canvas.grid.getCenterPoint({ x: xBase, y: yBase }) || { x: 0, y: 0 });
			// ({ x: xc, y: yc } = canvas.grid.getCenterPoint.bind(canvas.grid)({ x, y }) || { x: 0, y: 0 });
			const newDistance = canvas.grid.measurePath([new PIXI.Point(x, y), { x: xc, y: yc }], {}).distance;

			if (newDistance < distance)
				distance = newDistance;
		}
	}
	return distance;
}

/**
 * Computes the flanking status between an attacking token and its target
 * @param {Token4e} token                   Attacking token
 * @param {Token4e} target                  Target token
 * @returns {boolean}                       Whether or not the attacker is flanking the target
 */
export function computeFlankingStatus(token, target) {
	if (!canvas)
		return false;
	if (!token)
		return false;
	const noFlankConditions = new Set(["blinded", "dazed", "dead", "dominated", "petrified", "stunned", "surprised", "unconscious"]);
	if (noFlankConditions.intersection(new Set(token.actor.statuses)).size) return false;
	// For the target see how many square between this token and any friendly targets
	// Find all tokens hostile to the target
	if (!target)
		return false;
	let range = 1;
	if (computeDistance(token, target, { wallsBlock: true }) > range * (canvas?.dimensions?.distance ?? 1))
		return false;
		// an enemy's enemies are my friends.
	const allies = findNearby(-1, target, (canvas?.dimensions?.distance ?? 1));
	if (!token.document.disposition)
		return false; // Neutral tokens can't get flanking
	if (allies.length <= 1)
		return false; // length 1 means no other allies nearby
	let gridW;
	let gridH;
	let maxDist = (canvas?.dimensions?.distance ?? 5);
	if (game.settings?.get("core", "gridDiagonals") === 1)
		maxDist *= Math.sqrt(2);
	gridW = canvas?.grid?.sizeX ?? 100;
	gridH = canvas?.grid?.sizeY ?? 100;
	const tl = { x: target.x, y: target.y };
	const tr = { x: target.x + target.document.width * gridW, y: target.y };
	const bl = { x: target.x, y: target.y + target.document.height * gridH };
	const br = { x: target.x + target.document.width * gridW, y: target.y + target.document.height * gridH };
	const top = [tl.x, tl.y, tr.x, tr.y];
	const bottom = [bl.x, bl.y, br.x, br.y];
	const left = [tl.x, tl.y, bl.x, bl.y];
	const right = [tr.x, tr.y, br.x, br.y];
	// Loop through each square covered by attacker and ally
	const tokenStartX = -Math.max(0, token.document.width / 2 - 0.5);
	const tokenStartY = -Math.max(0, token.document.height / 2 - 0.5);
	const tokenPoints = [];
	for (let x = tokenStartX; x < token.document.width / 2; x++) {
		for (let y = tokenStartY; y < token.document.height / 2; y++) {
			let tx = token.center.x + x * gridW;
			let ty = token.center.y + y * gridH;
			if ((distancePointToken({ x: tx, y: ty, elevation: token.elevation }, target) ?? +Infinity) > maxDist) {
				continue;
			}
			tokenPoints.push({ x: tx, y: ty });
		}
	}
	for (let ally of allies) {
		if (ally.document.uuid === token.document.uuid)
			continue;
		const actor = ally.actor;            
		const cannotFlank = noFlankConditions.intersection(new Set(actor.statuses)).size;
		if (cannotFlank)
			continue;
		const allyStartX = -Math.max(0, ally.document.width / 2 - 0.5);
		const allyStartY = -Math.max(0, ally.document.height / 2 - 0.5);
		const allyPoints = [];
		for (let x1 = allyStartX; x1 < ally.document.width / 2; x1++) {
			for (let y1 = allyStartY; y1 < ally.document.height / 2; y1++) {
				let ax = ally.center.x + x1 * gridW;
				let ay = ally.center.y + y1 * gridH;
				if ((distancePointToken({ x: ax, y: ay, elevation: ally.elevation }, target) ?? +Infinity) > maxDist) {
					continue;
				}
				allyPoints.push({ x: ax, y: ay });
			}
		}
		for (let tokenPoint of tokenPoints) {
			for (let allyPoint of allyPoints) {
				const p1 = canvas.grid?.getCenterPoint(tokenPoint);
				const p2 = canvas.grid?.getCenterPoint(allyPoint);
				if (!p1 || !p2)
					continue;
				const rayToCheck = new foundry.canvas.geometry.Ray(p1, p2);
				const flankingTop = rayToCheck.intersectSegment(top) && rayToCheck.intersectSegment(bottom);
				const flankingLeft = rayToCheck.intersectSegment(left) && rayToCheck.intersectSegment(right);
				if (flankingLeft || flankingTop) {
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * Convenience method to get the unique actors of an array of tokens.
 * @param {(Token4e | TokenDocument4e)[]} [tokens] Defaults to canvas.tokens.controlled.
 * @returns {Set<Actor4e>}    The set of actors of the controlled tokens.
 */
export function tokensToActors(tokens) {
	tokens ??= canvas?.tokens?.controlled ?? [];
	const actors = tokens.map(token => token.actor).filter(_ => _);
	return new Set(actors);
}

/* -------------------------------------------- */

/** 
 * @param {String} msg  Text to print to the console
 */
export function debugLog(msg) {
	if (game.settings.get("dnd4e", "debugLogging")) {
		console.log(msg);
	}
}

/**
 * Socket handler to apply effect to a token
 * @param {object} data 
 * @param {Scene} data.scene
 * @param {string} data.tokenId
 * @param {string} data.actorId
 * @param {object} data.effectData
 * @returns {Promise}
 */
export async function handleApplyEffectToToken(data) {
	if (!game.user.isGM) {
		return;
	}
	debugLog(data);
	debugLog(game.scenes.get(data.scene));
	const effectData = data.effectData;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	await actor.newActiveEffectSocket(effectData);
}

/**
 * Socket handler to delete effects on a token
 * @param {object} data
 * @param {Scene} data.scene
 * @param {string} data.tokenId
 * @param {string} data.actorId
 * @param {string[]} data.toDelete          Array of effect ids to delete
 * @returns {Promise}
 */
export async function handleDeleteEffectToToken(data) {
	if (!game.user.isGM) {
		return;
	}

	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	await actor.deleteActiveEffectSocket(data.toDelete);
}

/**
 * Socket handler to prompt end of turn saving throws
 * @param {object} data
 * @param {Scene} data.scene
 * @param {string} data.tokenId
 * @param {string} data.actorId
 * @returns {Promise}
 */
export async function handlePromptEoTSaves(data) {
	//debugLog('handler reached');
	if (game.userId !== data?.targetUser) return;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	
	await actor.promptEoTSavesSocket();
}

/**
 * Socket handler for ongoing damage
 * @param {object} data
 * @param {Scene} data.scene
 * @param {string} data.tokenId
 * @param {string} data.actorId
 * @returns {Promise}
 */
export async function handleAutoDoTs(data) {
	if (!game.user.isGM) return;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);

	await actor.autoDoTsSocket(data.tokenID);
}

/**
 * Socket handler for expiring saving throw effects
 * @param {object} data
 * @param {Scene} data.effectId
 * @returns {Promise}
 */
export async function handleRefreshSaveEffects(data) {
	if (!game.user.isGM) return;
	ActiveEffect.registry.refresh("save", { effect: data.effectID });
}

/**
 * Socket handler for expiring end of day effects
 * @param {object} data
 * @param {Scene} data.actorId
 * @returns {Promise}
 */
export async function handleRefreshDayEndEffects(data) {
	if (!game.user.isGM) return;
	ActiveEffect.registry.refresh("dayEnd", { actor: data.actorID });
}

/* "Contains" Handlebars Helper: checks if a value exists in an array.
*
*	@param {String} lunch The value to find
*	@param {Array} lunchbox The array to search
*	@param {String} meal (optional) A key to pair with lunch
*	@returns {boolean} true if lunch exists in lunchbox.
*	If meal is provided, lunchbox is assumed to contain objects,
*	and will search for one where meal = lunch.
*
*	I don't know why, but meal is apparently the helper object, 
*	if not given? Not a null, which would have been useful :\
*	Anyway the type check should take care of it.
/*																			*/
Handlebars.registerHelper("contains", function(lunch, lunchbox, meal) {
	try {
		if (typeof meal != "string") {
			if (lunchbox instanceof Array) return lunchbox.includes(lunch);
			if (lunchbox instanceof Set) return lunchbox.has(lunch);
			//Test for object last, because arrays are also objects... heck you too Javascript >:<
			if (lunchbox instanceof Object) return lunch in lunchbox;
		}
		if (lunchbox.some(e => e[meal] === lunch)) return true;
		return false;
	} catch(err) {
		console.error("Contains helper spat up. Did you give it the right parameter types?");
		return false;
	}
});

Handlebars.registerHelper("isActor", function(obj) {
	return obj.isCharacter || obj.isNPC;
});

Handlebars.registerHelper("isActive", function(effect) {
	return !effect.disabled && !effect.isSuppressed;
});

Handlebars.registerHelper("getSourceName", function(effect) {
	return effect.sourceName === "Unknown" ? effect.parent.name : effect.sourceName;
});

Handlebars.registerHelper("needsEffectButton", function(power) {
	return hasEffects(power, ["all", "allies", "enemies"]);
});

Handlebars.registerHelper("needsHitEffectButton", function(power) {
	return hasEffects(power, ["hit"]);
});

Handlebars.registerHelper("needsMissEffectButton", function(power) {
	return hasEffects(power, ["miss"]);
});

Handlebars.registerHelper("needsHitOrMissEffectButton", function(power) {
	return hasEffects(power, ["hitOrMiss"]);
});

Handlebars.registerHelper("applyEffectsToSelection", function() {
	return game.settings.get("dnd4e", "applyEffectsToSelection");
});

/* -------------------------------------------- */
/*	Formatters																	*/
/* -------------------------------------------- */
	
/* -------------------------------------------- */

/**
 * A helper for using Intl.NumberFormat within handlebars.
 * @param {number} value		The value to format.
 * @param {object} options	Options forwarded to {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat}
 * @returns {string}
 */
export function formatNumber(value, options) {
	const formatter = new Intl.NumberFormat(game.i18n.lang, options);
	return formatter.format(value);
}

/* -------------------------------------------- */

/**
 * A helper function to format textarea text to HTML with linebreaks.
 * @param {string} value	The text to format.
 * @returns {Handlebars.SafeString}
 */
export function formatText(value) {
	return new Handlebars.SafeString(value?.replaceAll("\n", "<br>") ?? "");
}
	
/* -------------------------------------------- */

/**
 * A helper to create a set of <option> elements in a <select> block grouped together
 * in <optgroup> based on the provided categories.
 *
 * @param {SelectChoices} choices					Choices to format.
 * @param {object} [options]
 * @param {boolean} [options.localize]		 Should the label be localized?
 * @param {string} [options.blank]				 Name for the empty option, if one should be added.
 * @param {string} [options.labelAttr]		 Attribute pointing to label string.
 * @param {string} [options.chosenAttr]		Attribute pointing to chosen boolean.
 * @param {string} [options.childrenAttr]	Attribute pointing to array of children.
 * @returns {Handlebars.SafeString}				Formatted option list.
 */
function groupedSelectOptions(choices, options) {

	const localize = options.hash.localize ?? false;
	const blank = options.hash.blank ?? null;
	const labelAttr = options.hash.labelAttr ?? "label";
	const chosenAttr = options.hash.chosenAttr ?? "chosen";
	const childrenAttr = options.hash.childrenAttr ?? "children";

	// Create an option
	const option = (name, label, chosen) => {
		if (localize) label = _loc(label);
		html += `<option value="${name}" ${chosen ? "selected" : ""}>${label}</option>`;
	};

	// Create a group
	const group = category => {
		let label = category[labelAttr];
		if (localize) _loc(label);
		html += `<optgroup label="${label}">`;
		children(category[childrenAttr]);
		html += "</optgroup>";
	};

	// Add children
	const children = children => {
		for (let [name, child] of Object.entries(children)) {
			if (child[childrenAttr]) group(child);
			else option(name, child[labelAttr], child[chosenAttr] ?? false);
		}
	};

	// Create the options
	let html = "";
	if (blank !== null) option("", blank);
	children(choices);
	return new Handlebars.SafeString(html);
}

/* -------------------------------------------- */

/**
 * A helper that converts the provided object into a series of `data-` entries.
 * @param {object} object   Object to convert into dataset entries.
 * @param {object} options  Handlebars options.
 * @returns {string}
 */
function dataset(object, options) {
	const entries = [];
	for (let [key, value] of Object.entries(object ?? {})) {
		if (value === undefined) continue;
		key = key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (a, b) => (b ? "-" : "") + a.toLowerCase());
		entries.push(`data-${key}="${Handlebars.escapeExpression(value)}"`);
	}
	return new Handlebars.SafeString(entries.join(" "));
}

/* -------------------------------------------- */
	
/**
 * Register custom Handlebars helpers used by 4e.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		getProperty: foundry.utils.getProperty,
		"DND4E-groupedSelectOptions": groupedSelectOptions,
		"DND4E-numberFormat": (context, options) => formatNumber(context, options.hash),
		"DND4E-textFormat": formatText,
		"DND4E-dataset": dataset,
	});
}
	
/* -------------------------------------------- */
/*	Config Pre-Localization										 */
/* -------------------------------------------- */
	
/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKeyPath					Key path within `CONFIG.DND4E` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key]					If each entry in the config enum is an object,
 *																				localize and sort using this property.
 * @param {string[]} [options.keys=[]]		Array of localization keys. First key listed will be used for sorting
 *																				if multiple are provided.
 * @param {boolean} [options.sort=false]	Sort this config enum, using the key if set.
 */
export function preLocalize(configKeyPath, { key, keys = [], sort = false } = {}) {
	if (key) keys.unshift(key);
	_preLocalizationRegistrations[configKeyPath] = { keys, sort };
}
	
/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config	The `CONFIG.DND4E` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
	for (const [keyPath, settings] of Object.entries(_preLocalizationRegistrations)) {
		const target = foundry.utils.getProperty(config, keyPath);
		if (!target) continue;
		_localizeObject(target, settings.keys);
		if (settings.sort) foundry.utils.setProperty(config, keyPath, sortObjectEntries(target, settings.keys[0]));
	}

	// Localize & sort status effects
	CONFIG.statusEffects.forEach(s => s.name = _loc(s.name));
	// CONFIG.statusEffects.sort((lhs, rhs) =>
	//	 lhs.id === "dead" ? -1 : rhs.id === "dead" ? 1 : lhs.name.localeCompare(rhs.name, game.i18n.lang)
	// );
}

/* -------------------------------------------- */

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj                 The object to sort.
 * @param {string|Function} [sortKey]  An inner key upon which to sort or sorting function.
 * @returns {object}                   A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
	let sorted = Object.entries(obj);
	const sort = (lhs, rhs) => foundry.utils.getType(lhs) === "string" ? lhs.localeCompare(rhs, game.i18n.lang) : lhs - rhs;
	if (foundry.utils.getType(sortKey) === "function") sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
	else if (sortKey) sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
	else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
	return Object.fromEntries(sorted);
}
	
/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj			 The configuration object to localize.
 * @param {string[]} [keys]	List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
	for (const [k, v] of Object.entries(obj)) {
		const type = typeof v;
		if (type === "string") {
			obj[k] = _loc(v);
			continue;
		}

		if (type !== "object") {
			console.error(new Error(
				`Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`,
			));
			continue;
		}
		if (!keys?.length) {
			console.error(new Error(
				"Localization keys must be provided for pre-localizing when target is an object.",
			));
			continue;
		}

		for (const key of keys) {
			const value = foundry.utils.getProperty(v, key);
			if (!value) continue;
			foundry.utils.setProperty(v, key, _loc(value));
		}
	}
}
	
/* -------------------------------------------- */
/*	Localization																*/
/* -------------------------------------------- */
	
/**
 * A cache of already-fetched labels for faster lookup.
 * @type {Map<string, string>}
 */
const _attributeLabelCache = new Map();

/**
 * Convert an attribute path to a human-readable label.
 * @param {string} attr							The attribute path.
 * @param {object} [options]
 * @param {Actor5e} [options.actor]	An optional reference actor.
 * @returns {string|void}
 */
export function getHumanReadableAttributeLabel(attr, { actor } = {}) {
	// Check any actor-specific names first.
	if (attr.startsWith("resources.") && actor) {
		const resource = foundry.utils.getProperty(actor, `system.${attr}`);
		if (resource.label) return resource.label;
	}

	if ((attr === "details.xp.value") && (actor?.type === "NPC")) {
		return _loc("DND4E.ExperiencePointsValue");
	}

	if (attr.startsWith(".") && actor) {
		const item = fromUuidSync(attr, { relative: actor });
		return item?.name ?? attr;
	}

	// Check if the attribute is already in cache.
	let label = _attributeLabelCache.get(attr);
	if (label) return label;

	// Derived fields.
	if (attr === "attributes.init.total") label = "DND4E.InitiativeScore";
	else if (attr === "defences.ac.value") label = "DND4E.DefenceACShort";
	else if (attr === "defences.fort.value") label = "DND4E.DefenceFortShort";
	else if (attr === "defences.ref.value") label = "DND4E.DefenceRefShort";
	else if (attr === "defences.wil.value") label = "DND4E.DefenceWillShort";

	// Abilities.
	else if (attr.startsWith("abilities.")) {
		const [, key] = attr.split(".");
		label = CONFIG.DND4E.abilityScores[key].label;
	}

	// Skills.
	else if (attr.startsWith("skills.")) {
		const [, key] = attr.split(".");
		label = _loc("DND4E.PasCheck", { skill: CONFIG.DND4E.skills[key].label });
	}

	// Attempt to find the attribute in a data model.
	if (!label) {
		const { CharacterData, NPCData, VehicleData, GroupData } = DND4E.dataModels.actor;
		for (const model of [CharacterData, NPCData, VehicleData, GroupData]) {
			const field = model.schema.getField(attr);
			if (field) {
				label = field.label;
				break;
			}
		}
	}

	if (label) {
		label = _loc(label);
		_attributeLabelCache.set(attr, label);
	}

	return label;
}
