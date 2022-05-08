
export class Helper {

	static executeMacro(item) {
		const macro = new Macro ({
			name : item.name,
			type : item.data.data.macro.type,
			scope : item.data.data.macro.scope,
			command : item.data.data.macro.command, //cmd,
			author : game.user.id
		})
		// below vars are not part of the Macro data object so need to be set manually
		// CODE SMELL
		// data.item has historically been item.data
		// data.actor has historically been the actor
		// changing that would break existing macros that rely on item data.  I would like to make data.item = the item.
		// can still get to the item using .document
		macro.data.item = item.data
		macro.data.actor = item.actor //needs to be actor and not data to get at actors items collection - e.g. other items
		macro.data.launch = item.data.data.macro.launchOrder;
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
		s = s.replace(/^\./, '');           // strip a leading dot
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
			return actor.itemTypes.weapon.find((i) =>  {
				if(i.data.data.equipped) {

					if(itemData.weaponType === "any") {
						return i;
					}
					
					if(itemData.weaponType === "meleeRanged") {
						if(setMelee.includes(i.data.data.weaponType) || setRanged.includes(i.data.data.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "melee") {
						if(setMelee.includes(i.data.data.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default") 
								return i;
					}
					else if(itemData.weaponType === "ranged") {
						if(setRanged.includes(i.data.data.weaponType) || i.data.data.properties.tlg || i.data.data.properties.thv )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "implement") {
						if(i.data.data.properties.imp || i.data.data.properties.impA || i.data.data.properties.impD )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					// else if(itemData.weaponType === "implementA") {
						// if(i.data.data.properties.imp || i.data.data.properties.impA )
							// if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
								// return i;
							// else if(itemData.weaponUse === "default")
								// return i;
					// }
					// else if(itemData.weaponType === "implementD") {
						// if(i.data.data.properties.imp || i.data.data.properties.impD )
							// if(itemData.weaponUse === "defaultOH" && (i.data.data.weaponHand === "hOff"))
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
		const powerNeedsAWeapon = itemData.weaponType && itemData.weaponType !== "none" && itemData.weaponType !== "implement" && itemData.weaponUse !== "none"
		return !weaponUse && powerNeedsAWeapon
	}

	static get variableRegex() {
		return new RegExp(/@([a-z.0-9_\-]+)/gi);
	}


	static async applyEffects(arrayOfParts, rollData, actorData, powerData, weaponData = null, effectType) {
		const debug = game.settings.get("dnd4e", "debugEffectBonus") ? `D&D4eBeta |` : ""
		if (actorData.effects) {
			const powerInnerData = powerData.data
			const weaponInnerData = weaponData?.data
			if (debug) {
				console.log(`${debug} Debugging ${effectType} effects for ${powerData.name}.  Supplied Weapon: ${weaponData?.name}`)
			}

			const effectsToProcess = []
			const effects = Array.from(actorData.effects.values()).filter((effect) => effect.data.disabled === false)
			effects.forEach((effect) => {
				effect.data.changes.forEach((change => {
					if (change.key.startsWith(`power.${effectType}`) || (weaponInnerData && change.key.startsWith(`weapon.${effectType}`))) {
						effectsToProcess.push({
							name : effect.data.label,
							key: change.key,
							value: change.value
						})
					}
				}))
			})
			if (effectsToProcess.length > 0) {
				if (debug) {
					console.log(`${debug} Found the following possible active effects`)
					effectsToProcess.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`))
				}

				const suitableKeywords = []
				this._addKeywords(suitableKeywords, powerInnerData.damageType)
				this._addKeywords(suitableKeywords, powerInnerData.effectType)
				if (weaponInnerData) {
					this._addKeywords(suitableKeywords, weaponInnerData.weaponGroup)
					this._addKeywords(suitableKeywords, weaponInnerData.properties)
					this._addKeywords(suitableKeywords, weaponInnerData.damageType)
					this._addKeywords(suitableKeywords, weaponInnerData.implementGroup)
				}

				if (powerInnerData.powersource) {
					suitableKeywords.push(powerInnerData.powersource)
				}
				if (powerInnerData.secondPowersource) {
					suitableKeywords.push(powerInnerData.secondPowersource)
				}

				if (debug) {
					console.log(`${debug} based on power source, effect type, damage type and (if weapon) weapon group, properties and damage type the following effect keys are suitable`)
					suitableKeywords.sort()
					console.log(`${debug} ${suitableKeywords.join(", ")}`)
				}

				// filter out to just the relevant effects by keyword
				const matchingEffects = effectsToProcess.filter((effect) => {
					for (const keyword of suitableKeywords) {
						if (effect.key.includes(`${effectType}.${keyword}`)) {
							return true
						}
					}
					return false
				})

				if (debug) {
					console.log(`${debug} The following effects were deemed suitable by keyword filter`)
					matchingEffects.forEach((effect) => console.log(`${debug} ${effect.name} : ${effect.key} = ${effect.value}`))
				}

				const newParts = {}
				for (const effect of matchingEffects) {
					const keyParts = effect.key.split(".")
					if (keyParts.length === 4) {
						const bonusType = keyParts[3]
						const effectValueString = this.commonReplace(effect.value, actorData, powerData.data, weaponData?.data)
						const effectDice = await this.rollWithErrorHandling(effectValueString, {context : effect.key})
						const effectValue = effectDice.total
						if (bonusType === "untyped") {
							if (newParts["untypedEffectBonus"]) {
								newParts["untypedEffectBonus"] = newParts["untypedEffectBonus"] + effectValue
								if (debug) {
									console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue}: Additional untyped Bonus.  They Stack.`)
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
										console.log(`${debug} ${effect.name} : ${effect.key} => ${effect.value} = ${effectValue} : Is not great than existing ${bonusType}, discarding`)
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
						ui.notifications.warn(`Tried to process an bonus effect that had too few/many .'s in it: ${effect.key}: ${effect.value}`)
						console.log(`Tried to process an bonus effect that had too few/many .'s in it: ${effect.key}: ${effect.value}`)
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
					suitableKeywords.push(key)
				}
			}
		}
	}

	/**
	 * Perform replacement of @variables in the formula involving a power.  This is a recursive function with 2 modes of operation!
	 *
	 * @param formula The formula to examine and perform replacements on
	 * @param actorData The data from the actor to use to resolve variables: `actor.data`.  This may be null
	 * @param powerInnerData The data from the power to use to resolve variables. `power.data.data`
	 * @param weaponInnerData The data from the weapon to use to resolve variables.  `item.data.data` This may be null
	 * @param depth The number of times to recurse down the formula to replace variables, a safety net to stop infinite recursion.  Defaults to 1 which will produce 2 loops.  A depth of 0 will also prevent evaluation of custom effect variables (as that is an infinite hole)
	 * @param returnDataInsteadOfFormula If set to true it will return a data object of replacement variables instead of the formula string
	 * @return {String|{}|number} "0" if called with a depth of <0, A substituted formula string if called with returnDataInsteadOfFormula = false (the default) or an object of {variable = value} if called with returnDataInsteadOfFormula = true
	 */
	// DEVELOPER: Remember this call is recursive, if you change the method signature, make sure you update everywhere its used!
	static commonReplace (formula, actorData, powerInnerData, weaponInnerData=null, depth = 1, returnDataInsteadOfFormula = false) {
		if (depth < 0 ) return 0;
		let newFormula = formula;
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
			const actorInnerData = actorData.data
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
			}
			else {
				console.log("An actor data object without a .data property was passed to common replace. Probably passed actor.data.data by mistake!.  Replacing: " + formula)
			}
		}

		newFormula = newFormula.replaceAll("@powerLevel", powerInnerData?.level ? powerInnerData.level : 0)

		if(weaponInnerData) {
			newFormula =  newFormula.replaceAll("@itemLevel", weaponInnerData.level ? weaponInnerData.level : 0)

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
			newFormula = newFormula.replaceAll("@enhanceImp", weaponInnerData.proficientI ? weaponInnerData.enhance || 0 : 0);
			newFormula = newFormula.replaceAll("@enhance", weaponInnerData.enhance || 0);
			

			newFormula = this.replaceData (newFormula, weaponInnerData);
			
			
			//deprecated, kept for legacy purposes and because it's really handy for High Crit Weapons!
			// make sure to keep the dice formula same as main.  Definite candidate for a future refactor.
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
					if(weaponInnerData.properties.bru) {
						// dice += ` + (${parts[i][0]}*${weaponNum})d(${parts[i][1] - weaponData.brutal}) + (${weaponData.brutal}*${parts[i][0]}*${weaponNum})`;
						dice += `(${parts[i][0]}*${weaponNum})d${parts[i][1]}rr<${weaponInnerData.brutal || 1}`;
					}
					else{
						dice += `(${parts[i][0]}*${weaponNum})d${parts[i][1]}`;
					}
					if (i < parts.length - 1) dice += '+';
				}
				const possibleDice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
				dice = possibleDice !== 0 ? possibleDice : dice //there probably shouldn't be any formula left, because @wepDice is a formula contents under our command.  So if we had hit the bottom of the recursion tree, just try the original
				newFormula = newFormula.slice(0, indexStart) + newFormula.slice(indexEnd, newFormula.length);
				newFormula = newFormula.replaceAll("@wepDice", dice);
			}
			
			// New method to handle base power dice from dropdown
			// Includes handling of:
			//	-	weapon based damage
			//	-	flat damage
			//	-	dice damage
			// make sure to keep the weapon dice formula same as above.  Definite candidate for a future refactor.
			if(newFormula.includes("@powBase")) {
				let quantity = powerInnerData.hit.baseQuantity;
				let diceType = powerInnerData.hit.baseDiceType.toLowerCase();
				
				if(quantity === "") quantity = 1;
				
				let dice = "";
				
				// Handle Weapon Type Damage
				if(diceType.includes("weapon")){
					let parts = weaponInnerData.damageDice.parts;
					for(let i = 0; i< parts.length; i++) {
						if(!parts[i][0] || !parts[i][1]) continue;
						if(weaponInnerData.properties.bru) {
							dice += `(${quantity} * ${parts[i][0]})d${parts[i][1]}${parts[i][2]}rr<${weaponInnerData.brutal || 1}`;
						}
						else{

							// dice += `(${quantity} * ${parts[i][0]})d${parts[i][1]}${parts[i][2]}`;
							dice += `(${quantity} * ${parts[i][0]})d${parts[i][1]}${parts[i][2] || ``}`;// added a null check to i2 hotfix
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

				dice = this.commonReplace(dice, actorData, powerInnerData, weaponInnerData, depth-1)
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
					r.evaluate({maximize: true, async: false});
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
				rQuantity.evaluate({maximize: true, async: false});

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
				let quantity = powerInnerData.hit.baseQuantity;
				let diceType = powerInnerData.hit.baseDiceType;
				
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
				let diceType = powerInnerData.hit.baseDiceType.toLowerCase();
				let rQuantity = new Roll(`${quantity}`)
				rQuantity.evaluate({maximize: true, async: false});
				
				if(this._isNumber(rQuantity.result)) {
					quantity = rQuantity.result;
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

		// this is done at the bottom, because I don't want to iterating the entire actor effects collection unless I have to
		// as this could get unnecessarily expensive quickly.
		// Depth > 0 check is here to prevent an infinite recursion situation as this will call to common replace in case the variable uses a formula
		// having got to the bottom of common replace, check to see if there are any more @variables left.  If there aren't, then don't bother going any further
		if (actorData?.effects && depth > 0 && newFormula.includes('@')) {
			const debug = game.settings.get("dnd4e", "debugEffectBonus") ? `D&D4eBeta |` : ""
			if (debug) {
				console.log(`${debug} Substituting '${formula}', end of processing produced '${newFormula}' which still contains an @variable.  Searching active effects for a suitable variable`)
			}
			const resultObject = {}
			const effects = Array.from(actorData.effects.values()).filter((effect) => effect.data?.disabled === false);
			effects.forEach((effect) => {
				effect.data.changes.forEach((change => {
					if (this.variableRegex.test(change.key)) {
						if (debug) {
							console.log(`${debug} Found custom variable ${change.key} in effect ${effect.data.label}.  Value: ${change.value}`)
						}
						const changeValueReplaced = this.commonReplace(change.value, actorData, powerInnerData, weaponInnerData, 0) // set depth to avoid infinite recursion
						if (!resultObject[change.key]) {
							resultObject[change.key] = changeValueReplaced
							if (debug) {
								console.log(`${debug} Effect: ${effect.data.label}.  Computed Value: ${change.value} was the first match to ${change.key} `)
							}
						}
						else {
							if (debug) {
								console.log(`${debug} Effect: ${effect.data.label}. Computed Value: ${change.value} was an additional match to ${change.key} adding to previous`)
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

		return newFormula;
	}

  /**
   * Replace referenced data attributes in the roll formula with the syntax `@attr` with the corresponding key from
   * the provided `data` object. This is a temporary helper function that will be replaced with Roll.replaceFormulaData()
   * in Foundry 0.7.1.
   *
   * @param {String} formula    The original formula within which to replace.
   * @param {Object} data       Data object to use for value replacements.
   * @param {Object} missing    Value to use as missing replacements, such as {missing: "0"}.
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
			let value = getProperty(data, term);
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
	 * Create and evaluate a roll based on the given roll expression string.  If no expression has been provided, evaluate a roll of 0.
	 * In the event that the string fails to evaluate, display an error and return a roll of 0.
	 *
	 * Note this uses the async roll API so returns a Promise<Roll>
	 *
	 * @param {String} rollString    		The roll expression.
	 * @param {String} errorMessageKey      The key that will be localised for the error message if the roll fails.
	 * @param {String} context				Context on the source of the roll string / where it is being used
	 * @returns {Promise<Roll>}    			The evaluated Roll instance as a promise
	 */
	static async rollWithErrorHandling(rollString, { errorMessageKey = "DND4EBETA.InvalidRollExpression", context = "" }) {
		if (!errorMessageKey) {
			errorMessageKey = "DND4EBETA.InvalidRollExpression"
		}
		if (rollString && rollString !== "") {
			const roll = new Roll(rollString);
			return roll.roll({async : true}).catch(err => {
				let msg = context ? `${game.i18n.localize(errorMessageKey)} (in ${context}) : ${rollString}` : `${game.i18n.localize(errorMessageKey)} : ${rollString}`
				ui.notifications.error(msg);
				console.log(msg)
				console.log(err)
				return new Roll("0").roll({async : true});
			});
		}
		else {
			return new Roll("0").roll({async : true});
		}
	}

	static _areaValue(chatData, actorData){
		if(chatData.area) {
			try{
				let areaForm = this.commonReplace(`${chatData.area}`, actorData);
				return  Roll.safeEval(areaForm);
			} catch (e) {
				return  chatData.area;
			}
		} else {
			return  0;
		}
	}

	static _preparePowerCardData(chatData, CONFIG, actorData=null) {
		let powerSource = (chatData.powersource && chatData.powersource !== "") ? ` ♦ ${CONFIG.DND4EBETA.powerSource[`${chatData.powersource}`]}` : ""
		let powerDetail = `<span><b>${CONFIG.DND4EBETA.powerUseType[`${chatData.useType}`]}${powerSource}`;
		let tag = [];

		if(['melee', 'meleeRanged', 'ranged'].includes(chatData.weaponType) ) {
			tag.push(`Weapon`);
		} 
		else if (chatData.weaponType === "implement") {
			tag.push(`Implement`);
		}

		if (chatData.powersource && chatData.secondPowersource && chatData.secondPowersource != chatData.powersource){
			tag.push(`${CONFIG.DND4EBETA.powerSource[`${chatData.secondPowersource}`]}`)
		}

		if(chatData.damageType) {
			for ( let [damage, d] of Object.entries(chatData.damageType)) {
				if(d && CONFIG.DND4EBETA.damageTypes[damage]) tag.push(CONFIG.DND4EBETA.damageTypes[damage])
			}
		}
		if(chatData.effectType) {
			for ( let [effect, e] of Object.entries(chatData.effectType)) {
				if(e && CONFIG.DND4EBETA.effectTypes[effect]) tag.push(CONFIG.DND4EBETA.effectTypes[effect])
			}
		}
		tag.sort();
		powerDetail += tag.length > 0 ? `, ${tag.join(', ')}</b></span>` : `</b></span>`;
		
		powerDetail += `<br><span><b>${CONFIG.DND4EBETA.abilityActivationTypes[chatData.actionType]} •`;

		if(chatData.rangeType === "weapon") {
			powerDetail += ` ${CONFIG.DND4EBETA.weaponType[chatData.weaponType]}`;
			chatData.rangePower ? powerDetail += `</b> ${chatData.rangePower}</span>` : powerDetail += `</b></span>`;
		}
		else if (chatData.rangeType === "melee") {
			powerDetail += ` ${game.i18n.localize("DND4EBETA.Melee")}</b> ${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "reach") {
			powerDetail += ` ${game.i18n.localize("DND4EBETA.rangeReach")}</b> ${chatData.rangePower}</span>`;
		}
		else if (chatData.rangeType === "range") {
			powerDetail += ` ${game.i18n.localize("DND4EBETA.rangeRanged")}</b> ${chatData.rangePower}</span>`;
		}
		else if (['closeBurst', 'closeBlast'].includes(chatData.rangeType)) {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]} ${this._areaValue(chatData, actorData)}</b></span>`;
		}
		else if (['rangeBurst', 'rangeBlast', 'wall'].includes(chatData.rangeType)) {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]} ${this._areaValue(chatData, actorData)}</b> ${game.i18n.localize("DND4EBETA.RangeWithin")} <b>${chatData.rangePower}</b></span>`;
		}
		else if (chatData.rangeType === "personal") {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]}</b></span>`;
		}
		else if (chatData.rangeType === "special") {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]}</b></span>`;
		}
		else if (chatData.rangeType === "touch") {
			powerDetail += ` ${game.i18n.localize("DND4EBETA.Melee")} ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]}</b></span>`;
		}
		else {
			powerDetail += `</b></span>`;
		}

		if(chatData.requirement) {
			powerDetail += `<p span><b>${game.i18n.localize("DND4EBETA.Requirements")}:</b> ${chatData.requirement}</span></p>`;
		}

		if(chatData.trigger) {
			powerDetail += `<p span><b>${game.i18n.localize("DND4EBETA.Trigger")}:</b> ${chatData.trigger}</span></p>`;
		}

		if(chatData.target && (typeof chatData.target === "string")) { //target can sometimes be an object for things that did not have a dropdown
			powerDetail += `<p span><b>${game.i18n.localize("DND4EBETA.Target")}:</b> ${chatData.target}</span></p>`;
		}

		if(!chatData.postEffect && chatData.effect.detail) {
			powerDetail += `<p class="alt"><b>${game.i18n.localize("DND4EBETA.Effect")}:</b> ${chatData.effect.detail}</p>`;
		}
		
		if(!chatData.postSpecial && chatData.special) {
			powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Special")}:</b> ${chatData.special}</p>`;
			for (let [i, entry] of Object.entries(chatData.specialAdd.parts)){
				powerDetail += `<p>${entry}</p>`;
			}
		}

		if(chatData.attack.isAttack) {
			if(chatData.attack.ability === "form"){
				//if does not srtart with a number sign add one
				let trimmedForm = chatData.attack.formula.trim()
				if(!(trimmedForm.startsWith("+") || trimmedForm.startsWith("-"))) {
					trimmedForm = '+' + trimmedForm;
				}
				powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Attack")}</b>: ${trimmedForm} ${game.i18n.localize("DND4EBETA.VS")} ${CONFIG.DND4EBETA.def[chatData.attack.def]}</p>`;
			}
			else if(chatData.attack.ability){
				powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Attack")}</b>: ${CONFIG.DND4EBETA.abilities[chatData.attack.ability]} ${game.i18n.localize("DND4EBETA.VS")} ${CONFIG.DND4EBETA.def[chatData.attack.def]}</p>`;
			} else {
				powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Attack")}</b>: ${game.i18n.localize("DND4EBETA.Attack")} ${game.i18n.localize("DND4EBETA.VS")} ${CONFIG.DND4EBETA.def[chatData.attack.def]}</p>`;
			}
			// powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Attack")}</b>: ${CONFIG.DND4EBETA.abilities[chatData.attack.ability] || "Attack"} ${game.i18n.localize("DND4EBETA.VS")} ${CONFIG.DND4EBETA.def[chatData.attack.def]}</p>`;
		}

		let highlight = true;
		if (chatData.hit.detail){
			powerDetail += `<p${highlight? ` class="alt"`: ``}><b>${game.i18n.localize("DND4EBETA.Hit")}:</b> ${chatData.hit.detail}</p>`;
			highlight = !highlight;
		}

		if (chatData.miss.detail){
			powerDetail += `<p${highlight? ` class="alt"`: ``}><b>${game.i18n.localize("DND4EBETA.Miss")}:</b> ${chatData.miss.detail}</p>`;
			highlight = !highlight;
		}

		if(chatData.postEffect && chatData.effect.detail) {
			powerDetail += `<p${highlight? ` class="alt"`: ``}><b>${game.i18n.localize("DND4EBETA.Effect")}:</b> ${chatData.effect.detail}</p>`;
			highlight = !highlight;
		}
		if(chatData.postSpecial && chatData.special) {
			powerDetail += `<p${highlight? ` class="alt"`: ``}><b>${game.i18n.localize("DND4EBETA.Special")}:</b> ${chatData.special}</p>`;
			highlight = !highlight;
			for (let [i, entry] of Object.entries(chatData.specialAdd.parts)){
				powerDetail += `<p>${entry}</p>`;
			}
		}

		if(chatData.sustain?.actionType !== "none" && chatData.sustain?.actionType) {
			powerDetail += `<p${highlight? ` class="alt"`: ``}><b>${game.i18n.localize("DND4EBETA.Sustain")} ${CONFIG.DND4EBETA.abilityActivationTypes[chatData.sustain.actionType]}:</b> ${chatData.sustain.detail}</p>`;
		}

		if(actorData){
			powerDetail = this.commonReplace(powerDetail, actorData);
		}

		return powerDetail;
	}

	static _isNumber(str){
		return /^-?\d+$/.test(str);
	}

	static async rechargeItems(actor, targetArray){

		const items = actor.items.filter(item => targetArray.includes(item.data.data.uses?.per));
		const updateItems = items.map( item => {
			return {
				_id: item.id,
				"data.uses.value": item.data.data.preparedMaxUses
			};
		});

		if(updateItems) await actor.updateEmbeddedDocuments("Item", updateItems);
	}

	static async endEffects(actor, targetArray){
		// const effects = actor.effects.filter(effect => targetArray.includes(effect.data.flags.dnd4e.effectData.durationType));
		const effects = [];
		for(let e of actor.effects){
			if(targetArray.includes(e.data.flags.dnd4e?.effectData?.durationType)){
				effects.push(e.id);
			}
		}
		if(effects) await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
	}

	static getInitiativeByToken(id){
		if(!game.combat) return 0;
		for(let t of game.combat.turns){
			if(t.data.tokenId === id){
				return t.data.initiative
			}
		}

		return game.combat.turns[game.combat.turn].initiative || -1;
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
		return game.combat? game.combat.turns[game.combat.turn].initiative : 0;
	}

	static async applyEffectsToTokens(effectMap, tokenTarget, condition, parent){
		const combat = game.combat;
		for(let e of effectMap){
			if(e.data.flags.dnd4e.effectData.powerEffectTypes === condition){
				for(let t of tokenTarget){
					let effectData = e.data;
					effectData.sourceName = parent.name
					effectData.origin = parent.uuid

					const duration = e.data.duration;
					const flags = e.data.flags;
					duration.combat = combat?.id || "None Combat";
					duration.startRound = combat?.round || 0;
					flags.dnd4e.effectData.startTurnInit = combat?.turns[combat.turn].data.initiative || 0;

					const userTokenId = this.getTokenIdForLinkedActor(parent);
					const userInit = this.getInitiativeByToken(this.getTokenIdForLinkedActor(parent));
					const targetInit = t ? this.getInitiativeByToken(t.id) : userInit;
					const currentInit = this.getCurrentTurnInitiative();

					if(flags.dnd4e.effectData.durationType === "endOfTargetTurn" || flags.dnd4e.effectData.durationType === "startOfTargetTurn"){
						duration.rounds = combat? currentInit > targetInit ? combat.round : combat.round + 1 : 0;
						flags.dnd4e.effectData.durationTurnInit = t ? this.getInitiativeByToken(t.data._id) : userInit;						
					}
					else if(flags.dnd4e.effectData.durationType === "endOfUserTurn" || flags.dnd4e.effectData.durationType === "startOfUserTurn" ){
						duration.rounds = combat? currentInit > userInit ? combat.round : combat.round + 1 : 0;
						flags.dnd4e.effectData.durationTurnInit = userInit;
					}

					const newEffectData = {
						label: e.data.label,
						icon: e.data.icon,
						origin: parent.uuid,
						sourceName: parent.name,
						// duration: duration, //Not too sure why this fails, but it does
						// duration: {rounds: duration.rounds, startRound: duration.startRound},
						rounds: duration.rounds,
						startRound: duration.startRound,
						tint: e.data.tint,
						flags: flags,
						changes: e.data.changes,
						changesID: e.uuid
					};
					let actor;
					if(t?.actor){
						actor = t.actor;
					} else { //extra condition for when actors this linked data target self						
						actor = parent;
					}

					if(game.user.isGM){
						actor.newActiveEffect(newEffectData);
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
				}
			}
		}
	}
}

export async function handleApplyEffectToToken(data){
	if(!game.user.isGM){
		return;
	}
	const effectData = data.effectData;
	const actor = data.tokenID ? game.scenes.get(data.scene).tokens.get(data.tokenID).actor : game.actors.get(data.actorID);
	await actor.newActiveEffectSocket(effectData);
}