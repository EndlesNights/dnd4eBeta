import { Actor4e } from "./actor/actor.js";
import {Helper} from "./helper.js";
import Item4e from "./item/item.js";

/**
 * These methods are all called by https://github.com/Drental/fvtt-tokenactionhud, their method signature should not be changed without a code change there.
 *
 * Also by the integration for TAH Core in Drac's Tools.
 */
export const TokenBarHooks = {
    version: 3
}

TokenBarHooks.generatePowerGroups = (actor) => actor.sheet._generatePowerGroups()

TokenBarHooks.updatePowerAvailable = (actor, power) =>  actor.sheet._checkItemAvailable(power)

TokenBarHooks.isPowerAvailable = (actor, power) => {
    actor.sheet._checkItemAvailable(power)
    return !power.system.notAvailable
}

TokenBarHooks.quickSave = (actor, event) => actor.rollSave(event, {isFF : true});

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

/**
 * 
 * @param {Actor4e} actor 
 * @param {Item4e} item 
 */
//v3 hook.  _generateItemSummary returns a jquery selector that the sheet wants.  Give the caller back just the html.
TokenBarHooks.generateItemTooltip = async (actor, item) => {
    //see actor-sheet.js line 383
    const chatdata = await item.getChatData({secrets: actor.isOwner})
    console.log(chatdata)
    if (item.type === "power" && item.system.autoGenChatPowerCard) {
        let attackBonus = null;
        if(item.hasAttack){
            attackBonus = await item.getAttackBonus();
        }
        let detailsText = Helper._preparePowerCardData(chatdata, CONFIG, actor, attackBonus);
        const enrichedDetailsText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(detailsText, {
            async: true,
            relativeTo: actor
        });
        console.log(enrichedDetailsText)
        return enrichedDetailsText
    }
    else {
        return chatdata.description.value
    }
}

