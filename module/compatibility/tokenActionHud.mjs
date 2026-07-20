import { Actor4e, Item4e } from "../documents/_module.mjs";
import * as utils from "../utils/utils.mjs";
import * as apps from "../applications/apps/_module.mjs";

/**
 * These methods are all called by https://github.com/Drental/fvtt-tokenactionhud, their method signature should not be changed without a code change there.
 *
 * Also by the integration for TAH Core in Drac's Tools.
 */
export const TokenBarHooks = {
	version: 3,
};

TokenBarHooks.generatePowerGroups = (actor) => actor.sheet._generatePowerGroups();

TokenBarHooks.updatePowerAvailable = (actor, power) => actor.sheet._checkItemAvailable(power);

TokenBarHooks.isPowerAvailable = (actor, power) => {
	actor.sheet._checkItemAvailable(power);
	return !power.system.notAvailable;
};

TokenBarHooks.quickSave = (actor, event) => actor.rollSave(event, { isFF: true }, {});

TokenBarHooks.saveDialog = (actor, event) => new apps.SaveThrowDialog({ document: actor }).render(true);

TokenBarHooks.healDialog = (actor, event) => new apps.HealMenuDialog({ document: actor }).render(true);

TokenBarHooks.rechargePower = (actor, power, event) => actor.sheet._onItemRecharge(event, power);

TokenBarHooks.rollPower = (actor, power, event) => {
	const fastForward = utils.isRollFastForwarded(event);
	return actor.usePower(power, { configureDialog: !fastForward, fastForward: fastForward });
};

TokenBarHooks.rollSkill = (actor, checkId, event) => actor.rollSkill(checkId, { event: event });

TokenBarHooks.rollAbility = (actor, checkId, event) => actor.rollAbility(checkId, { event: event });

TokenBarHooks.rollItem = (actor, item, event) => item.roll();

TokenBarHooks.deathSave = (actor, event) => new apps.DeathSaveDialog({ document: actor }).render(true);

TokenBarHooks.secondWind = (actor, event) => new apps.SecondWindDialog({ document: actor }).render(true);

TokenBarHooks.actionPoint = (actor, event) => new apps.ActionPointDialog({ document: actor }).render(true);

//v3 hook - get all the powers back grouped by sheet selection
TokenBarHooks.powersBySheetGroup = (actor) => {
	const allPowers = actor.itemTypes.power;
	const powersByGroup = actor.sheet._generatePowerGroups();
	for (let p of allPowers) {
		powersByGroup[actor.sheet._groupPowers(p, powersByGroup)].items.push(p);
	}
	actor.sheet._sortPowers(powersByGroup);
	return powersByGroup;
};

/**
 * 
 * @param {Actor4e} actor 
 * @param {Item4e} item 
 */
TokenBarHooks.generateItemTooltip = async (actor, item) => {
	//see actor-sheet.js line 383
	const chatdata = await item.getChatData({ secrets: actor.isOwner });
	if ((item.type === "power") && item.system.autoGenChatPowerCard) {
		let attackBonus = null;
		if (item.hasAttack) {
			attackBonus = await item.getAttackBonus();
		}
		let detailsText = utils.preparePowerCardData(chatdata, actor.getRollData(), attackBonus);
		const enrichedDetailsText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(detailsText, {
			relativeTo: actor,
		});
		return enrichedDetailsText;
	}
	else {
		return chatdata.description.value;
	}
};
