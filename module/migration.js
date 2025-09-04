/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function() {
	const version = game.system.version;
	ui.notifications.info(game.i18n.format("MIGRATION.4eBegin", {version}), {permanent: true});

	const migrationData = await getMigrationData();

	// Migrate World Actors
	for ( let a of game.actors ) {
		try {
			const updateData = migrateActorData(a.toObject(), migrationData);
			if ( !foundry.utils.isEmpty(updateData) ) {
				console.log(`Migrating Actor document ${a.name}`);
				await a.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Failed dnd4e system migration for Actor ${a.name}: ${err.message}`;
			console.error(err);
		}
		
		// Migrate items contained by an actor
		for ( let i of a.items ) {
			try {
				const updatedItem = migrateItemData(i.toObject(), migrationData);
				if ( !foundry.utils.isEmpty(updatedItem) ) {
					console.log(`Migrating Item ${i.name} of Actor ${a.name}`);
					await i.update(updatedItem, {enforceTypes: false});
				}
			} catch(err) {
				err.message = `Failed dnd4e system migration for Item ${i.name} of Actor ${a.name}: ${err.message}`;
				console.error(err);
			}
		}
	}

	// Migrate World Items
	for ( let i of game.items ) {
		try {
			const updateData = migrateItemData(i.toObject(), migrationData);
			if ( !foundry.utils.isEmpty(updateData) ) {
				console.log(`Migrating Item document ${i.name}`);
				await i.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Failed dnd4e system migration for Item ${i.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate Actor Override Tokens
	for ( let s of game.scenes ) {
		try {
			const updateData = migrateSceneData(s, migrationData);
			if ( !foundry.utils.isEmpty(updateData) ) {
				console.log(`Migrating Scene document ${s.name}`);
				await s.update(updateData, {enforceTypes: false});
				// If we do not do this, then synthetic token actors remain in cache
				// with the un-updated actorData.
				s.tokens.forEach(t => t._actor = null);
			}
		} catch(err) {
			err.message = `Failed dnd4e system migration for Scene ${s.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Compendium Packs
	for ( let p of game.packs ) {
		if ( p.metadata.package !== "world" ) continue;
		if ( !["Actor", "Item", "Scene"].includes(p.documentName) ) continue;
		await migrateCompendium(p);
	}

	// Set the migration as complete
	game.settings.set("dnd4e", "systemMigrationVersion", game.system.version);
	ui.notifications.info(game.i18n.format("MIGRATION.4eComplete", {version}), {permanent: true});

};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Documents within a single Compendium pack
 * @param {CompendiumCollection} pack  Pack to be migrated.
 * @returns {Promise}
 */
export const migrateCompendium = async function(pack) {
	const documentName = pack.documentName;
	if ( !["Actor", "Item", "Scene"].includes(documentName) ) return;

	const migrationData = await getMigrationData();

	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({locked: false});

	// Begin by requesting server-side data model migration and get the migrated content
	await pack.migrate();
	const documents = await pack.getDocuments();

	// Iterate over compendium entries - applying fine-tuned migration functions
	for ( let doc of documents ) {
		let updateData = {};
		try {
			switch (documentName) {
				case "Actor":
					updateData = migrateActorData(doc.toObject(), migrationData);
					break;
				case "Item":
					updateData = migrateItemData(doc.toObject(), migrationData);
					break;
				case "Scene":
					updateData = migrateSceneData(doc, migrationData);
					break;
			}

			// Save the entry, if data was changed
			if ( foundry.utils.isEmpty(updateData) ) continue;
			await doc.update(updateData);
			console.log(`Migrated ${documentName} document ${doc.name} in Compendium ${pack.collection}`);
		}

		// Handle migration failures
		catch(err) {
			err.message = `Failed dnd4e system migration for document ${doc.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
		}
	}

	// Apply the original locked status for the pack
	await pack.configure({locked: wasLocked});
	console.log(`Migrated all ${documentName} documents from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {object} actor    The actor data object to update
 * @return {Object}         The updateData to apply
 */
export const migrateActorData = function(actor, migrationData) {
	const updateData = {};

	// Actor Data Updates
	if (actor) {
		_migrateActorTempHP(actor, updateData);
		_migrateActorAddProfKeys(actor, updateData);
		_migrateActorSkills(actor, updateData);
		_migrateActorFeatItemPowerBonusSources(actor, updateData);
		_migrateActorDefAndRes(actor, updateData);
		_migrateActorGlobalMods(actor, updateData);
		_migrateActorSwim(actor, updateData);
		_migrateHazardSpeed(actor, updateData);
		_migrateActorMarker(actor, updateData);
	}

	return updateData;
};

/* -------------------------------------------- */


/**
 * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
 * @param {object} actorData    The data object for an Actor
 * @returns {object}            The scrubbed Actor data
 */
// eslint-disable-next-line no-unused-vars -- We might want to still use this in later migrations.
function cleanActorData(actorData) {

	// Scrub system data
	const model = game.model.Actor[actorData.type];
	actorData = filterObject(actorData, model);

	// Scrub system flags
	const allowedFlags = CONFIG.DND4E.allowedActorFlags.reduce((obj, f) => {
		obj[f] = null;
		return obj;
	}, {});
	if ( actorData.flags.dnd4e ) {
		actorData.flags.dnd4e = filterObject(actorData.flags.dnd4e, allowedFlags);
	}

	// Return the scrubbed data
	return actorData;
}

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 *
 * @param {object} item  Item data to migrate
 * @return {object}      The updateData to apply
 */
export const migrateItemData = function(item) {
	const updateData = {};
	_migrateImplmentKey(item, updateData);
	_migrateContainerItems(item, updateData);
	_migrateItemsGMDescriptions(item, updateData);
	_migrateNeckGearEnhance(item, updateData);
	_migratePowerBasicAndGlobal(item, updateData);
	_migrateFeature(item, updateData);
	_migrateRitualCategory(item, updateData);
	return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene document to incorporate changes to the data model of its actor data overrides
 * Return an Object of updateData to be applied
 * @param {object} scene            The Scene data to Update
 * @param {object} [migrationData]  Additional data to perform the migration
 * @returns {object}                The updateData to apply
 */
 export const migrateSceneData = function(scene, migrationData) {
	const tokens = scene.tokens.map(token => {
		const t = token.toObject();
		const update = {};
		// _migrateTokenImage(t, update);
		if ( Object.keys(update).length ) foundry.utils.mergeObject(t, update);
		if ( !t.actorId || t.actorLink ) {
			t.actorData = {};
		}
		else if ( !game.actors.has(t.actorId) ) {
			t.actorId = null;
			t.actorData = {};
		}
		else if ( !t.actorLink ) {
			const actorData = duplicate(t.delta);
			actorData.type = token.actor?.type;
			const update = migrateActorData(actorData, migrationData);
			["items", "effects"].forEach(embeddedName => {
				if (!update[embeddedName]?.length) return;
				const updates = new Map(update[embeddedName].map(u => [u._id, u]));
				t.actorData[embeddedName].forEach(original => {
					const update = updates.get(original._id);
					if (update) foundry.utils.mergeObject(original, update);
				});
				delete update[embeddedName];
			});

			foundry.utils.mergeObject(t.delta, update);
		}
		return t;
	});
	return {tokens};
};


/* -------------------------------------------- */

/**
 * Fetch bundled data for large-scale migrations.
 * @returns {Promise<object>}  Object mapping original system icons to their core replacements.
 */
export const getMigrationData = async function() {
	const data = {};
	try {
		//don't need this but's it's setup incase we ever do I suppose
	} catch(err) {
		console.warn(`Failed to retrieve icon migration data: ${err.message}`);
	}
	return data;
};
/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Migrate the actor temphp from attributes.hp to attributes.temphp object
 * @param {object} actorData   Actor data being migrated.
 * @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
 function _migrateActorTempHP(actorData, updateData) {
	const ad = actorData.system;
	if(!ad) return updateData;

	const old = ad?.attributes?.hp?.temphp;
	const hasOld = old !== undefined && ad.attributes[`hp-=temphp`] !== undefined;
	if ( hasOld ) {
		// If new data is not present, migrate the old data
		if (old !== undefined && ad.attributes?.temphp?.value !== old && (typeof old === "number") ) {
			ad.attributes.temphp = {
				value: old,
				max: 10,
			}
		}

		// Remove the old attribute
		if(ad.attributes.hp.temphp !== undefined){
			updateData["system.attributes.-=temphp"] = null;
		}

		if(ad.attributes[`hp-=temphp`] !== undefined){
			updateData["system.attributes.-=hp-=temphp"] = null;
		}
	}
	return updateData;
}

/**
 * Migrate the actor adding in object keys for proficiencies
 * @param {object} actorData   Actor data being migrated.
 * @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
 function _migrateActorAddProfKeys(actorData, updateData) {
	if(["Hazard","NPC"].includes(actorData?.type)) return;
	if(!actorData?.system?.details) return;

	if(actorData.system.details.armourProf == undefined){
		updateData["system.details.armourProf"] = {
			"value": [],
			"custom": ""
		}
	}
	if(actorData.system.details.weaponProf == undefined){
		updateData["system.details.weaponProf"] = {
			"value": [],
			"custom": ""
		}
	}
	if(actorData.system.details.implementProf == undefined){ //v0.6.15
		updateData["system.details.implementProf"] = {
			"value": [],
			"custom": ""
		}
	}

	return updateData;
 }

 /**
 * Migrate the actor adding missing keys for skill training to move the out of the "value" key. v0.4.33
 * @param {object} actorData   Actor data being migrated.
 * @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateActorSkills(actorData, updateData){
	if(actorData?.type === "Hazard") return;
	
	const skills = actorData?.system?.skills;
	if(! skills) return;

	for( const [id, skl] of Object.entries(skills)){
		if(skl.training == undefined || skl.value){
			updateData[`system.skills.${id}.training`] = skl.value || 0;
			updateData[`system.skills.${id}.value`] = 0;
		}
	}

	updateData[`system.skillTraining`] = {
		untrained:{
			value:0,
			feat: 0,
			item: 0,
			power: 0,
			untyped: 0
		},
		trained:{
			value:5,
			feat: 0,
			item: 0,
			power: 0,
			untyped: 0
		},
		expertise:{
			value:8,
			feat: 0,
			item: 0,
			power: 0,
			untyped: 0
		}
	}

	return updateData;
}

 /**
 * Migrate the actor adding missing keys for Feats, Item and Power bonus keys. v0.4.33
 * @param {object} actorData   Actor data being migrated.
 * @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateActorFeatItemPowerBonusSources(actorData, updateData){
	const skills = actorData?.system?.skills;

	if(skills){
		for( const [id, skl] of Object.entries(skills)){
			if(skl.feat == undefined){
				updateData[`system.skills.${id}.feat`] = 0;
			}
			if(skl.item == undefined){
				updateData[`system.skills.${id}.item`] = 0;
			}
			if(skl.power == undefined){
				updateData[`system.skills.${id}.power`] = 0;
			}
			if(skl.untyped == undefined){
				updateData[`system.skills.${id}.untyped`] = 0;
			}
		}
	}

	const defences = actorData?.system?.defences;
	if(defences){
		for( const [id, def] of Object.entries(defences)){
			if(def.feat == undefined){
				updateData[`system.defences.${id}.feat`] = 0;
			}
			if(def.item == undefined){
				updateData[`system.defences.${id}.item`] = 0;
			}
			if(def.power == undefined){
				updateData[`system.defences.${id}.power`] = 0;
			}
			if(def.untyped == undefined){
				updateData[`system.defences.${id}.untyped`] = 0;
			}
		}
	}

	const hp = actorData?.system?.attributes?.hp;
	if(hp){
		if(hp.feat == undefined){
			updateData[`system.attributes.hp.feat`] = 0;
		}
		if(hp.item == undefined){
			updateData[`system.attributes.hp.item`] = 0;
		}
		if(hp.power == undefined){
			updateData[`system.attributes.hp.power`] = 0;
		}
		if(hp.untyped == undefined){
			updateData[`system.attributes.hp.untyped`] = 0;
		}
	}

	const init = actorData?.system?.attributes?.init;
	if(init){
		if(init.feat == undefined){
			updateData[`system.attributes.init.feat`] = 0;
		}
		if(init.item == undefined){
			updateData[`system.attributes.init.item`] = 0;
		}
		if(init.power == undefined){
			updateData[`system.attributes.init.power`] = 0;
		}
		if(init.untyped == undefined){
			updateData[`system.attributes.init.untyped`] = 0;
		}
	}

	const modifiers = actorData?.system?.modifiers;
	if(modifiers){
		for( const [id, mod] of Object.entries(modifiers)){
			if(mod.feat == undefined){
				updateData[`system.modifiers.${id}.feat`] = 0;
			}
			if(mod.item == undefined){
				updateData[`system.modifiers.${id}.item`] = 0;
			}
			if(mod.power == undefined){
				updateData[`system.modifiers.${id}.power`] = 0;
			}
			if(mod.untyped == undefined){
				updateData[`system.modifiers.${id}.untyped`] = 0;
			}
			if(mod.bonus == undefined){
				updateData[`system.modifiers.${id}.bonus`] = [];
			}
		}
	}

	const movement = actorData?.system?.details?.movement;
	if(movement){
		for( const [id, mov] of Object.entries(movement)){
			if(mov.feat == undefined){
				updateData[`system.details.movement.${id}.feat`] = 0;
			}
			if(mov.item == undefined){
				updateData[`system.details.movement.${id}.item`] = 0;
			}
			if(mov.power == undefined){
				updateData[`system.details.movement.${id}.power`] = 0;
			}
			if(mov.untyped == undefined){
				updateData[`system.details.movement.${id}.untyped`] = 0;
			}
		}
	}

	const deathsavebon = actorData?.system?.details?.deathsavebon;
	if(deathsavebon){
		if(deathsavebon.feat == undefined){
			updateData[`system.details.deathsavebon.feat`] = 0;
		}
		if(deathsavebon.item == undefined){
			updateData[`system.details.deathsavebon.item`] = 0;
		}
		if(deathsavebon.power == undefined){
			updateData[`system.details.deathsavebon.power`] = 0;
		}
		if(deathsavebon.untyped == undefined){
			updateData[`system.details.deathsavebon.untyped`] = 0;
		}
	}

	const saves = actorData?.system?.details?.saves;
	if(saves){
		if(saves.feat == undefined){
			updateData[`system.details.saves.feat`] = 0;
		}
		if(saves.item == undefined){
			updateData[`system.details.saves.item`] = 0;
		}
		if(saves.power == undefined){
			updateData[`system.details.saves.power`] = 0;
		}
		if(saves.untyped == undefined){
			updateData[`system.details.saves.untyped`] = 0;
		}
	}

	const surgeBon = actorData?.system?.details?.surgeBon;
	if(surgeBon){
		if(surgeBon.feat == undefined){
			updateData[`system.details.surgeBon.feat`] = 0;
		}
		if(surgeBon.item == undefined){
			updateData[`system.details.surgeBon.item`] = 0;
		}
		if(surgeBon.power == undefined){
			updateData[`system.details.surgeBon.power`] = 0;
		}
		if(surgeBon.untyped == undefined){
			updateData[`system.details.surgeBon.untyped`] = 0;
		}
	}

	const surges = actorData?.system?.details?.surges;
	if(surges){
		if(surges.feat == undefined){
			updateData[`system.details.surges.feat`] = 0;
		}
		if(surges.item == undefined){
			updateData[`system.details.surges.item`] = 0;
		}
		if(surges.power == undefined){
			updateData[`system.details.surges.power`] = 0;
		}
		if(surges.untyped == undefined){
			updateData[`system.details.surges.untyped`] = 0;
		}
	}
	const surgeEnv = actorData?.system?.details?.surgeEnv;
	if(surgeEnv){
		if(surgeEnv.feat == undefined){
			updateData[`system.details.surgeEnv.feat`] = 0;
		}
		if(surgeEnv.item == undefined){
			updateData[`system.details.surgeEnv.item`] = 0;
		}
		if(surgeEnv.power == undefined){
			updateData[`system.details.surgeEnv.power`] = 0;
		}
		if(surgeEnv.untyped == undefined){
			updateData[`system.details.surgeEnv.untyped`] = 0;
		}
	}
	const secondwindbon = actorData?.system?.details?.secondwindbon;
	if(secondwindbon){
		if(secondwindbon.feat == undefined){
			updateData[`system.details.secondwindbon.feat`] = 0;
		}
		if(secondwindbon.item == undefined){
			updateData[`system.details.secondwindbon.item`] = 0;
		}
		if(secondwindbon.power == undefined){
			updateData[`system.details.secondwindbon.power`] = 0;
		}
		if(secondwindbon.untyped == undefined){
			updateData[`system.details.secondwindbon.untyped`] = 0;
		}
	}

	const passive = actorData?.system?.passive;
	if(passive){
		for( const [id, pasv] of Object.entries(passive)){
			if(pasv.feat == undefined){
				updateData[`system.passive.${id}.feat`] = 0;
			}
			if(pasv.item == undefined){
				updateData[`system.passive.${id}.item`] = 0;
			}
			if(pasv.power == undefined){
				updateData[`system.passive.${id}.power`] = 0;
			}
			if(pasv.untyped == undefined){
				updateData[`system.passive.${id}.untyped`] = 0;
			}
		}
	}

	return updateData;
}

/**
 * Migrate any data from the key "implementGroup" to the key of "implment"
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
 function _migrateImplmentKey(itemData, updateData){
	if(itemData.type !== "weapon" && itemData.system.implementGroup != undefined) return;

	const implementData = itemData.system.implementGroup;

	updateData["system.-=implementGroup"] = null;
	updateData["system.implement"] = implementData;

	return updateData;
 }

/**
 * Migrate backpack/Container items data to include new keys
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateContainerItems(itemData, updateData){

	if(itemData.type === "backpack"){
		//Add ritual datakeys
		if(!itemData.system.hasOwnProperty('ritualcomp')){
			updateData["system.ritualcomp"] = {
				"ar" : 0,
				"ms" : 0,
				"rh" : 0,
				"si" : 0,
				"rs" : 0
			};
		}

	}

	//only add to phsyical item types
	if(["weapon", "equipment", "consumable", "tool", "loot", "backpack", ].includes(itemData.type) && !itemData.system.hasOwnProperty('container')){
		updateData["system.container"] = null;
	}

	return updateData;
}

/**
 * Migrate all items data to include new object keys for a GM Description, which will not be visable to normal players
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateItemsGMDescriptions(itemData, updateData){

	if(!itemData.system.description.hasOwnProperty('gm')){
		updateData["system.description.gm"] = "";
	}
	
	return updateData;
}

/**
 * A general tool to purge flags from all entities in a Compendium pack.
 * @param {Compendium} pack   The compendium pack to clean
 * @private
 */
export async function purgeFlags(pack) {
	const cleanFlags = (flags) => {
		const flags4e = flags.dnd4e || null;
		return flags4e ? {dnd4e: flags4e} : {};
	};
	await pack.configure({locked: false});
	const content = await pack.getContent();
	for ( let doc of content ) {
		const update = {flags: cleanFlags(doc.flags)};
		if ( pack.documentName === "Actor" ) {
			update.items = doc.items.map(i => {
			i.flags = cleanFlags(i.flags);
			return i;
			});
		}
		await doc.update(update, {recursive: false});
		console.log(`Purged flags from ${doc.name}`);
	}
	await pack.configure({locked: true});
}

/* -------------------------------------------- */

/**
 * Purge the data model of any inner objects which have been flagged as _deprecated.
 * @param {object} data   The data to clean.
 * @returns {object}      Cleaned data.
 * @private
 */
export function removeDeprecatedObjects(data) {
	for ( let [k, v] of Object.entries(data) ) {
		if ( getType(v) === "Object" ) {
			if (v._deprecated === true) {
				console.log(`Deleting deprecated object key ${k}`);
				delete data[k];
			}
			else removeDeprecatedObjects(v);
		}
	}
	return data;
}

 /**
 * Migrate the actor adding missing keys for defences and resistances (v0.4.6)
 * @param {object} actorData   Actor data being migrated.
 * @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateActorDefAndRes(actorData, updateData){
	
	const defences = actorData?.system?.defences;
	if(defences){
		for( const [id, def] of Object.entries(defences)){
			if(def.shield == undefined){
				updateData[`system.defences.${id}.shield`] = 0;
			}
		}
	}
	
	const resistances = actorData?.system?.resistances;
	if(resistances){
		for( const [id, res] of Object.entries(resistances)){
			if(res.res == undefined){
				updateData[`system.resistances.${id}.res`] = 0;
			}
			if(res.vuln == undefined){
				updateData[`system.resistances.${id}.vuln`] = 0;
			}
		}
	}

	return updateData;
}

/**
 * Migrate neck items from three identical base NADS values to one enhancment value. (v0.4.6)
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
*/
function _migrateNeckGearEnhance(itemData, updateData){
if(itemData.type !== "equipment" || itemData.system?.armour.type !== "neck") return;
	
if ((itemData.system?.armour.fort !== itemData.system?.armour.ref || itemData.system?.armour.fort !== itemData.system?.armour.wil) || itemData.system?.armour.fort === 0) return;
	
	updateData["system.armour.enhance"] = itemData.system.armour.fort;
	updateData["system.armour.fort"] = 0;
	updateData["system.armour.ref"] = 0;
	updateData["system.armour.wil"] = 0;

	return updateData;
}

/**
 * Migrate powers without "isBasic" toggle or manual atkMod/dmgMod usage (v0.5.5)
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
*/
function _migratePowerBasicAndGlobal(itemData, updateData){
	if(itemData.type !== "power") return;
		
	if(itemData.system?.attack?.isBasic == undefined){
		updateData["system.attack.isBasic"] = false;
	}
	if(itemData?.system?.attack?.formula){
		updateData["system.attack.formula"] = itemData.system.attack.formula.replace(/(@atkMod *\+* *)|( *\+* *@atkMod)/g,'');
	}
	if(itemData?.system?.hit?.formula){
		updateData["system.hit.formula"] = itemData.system.hit.formula.replace(/ *\+* *@dmgMod/g,'');
		updateData["system.hit.critFormula"] = itemData.system.hit.critFormula.replace(/(@dmgMod *\+* *)|( *\+* *@dmgMod)/g,'');
	}
	if(itemData?.system?.miss?.formula){
		updateData["system.miss.formula"] = itemData.system.miss.formula.replace
		(/(@dmgMod *\+* *)|( *\+* *@dmgMod)/g,'');
	}
	
	return updateData;
}

/**
* Migrate the actor adding missing keys for global skill and defence modifiers (v0.5.5)
* @param {object} actorData   Actor data being migrated.
* @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
* @returns {object}           Modified version of update data.
* @private
*/
function _migrateActorGlobalMods(actorData, updateData){
	
	const modifiers = actorData?.system?.modifiers;
	
	if(modifiers?.skills == undefined){
		updateData[`system.modifiers.skills`] = {
			"value": 0,
			"class": 0,
			"feat": 0,
			"item": 0,
			"power": 0,
			"race": 0,
			"untyped": 0,
			"bonus": [{}]
		};
	}
	
	if(modifiers?.defences == undefined){
		updateData[`system.modifiers.defences`] = {
			"value": 0,
			"class": 0,
			"feat": 0,
			"item": 0,
			"power": 0,
			"race": 0,
			"untyped": 0,
			"bonus": [{}]
		};
	}

	return updateData;
}

/**
* Migrate actors missing keys for swim speed (v0.5.12)
* @param {object} actorData   Actor data being migrated.
* @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
* @returns {object}           Modified version of update data.
* @private
*/
function _migrateActorSwim(actorData, updateData){
	
	if(actorData?.type === "Hazard") return;
	const movement = actorData?.system?.movement;
	
	if(movement?.swim == undefined){
		updateData[`system.movement.swim`] = {
			"value": 0,
			"formula": "(@base + @armour)/2",
			"bonus": [{}],
			"feat": 0,
			"item": 0,
			"power": 0,
			"race": 0,
			"untyped": 0,
			"temp": 0
		};
	}
	return updateData;
}

/**
 * Migrate featlike items to new "features" type
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateFeature(itemData, updateData){
	const sourceType = itemData.type;
	
	if(sourceType == 'feature'){
		//Catch any features that were migrated early during beta/testing
		updateData["system.activation"] = null;
		updateData["system.duration"] = null;
		updateData["system.target"] = null;
		updateData["system.range"] = null;
		updateData["system.uses"] = null;
		updateData["system.consume"] = null;
		return updateData;
	}	
	
	if(!(['classFeats','feat','raceFeats','pathFeats','destinyFeats'].includes(sourceType))) return;
	
	updateData["type"] = "feature";
	
	switch(sourceType){
		case "classFeats":
			updateData["system.featureType"] = "class";
			break;
		case "feat":
			updateData["system.featureType"] = "feat";
			break;
		case "raceFeats":
			updateData["system.featureType"] = "race";
			break;
		case "pathFeats":
			updateData["system.featureType"] = "path";
			break;
		case "destinyFeats":
			updateData["system.featureType"] = "destiny";
			break;
		default:
			updateData["system.featureType"] = "other";
			break;
	}
	
	if(!itemData.system?.level) updateData["system.level"] = '';
	if(!itemData.system?.requirements) updateData["system.requirements"] = '';
	updateData["system.featureSource"] = '';
	updateData["system.featureGroup"] = '';
	updateData["system.auraSize"] = '';
	
	//Remove obsolete properties
	updateData["system.activation"] = null;
	updateData["system.duration"] = null;
	updateData["system.target"] = null;
	updateData["system.range"] = null;
	updateData["system.uses"] = null;
	updateData["system.consume"] = null;
	
	return updateData;
}

/**
 * Migrate ritual category text to select text
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateRitualCategory(itemData, updateData){	
	if(!itemData.type === 'ritual') return;
	
	updateData["system.category"] = "other";
	//console.debug(CONFIG.DND4E.ritualTypes);
	for ( const [id, group] of Object.entries(CONFIG.DND4E.ritualTypes)){
		//console.debug(`${id} ${group.label}`);
		if( itemData.system.category == id || itemData.system.category == group.label ){
			updateData["system.category"] = id;
		}	
	}
	
	return updateData;
}

/**
* Migrate hazards without movement
* @param {object} actorData   Actor data being migrated.
* @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
* @returns {object}           Modified version of update data.
* @private
*/
function _migrateHazardSpeed(actorData, updateData){
	
	if(actorData?.type != "Hazard") return;
	console.debug(actorData.system.movement);
	const moveTemplate = {'base':{},'walk':{},'run':{},'charge':{},'climb':{},'swim':{},'shift':{}};
	
	const movement = actorData.system.movement === undefined ? moveTemplate : actorData.system.movement;
	console.debug(movement);
	
	for (const [m, mode] of Object.entries(movement)){
		console.debug(m);
		console.debug(mode);	
		if(['notes','custom','none'].includes(m)) continue;
		
		if(mode?.bonus == undefined){			
			updateData[`system.movement.${m}`] = {
				"value": mode.value || 0,
				"bonus": [{}],
				"feat": mode.feat || 0,
				"item": mode.item || 0,
				"power": mode.power || 0,
				"race": mode.race || 0,
				"untyped": mode.untyped || 0,
				"temp": mode.temp || 0
			};
			
			if(m != 'base'){
				let spdFormula = `@base`;				
				if(m === 'run') {
					spdFormula = '@base + 2';
				}else if(m === 'shift'){
					spdFormula = '1';
				}else if(['climb','swim'].includes(m)) {
					spdFormula = '@base / 2';
				}
				updateData[`system.movement.${m}.formula`] = spdFormula;
			}
		}
	}
	
	if(movement.none === undefined) updateData['system.movement.none'] = true;
	
	return updateData;
}

/**
* Migrate actors missing marker key (v0.6.13)
* @param {object} actorData   Actor data being migrated.
* @param {object} updateData  Existing updates being applied to actor. *Will be mutated.*
* @returns {object}           Modified version of update data.
* @private
*/
function _migrateActorMarker(actorData, updateData){
	
	if(!['Player Character','NPC','Hazard'].includes(actorData?.type)) return;
	const system = actorData.system;
	
	if(system?.marker == undefined) updateData['system.marker'] = null;
	return updateData;
}

/**
 * Add keywords & customKeywords properties to features
 * @param {object} itemData   Item data being migrated.
 * @param {object} updateData  Existing updates being applied to item. *Will be mutated.*
 * @returns {object}           Modified version of update data.
 * @private
 */
function _migrateFeatureKeywords(itemData, updateData){
	const sourceType = itemData.type;
	
	if(sourceType == 'feature'){
		//Add new properties from 0.6.13
		if(system?.effectType == undefined) updateData['system.effectType'] = {};
		if(system?.damageType == undefined) updateData['system.damageType'] = {};
		if(system?.customKeywords == undefined) updateData['system.customKeywords'] = "";
		return updateData;
	}	
}