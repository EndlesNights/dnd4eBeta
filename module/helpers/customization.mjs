/**
 * Adds custom skills to CONFIG.DND4E.skills.
 */
export function customSkillSetup() {
	CONFIG.DND4E.coreSkills = foundry.utils.deepClone(CONFIG.DND4E.skills); 

	const customSkillsArray = game.settings.get("dnd4e", "custom-skills");
	
	if (!customSkillsArray.length) return;

	for (const skill of customSkillsArray) {
		CONFIG.DND4E.skills[skill.id] = {
			label: skill.label,
			ability: skill.ability,
			armourCheck: skill.armourCheck,
		};
	}
}

/**
 * Adds custom statuses to CONFIG.DND4E.statusEffect.
 */
export function customStatusSetup() {
	CONFIG.DND4E.coreStatuses = foundry.utils.deepClone(CONFIG.DND4E.statusEffect); 

	const customStatusArray = game.settings.get("dnd4e", "custom-statuses");
	
	if (!customStatusArray.length) return;

	for (const status of customStatusArray) {
		CONFIG.DND4E.statusEffect[status.id] = {
			name: status.name,
			img: status.img,
			description: status.description,
		};
	}
}

/**
 * Integrates custom status changes into default status AEs
 */
export async function applyCustomStatusToCompendium() {
	const PACK_ID = "dnd4e.example_effects";
	const pack = game.packs.get(PACK_ID);
	if (!pack) return;

	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({ locked: false });

	const effects = await pack.getDocuments();

	const statusEffects = CONFIG.statusEffects;
	const updates = [];

	// Iterate over compendium entries - applying fine-tuned migration functions
	for (let effect of effects) {
		if (effect.statuses.size !== 1) continue;
		const effectStatus = Array.from(effect.statuses)[0];
		const status = statusEffects[effectStatus];
		if (!status) continue;
		const localizedDescription = _loc(status.description);
		const update = {};
		if (effect.name !== status.name) {
			update.name = status.name;
		}
		if (effect.img !== status.img) {
			update.img = status.img;
		}
		if (effect.description !== localizedDescription) {
			update.description = localizedDescription;
		}
		if (!Object.keys(update).length) continue;
		update._id = effect._id;
		updates.push({
			action: "update",
			documentName: "ActiveEffect",
			updates: [update],
			pack: PACK_ID,
		});
	}

	if (!updates.length) return;

	await foundry.documents.modifyBatch(updates);

	// Apply the original locked status for the pack
	await pack.configure({ locked: wasLocked });
}
