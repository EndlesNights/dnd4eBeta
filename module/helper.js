
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


	static getWeaponUse(itemData, actor) {
		if(itemData.weaponUse === "none" || (itemData.weaponType === "none" && actor.itemTypes.weapon.length == 0)) return null;
		let weaponUse = itemData.weaponUse? actor.items.get(itemData.weaponUse) : null;
		//If default weapon is in use, find a sutable weapon
		if(itemData.weaponUse === "default" || itemData.weaponUse === "defaultOH") {
			let setMelee = ["melee", "simpleM", "militaryM", "superiorM", "improvM", "naturalM", "siegeM"];
			let setRanged = ["ranged", "simpleR", "militaryR", "superiorR", "improvR", "naturalR", "siegeR"];
			
			return actor.itemTypes.weapon.find((i) =>  {
				if(i.data.data.equipped) {
					if(itemData.weaponType === "meleeRanged") {
						if(setMelee.includes(i.data.data.weaponType) || setRanged.includes(i.data.data.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "melee") {
						if(setMelee.includes(i.data.data.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default") 
								return i;
					}
					else if(itemData.weaponType === "ranged") {
						if(setRanged.includes(i.data.data.weaponType) )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "implement") {
						if(i.data.data.properties.imp || i.data.data.properties.impA || i.data.data.properties.impD )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "implementA") {
						if(i.data.data.properties.imp || i.data.data.properties.impA )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
					else if(itemData.weaponType === "implementD") {
						if(i.data.data.properties.imp || i.data.data.properties.impD )
							if(itemData.weaponUse === "defaultOH" && (i.data.data.hand === "HOff"))
								return i;
							else if(itemData.weaponUse === "default")
								return i;
					}
				}
			}, {});
		}
		return weaponUse;
	}
	
	static commonReplace (formula, actorData, powerData, weaponData=null, depth = 1) {
		if (depth < 0 ) return 0;
		let newFormula = formula;
		if(actorData) {
			if(powerData) newFormula = newFormula.replace("@powerMod", !!(powerData.attack?.ability)? actorData.abilities[powerData.attack.ability].mod : "");
			
			newFormula = newFormula.replace("@strMod", actorData.abilities["str"].mod);
			newFormula = newFormula.replace("@conMod", actorData.abilities["con"].mod);
			newFormula = newFormula.replace("@dexMod", actorData.abilities["dex"].mod);
			newFormula = newFormula.replace("@intMod", actorData.abilities["int"].mod);
			newFormula = newFormula.replace("@wisMod", actorData.abilities["wis"].mod);
			newFormula = newFormula.replace("@chaMod", actorData.abilities["cha"].mod);
			
			newFormula = newFormula.replace("@lvhalf", Math.floor(actorData.details.level/2));
			newFormula = newFormula.replace("@lv", actorData.details.level);
		}
		
		if(powerData) {
			newFormula = newFormula.replace("@damageFormula", this.commonReplace(formula, actorData, powerData, weaponData, depth-1));
			newFormula = this.replaceData (newFormula, powerData);
		}

		if(weaponData) {
			newFormula = newFormula.replace("@wepAttack", this.commonReplace(weaponData.attackForm, actorData, powerData, weaponData, depth-1));
			newFormula = newFormula.replace("@wepDamage", this.commonReplace(weaponData.damageForm, actorData, powerData, weaponData, depth-1));
			newFormula = newFormula.replace("@wepCritBonus", this.commonReplace(weaponData.critDamageForm, actorData, powerData, weaponData, depth-1));
			newFormula = this.replaceData (newFormula, weaponData);
			
			newFormula = newFormula.replace("@wepDiceNum", weaponData.diceNum);
			newFormula = newFormula.replace("@wepDiceDamage", weaponData.diceDamage);
		} else {
			//if no weapon is in use replace the weapon keys with nothing.
			newFormula = newFormula.replace("@wepAttack", "");
			newFormula = newFormula.replace("@wepDamage", "");
			newFormula = newFormula.replace("@wepCritBonus", "");
			
			newFormula = newFormula.replace("@wepDiceNum", "0");
			newFormula = newFormula.replace("@wepDiceDamage", "0");			
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

}
