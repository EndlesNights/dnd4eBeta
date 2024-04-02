
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} dropData     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
export async function create4eMacro(dropData, slot) {
	const macroData = { type: "script", scope: "actor" };

	if(dropData.type === "Item") {
		const itemData = await Item.implementation.fromDropData(dropData);
		console.log(itemData)
		if ( !itemData ) {
			ui.notifications.warn("MACRO.4eUnownedWarn", {localize: true});
			return null;
		}
		foundry.utils.mergeObject(macroData, {
			name: itemData.name,
			img: itemData.img,
			command: `game.dnd4e.rollItemMacro("${itemData.name}")`,
			flags: {"dnd4e.itemMacro": true}
		});
	}
	else if(dropData.type === "ActiveEffect") {
		const effectData = await ActiveEffect.implementation.fromDropData(dropData);
		if ( !effectData ) {
			ui.notifications.warn("MACRO.4eUnownedWarn", {localize: true});
			return null;
		}
		foundry.utils.mergeObject(macroData, {
			name: effectData.name,
			img: effectData.icon,
			command: `game.dnd4e.toggleEffect("${effectData.name}")`,
			flags: {"dnd4e.effectMacro": true}
		});
	}
	
	// Assign the macro to the hotbar
	const macro = game.macros.find(m => {
		return (m.name === macroData.name) && (m.command === macroData.command) && m.isAuthor;
	}) || await Macro.create(macroData);
	game.user.assignHotbarMacro(macro, slot);
	
}

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
export function rollItemMacro(itemName, type="DOCUMENT.Item") {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if ( speaker.token ) actor = game.actors.tokens[speaker.token];
	if ( !actor ) actor = game.actors.get(speaker.actor);
	if ( !actor ) return ui.notifications.warn(game.i18n.localize("DND4E.ControlledNoActor"));

	// Get matching items
	const items = actor ? actor.items.filter(i => i.name === itemName) : [];
	if ( items.length > 1 ) {
    ui.notifications.warn(game.i18n.format("MACRO.4eMultipleTargetsWarn", { actor: actor.name, type: game.i18n.localize(type), name: itemName }));
	} else if ( items.length === 0 ) {
		return ui.notifications.warn(game.i18n.format("MACRO.4eMissingTargetWarn", { actor: actor.name, type: game.i18n.localize(type), name: itemName }));
	}
	const item = items[0];

	// Trigger the item roll
	const power = ["power","atwill","encounter","daily","utility", "item"];
	if ( power.includes(item.type)) return actor.usePower(item);
	return item.roll();
}

/* -------------------------------------------- */

/**
 * Toggle an effect on and off when a macro is clicked.
 * @param {string} effectName        Name of the effect to be toggled.
 * @returns {Promise<ActiveEffect>}  The effect after it has been toggled.
 */
export function toggleEffect(effectName, type="DOCUMENT.ActiveEffect") {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if ( speaker.token ) actor = game.actors.tokens[speaker.token];
	if ( !actor ) actor = game.actors.get(speaker.actor);
	if ( !actor ) return ui.notifications.warn(game.i18n.localize("DND4E.ControlledNoActor"));

	const collection = Array.from(actor.allApplicableEffects());

	const documents =  collection.filter(i => i.name === effectName);
	console.log(effectName)
	if(documents.length === 1){
		const effect = documents[0]
		return effect?.update({disabled: !effect.disabled});
	}
	else if (documents.length > 1){
    ui.notifications.warn(game.i18n.format("MACRO.4eMultipleTargetsWarn", { actor: actor.name, type: game.i18n.localize(type), name: effectName }));
	} else {
		return ui.notifications.warn(game.i18n.format("MACRO.4eMissingTargetWarn", { actor: actor.name, type: game.i18n.localize(type), name: effectName }));
	}

}
