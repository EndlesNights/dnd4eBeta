import {SaveThrowDialog} from "./apps/save-throw.js";

/**
 * These methods are all called by https://github.com/Drental/fvtt-tokenactionhud, their method signature should not be changed without a code change there.
 */
export const TokenBarHooks = {
    version: 2
}

TokenBarHooks.generatePowerGroups = (actor) => actor.sheet._generatePowerGroups()

TokenBarHooks.updatePowerAvailable = (actor, power) =>  actor.sheet._checkPowerAvailable(power.data)

TokenBarHooks.isPowerAvailable = (actor, power) => {
    actor.sheet._checkPowerAvailable(power.data)
    return !power.data.data.notAvailable
}

TokenBarHooks.quickSave = (actor, event) => new SaveThrowDialog(actor)._updateObject(event, {save : 0, dc: 10})

TokenBarHooks.saveDialog = (actor, event) =>  actor.sheet._onSavingThrow(event)

TokenBarHooks.healDialog = (actor, event) =>  actor.sheet._onHealMenuDialog(event)

TokenBarHooks.rechargePower = (actor, power, event) => actor.sheet._onItemRecharge(event)

TokenBarHooks.rollPower = (actor, power, event) => actor.usePower(power)

TokenBarHooks.rollSkill = (actor, checkId, event) => actor.rollSkill(checkId, { event: event });

TokenBarHooks.rollAbility = (actor, checkId, event) => actor.rollAbility(checkId, { event: event });

TokenBarHooks.rollItem = (actor, item, event) => item.roll()

TokenBarHooks.deathSave = (actor, event) => actor.sheet._onDeathSave(event)

TokenBarHooks.secondWind = (actor, event) => actor.sheet._onSecondWind(event)

TokenBarHooks.actionPoint = (actor, event) => actor.sheet._onActionPointDialog(event)