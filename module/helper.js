export class Helper {

	static async executeMacro(item) {
		const macro = new Macro ({
			name : item.name,
			type : item.system.macro.type,
			scope : item.system.macro.scope,
			command : item.system.macro.command, //cmd,
			author : game.user.id
		})
		macro.item = item
		macro.actor = item.actor
		macro.launch = item.system.macro.launchOrder;
		return macro.execute();
	}

	/**
	 * Returns true if the variable is defined and is not an empty string.
	 * @param str the object to check, could be a string, could be any other object
	 * @returns {boolean} if the object is defined (non null) and is not the empty string.
	 */
	static isNonEmpty(str) {
		return str && str !== ""
	}

	/* -------------------------------------------- */
	/**
	* Refrence a nested object by string.
	* s is the string that holds the targeted nested adress
	* o is the root objet, defaulting to this.object.data
	*/
	static byString(s, o) {
		s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		s = s.replace(/^\./, '');					 // strip a leading dot
		var a = s.split('.');
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
	 * @param str The object
	 * @return {string} "({str})"
	 */
	static bracketed (str) {
		return `(${str})`
	}

	/**
	 * Find A suitable weapon to use with the power.
	 * Either the specified weapon, or a weapon that matches the itemData.weaponType category if itemData.weaponUse is set to default
	 * @param itemData The Power being used
	 * @param actor The actor that owns the power
	 * @returns {null|*} The weapon details or null if either no suitable weapon is found or itemData.weaponUse is set to none.
	 */
	static getWeaponUse(itemData, actor) {
		if(itemData.weaponUse === "none" || (itemData.weaponType === "none" && actor.itemTypes.weapon.length === 0)) return null;
		let weaponUse = itemData.weaponUse? actor.items.get(itemData.weaponUse) : null;
		//If default weapon is in use, find a sutable weapon
		if(itemData.weaponUse === "default" || itemData.weaponUse === "defaultOH") {
			let setMelee = ["melee", "simpleM", "militaryM", "superiorM", "improvM", "naturalM", "siegeM"];
			let setRanged = ["ranged", "simpleR", "militaryR", "superiorR", "improvR", "naturalR", "siegeR"];
			return actor.itemTypes.weapon.sort(i => i.system.weaponHand === "hOff" ? 1 : -1).find((i) =>	{ // Flush off-hand to the end
				if(i.system.equipped) {

					if(itemData.weaponType === "any") {
						return i;
					}
					
					if(itemData.weaponType === "meleeRanged") {
						if(setMelee.includes(i.system.weaponType) || setRanged.includes(i.system.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "melee") {
						if(setMelee.includes(i.system.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default") 
								return i;
					}
					else if(itemData.weaponType === "ranged") {
						if(setRanged.includes(i.system.weaponType) || i.system.properties.tlg || i.system.properties.thv )
							if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "implement") {
						if(i.system.properties.imp || i.system.properties.impA || i.system.properties.impD )
							if(itemData.weaponUse === "defaultOH" && (i.system.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
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
	 * @param weaponUse The details of the weapon being used for the power from Helper.getWeaponUse
	 * @returns {boolean} True if the character lacks a suitable weapon to use the power
	 */
	static lacksRequiredWeaponEquipped(itemData, weaponUse) {
		// a power needs a weapon equipped to roll attack if a weapon type has been specified that is not None or Implement And weaponUse is not none.
		const powerNeedsAWeapon = itemData.weaponType && !["none", "implement", "any"].includes(itemData.weaponType) && itemData.weaponUse !== "none"
		return !weaponUse && powerNeedsAWeapon
	}

	static get variableRegex() {
		return new RegExp(/@([a-z.0-9_\-]+)/gi);
	}

	static async applyEffects(arrayOfParts, rollData, actorData, powerData, weaponData = null, effectType) {
		const debug = game.settings.get("dnd4e", "debugEffectBonus") ? `D&D4e |` : ""
		if (actorData.effects) {
			const powerInnerData = powerData.system
			const weaponInnerData = weaponData?.system
			let enhValue = weaponInnerData?.enhance||0;
			if (debug) {
				console.log(`${debug} Debugging ${effectType} effects for ${powerData.name}.	Supplied Weapon: ${weaponData?.name}`)
			}
			
			//Using inherent enhancements?
			if(game.settings.get("dnd4e", "inhEnh")) {
				//If our enhancement is lower than the inherent level, adjust it upward
				enhValue = Math.max(weaponInnerData?.enhance||0,Helper.findKeyScale(actorData.system.details.level, CONFIG.DND4E.SCALE.basic, 1));
				//console.log(`Checked inherent atk/dmg enhancement of +'${Helper.findKeyScale(actorData.system.details.level, CONFIG.DND4E.SCALE.basic, 1)}' for this level against weapon value of +${weaponInnerData?.enhance})`);
			}

			const effectsToProcess = []
			const effects = actorData.getActiveEffects().filter((effect) => effect.disabled === false)
			effects.forEach((effect) => {
				effect.changes.forEach((change => {
					if (change.key.startsWith(`power.${effectType}`) || (weaponInnerData && change.key.startsWith(`weapon.${effectType}`))) {
						effectsToProcess.push({
							name : effect.name,
							key: change.key,
							value: change.value
						})
					}
				}))
			})
			
			//Dummy up some extra effects to represent global atk/damage bonuses
			const globalMods = actorData.system.modifiers;
			if(globalMods[effectType]?.value){
				for (const [key, value] of Object.entries(globalMods[effectType])) {
					//No way to sort bonus array types, so we'll combine them with untyped before checks.
					const adjValue = ( key == 'untyped' ? value + globalMods[effectType].bonusValue : value);
					if(!['value','bonus','warn','bonusValue','label'].includes(key) && adjValue != 0){
						effectsToProcess.push({
							name : `Global ${effectType} modifier`,
							key: `modifiers.${effectType}.global.${key}`,
							value: adjValue
						});
					}
				}
			}			
			
			if (effectsToProcess.length > 0) {
				if (debug) {
					console.log(`${debug} Found the following possible active effects`)
					effectsToProcess.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`))
				}

				const suitableKeywords = ['global']
				this._addKeywords(suitableKeywords, powerInnerData.damageType)
				this._addKeywords(suitableKeywords, powerInnerData.effectType)
				if (weaponInnerData) {
					this._addKeywords(suitableKeywords, weaponInnerData.weaponGroup)
					this._addKeywords(suitableKeywords, weaponInnerData.properties)
					this._addKeywords(suitableKeywords, weaponInnerData.damageType)
					this._addKeywords(suitableKeywords, weaponInnerData.implement) // implement group for implement powers.	Bad naming of property, sorry -Drac
					if(weaponInnerData.weaponBaseType){
						suitableKeywords.push(weaponInnerData.weaponBaseType)
					}
				}

				if (powerInnerData.powersource) {
					suitableKeywords.push(powerInnerData.powersource)
				}
				if (powerInnerData.secondPowersource) {
					suitableKeywords.push(powerInnerData.secondPowersource)
				}
				if(powerInnerData.weaponType){
					//Tool-based keywords like implement and weapon belong to the power, so in most cases we do not need to check the weapon to know which ones to use. Melee/ranged weapons and "any" are the exceptions, so we check the equipped weapon just for those.
					
					switch(powerInnerData.weaponType){
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
							if(weaponInnerData) {
								 if(weaponInnerData.WeaponType === "implement") {
									suitableKeywords.push("usesImplement");
								} else if(weaponInnerData.isRanged) {
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
					switch(powerInnerData.weaponType){
						case "none": break;
						case "implement":
							if(weaponInnerData) {
								if(weaponInnerData.proficientI) suitableKeywords.push('proficient');
							}
							break;
						case "any":
							if(weaponInnerData) {
								 if(weaponInnerData.WeaponType === "implement") {
									if(weaponInnerData.proficientI) suitableKeywords.push('proficient');
								}
							}	
						default:
							if(weaponInnerData) {
								if(weaponInnerData.proficient) suitableKeywords.push('proficient');
							}
					}
				}
				
				if(powerInnerData.rangeType){
					switch(powerInnerData.rangeType){
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
				if(weaponInnerData){
					if(!weaponInnerData.properties.two){ //Skip if it's tagged two-handed
						//Make sure it's some kind of weapon
						const wpnGroupValues = Object.values(weaponInnerData.weaponGroup);
						const isWeapon = wpnGroupValues.some(function(element){
							return element;
						});
						if(isWeapon){
							suitableKeywords.push("one");
						}
					}
				}
				
				if(powerInnerData.attack?.def){
					switch(powerInnerData.attack.def){
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
				
				if(powerInnerData.attack?.isBasic){
					suitableKeywords.push("basic");
					if(suitableKeywords.includes("melee")) suitableKeywords.push("mBasic");
					if(suitableKeywords.includes("ranged")) suitableKeywords.push("rBasic");
				};
				
				if(powerInnerData.attack?.isCharge || rollData?.isCharge) suitableKeywords.push("charge");
				if(powerInnerData.attack?.isOpp || rollData?.isOpp) suitableKeywords.push("opp");
				
				if(powerInnerData.attack?.def){
					suitableKeywords.push(`vs${powerInnerData.attack.def.capitalize()}`);
				};
				if(powerInnerData.attack?.ability){
					suitableKeywords.push(`uses${powerInnerData.attack.ability.capitalize()}`);
				};
				
				if(powerInnerData?.keywordsCustom){
					const customKeys = powerInnerData.keywordsCustom.split(';');
					customKeys.forEach((item) => suitableKeywords.push(item));
				}

				if (debug) {
					console.debug(rollData);
					console.debug(`${debug} based on power source, effect type, damage type and (if weapon) weapon group and properties the following effect keys are suitable`);
					console.debug(suitableKeywords.sort());
					console.debug(`${debug} ${suitableKeywords.join(", ")}`);
				}

				// filter out to just the relevant effects by keyword
				const matchingEffects = effectsToProcess.filter((effect) => {
					const keyParts = effect.key.split(".")
					if (keyParts.length >= 4 && keyParts[1] === effectType){
						const keywords = keyParts.slice(2, -1);
						for (const keyword of keywords) {
							if (!suitableKeywords.includes(keyword)) {
								return false
							}
						}
						return true
					}
				})

				if (debug) {
					console.log(`${debug} The following effects were deemed suitable by keyword filter`)
					matchingEffects.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`))
				}

				const newParts = {}
				for (const effect of matchingEffects) {
					const keyParts = effect.key.split(".")
					if (keyParts.length >= 4) {
						const bonusType = keyParts[keyParts.length - 1]
						const effectValueString = this.commonReplace(effect.value, actorData, powerInnerData, weaponInnerData)
						const effectDice = await this.rollWithErrorHandling(effectValueString, {context : effect.key})
						const effectValue = effectDice.total
						if (bonusType === "untyped") {
							if (newParts["untypedEffectBonus"]) {
								newParts["untypedEffectBonus"] = newParts["untypedEffectBonus"] + effectValue
								if (debug) {
									console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue}: Additional untyped Bonus.	They Stack.`)
								}
							}
							else {
								newParts["untypedEffectBonus"] = effectValue
								if (debug) {
									console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue}: First untyped Bonus`)
								}
							}
						}
						else {
							const key = `${bonusType}EffectBonus`
							if (newParts[key]) {
								if (newParts[key] < effectValue) {
									newParts[key] = effectValue
									if (debug) {
										console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue}: Is greater than existing ${bonusType}, replacing`)
									}
								}
								else {
									if (debug) {
										console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue} : Is not greater than existing ${bonusType}, discarding`)
									}
								}
							}
							else {
								newParts[key] = effectValue
								if (debug) {
									console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue} : First ${bonusType} Bonus`)
								}
							}
						}
					}
					else {
						ui.notifications.warn(`Tried to process a bonus effect that had too few .'s in it: ${effect.key}: ${effect.value}`)
						console.log(`Tried to process a bonus effect that had too few .'s in it: ${effect.key}: ${effect.value}`)
					}
				}
				
				for (const [key, value] of Object.entries(newParts)) {
					for (const parts of arrayOfParts) {
						parts.push("@" + key)
					}
					rollData[key] = value
				}
			}
		}
	}

	static _addKeywords(suitableKeywords, keywordsActive) {
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
	 * @param formula The formula to examine and perform replacements on
	 * @param actorData The data from the actor to use to resolve variables: `actor.system`.	This may be null
	 * @param powerInnerData The data from the power to use to resolve variables. `power.system`
	 * @param weaponInnerData The data from the weapon to use to resolve variables.	`item.system` This may be null
	 * @param depth The number of times to recurse down the formula to replace variables, a safety net to stop infinite recursion.	Defaults to 1 which will produce 2 loops.	A depth of 0 will also prevent evaluation of custom effect variables (as that is an infinite hole)
	 * @param returnDataInsteadOfFormula If set to true it will return a data object of replacement variables instead of the formula string
	 * @return {String|{}|number} "0" if called with a depth of <0, A substituted formula string if called with returnDataInsteadOfFormula = false (the default) or an object of {variable = value} if called with returnDataInsteadOfFormula = true
	 */
	// DEVELOPER: Remember this call is recursive, if you change the method signature, make sure you update everywhere its used!
	static commonReplace (formula, actorData, powerInnerData, weaponInnerData=null, depth = 2, returnDataInsteadOfFormula = false) {
		if (depth < 0 ) return 0;
		let newFormula = formula.toString(); // just in case integers somehow get passed
		if (returnDataInsteadOfFormula) {
			const result = {}
			const variables = formula.match(this.variableRegex)
			if (variables) {
				variables.forEach(variable => {
					// get the value for that variable - call this method with just the variable and with return data off
					result[variable.substring(1)] = this.commonReplace(variable, actorData, powerInnerData, weaponInnerData, depth, false) // trim off the leading @
				})
			}
			return result
		}

		if(actorData) {
			const actorInnerData = actorData.system;
			if (actorInnerData) {
				newFormula = Roll.replaceFormulaData(newFormula, actorInnerData);
				if(powerInnerData) {
					newFormula = newFormula.replaceAll("@powerMod", !!(actorInnerData.abilities[powerInnerData.attack?.ability])? actorInnerData.abilities[powerInnerData.attack.ability].mod : "");
				}

				newFormula = newFormula.replaceAll("@strMod", actorInnerData.abilities["str"].mod);
				newFormula = newFormula.replaceAll("@conMod", actorInnerData.abilities["con"].mod);
				newFormula = newFormula.replaceAll("@dexMod", actorInnerData.abilities["dex"].mod);
				newFormula = newFormula.replaceAll("@intMod", actorInnerData.abilities["int"].mod);
				newFormula = newFormula.replaceAll("@wisMod", actorInnerData.abilities["wis"].mod);
				newFormula = newFormula.replaceAll("@chaMod", actorInnerData.abilities["cha"].mod);

				newFormula = newFormula.replaceAll("@lvhalf", Math.floor(actorInnerData.details.level/2));
				newFormula = newFormula.replaceAll("@lv", actorInnerData.details.level);
				newFormula = newFormula.replaceAll("@tier", actorInnerData.details.tier);

				newFormula = newFormula.replaceAll("@atkMod", actorInnerData.modifiers.attack.value);
				newFormula = newFormula.replaceAll("@dmgMod", actorInnerData.modifiers.damage.value);

				newFormula = newFormula.replaceAll("@heroic", actorInnerData.details.level < 11 ? 1 : 0);
				newFormula = newFormula.replaceAll("@paragon", actorInnerData.details.level >= 11 && actorInnerData.details.level < 21 ? 1 : 0);
				newFormula = newFormula.replaceAll("@epic", actorInnerData.details.level >= 21 ? 1 : 0);

				newFormula = newFormula.replaceAll("@heroicOrParagon", actorInnerData.details.level < 21 ? 1 : 0);
				newFormula = newFormula.replaceAll("@paragonOrEpic", actorInnerData.details.level >= 11 ? 1 : 0);

				newFormula = newFormula.replaceAll("@bloodied",	actorInnerData.details.isBloodied ? 1 : 0);
				
				newFormula = newFormula.replaceAll("@sneak",	CONFIG.DND4E.SNEAKSCALE[actorInnerData.details.tier]);
				
				newFormula = newFormula.replaceAll("@enhArmour", actorInnerData.defences.ac.enhance || 0);
				newFormula = newFormula.replaceAll("@enhNAD", Math.min(actorInnerData.defences.fort.enhance || 0, actorInnerData.defences.ref.enhance || 0, actorInnerData.defences.wil.enhance || 0));

				newFormula = newFormula.replaceAll("@charaID", actorData.id || 0);
				newFormula = newFormula.replaceAll("@charaUID", actorData.uuid || 0);
				
				//targets @scale plus some #
				newFormula = newFormula.replace(/@scale(\d*)/g,	(match, number) => {return this.findKeyScale(actorInnerData.details.level, CONFIG.DND4E.SCALE.basic, number-1)});

			}
			else {
				console.log("An actor data object without a .data property was passed to common replace. Probably passed actor.system by mistake!.	Replacing: " + formula)
			}
		}

		newFormula = newFormula.replaceAll("@powerLevel", powerInnerData?.level ? powerInnerData.level : 0)
		let enhValue = weaponInnerData?.enhance||0;
		
		if(weaponInnerData) {
			//Using inherent enhancements?
			if(game.settings.get("dnd4e", "inhEnh")) {
				//If our enhancement is lower than the inherent level, adjust it upward
				enhValue = Math.max(weaponInnerData?.enhance||0,Helper.findKeyScale(actorData.system.details.level, CONFIG.DND4E.SCALE.basic, 1));
				console.log(`Checked inherent atk/dmg enhancement of +${Helper.findKeyScale(actorData.system.details.level, CONFIG.DND4E.SCALE.basic, 1)} for this level against weapon value of +${weaponInnerData?.enhance}`);
			}
			
			newFormula =	newFormula.replaceAll("@itemLevel", weaponInnerData.level ? weaponInnerData.level : 0)

			if (powerInnerData.weaponType === "implement") {
				newFormula = newFormula.replaceAll("@wepAttack", this.bracketed(this.commonReplace(weaponInnerData.attackFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
				newFormula = newFormula.replaceAll("@wepDamage", this.bracketed(this.commonReplace(weaponInnerData.damageFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
				newFormula = newFormula.replaceAll("@wepCritBonus", this.bracketed(this.commonReplace(weaponInnerData.critDamageFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
			}
			else {
				newFormula = newFormula.replaceAll("@wepAttack", this.bracketed(this.commonReplace(weaponInnerData.attackForm, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
				newFormula = newFormula.replaceAll("@wepDamage", this.bracketed(this.commonReplace(weaponInnerData.damageForm, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
				newFormula = newFormula.replaceAll("@wepCritBonus", this.bracketed(this.commonReplace(weaponInnerData.critDamageForm, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
			}

			newFormula = newFormula.replaceAll("@impCritBonus", this.bracketed(this.commonReplace(weaponInnerData.critDamageFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0));

			newFormula = newFormula.replaceAll("@impAttackO", this.bracketed(this.commonReplace(weaponInnerData.attackFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0 ));
			newFormula = newFormula.replaceAll("@impDamageO", this.bracketed(this.commonReplace(weaponInnerData.damageFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0 ));

			newFormula = newFormula.replaceAll("@impAttack", this.bracketed(weaponInnerData.proficientI ? this.commonReplace(weaponInnerData.attackFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0 : 0));
			newFormula = newFormula.replaceAll("@impDamage", this.bracketed(weaponInnerData.proficientI ? this.commonReplace(weaponInnerData.damageFormImp, actorData, powerInnerData, weaponInnerData, depth-1) || 0 : 0));

			newFormula = newFormula.replaceAll("@profBonusO",weaponInnerData.profBonus || 0);
			newFormula = newFormula.replaceAll("@profImpBonusO", weaponInnerData.profImpBonus || 0);
			
			newFormula = newFormula.replaceAll("@profImpBonus", weaponInnerData.proficientI ? weaponInnerData.profImpBonus || 0 : 0);
			newFormula = newFormula.replaceAll("@profBonus", weaponInnerData.proficient ? weaponInnerData.profBonus || 0 : 0);

			//newFormula = newFormula.replaceAll("@enhanceImp", weaponInnerData.proficientI ? this.bracketed(this.commonReplace(weaponInnerData.enhance, actorData, powerInnerData, weaponInnerData, depth-1) || 0) : 0);
			newFormula = newFormula.replaceAll("@enhanceImp", (weaponInnerData.type === 'implement' || weaponInnerData.properties.imp) ? this.bracketed(this.commonReplace(enhValue, actorData, powerInnerData, weaponInnerData, depth-1) || 0) : 0);
			//newFormula = newFormula.replaceAll("@enhance", this.bracketed(this.commonReplace(weaponInnerData.enhance, actorData, powerInnerData, weaponInnerData, depth-1) || 0));
			newFormula = newFormula.replaceAll("@enhance", this.bracketed(this.commonReplace(enhValue, actorData, powerInnerData, weaponInnerData, depth-1) || 0));

			newFormula = this.replaceData (newFormula, weaponInnerData);
			
			
			//deprecated, kept for legacy purposes and because it's really handy for High Crit Weapons!
			// make sure to keep the dice formula same as main.	Definite candidate for a future refactor.
			if(newFormula.includes("@wepDice")) {
				let parts = weaponInnerData.damageDice.parts;
				let indexStart = newFormula.indexOf("@wepDice")+8;
				let indexEnd = newFormula.substring(indexStart).indexOf(")")+1 + indexStart

				let weaponNum = newFormula.substring(indexStart).match(/\(([^)]+)\)/)[1]
				weaponNum = eval(weaponNum.replaceAll(/[a-z]/gi, ''));

				if(typeof(weaponNum) !== "number") weaponNum = 1;

				let dice = "";
				for(let i = 0; i< parts.length; i++) {
					if(!parts[i][0] || !parts[i][1]) continue;

					let quantity = this.commonReplace(parts[i][0], actorData, powerInnerData, weaponInnerData, depth-1);
					let r = new Roll(`${quantity}`);

					if(r.isDeterministic){
						r.evaluateSync();
						quantity = r.total;
					}

					if(weaponInnerData.properties.bru) {
						dice += `(${quantity}*${weaponNum})d${parts[i][1]}rr<=${weaponInnerData.brutal || 1}`;
					}
					else{
						dice += `(${quantity}*${weaponNum})d${parts[i][1]}`;
					}
					if (i < parts.length - 1) dice += '+';
				}
				const possibleDice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
				dice = possibleDice !== 0 ? possibleDice : dice //there probably shouldn't be any formula left, because @wepDice is a formula contents under our command.	So if we had hit the bottom of the recursion tree, just try the original
				newFormula = newFormula.slice(0, indexStart) + newFormula.slice(indexEnd, newFormula.length);
				newFormula = newFormula.replaceAll("@wepDice", dice);
			}
			
			// New method to handle base power dice from dropdown
			// Includes handling of:
			//	-	weapon based damage
			//	-	flat damage
			//	-	dice damage
			// make sure to keep the weapon dice formula same as above.	Definite candidate for a future refactor.
			if(newFormula.includes("@powBase")) {
				let quantity = this.commonReplace(powerInnerData.hit.baseQuantity, actorData, powerInnerData, weaponInnerData, depth-1);
				let r = new Roll(`${quantity}`);

				//Just to help keep the rolls cleaner, look for Deterministic elements to remove
				if(r.isDeterministic){
					r.evaluateSync();
					quantity = r.total;
				}

				let diceType = powerInnerData.hit.baseDiceType.toLowerCase();
				
				if(quantity === "") quantity = 1;
				
				let dice = "";
				
				// Handle Weapon Type Damage
				if(diceType.includes("weapon")){
					let parts = weaponInnerData.damageDice.parts;
					for(let i = 0; i< parts.length; i++) {

						if(!parts[i][0] || !parts[i][1]) continue;

						let weaponDiceQuantity = this.commonReplace(`(${quantity}) * (${parts[i][0]})`, actorData, powerInnerData, weaponInnerData, depth-1);
						let r2 = new Roll(`${weaponDiceQuantity}`);
	
						if(r2.isDeterministic){
							r2.evaluateSync();
							weaponDiceQuantity = r2.total;
						}
						if(weaponInnerData.properties.bru) {
							dice += `${weaponDiceQuantity}d${parts[i][1]}${parts[i][2]}rr<=${weaponInnerData.brutal || 1}`;
						}
						else{
							dice += `${weaponDiceQuantity}d${parts[i][1]}${parts[i][2] || ``}`;// added a null check to i2 hotfix
						}

						if (i < parts.length - 1) dice += '+';
					}
				}
				// Handle Flat Type Damage
				else if(diceType.includes("flat")) {
					dice += `${quantity}`;
				}
				// Handle Dice Type Damage
				else{
					dice += `${quantity}${diceType}`;
				}

				dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1);
				newFormula = newFormula.replaceAll("@powBase", dice);
			}

			if(newFormula.includes("@wepMax")) {
				let parts = weaponInnerData.damageDice.parts;
				let dice = "";
				for(let i = 0; i< parts.length; i++) {
					if(!parts[i][0] || !parts[i][1]) continue;
					dice += `(${parts[i][0]} * ${parts[i][1]})`
					if (i < parts.length - 1) dice += '+';
				}
				dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
				let r = new Roll(`${dice}`)
				if(dice){
					r.evaluateSync({maximize: true});
					newFormula = newFormula.replaceAll("@wepMax", r.result);
				} else {
					newFormula = newFormula.replaceAll("@wepMax", dice);
				}
			}
			
			// New method to handle base power dice from dropdown for critical hits
			// Includes handling of:
			//	-	weapon based damage
			//	-	flat damage
			//	-	dice damage
			if(newFormula.includes("@powMax")) {
				let dice = "";
				let quantity = powerInnerData.hit.baseQuantity;
				quantity = this.commonReplace(quantity, actorData, powerInnerData, weaponInnerData, 0)
				let diceType = powerInnerData.hit.baseDiceType.toLowerCase();
				let rQuantity = new Roll(`${quantity}`)
				// rQuantity.evaluate({maximize: true, async: false});
				rQuantity.evaluateSync({maximize: true});

				//check if is valid number
				if(this._isNumber(rQuantity.total)){
					quantity = rQuantity.total;
				} else {
					quantity = 1;
				}
				

				// Handle Weapon Type Damage
				if(diceType.includes("weapon")){
					let parts = weaponInnerData.damageDice.parts;
						for(let i = 0; i< parts.length; i++) {
							if(!parts[i][0] || !parts[i][1]) continue;
							dice += `(${quantity} * ${parts[i][0]} * ${parts[i][1]})`
							if (i < parts.length - 1) dice += '+';
						}
				}
				// Handle Flat Type Damage
				else if(diceType.includes("flat")) {
					dice += `${quantity}`;
				}
				// Handle Dice Type Damage
				else{
					let diceValue = diceType.match(/\d+/g).join('');
					dice += `${quantity} * ${diceValue}`;
				}
				dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
				newFormula = newFormula.replaceAll("@powMax", dice);
			}
		}
		else {
			// if there is no weapon, then itemLevel becomes power level
			newFormula = newFormula.replaceAll("@itemLevel", powerInnerData?.level ? powerInnerData.level : 0)

			//if no weapon is in use replace the weapon keys with nothing.
			newFormula = newFormula.replaceAll("@wepAttack", "0");
			newFormula = newFormula.replaceAll("@wepDamage", "0");
			newFormula = newFormula.replaceAll("@wepCritBonus", "0");
			
			newFormula = newFormula.replaceAll("@wepDiceNum", "0");
			newFormula = newFormula.replaceAll("@wepDiceDamage", "0");
			
			newFormula = newFormula.replaceAll("@impAttackO", "0" );
			newFormula = newFormula.replaceAll("@impDamageO", "0");

			newFormula = newFormula.replaceAll("@impAttack", "0");
			newFormula = newFormula.replaceAll("@impDamage", "0");

			newFormula = newFormula.replaceAll("@profBonusO", "0");
			newFormula = newFormula.replaceAll("@profImpBonusO", "0");
			
			newFormula = newFormula.replaceAll("@profImpBonus", "0");
			newFormula = newFormula.replaceAll("@profBonus", "0");
			newFormula = newFormula.replaceAll("@enhanceImp", "0");
			newFormula = newFormula.replaceAll("@enhance", "0");

			if(newFormula.includes("@wepDice")) {
				let indexStart = newFormula.indexOf("@wepDice")+8;
				let indexEnd = newFormula.substring(indexStart).indexOf(")")+1 + indexStart

				let weaponNum = newFormula.substring(indexStart).match(/\(([^)]+)\)/)[1]
				weaponNum = eval(weaponNum.replaceAll(/[a-z]/gi, ''));

				if(typeof(weaponNum) !== "number") weaponNum = 1;

				newFormula = newFormula.slice(0, indexStart) + newFormula.slice(indexEnd, newFormula.length);
				newFormula = newFormula.replaceAll("@wepDice", "");
			}

			if(newFormula.includes("@powBase")) {
				let quantity = this.commonReplace(powerInnerData.hit.baseQuantity, actorData, powerInnerData, weaponInnerData, depth-1);
				let diceType = powerInnerData.hit.baseDiceType;

				let r = new Roll(`${quantity}`);
				if(r.isDeterministic){
					r.evaluateSync();
					quantity = r.total;
				}
				
				if(diceType == "weapon"){
					newFormula = newFormula.replaceAll("@powBase", '0');
				} else {
					if(quantity === "") quantity = 1;
				
					let dice = "";
					
					// Handle Flat Type Damage
					if(diceType.includes("flat")) {
						dice += `${quantity}`;
					}
					// Handle Dice Type Damage
					else{
						dice += `${quantity}${diceType}`;
					}
	
					dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
					newFormula = newFormula.replaceAll("@powBase", dice);
				}

			}


			if(newFormula.includes("@powMax")) {
				let dice = "";
				let quantity = powerInnerData.hit.baseQuantity;
				quantity = this.commonReplace(quantity, actorData, powerInnerData, weaponInnerData, 0)
				let diceType = powerInnerData.hit.baseDiceType.toLowerCase();
				let rQuantity = new Roll(`${quantity}`)
				rQuantity.evaluateSync({maximize: true});
				
				if(this._isNumber(rQuantity.total)) {
					quantity = rQuantity.total;
				} else {
					quantity = 1;
				}
				
				// Handle Weapon Type Damage
				if(diceType.includes("weapon") && weaponInnerData){
					let parts = weaponInnerData.damageDice.parts;
						for(let i = 0; i< parts.length; i++) {
							if(!parts[i][0] || !parts[i][1]) continue;
							dice += `(${quantity} * ${parts[i][0]} * ${parts[i][1]})`
							if (i < parts.length - 1) dice += '+';
						}
				}
				// Handle Flat Type Damage
				else if(diceType.includes("flat")) {
					dice += `${quantity}`;
				}
				// Handle Dice Type Damage
				else{
					let diceValue = diceType.match(/\d+/g)?.join('');
					dice += `${quantity} * ${diceValue}`;
				}
				dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
				newFormula = newFormula.replaceAll("@powMax", dice);
			}			
		}

		// this is done at the bottom, because I don't want to be iterating the entire actor effects collection unless I have to
		// as this could get unnecessarily expensive quickly.
		// Depth > 0 check is here to prevent an infinite recursion situation as this will call to common replace in case the variable uses a formula
		// having got to the bottom of common replace, check to see if there are any more @variables left.	If there aren't, then don't bother going any further
		if (actorData?.effects && depth > 0 && newFormula.includes('@')) {
			const debug = game.settings.get("dnd4e", "debugEffectBonus") ? `D&D4e |` : ""
			if (debug) {
				console.log(`${debug} Substituting '${formula}', end of processing produced '${newFormula}' which still contains an @variable.	Searching active effects for a suitable variable`)
			}
			const resultObject = {}
			const effects = actorData.getActiveEffects().filter((effect) => effect?.disabled === false);
			effects.forEach((effect) => {
				effect.changes.forEach((change => {
					if (this.variableRegex.test(change.key)) {
						if (debug) {
							console.log(`${debug} Found custom variable ${change.key} in effect ${effect.name}.	Value: ${change.value}`)
						}
						const changeValueReplaced = this.commonReplace(change.value, actorData, powerInnerData, weaponInnerData, 0) // set depth to avoid infinite recursion
						if (!resultObject[change.key]) {
							resultObject[change.key] = changeValueReplaced
							if (debug) {
								console.log(`${debug} Effect: ${effect.name}.	Computed Value: ${change.value} was the first match to ${change.key} `)
							}
						}
						else {
							if (debug) {
								console.log(`${debug} Effect: ${effect.name}. Computed Value: ${change.value} was an additional match to ${change.key} adding to previous`)
							}
							if(this._isNumber(resultObject[change.key]) && this._isNumber(changeValueReplaced)){
								resultObject[change.key] = Number(resultObject[change.key]) + Number(changeValueReplaced)
							} else {
								resultObject[change.key] = `${resultObject[change.key]} + ${changeValueReplaced}`
							}
						}
					}
				}))
			})

			if (debug) {
				console.log(`${debug} Discovered custom variable values in effects to substitute into formula (${newFormula}): ${JSON.stringify(resultObject)}`)
			}
			for (const [key, value] of Object.entries(resultObject)) {
				newFormula = newFormula.replaceAll(key, value);
			}
		}

		//Temporary, this should be moved into an enrichers class in the future
		const regexTextPattern = /\[\[\/text\s(.*?)\]\]/g;
		newFormula = newFormula.replace(regexTextPattern, (text, r) => {
			let roll = new Roll(`${r}`);

			if(roll.isDeterministic){
				roll.evaluateSync();
				return roll.total;
			}
			return `[[${r}]]`;
		});

		return newFormula;
	}

	/**
	 * Replace referenced data attributes in the roll formula with the syntax `@attr` with the corresponding key from
	 * the provided `data` object. This is a temporary helper function that will be replaced with Roll.replaceFormulaData()
	 * in Foundry 0.7.1.
	 *
	 * @param {String} formula		The original formula within which to replace.
	 * @param {Object} data			 Data object to use for value replacements.
	 * @param {Object} missing		Value to use as missing replacements, such as {missing: "0"}.
	 * @return {String} The formula with attributes replaced with values.
	 */
	static replaceData(formula, data, {missing=null, depth=1}={}) {
		// Exit early if the formula is invalid.
		if ( typeof formula != "string" || depth < 1) {
		return 0;
		}
		// Replace attributes with their numeric equivalents.
		let dataRgx = this.variableRegex
		let rollFormula = formula.replace(dataRgx, (match, term) => {
			let value = foundry.utils.getProperty(data, term);
			// If there was a value returned, trim and return it.
			if ( value || value == 0) {
				return String(value).trim();
			}
			// Otherwise, return either the missing replacement value, or the original @attr string for later replacement.
			else {
				return missing != null ? missing : `@${term}`;
			}
		});
		return rollFormula;
	}

	static evaluate(s) {
		let total = 0;
		s = s.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];

		while (s.length) {
			total += parseFloat(s.shift());
		}
		return total;
	}

	/**
	 * Create and evaluate a roll based on the given roll expression string.	If no expression has been provided, evaluate a roll of 0.
	 * In the event that the string fails to evaluate, display an error and return a roll of 0.
	 *
	 * Note this uses the async roll API so returns a Promise<Roll>
	 *
	 * @param {String} rollString				The roll expression.
	 * @param {String} errorMessageKey			The key that will be localised for the error message if the roll fails.
	 * @param {String} context				Context on the source of the roll string / where it is being used
	 * @returns {Promise<Roll>}					The evaluated Roll instance as a promise
	 */
	static async rollWithErrorHandling(rollString, { errorMessageKey = "DND4E.InvalidRollExpression", context = "" }) {
		if (!errorMessageKey) {
			errorMessageKey = "DND4E.InvalidRollExpression"
		}
		if (rollString && rollString !== "") {
			const roll = new Roll(`${rollString}`);
			// return roll.roll({async : true}).catch(err => {
			return roll.roll().catch(err => {
				let msg = context ? `${game.i18n.localize(errorMessageKey)} (in ${context}) : ${rollString}` : `${game.i18n.localize(errorMessageKey)} : ${rollString}`
				ui.notifications.error(msg);
				console.log(msg)
				console.log(err)
				// return new Roll("0").roll({async : true});
				return new Roll("0").roll();
			});
		}
		else {
			// return new Roll("0").roll({async : true});
			return new Roll("0").roll();
		}
	}

	static _areaValue(chatData, actorData){
		if(chatData.area) {
			try{
				let areaForm = this.commonReplace(`${chatData.area}`, actorData);
				return	Roll.safeEval(areaForm);
			} catch (e) {
				return	chatData.area;
			}
		} else {
			return	0;
		}
	}

	static _preparePowerCardData(chatData, CONFIG, actorData=null, attackTotal=null) {
		let powerSource = (chatData.powersource && chatData.powersource !== "") ? `${CONFIG.DND4E.powerSource[`${chatData.powersource}`]}` : "";
		let powerDetail = `<span class="basics"><span class="usage">${CONFIG.DND4E.powerUseType[`${chatData.useType}`]}</span>`;
		let tag = [];
		
		if(chatData.powersource) tag.push(powerSource);

		if(['melee', 'meleeRanged', 'ranged'].includes(chatData.weaponType) ) {
			tag.push(`Weapon`);
		} 
		else if (chatData.weaponType === "implement") {
			tag.push(`Implement`);
		}

		if (chatData.powersource && chatData.secondPowersource && chatData.secondPowersource != chatData.powersource){
			tag.push(`${CONFIG.DND4E.powerSource[`${chatData.secondPowersource}`]}`)
		}
		
		if(chatData.weaponDamageType) {
			for ( let [damage, d] of Object.entries(chatData.weaponDamageType)) {
				if(d && CONFIG.DND4E.damageTypes[damage]) tag.push(CONFIG.DND4E.damageTypes[damage])
			}
		}
		else if(chatData.damageType) {
			for ( let [damage, d] of Object.entries(chatData.damageType)) {
				if(d && CONFIG.DND4E.damageTypes[damage]) tag.push(CONFIG.DND4E.damageTypes[damage])
			}
		}

		if(chatData.effectType) {
			for ( let [effect, e] of Object.entries(chatData.effectType)) {
				if(e && CONFIG.DND4E.effectTypes[effect]) tag.push(CONFIG.DND4E.effectTypes[effect])
			}
		}
		
		if(chatData?.keywordsCustom){
			const customKeys = chatData.keywordsCustom.split(';');
			customKeys.forEach((item) => tag.push(item));
		}
		
		tag.sort();
		
		if(tag.length > 0) powerDetail += ` ♦ <span class="keywords">${tag.join(', ')}</span>`;
		
		powerDetail += `</span><br /><span><span class="action">${CONFIG.DND4E.abilityActivationTypes[chatData.actionType].label}</span> `;

		if(chatData.rangeType === "weapon") {
			powerDetail += ` <span class="range-type weapon">${CONFIG.DND4E.weaponType[chatData.weaponType]}</span>`;
			if(chatData.rangePower) powerDetail += ` <span class="range-value">${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "melee") {
			powerDetail += ` <span class="range-type melee">${game.i18n.localize("DND4E.Melee")}</span> <span class="range-size">${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "reach") {
			powerDetail += ` <span class="range-type reach">${game.i18n.localize("DND4E.rangeReach")}</span> <span class="range-size">${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "range") {
			powerDetail += ` <span class="range-type ranged">${game.i18n.localize("DND4E.rangeRanged")}</span> <span class="range-size">${chatData.rangePower}</span>`;
			if(chatData.range?.long) powerDetail += `/<span class="range-long">${chatData.range.long}</span>`;
		}
		else if (['closeBurst', 'closeBlast'].includes(chatData.rangeType)) {
			powerDetail += ` <span class="range-type close">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span> <span class="range-size">${this._areaValue(chatData, actorData)}</span>`;
		}
		else if (['rangeBurst', 'rangeBlast', 'wall'].includes(chatData.rangeType)) {
			powerDetail += ` <span class="range-type area">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span> <span class="range-size">${this._areaValue(chatData, actorData)}</span> <span class="label-within">${game.i18n.localize("DND4E.RangeWithin")}</span> <span class="range-within">${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "personal") {
			powerDetail += ` <span class="range-type personal">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span>`;
		}
		else if (chatData.rangeType === "special") {
			powerDetail += ` <span class="range-type special">${CONFIG.DND4E.rangeType[chatData.rangeType].label}</span>`;
		}
		else if (chatData.rangeType === "touch") {
			powerDetail += ` <span class="range-type melee">${game.i18n.localize("DND4E.Melee")}</span> <span class="range-size touch">${game.i18n.localize("DND4E.DistTouch")}</span>`;
		}
		else {
			powerDetail += `</span>`;
		}
		powerDetail += `</span>`;

		if(chatData.requirement) {
			powerDetail += `<p class="requirements"><strong>${game.i18n.localize("DND4E.Requirements")}:</strong> ${chatData.requirement}</p>`;
		}

		if(chatData.trigger) {
			powerDetail += `<p class="trigger"><strong>${game.i18n.localize("DND4E.Trigger")}:</strong> ${chatData.trigger}</p>`;
		}

		if(chatData.target && (typeof chatData.target === "string")) { //target can sometimes be an object for things that did not have a dropdown
			powerDetail += `<p class="target"><strong>${game.i18n.localize("DND4E.Target")}:</strong> ${chatData.target}</p>`;
		}

		if(!chatData.postEffect && chatData.effect.detail) {
			powerDetail += `<p class="effect alt"><strong>${game.i18n.localize("DND4E.Effect")}:</strong> ${chatData.effect.detail}</p>`;
		}
		
		if(!chatData.postSpecial && chatData.special) {
			powerDetail += `<p class="special"><strong>${game.i18n.localize("DND4E.Special")}:</strong> ${chatData.special}</p>`;
			for (let [i, entry] of Object.entries(chatData.specialAdd.parts)){
				powerDetail += `<p class="special multi">${entry}</p>`;
			}
		}

		if(chatData.attack.isAttack) {
			let attackForm = chatData.attack.formula;
			attackForm = chatData.attack.formula.replaceAll('@powerMod',`@${chatData.attack?.ability}Mod`);
			const weapon = Helper.getWeaponUse(chatData, actorData);
			const attackValues = this.commonReplace(attackForm, actorData, chatData, weapon?.system);
			if(!(attackTotal == undefined)){
				//if does not start with a number sign add one
				attackTotal = attackTotal.toString();
				if(!(attackTotal.startsWith("+") || attackTotal.startsWith("-"))) {
					attackTotal = '+' + attackTotal;
				}
			}else if(chatData.attack.ability){
				attackTotal = CONFIG.DND4E.abilities[chatData.attack.ability];
			}else{
				attackTotal = game.i18n.localize("DND4E.Attack");
			}
			
			if(chatData.attack.detail) {
				let attackDetail = chatData.attack.detail.replaceAll('@attackValues', `${attackValues}`);
				attackDetail = attackDetail.replaceAll('@attackTotal', `${attackTotal}`);
				powerDetail += `<p class="attack"><strong>${game.i18n.localize("DND4E.Attack")}:</strong> ${attackDetail}</p>`;
			}
			else {
				if(chatData.attack.ability === "form"){				
					powerDetail += `<p class="attack"><strong>${game.i18n.localize("DND4E.Attack")}:</strong> <a class="attack-bonus" data-tooltip="${attackValues}">${attackTotal}</a>`;
				}
				else if(chatData.attack.ability){
					powerDetail += `<p class="attack"><strong>${game.i18n.localize("DND4E.Attack")}</strong>: <a class="attack-bonus" data-tooltip="`;		
					if(game.settings.get("dnd4e","cardAtkDisplay")=="bonus"){
						powerDetail += `${CONFIG.DND4E.abilities[chatData.attack.ability]} (${attackValues})">${attackTotal}</a>`;
					} else if (game.settings.get("dnd4e","cardAtkDisplay")=="both"){
						powerDetail += `(${attackValues})">${CONFIG.DND4E.abilities[chatData.attack.ability]} (${attackTotal})</a>`;
					} else{
						powerDetail += `${attackTotal} (${attackValues})">${CONFIG.DND4E.abilities[chatData.attack.ability]}</a>`;
					}
				} else {
					powerDetail += `<p class="attack"><strong>${game.i18n.localize("DND4E.Attack")}</strong>: ${game.i18n.localize("DND4E.Attack")}`;
				}
				powerDetail += ` ${game.i18n.localize("DND4E.VS")} ${CONFIG.DND4E.defensives[chatData.attack.def].abbreviation}</p>`;
			}
		}

		if (chatData.hit.detail){
			powerDetail += `<p class="hit alt-highlight"><strong>${game.i18n.localize("DND4E.Hit")}:</strong> ${chatData.hit.detail}</p>`;
		}

		if (chatData.miss.detail){
			powerDetail += `<p class="miss alt-highlight"><strong>${game.i18n.localize("DND4E.Miss")}:</strong> ${chatData.miss.detail}</p>`;
		}

		if(chatData.postEffect && chatData.effect.detail) {
			powerDetail += `<p class="effect alt-highlight"><strong>${game.i18n.localize("DND4E.Effect")}:</strong> ${this.paragraphTrim(chatData.effect.detail)}</p>`;
		}
		if(chatData.postSpecial && chatData.special) {
			powerDetail += `<p class="special alt-highlight"><strong>${game.i18n.localize("DND4E.Special")}:</strong> ${chatData.special}</p>`;
			for (let [i, entry] of Object.entries(chatData.specialAdd.parts)){
				powerDetail += `<p>${entry}</p>`;
			}
		}

		if(chatData.sustain?.actionType !== "none" && chatData.sustain?.actionType) {
			powerDetail += `<p class="sustain alt-highlight"><strong>${game.i18n.localize("DND4E.Sustain")} ${CONFIG.DND4E.abilityActivationTypes[chatData.sustain.actionType].label}:</strong> ${chatData.sustain.detail}</p>`;
		}

		if(actorData){
			powerDetail = this.commonReplace(powerDetail, actorData);
		}
		
		return powerDetail;
	}

	static paragraphTrim(string){
		// Check if the string starts with <p>
		if(string.startsWith('<p>')) {
			// Remove the first occurrence of <p> and </p>
			string = string.replace(/<p>(.*?)<\/p>/, '$1');
		}
		if(string.endsWith('</p>')){
			// Removes the last four characters if they are '</p>'
			string = string.slice(0, -4); 
		}
		return string;
	}
	static _isNumber(str){
		return /^-?\d+$/.test(str);
	}

	static async rechargeItems(actor, targetArray){

		const items = actor.items.filter(item => targetArray.includes(item.system.uses?.per));
		const updateItems = items.map( item => {
			return {
				_id: item.id,
				"system.uses.value": item.system.preparedMaxUses
			};
		});

		if(updateItems) await actor.updateEmbeddedDocuments("Item", updateItems);
	}

	static async endEffects(actor, targetArray){
		const effects = [];
		for(let e of actor.effects){
			if(targetArray.includes(e.flags.dnd4e?.effectData?.durationType)){
				effects.push(e.id);
			}
		}
		if(effects) await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
	}

	static getInitiativeByToken(id){
		if(!game.combat) return 0;
		for(let t of game.combat.turns){
			if(t.tokenId === id){
				return t.initiative
			}
		}

		return game.combat.turns[game.combat.turn]?.initiative || -1;
	}

	static getTokenIdForLinkedActor(actor){
		if(actor.token?.id){
			return actor.token.id;
		}

		const actorId = actor.id;

		if(canvas.tokens.controlled){
			for(let t of canvas.tokens.controlled){
				if(t.actor.id === actorId){
					return t.id;
				}
			}
		}

		if(!game.combat) return null;
		
		if(game.combat.turns[game.combat.turn].actor.id === actorId){
			return game.combat.turns[game.combat.turn].id;
		}

		for(let t of game.combat.turns){
			if(t.actor.id === actorId){
				return t.id;
			}
		}
	}

	static getCurrentTurnInitiative(){
		return game.combat? game.combat.turns[game.combat.turn]?.initiative : 0;
	}

	static async solidifyEffectActorData(effect, parentActor){
		console.log(effect)
		console.log(parentActor)

		//dots
		for(const dot of effect.flags.dnd4e.dots){
			// dot.amount = await this.parseSolidify(dot.amount, parentActor);
			dot.amount = dot.amount.toString().replace(/\$solidify\((.*?)\)/g, (match, value) => {
				return Helper.commonReplace(value, parentActor);
			});
		}

		//changes
		for(const change of effect.changes){
			// change.value = this.parseSolidify(change.value, parentActor);
			change.value = change.value.replace(/\$solidify\((.*?)\)/g, (match, value) => {
				return Helper.commonReplace(value, parentActor);
			});
			console.log(change.value);
		}

	}

	// static async parseSolidify(inputString, parentActor){
	// 	const newVal =  inputString.replace(/\$solidify\((.*?)\)/g, (match, value) => {
	// 		return Helper.commonReplace(value, parentActor);
	// 	});
	// 	return newVal;
	// }

	static async applyEffectsToTokens(effectMap, tokenTarget, condition, parent){

		const combat = game.combat;
		for(let effect of effectMap){
			let e = effect.toObject(); // This is to avoid editing the source effect
			if(e.flags.dnd4e.effectData.powerEffectTypes === condition){
				for(let t of tokenTarget){
					// let effectData = e.data;
					// e.sourceName = parent.name;
					e.origin = parent.uuid;
					this.solidifyEffectActorData(e, parent);
					const duration = e.duration;
					const flags = e.flags;
					duration.combat = combat?.id || "None Combat";
					duration.startRound = combat?.round || 0;
					/*Removing the initial timing calc after 0.6.11 since it's now redundant with the effect's derived data routine

					flags.dnd4e.effectData.startTurnInit =	combat?.turns[combat?.turn]?.initiative || 0;

					const userTokenId = this.getTokenIdForLinkedActor(parent);
					const userInit = this.getInitiativeByToken(userTokenId);
					const targetInit = t ? this.getInitiativeByToken(t.id) : userInit;
					const currentInit = this.getCurrentTurnInitiative();

					if(flags.dnd4e.effectData.durationType === "endOfTargetTurn" || flags.dnd4e.effectData.durationType === "startOfTargetTurn"){
						flags.dnd4e.effectData.durationRound = combat? currentInit > targetInit ? combat.round : combat.round + 1 : 0;
						flags.dnd4e.effectData.durationTurnInit = t ? targetInit : userInit;						
					}
					else if(flags.dnd4e.effectData.durationType === "endOfUserTurn" || flags.dnd4e.effectData.durationType === "startOfUserTurn" ){
						flags.dnd4e.effectData.durationRound = combat? currentInit > userInit ? combat.round : combat.round + 1 : 0;
						flags.dnd4e.effectData.durationTurnInit = userInit;
					}
					else if(flags.dnd4e.effectData.durationType === "endOfUserCurrent") {
						flags.dnd4e.effectData.durationRound = combat? combat.round : 0;
						flags.dnd4e.effectData.durationTurnInit = combat? currentInit : 0;
					}
					else if(flags.dnd4e.effectData.durationType === "custom" && (duration?.rounds || duration?.turns)){
						flags.dnd4e.effectData.durationRound = duration.startRound + (duration?.rounds || 0);
						let initCount = duration?.turns || 0;
						for (const [i, turn] of combat.turns.entries()) {
							if (turn.initiative == currentInit){
								initCount += i;
							}
						}
						initCount = Math.min(initCount,this.duration?.turns,combat.turns.length);
						flags.dnd4e.effectData.durationTurnInit = combat.turns[initCount].initiative;
					}*/

					const newEffectData = {
						name: e.name,
						description: e.description ? e.description : '',
						img: e.img,
						origin: e.origin,
						sourceName: parent.name,
						//"duration": duration, //Not too sure why this fails, but it does
						"duration": {startRound: duration?.startRound, rounds: duration.rounds, turns: duration.turns},
						rounds: duration.rounds,
						turns: duration.turns,
						startRound: duration.startRound,
						statuses: e.statuses,
						tint: e.tint,
						"flags": flags,
						changes: e.changes,
						changesID: e.uuid
					};

					if(e.statuses[0] && game.settings.get("dnd4e","markAutomation")){
						const marks = new Set(['mark_1','mark_2','mark_3','mark_4','mark_5','mark_6','mark_7']);
						const hasMark = marks.intersection(new Set(e.statuses)).size;
						
						if(hasMark){
							// If the effect already has `system.marker` assume it's for a reason
							if(!e.changes.some(c => c.key === 'system.marker')) {
								const changeData = {
									"key": "system.marker",
									"mode": 5,
									"value": e.origin,
									"priority": null
								}							
								newEffectData.changes.push(changeData);
							}
							
							if(t?.actor?.allApplicableEffects){
								for (let effect of t.actor.allApplicableEffects()) {
									if (marks.intersection(effect.statuses).size) effect.delete();
								}
							}
						}
					}

					let actor;
					if(t?.actor){
						actor = t.actor;
					} else { //extra condition for when actors this linked data target self
						actor = parent;
					}

					if(actor.isOwner || game.user.isGM){
						await actor.newActiveEffect(newEffectData);
					} else {
						game.socket.emit('system.dnd4e', {
							actorID: actor.id,
							tokenID: t?.id || null,
							operation: 'applyTokenEffect',
							user: game.user.id,
							scene: canvas.scene.id,
							effectData: newEffectData
						});
					}
					
					console.log(`Effect setup fired for ${e.name} on ${actor.name}.`);
				}
			}
		}
	}

	static async applyEffectsToTargets(effects, actor){
		this.applyAllXEffectsToTokens(effects, actor, game.user.targets)
	}

	/**
	 * Apply All / Ally / Enemy effects to the selection
	 *
	 * @param {EmbeddedCollection} effects The powers effects
	 * @param {Actor} actor The source actor
	 * @param {Set} selection the Tokens to apply to
	 */
	static async applyAllXEffectsToTokens(effects, actor, selection){
		if (selection?.size){
			await this.applyEffectsToTokens(effects, selection, "all", actor);
			const parentDisposition = actor.token?.disposition || actor.prototypeToken.disposition || null;
			await this.applyEffectsToTokens(effects, this.filterActorSetByDisposition(selection, parentDisposition), "allies", actor);
			await this.applyEffectsToTokens(effects, this.filterActorSetByDisposition(selection, parentDisposition, false), "enemies", actor);
		}
	}

	/**
	 * Determine if a fastForward key was held during the given click event.
	 *
	 * @param {Event} event A click event
	 * @returns {boolean} if the click was done while holding down a fastForward key
	 */
	static isUsingFastForwardKey(event) {
		return event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
	}

	static isRollFastForwarded(event) {
		const isModKeyPressed = this.isUsingFastForwardKey(event);
		return game.settings.get("dnd4e","fastFowardSettings") ? !isModKeyPressed : isModKeyPressed;
	}
	
	/**
	/* Function to determine the owner of a document - 
	/* favouring players and falling back to a GM
	/* (pinched from the 5e system for use in the combat loop)
	/* Returns the player object, or the player's ID if 
	/* called with idOnly set to "true"
	/**/
	static firstOwner(doc,idOnly=false){
		// null docs could mean an empty lookup, null docs are not owned by anyone
		if (!doc) return false;

		//const playerOwners = owners.filter(([id, level]) => (!game.users.get(id)?.isGM && game.users.get(id)?.active) && level === 3).map(([id, level])=> id);
		let found;
		
		//First check for an assigned character (but player must be active!)
		game.users.forEach(function (player) {
			if(player.active && player.character?.id === doc.id){
				//console.log(`Player found for ${doc.name}: ${player.id}`);
				found = (idOnly ? player.id : player );
				return;
			}
		});
		if(found) return found;
		
		//If all players have ownership, the GM fallback will be used
		if(doc.ownership['default'] != 3){
		//If no assigned character, check for specific (active) player owner
			const owners = Object.entries(doc.ownership);
			for (const [i, owner] of Object.entries(owners)){
				if (1 !== 0){
					const ownerData = game.users?.get(owner[0]);
					if(!ownerData?.isGM && ownerData?.active && owner[1] === 3){
						//console.log(`Owner of ${doc.name}: ${ownerData.name}`);
						found = (idOnly ? owner : ownerData);
					}
				}
			}
		}
		if(found) return found;

		// If we have no valid player, fall back to first GM
		//console.log(`No valid owner found for ${doc.name}, using GM fallback`);
		const firstGM = game.users.find(u => u.isGM && u.active);
		return ( idOnly ? firstGM.id : firstGM );
	}
	
	/**
	 * Function to return the sum of the highest positive value 
	 * and the lowest negative value in a given set.
	 * Intended for getting the correct value from multiple 
	 * resistances and vulnerabilities.
	 */
	static sumExtremes(values = []){
		if (!values.length) return;
		let negatives = [0], positives = [0];
		for (let v of values){
			if (v === 0) continue;
			if ( v < 0 ){
				//console.log(`negative: ${v}`)
				negatives.push(v);
			} else {
				//console.log(`positive: ${v}`)
				positives.push(v);
			}
		}
		return Math.max(...positives) + Math.min(...negatives);
	}

	/**
	 * Determine if a fastForward key was held during the given click event.
	 *
	 * @param {actorSet} set Actors
	 * @param {disposition} string disposition value to keep
	 * @param {same} boolean match based on same or diffrent disposition
	 * @returns {set} New set of matching disposition
	 */

	static filterActorSetByDisposition(actorSet, disposition, same=true) {
		if(disposition === null){
			return [];
		}
		const filteredSet = new Set();
		for (const actor of actorSet) {
			if((actor.document?.disposition === disposition) === same) {
				filteredSet.add(actor);
			}
		}
		return filteredSet;
	}

	static hasEffects(power, effects) {
		const foundEffects = power.item.effects.contents.filter(e => effects.includes(e.flags.dnd4e.effectData.powerEffectTypes));
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
	static findKeyScale(input, scale, offsetNumber=0){
		input-=offsetNumber;
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
				if (!nextKey || input < nextKey) {
					result = scale[key];
					break;
				}
			}
		}
		return `${result}`;
	}
	
	/**
	 * Helper function to convert an initiative with decimal points to a human-friendly round number with tooltip.
	 * @param {string} initiative			The roll result
	 * @returns {string|void}
	 */
	static initTooltip(init=null){
		if(!init) return "";
		
		try{
			let rollparts = init.toString().split('.');
			
			if(rollparts.length != 2) return init;
			
			rollparts[2] = rollparts[1].substr(2,2);
			rollparts[1] = rollparts[1].substr(0,2);
			const tiebreaker = game.settings.get("dnd4e", "initiativeDexTiebreaker");
			let html = `<span class="init-tiebroken" data-tooltip="${game.i18n.localize("DND4EUI.Tiebreaker")}: `;
			
			if (tiebreaker === 'system') {
				html += `[${game.i18n.localize("DND4E.InitiativeScore")}] ${rollparts[1]}, `;
			} else if (tiebreaker === 'dex') {
				html += `[${game.i18n.localize("DND4E.AbilityDex")}] ${rollparts[1]}, `;
			}
			html += `[${game.i18n.localize("SETTINGS.4eInitTBRand")}] ${rollparts[2]}">${rollparts[0]}</span>`;
			
			return html;
		}catch(e){
			console.warn(`Failed to create initiative tooltip: ${e}`);
			return "";
		}
	}

	static tokensForActor(actor) {
		if (!(actor instanceof Actor))
			return undefined;
		if (actor.token)
			return [actor.token.object];
		const tokens = actor.getActiveTokens();
		if (!tokens.length)
			return undefined;
		const controlled = tokens.filter(t => t.controlled);
		return controlled.length ? controlled : tokens;
	}

	static tokenForActor(actor) {
		const tokens = this.tokensForActor(actor);
		if (!tokens)
			return undefined;
		return tokens[0];
	}

	static getPlaceable(tokenRef) {
		if (!tokenRef)
			return undefined;
		if (tokenRef instanceof PlaceableObject)
			return tokenRef;
		let entity = tokenRef;
		if (typeof tokenRef === "string") {
			entity = fromUuidSync(tokenRef);
		}
		if (entity instanceof PlaceableObject)
			return entity;
		if (entity.object instanceof PlaceableObject)
			return entity.object;
		if (entity instanceof Actor)
			return this.tokenForActor(entity);
		if (entity instanceof Item && entity.parent instanceof Actor)
			return this.tokenForActor(entity.parent);
		if (entity instanceof ActiveEffect && entity.parent instanceof Actor)
			return this.tokenForActor(entity.parent);
		if (entity instanceof ActiveEffect && entity.parent instanceof Item)
			return this.tokenForActor(entity.parent?.parent);
		return undefined;
	}

	static measureDistances(segments, options = {}) {
		let isGridless = canvas?.grid?.constructor.name === "GridlessGrid";
		if (!isGridless || !options.gridSpaces || !canvas?.grid) {
			return segments.map(s => canvas?.grid?.measurePath([s.ray.A, s.ray.B])).map(d => d.distance);
			;
		}
		if (!canvas?.grid)
			return 0;
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
			}
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
				return { ray: new Ray(aCenter, bCenter) };
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
	*** gets the shortest distance betwen two tokens taking into account both tokens size
	*** if wallblocking is set then wall are checked
	**/
	static computeDistance(t1 /*Token*/, t2 /*Token*/, wallsBlock = false ) {
		if (!canvas || !canvas.scene)
			return -1;
		if (!canvas.grid || !canvas.dimensions)
			return -1;
		t1 = this.getPlaceable(t1);
		t2 = this.getPlaceable(t2);
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
						if (x > t1StartX && x < t1DocWidth - t1StartX) {
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
								if (x1 > t2StartX && x1 < t2DocWidth - t2StartX) {
									// skip to the last y position;
									y1 = t2DocHeight - t2StartY;
								}
							}
							const point = canvas.grid.getCenterPoint({ x: Math.round(t2.document.x + (canvas.dimensions.size * x1)), y: Math.round(t2.document.y + (canvas.dimensions.size * y1)) });
							let dest = new PIXI.Point(point.x, point.y);
							const r = new Ray(origin, dest);
							if (wallsBlock) {
								let collisionCheck;
								collisionCheck = CONFIG.Canvas.polygonBackends.sight.testCollision(origin, dest, { source: t1.document, mode: "any", type: "sight" });
								if (collisionCheck)
									continue;
								break;
							}
							segments.push({ ray: r });
						}
					}
				}
			}
			if (segments.length === 0) {
				return -1;
			}
			rdistance = segments.map(ray => this.measureDistances([ray], { gridSpaces: true }));
			distance = Math.min(...rdistance);
		}
		else {
			const w = t2.document;
			let closestPoint = foundry.utils.closestPointToSegment(t1.center, w.object.edge.a, w.object.edge.b);
			distance = this.measureDistances([{ ray: new Ray(t1.center, closestPoint) }], { gridSpaces: true });
		}
		return Math.max(distance, 0);
	}
}

export async function handleApplyEffectToToken(data){
	if(!game.user.isGM){
		return;
	}
	console.log(data)
	console.log(game.scenes.get(data.scene))
	const effectData = data.effectData;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	await actor.newActiveEffectSocket(effectData);
}

export async function handleDeleteEffectToToken(data){
	if(!game.user.isGM){
		return;
	}

	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	await actor.deleteActiveEffectSocket(data.toDelete);
}

export async function handlePromptEoTSaves(data) {
	//console.log('handler reached');
	if (game.userId !== data?.targetUser) return;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	
	await actor.promptEoTSavesSocket();
}

export async function handleAutoDoTs(data) {
	if(!game.user.isGM) return;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);

	await actor.autoDoTsSocket(data.tokenID);
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
Handlebars.registerHelper('contains', function(lunch, lunchbox, meal) {
	try{
		if(typeof meal != "string") {
			if(lunchbox instanceof Array) return lunchbox.includes(lunch);
			if(lunchbox instanceof Set) return lunchbox.has(lunch);
			//Test for object last, because arrays are also objects... heck you too Javascript >:<
			if(lunchbox instanceof Object) return lunchbox.hasOwnProperty(lunch);
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

Handlebars.registerHelper("isActive", function(effect){
	return !effect.disabled && !effect.isSuppressed;
});

Handlebars.registerHelper("getSourceName", function(effect){
	return effect.sourceName === "Unknown" ? effect.parent.name : effect.sourceName;
});

Handlebars.registerHelper("needsEffectButton", function(power){
	return Helper.hasEffects(power, ["all", "allies", "enemies"])
});

Handlebars.registerHelper("needsHitEffectButton", function(power){
	return Helper.hasEffects(power, ["hit"])
});

Handlebars.registerHelper("needsMissEffectButton", function(power){
	return Helper.hasEffects(power, ["miss"])
});

Handlebars.registerHelper("needsHitOrMissEffectButton", function(power){
	return Helper.hasEffects(power, ["hitOrMiss"])
});

Handlebars.registerHelper("applyEffectsToSelection", function(){
	return game.settings.get("dnd4e","applyEffectsToSelection")
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
		if ( localize ) label = game.i18n.localize(label);
		html += `<option value="${name}" ${chosen ? "selected" : ""}>${label}</option>`;
	};

	// Create a group
	const group = category => {
		let label = category[labelAttr];
		if ( localize ) game.i18n.localize(label);
		html += `<optgroup label="${label}">`;
		children(category[childrenAttr]);
		html += "</optgroup>";
	};

	// Add children
	const children = children => {
		for ( let [name, child] of Object.entries(children) ) {
			if ( child[childrenAttr] ) group(child);
			else option(name, child[labelAttr], child[chosenAttr] ?? false);
		}
	};

	// Create the options
	let html = "";
	if ( blank !== null ) option("", blank);
	children(choices);
	return new Handlebars.SafeString(html);
}

	/* -------------------------------------------- */
	
	/**
	 * Register custom Handlebars helpers used by 4e.
	 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		getProperty: foundry.utils.getProperty,
		"DND4E-concealSection": concealSection,
		"DND4E-dataset": dataset,
		"DND4E-groupedSelectOptions": groupedSelectOptions,
		"DND4E-linkForUuid": (uuid, options) => linkForUuid(uuid, options.hash),
		"DND4E-itemContext": itemContext,
		"DND4E-numberFormat": (context, options) => formatNumber(context, options.hash),
		"DND4E-textFormat": formatText
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
export function preLocalize(configKeyPath, { key, keys=[], sort=false }={}) {
	if ( key ) keys.unshift(key);
	_preLocalizationRegistrations[configKeyPath] = { keys, sort };
}
	
/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config	The `CONFIG.DND4E` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
	for ( const [keyPath, settings] of Object.entries(_preLocalizationRegistrations) ) {
		const target = foundry.utils.getProperty(config, keyPath);
		if ( !target ) continue;
		_localizeObject(target, settings.keys);
		if ( settings.sort ) foundry.utils.setProperty(config, keyPath, sortObjectEntries(target, settings.keys[0]));
	}

	// Localize & sort status effects
	CONFIG.statusEffects.forEach(s => s.name = game.i18n.localize(s.name));
	// CONFIG.statusEffects.sort((lhs, rhs) =>
	//	 lhs.id === "dead" ? -1 : rhs.id === "dead" ? 1 : lhs.name.localeCompare(rhs.name, game.i18n.lang)
	// );
}
	
/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj			 The configuration object to localize.
 * @param {string[]} [keys]	List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
	for ( const [k, v] of Object.entries(obj) ) {
		const type = typeof v;
		if ( type === "string" ) {
			obj[k] = game.i18n.localize(v);
			continue;
		}

		if ( type !== "object" ) {
			console.error(new Error(
				`Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`
			));
			continue;
		}
		if ( !keys?.length ) {
			console.error(new Error(
				"Localization keys must be provided for pre-localizing when target is an object."
			));
			continue;
		}

		for ( const key of keys ) {
			const value = foundry.utils.getProperty(v, key);
			if ( !value ) continue;
			foundry.utils.setProperty(v, key, game.i18n.localize(value));
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
export function getHumanReadableAttributeLabel(attr, { actor }={}) {
	// Check any actor-specific names first.
	if ( attr.startsWith("resources.") && actor ) {
		const resource = foundry.utils.getProperty(actor, `system.${attr}`);
		if ( resource.label ) return resource.label;
	}

	if ( (attr === "details.xp.value") && (actor?.type === "npc") ) {
		return game.i18n.localize("DND4E.ExperiencePointsValue");
	}

	if ( attr.startsWith(".") && actor ) {
		const item = fromUuidSync(attr, { relative: actor });
		return item?.name ?? attr;
	}

	// Check if the attribute is already in cache.
	let label = _attributeLabelCache.get(attr);
	if ( label ) return label;

	// Derived fields.
	if ( attr === "attributes.init.total" ) label = "DND4E.InitiativeBonus";
	else if ( attr === "attributes.ac.value" ) label = "DND4E.ArmorClass";
	else if ( attr === "attributes.spelldc" ) label = "DND4E.SpellDC";

	// Abilities.
	else if ( attr.startsWith("abilities.") ) {
		const [, key] = attr.split(".");
		label = game.i18n.format("DND4E.AbilityScoreL", { ability: CONFIG.DND4E.abilities[key].label });
	}

	// Skills.
	else if ( attr.startsWith("skills.") ) {
		const [, key] = attr.split(".");
		label = game.i18n.format("DND4E.SkillPassiveScore", { skill: CONFIG.DND4E.skills[key].label });
	}

	// Spell slots.
	else if ( attr.startsWith("spells.") ) {
		const [, key] = attr.split(".");
		if ( !/spell\d+/.test(key) ) label = `DND4E.SpellSlots${key.capitalize()}`;
		else {
			const plurals = new Intl.PluralRules(game.i18n.lang, {type: "ordinal"});
			const level = Number(key.slice(5));
			label = game.i18n.format(`DND4E.SpellSlotsN.${plurals.select(level)}`, { n: level });
		}
	}

	// Attempt to find the attribute in a data model.
	if ( !label ) {
		const { CharacterData, NPCData, VehicleData, GroupData } = DND4E.dataModels.actor;
		for ( const model of [CharacterData, NPCData, VehicleData, GroupData] ) {
			const field = model.schema.getField(attr);
			if ( field ) {
				label = field.label;
				break;
			}
		}
	}

	if ( label ) {
		label = game.i18n.localize(label);
		_attributeLabelCache.set(attr, label);
	}

	return label;
}
