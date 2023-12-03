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
	const model = game.system.model.Actor[actorData.type];
	actorData = filterObject(actorData, model);

	// Scrub system flags
	const allowedFlags = CONFIG.DND4EBETA.allowedActorFlags.reduce((obj, f) => {
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
	return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Scene document to incorporate changes to the data model of it's actor data overrides
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
			const actorData = duplicate(t.actorData);
			actorData.type = token.actor?.type;
			const update = migrateActorData(actorData, migrationData);
			["items", "effects"].forEach(embeddedName => {
				if (!update[embeddedName]?.length) return;
				const updates = new Map(update[embeddedName].map(u => [u._id, u]));
				t.actorData[embeddedName].forEach(original => {
					const update = updates.get(original._id);
					if (update) mergeObject(original, update);
				});
				delete update[embeddedName];
			});

			mergeObject(t.actorData, update);
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
	if(!actorData?.system?.details) return;

	if(actorData.system.details.armourProf == undefined){
		updateData["system.details"] = {
			"value": [],
			"custom": ""
		}
	}
	if(actorData.system.details.weaponProf == undefined){
		updateData["system.details"] = {
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
		for( const [id, def] of Object.entries(skills)){
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
		for( const [id, mod] of Object.entries(skills)){
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
		}
	}

	const movement = actorData?.system?.details?.movement;
	if(movement){
		for( const [id, mov] of Object.entries(skills)){
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
		for( const [id, pasv] of Object.entries(skills)){
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

	const resistances = actorData?.system?.resistances;
	if(resistances){
		for( const [id, res] of Object.entries(skills)){
			if(res.feat == undefined){
				updateData[`system.resistances.${id}.feat`] = 0;
			}
			if(res.item == undefined){
				updateData[`system.resistances.${id}.item`] = 0;
			}
			if(res.power == undefined){
				updateData[`system.resistances.${id}.power`] = 0;
			}
			if(res.untyped == undefined){
				updateData[`system.resistances.${id}.untyped`] = 0;
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
