
export class Helper {

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
	 * Find A suitable weapon to use with the power.
	 * Either the specified weapon, or a weapon that matches the itemData.weaponType category if itemData.weaponUse is set to default
	 * @param itemData The Power being used
	 * @param actor The actor that owns the power
	 * @returns {null|*} The weapon details or null if either no suitable weapon is found or itemData.weaponUse is set to none.
	 */
	static getWeaponUse(itemData, actor) {
		if(itemData.weaponUse === "none" || (itemData.weaponType === "none" && actor.itemTypes.weapon.length == 0)) return null;
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
						if(setRanged.includes(i.data.data.weaponType) )
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
	
	static commonReplace (formula, actorData, powerData, weaponData=null, depth = 1, stringOnly = false) {
		if (depth < 0 ) return 0;
		let newFormula = formula;

		if(actorData) {

			if (!stringOnly) newFormula = Roll.replaceFormulaData(newFormula, actorData);
			if(powerData) newFormula = newFormula.replace("@powerMod", !!(powerData.attack?.ability)? actorData.abilities[powerData.attack.ability].mod : "");
			
			newFormula = newFormula.replace("@strMod", actorData.abilities["str"].mod);
			newFormula = newFormula.replace("@conMod", actorData.abilities["con"].mod);
			newFormula = newFormula.replace("@dexMod", actorData.abilities["dex"].mod);
			newFormula = newFormula.replace("@intMod", actorData.abilities["int"].mod);
			newFormula = newFormula.replace("@wisMod", actorData.abilities["wis"].mod);
			newFormula = newFormula.replace("@chaMod", actorData.abilities["cha"].mod);
			
			newFormula = newFormula.replace("@lvhalf", Math.floor(actorData.details.level/2));
			newFormula = newFormula.replace("@lv", actorData.details.level);
			newFormula = newFormula.replace("@tier", actorData.details.tier);

			newFormula = newFormula.replace("@atkMod", actorData.modifiers.attack.value);
			newFormula = newFormula.replace("@dmgMod", actorData.modifiers.damage.value);
		}
		
		if(powerData) {
			newFormula = newFormula.replace("@damageFormula", this.commonReplace(formula, actorData, powerData, weaponData, depth-1));
			newFormula = this.replaceData (newFormula, powerData);
		}

		if(weaponData) {

			if (powerData.weaponType === "implement") {
				newFormula = newFormula.replace("@wepAttack", this.commonReplace(weaponData.attackFormImp, actorData, powerData, weaponData, depth-1) || 0);
				newFormula = newFormula.replace("@wepDamage", this.commonReplace(weaponData.damageFormImp, actorData, powerData, weaponData, depth-1) || 0);
				newFormula = newFormula.replace("@wepCritBonus", this.commonReplace(weaponData.critDamageFormImp, actorData, powerData, weaponData, depth-1) || 0);
			}
			else {
				newFormula = newFormula.replace("@wepAttack", this.commonReplace(weaponData.attackForm, actorData, powerData, weaponData, depth-1) || 0);
				newFormula = newFormula.replace("@wepDamage", this.commonReplace(weaponData.damageForm, actorData, powerData, weaponData, depth-1) || 0);
				newFormula = newFormula.replace("@wepCritBonus", this.commonReplace(weaponData.critDamageForm, actorData, powerData, weaponData, depth-1) || 0);
			}

			newFormula = newFormula.replace("@impAttackO", this.commonReplace(weaponData.attackFormImp, actorData, powerData, weaponData, depth-1) || 0 );
			newFormula = newFormula.replace("@impDamageO", this.commonReplace(weaponData.damageFormImp, actorData, powerData, weaponData, depth-1) || 0 );

			newFormula = newFormula.replace("@impAttack", weaponData.proficientI ? this.commonReplace(weaponData.attackFormImp, actorData, powerData, weaponData, depth-1) || 0 : 0);
			newFormula = newFormula.replace("@impDamage", weaponData.proficientI ? this.commonReplace(weaponData.damageFormImp, actorData, powerData, weaponData, depth-1) || 0 : 0);

			newFormula = newFormula.replace("@profBonusO",weaponData.profBonus || 0);
			newFormula = newFormula.replace("@profImpBonusO", weaponData.profImpBonus || 0);
			
			newFormula = newFormula.replace("@profImpBonus", weaponData.proficientI ? weaponData.profImpBonus || 0 : 0);
			newFormula = newFormula.replace("@profBonus", weaponData.proficient ? weaponData.profBonus || 0 : 0);
			newFormula = newFormula.replace("@enhanceImp", weaponData.proficientI ? weaponData.enhance || 0 : 0);
			newFormula = newFormula.replace("@enhance", weaponData.enhance || 0);
			

			newFormula = this.replaceData (newFormula, weaponData);
			
			

			if(newFormula.includes("@wepDice")) {
				let parts = weaponData.damageDice.parts;
				let indexStart = newFormula.indexOf("@wepDice")+8;
				let indexEnd = newFormula.substring(indexStart).indexOf(")")+1 + indexStart

				let weaponNum = newFormula.substring(indexStart).match(/\(([^)]+)\)/)[1]
				weaponNum = eval(weaponNum.replace(/[a-z]/gi, ''));

				if(typeof(weaponNum) !== "number") weaponNum = 1;

				let dice = "";
				for(let i = 0; i< parts.length; i++) {
					if(!parts[i][0] || !parts[i][1]) continue;
					if(weaponData.properties.bru) {
						// dice += ` + (${parts[i][0]}*${weaponNum})d(${parts[i][1] - weaponData.brutal}) + (${weaponData.brutal}*${parts[i][0]}*${weaponNum})`;
						dice += `(${parts[i][0]}*${weaponNum})d${parts[i][1]}rr<${weaponData.brutal || 1}`;
					}
					else{
						dice += `(${parts[i][0]}*${weaponNum})d${parts[i][1]}`;
					}
					if (i < parts.length - 1) dice += '+';
				}
				dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
				newFormula = newFormula.slice(0, indexStart) + newFormula.slice(indexEnd, newFormula.length);
				newFormula = newFormula.replace("@wepDice", dice);
			}
			
			// New method to handle base power dice from dropdown
			// Includes handling of:
			//	-	weapon based damage
			//	-	flat damage
			//	-	dice damage
			if(newFormula.includes("@powBase")) {
				let quantity = powerData.hit.baseQuantity;
				let diceType = powerData.hit.baseDiceType.toLowerCase();
				
				if(quantity === "") quantity = 1;
				
				let dice = "";
				
				// Handle Weapon Type Damage
				if(diceType.includes("weapon")){
					let parts = weaponData.damageDice.parts;
					for(let i = 0; i< parts.length; i++) {
						if(!parts[i][0] || !parts[i][1]) continue;
						if(weaponData.properties.bru) {
							dice += `(${quantity} * ${parts[i][0]})d${parts[i][1]}rr<${weaponData.brutal}`;
						}
						else{
						dice += `(${quantity} * ${parts[i][0]})d${parts[i][1]}`;
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

				dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
				newFormula = newFormula.replace("@powBase", dice);
			}

			if(newFormula.includes("@wepMax")) {
				let parts = weaponData.damageDice.parts;
				let dice = "";
				for(let i = 0; i< parts.length; i++) {
					if(!parts[i][0] || !parts[i][1]) continue;
					dice += `(${parts[i][0]} * ${parts[i][1]})`
					if (i < parts.length - 1) dice += '+';
				}
				dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
				let r = new Roll(`${dice}`)
				if(dice){
					r.evaluate({maximize: true, async: false});
					newFormula = newFormula.replace("@wepMax", r.result);
				} else {
					newFormula = newFormula.replace("@wepMax", dice);
				}
			}
			
			// New method to handle base power dice from dropdown for critical hits
			// Includes handling of:
			//	-	weapon based damage
			//	-	flat damage
			//	-	dice damage
			if(newFormula.includes("@powMax")) {
				let dice = "";
				let quantity = powerData.hit.baseQuantity;
				let diceType = powerData.hit.baseDiceType.toLowerCase();
				let rQuantity = new Roll(`${quantity}`)
				rQuantity.evaluate({maximize: true, async: false});

				//check if is valid number
				if(this._isNumber(rQuantity.result)){ 
					quantity = rQuantity.result;
				} else {
					quantity = 1;
				}
				

				// Handle Weapon Type Damage
				if(diceType.includes("weapon")){
					let parts = weaponData.damageDice.parts;
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
				dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
				newFormula = newFormula.replace("@powMax", dice);
			}
			
			
			// if(weaponData.properties.bru) {
			// 	let index = formula.trim().indexOf("*@wepDiceNum");
			// 	let wDice = 1;
			// 	if(index > 0 ) {
			// 		let check = formula.trim().substring(0,index).match(/\d+$/);
			// 		wDice = check? check[0] : 1;
			// 	}
			// 	newFormula = newFormula.replace("@wepDiceNum", weaponData.diceNum);
			// 	newFormula = newFormula.replace("@wepDiceDamage", '(' + weaponData.diceDamage + '-'+ weaponData.brutal +') + '+ weaponData.brutal +' * ' + weaponData.diceNum * wDice);
				
			// }
			// else {
			// 	// newFormula = newFormula.replace("@wepDice", weaponData.damageDice);
			// 	newFormula = newFormula.replace("@wepDiceNum", weaponData.diceNum);
			// 	newFormula = newFormula.replace("@wepDiceDamage", weaponData.diceDamage);
			// }

		} else {
			//if no weapon is in use replace the weapon keys with nothing.
			newFormula = newFormula.replace("@wepAttack", "");
			newFormula = newFormula.replace("@wepDamage", "");
			newFormula = newFormula.replace("@wepCritBonus", "");
			
			newFormula = newFormula.replace("@wepDiceNum", "0");
			newFormula = newFormula.replace("@wepDiceDamage", "0");
			
			newFormula = newFormula.replace("@impAttackO", "0" );
			newFormula = newFormula.replace("@impDamageO", "0");

			newFormula = newFormula.replace("@impAttack", "0");
			newFormula = newFormula.replace("@impDamage", "0");

			newFormula = newFormula.replace("@profBonusO", "0");
			newFormula = newFormula.replace("@profImpBonusO", "0");
			
			newFormula = newFormula.replace("@profImpBonus", "0");
			newFormula = newFormula.replace("@profBonus", "0");
			newFormula = newFormula.replace("@enhanceImp", "0");
			newFormula = newFormula.replace("@enhance", "0");



			if(newFormula.includes("@wepDice")) {
				let indexStart = newFormula.indexOf("@wepDice")+8;
				let indexEnd = newFormula.substring(indexStart).indexOf(")")+1 + indexStart

				let weaponNum = newFormula.substring(indexStart).match(/\(([^)]+)\)/)[1]
				weaponNum = eval(weaponNum.replace(/[a-z]/gi, ''));

				if(typeof(weaponNum) !== "number") weaponNum = 1;

				newFormula = newFormula.slice(0, indexStart) + newFormula.slice(indexEnd, newFormula.length);
				newFormula = newFormula.replace("@wepDice", "");
			}

			if(newFormula.includes("@powBase")) {
				let quantity = powerData.hit.baseQuantity;
				let diceType = powerData.hit.baseDiceType;
				
				if(diceType == "weapon"){
					newFormula = newFormula.replace("@powBase", '0');
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
	
					dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
					newFormula = newFormula.replace("@powBase", dice);
				}

			}


			if(newFormula.includes("@powMax")) {
				let dice = "";
				let quantity = powerData.hit.baseQuantity;
				let diceType = powerData.hit.baseDiceType.toLowerCase();
				let rQuantity = new Roll(`${quantity}`)
				rQuantity.evaluate({maximize: true, async: false});
				
				if(this._isNumber(rQuantity.result)) {
					quantity = rQuantity.result;
				} else {
					quantity = 1;
				}
				
				// Handle Weapon Type Damage
				if(diceType.includes("weapon") && weaponData){
					let parts = weaponData.damageDice.parts;
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
				dice = this.commonReplace(dice, actorData, powerData, weaponData, depth-1)
				newFormula = newFormula.replace("@powMax", dice);
			}			
		}

		//check for actor values in formula
		
		// for(let i = 0; i < (newFormula.match(/@/g) || []).length; i++) {
		// 	let indexStart = newFormula.indexOf('@');
		// 	let indexEnd = (newFormula + ' ').substring(indexStart).search(/[ /*+-]/);
		// 	//FIX the regex, get rid of the ' ' and just tell it to search to up to end of string

		// 	let val = typeof this.byString(newFormula.substring(indexStart+1, indexStart + indexEnd), actorData) === 'number' ?
		// 		this.byString(newFormula.substring(indexStart+1, indexStart + indexEnd), actorData) : '';
		// 	newFormula = newFormula.replace(newFormula.substring(indexStart, indexStart + indexEnd), val);
		// }
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
	static replaceData(formula, data, {missing=null,depth=1}={}) {
		// Exit early if the formula is invalid.
		if ( typeof formula != "string" || depth < 1) {
		return 0;
		}
		// Replace attributes with their numeric equivalents.
		let dataRgx = new RegExp(/@([a-z.0-9_\-]+)/gi);
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
			powerDetail += ` ${game.i18n.localize("DND4EBETA.Range")}</b> ${chatData.rangePower}</span>`;
		}
		else if (['closeBurst', 'closeBlast'].includes(chatData.rangeType)) {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]} ${chatData.area}</b></span>`;
		}
		else if (['rangeBurst', 'rangeBlast', 'wall'].includes(chatData.rangeType)) {
			powerDetail += ` ${CONFIG.DND4EBETA.rangeType[chatData.rangeType]} ${chatData.area}</b> ${game.i18n.localize("DND4EBETA.RangeWithinOf")} <b>${chatData.rangePower}</b> ${game.i18n.localize("DND4EBETA.Squares")}</span>`;
		}
		else if (chatData.rangeType === "personal") {
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

		if(chatData.target) {
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
			powerDetail += `<p><b>${game.i18n.localize("DND4EBETA.Attack")}</b>: ${CONFIG.DND4EBETA.abilities[chatData.attack.ability] || "Attack"} ${game.i18n.localize("DND4EBETA.VS")} ${CONFIG.DND4EBETA.def[chatData.attack.def]}</p>`;
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

		if(chatData.sustain.actionType !== "none" && chatData.sustain.actionType) {
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
}
