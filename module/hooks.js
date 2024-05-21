import {SaveThrowDialog} from "./apps/save-throw.js";
import {Helper} from "./helper.js";

/**
 * These methods are all called by https://github.com/Drental/fvtt-tokenactionhud, their method signature should not be changed without a code change there.
 *
 * Also by the integration for TAH Core in Drac's Tools.
 */
export const TokenBarHooks = {
    version: 3
}

TokenBarHooks.generatePowerGroups = (actor) => actor.sheet._generatePowerGroups()

TokenBarHooks.updatePowerAvailable = (actor, power) =>  actor.sheet._checkPowerAvailable(power)

TokenBarHooks.isPowerAvailable = (actor, power) => {
    actor.sheet._checkPowerAvailable(power)
    return !power.system.notAvailable
}

TokenBarHooks.quickSave = (actor, event) => new SaveThrowDialog(actor)._updateObject(event, {save : 0, dc: 10})

TokenBarHooks.saveDialog = (actor, event) =>  actor.sheet._onSavingThrow(event)

TokenBarHooks.healDialog = (actor, event) =>  actor.sheet._onHealMenuDialog(event)

TokenBarHooks.rechargePower = (actor, power, event) => actor.sheet._onItemRecharge(event)

TokenBarHooks.rollPower = (actor, power, event) => {
    const fastForward = Helper.isRollFastForwarded(event);
    return actor.usePower(power, {configureDialog: !fastForward, fastForward: fastForward})
}

TokenBarHooks.rollSkill = (actor, checkId, event) => actor.rollSkill(checkId, { event: event });

TokenBarHooks.rollAbility = (actor, checkId, event) => actor.rollAbility(checkId, { event: event });

TokenBarHooks.rollItem = (actor, item, event) => item.roll()

TokenBarHooks.deathSave = (actor, event) => actor.sheet._onDeathSave(event)

TokenBarHooks.secondWind = (actor, event) => actor.sheet._onSecondWind(event)

TokenBarHooks.actionPoint = (actor, event) => actor.sheet._onActionPointDialog(event)

//v3 hook - get all the powers back grouped by sheet selection
TokenBarHooks.powersBySheetGroup = (actor) => {
    const allPowers = actor.items.filter((item) => item.type === "power")
    const powersByGroup = actor.sheet._generatePowerGroups();
    for (let p of allPowers) {
        powersByGroup[actor.sheet._groupPowers(p, powersByGroup)].items.push(p);
    }
    actor.sheet._sortPowers(powersByGroup);
    return powersByGroup;
}

//v3 hook.  _generateItemSummary returns a jquery selector that the sheet wants.  Give the caller back just the html.
TokenBarHooks.generateItemTooltip = async (actor, item) => (await actor._sheet._generateItemSummary(item)).get(0).outerHTML

