# Changelog

## Version 0.2.85
- Pass the event into initative to allow for fast forwarding [merge](https://github.com/EndlesNights/dnd4eBeta/pull/232) from [TheGiddyLimit](https://github.com/draconas1)
- FastForward Keys moved to helper function [merge](https://github.com/EndlesNights/dnd4eBeta/pull/231) from [kyleady](https://github.com/kyleady)
- Bugfix with Attacking Multiple Tokens with FastForward [merge](https://github.com/EndlesNights/dnd4eBeta/pull/230) from [kyleady](https://github.com/kyleady)
- Bugfix when attack with defecne that targeted null defence type [merge](https://github.com/EndlesNights/dnd4eBeta/pull/229) from [kyleady](https://github.com/kyleady)
- Added limited view for NPCs [merge](https://github.com/EndlesNights/dnd4eBeta/pull/228) from [mncimino1993](https://github.com/mncimino1993)

## Version 0.2.84
- fixed issue where healing where "surgeValue" tag was consuming a healing surge instead of just granting the HP. (For real this time)

## Version 0.2.83
- fixed issue where brutal value should have been checking for "less than equal" when it was instead just checking for "less than"
- fixed issue where healing where "surgeValue" tag was consuming a healing surge instead of just granting the HP.

## Version 0.2.82
- fixed small issue with object sorting on sheets. Powers, items, and feats should now be able to be manually resorted objects within the confines of the current sorting filters by dragging and dropping the items once more.
- fixed issue with power text filter, where the input element id was having interference from the feat filter input element because they shared the same id.
- fixed css for pwer text filter, where the css intended for another element was not specific enough and was causing the text to be unreadable shade of white.

## Version 0.2.81
- fixed fastforward for damage rolls
- can now fastword power use, will autmaticly roll attack, damage, and healing rolls, as well as place measure templates.

## Version 0.2.80
- hotfix, forgot to remove a testcase.

## Version 0.2.79
- users should now be able to apply effects to targets that they do not controls via socket
- switched the icon used for dead tokens to standardized with core Foundry [merge](https://github.com/EndlesNights/dnd4eBeta/pull/120) from [TheGiddyLimit](https://github.com/TheGiddyLimit)
- change to helper function that will replace empty values with a string of "0" instead of empty strings so that roll formulas properly eventuate. [merge](https://github.com/EndlesNights/dnd4eBeta/pull/209) from [BadgerKing7](https://github.com/BadgerKing7)
- fixed an issue where older powers area of effect templates would not load properly as there value was still stored numerically and not in a string.
- When rolling initiative from a character sheet, the user will now be promoted with the standard rolling dialog option and be able to input situational bonuses

## Version 0.2.78
- more fixes with linked actor/token effect interactions in regards to self application of effects
- added edge case for effects ending at the start of a targets turn when they are first in the init order
- fix strange interaction where some times an effects duration would not properly set if sourced from actors with linked data

## Version 0.2.77
- hotfix, fix long rest, broke because of effect durations
- hotfix, fix filter issue with power effects that should target self not going into their proper category
- hotfix, fix an issue where powers that soured from token/actors with linked data would cause a null value that would prevent their effects from being placed on their targets. 

## Version 0.2.76
- hotfix, fixed spelling / grammer

## Version 0.2.75
- hotfix, added text for end of day for durations

## Version 0.2.74
- item sheet css fix
- added some more sorting options for powers
- powers will also have a tertiary alphabetical sorting applied to them.
- active effects provided by items now have an option where the effect is only turned on while the item is equipped.
- active effects from powers can be applied to target tokens
- duration options have been added to active effects
- when half levels are turned off, it will no longer show the value of mod + 1/2 level next to the ability mods.
- The value for Area of Effect sizes within powers/consumables is now a string text, and can be composed of basic roll formulas.

## Version 0.2.73
- fix damage type calculation
- added alternative damage calculation rules
- action point riders custom text [merge](https://github.com/EndlesNights/dnd4eBeta/pull/200) from [draconas1](https://github.com/draconas1)

## Version 0.2.72
- fixed an issue where bonus damage was overrider secondary damage.

## Version 0.2.71
- fixed issue where addition symbol was not correctly being added to the bonus from tool rolls, causing the value to be appended to the value of the skill.
- melee weapons with the light throw and heavy throw properties should now be usable with both melee and ranged powers  

## Version 0.2.70
- Added an option to show formual as part of power data card text
- NPC powers will now have the formual as the default instea of an ability score
- Some extra hooks for Token Action HUD. [merge](https://github.com/EndlesNights/dnd4eBeta/pull/195) from [draconas1](https://github.com/draconas1)

## Version 0.2.69
- nice
- Made all SRD armours proficient by default [merge](https://github.com/EndlesNights/dnd4eBeta/pull/194) from [draconas1](https://github.com/draconas1)
- Fixed Macro Execution, Centralised the execution to one place so they all have consistent data [merge](https://github.com/EndlesNights/dnd4eBeta/pull/193) from [draconas1](https://github.com/draconas1)

## Version 0.2.68
- moved "Spend Healing Surges?" option into the isHealing required handle be where it was intended to be.
- fix variable name mistype where "diagonalMovement" was checking instead of intended "damageCalcRules"
- Updates to Manual [merge](https://github.com/EndlesNights/dnd4eBeta/pull/191) from [draconas1](https://github.com/draconas1)

## Version 0.2.67
- Hotfix check that added "-2 to attack rolls" for Non proficient armour penalty caused Not-A-Number. when no penalty was detected instead of zero.

## Version 0.2.66
- Tweak to Effects modifieirs CSS
- Heal/Damage by surge amount
- Non proficient armour penalty added. Characters who are wearing armour that they are not proficient in will take a -2 to attack rolls and have a -2 to their reflex defences.
- Non proficient shield penalty added. Characters who are not proficient with a shield they have equipped will not gain the any of the defences provided by the shields stats.

## Version 0.2.65
- fixed issue with modifyTokenAttribute setting health while delta is false. Should now be able to correctly change any values again.
- changed how temphp is stored, is now stored at 'name="data.attributes.temphp.value'.
- temphp can now be set when setting to as a token Bar attribute, using maxHP for its scale.
- tempHP is now set as the default option for secondaryTokenAttribute for all new tokens.
- surge values is now completely self derived via code as the bases for any surge at 'data.details.surgeValue'. Use 'data.details.surgeBon.value' via effects if you wish to modify it. [merge](https://github.com/EndlesNights/dnd4eBeta/pull/186) from [draconas1](https://github.com/draconas1)

## Version 0.2.64
- fix to damage calculation with untyped damage.
- Formula term highlight rollback + minor fixes [merge](https://github.com/EndlesNights/dnd4eBeta/pull/183) from [draconas1](https://github.com/draconas1)
- Added additional power type category options [merge](https://github.com/EndlesNights/dnd4eBeta/pull/182) from [FoxLee](https://github.com/FoxLee)
- updated example character and powers to match new categories.

## Version 0.2.63
- "Manual & Help" documentation was added into the system as a Journal Entry Compendium pack. [merge](https://github.com/EndlesNights/dnd4eBeta/pull/171) from [draconas1](https://github.com/draconas1)
- Number of data fixes seen in the following [merge](https://github.com/EndlesNights/dnd4eBeta/pull/177) from [draconas1](https://github.com/draconas1) This could have been a patch on its own!
- refactor to prepareData()
- new helper formula calls to help with all sorts of power or feat formulas that scale from tiers 
	@heroic, returns value of 1 if character level is less than 11, else zero
	@paragon, returns value of 1 if character level is or is between 11 and 20, else zero
	@Epic, returns a value of 1 if character level is 21 or higher, else zero,
	@heroicOrParagon, if @heroic or @paragon are true, return 1 else zero
	@paragonOrEpic, if @paragon or @epic are true, return 1 else zero
- All classes now use @conMod for their surge bonus, no more half a surge for characters with con 15! Stupid javascript type system.
- All classes now set their HP formula to override, because HP auto-calc fields are saved in the actor and the effects directly edit them, having effects that add to them is hilarious and bumps them every time you view that screen and triggered a save.
It should be noted this is still a risk with hp-auto calc and the bonus field.
- Dragonborn racial fixed to modify surge value, not number of surges. Closes Dragonborn Racial applies wrong effect #166
- Elves kneecapped. Previously Elves added 7 to their speed and so went zipping along at speed 13. Set to override.
- Human racial flange of +1 to all defences added to their racial package. I know humans suck, but not giving them their racial defence bonus was really mean. Think of all the poor humans who have died for the lack of +1 ref!
- Updated Basic Melee and Ranged attacks to use a base damage formula of 1 + @Epic so their damage scales automatically
- Poked the @powmax variable in formula helper so it will handle formula in the power base damage multiplier the same as @powbase does.
- Fixed an issue in highlighted rolls because foundry modifies the formula of dice rolls (a few spaces appear and disappear)
- Resurrected @wepDice() to use with high crit weapons
- All SRD high crit weapons have their bonus crit damage put in the bonus crit damage formula and done as @wepDice(@tier) so it just gives them the right number based on their base damage and tier.
- when I entered SRD weapons I somehow missed the 2 handed property. 2 handed wepaons now correctly have the 2H weapon property set so work with the example fighter weapon talent.
- Fixed why implement secondary crit damage could not be deleted [merge](https://github.com/EndlesNights/dnd4eBeta/pull/178) from [draconas1](https://github.com/draconas1)
- Added Confirm delete option, no more accedently deleting powers/items when enabled [merge](https://github.com/EndlesNights/dnd4eBeta/pull/179) from [draconas1](https://github.com/draconas1) RIP all you accedently deleted powers.
- Buttons added at the ned of damage and healing rolls to indicate to apply damage and or healing effect [merge](https://github.com/EndlesNights/dnd4eBeta/pull/180) from [draconas1](https://github.com/draconas1)
- Added Level to all inventory items as a top level field, like on paragon/epic features [merge](https://github.com/EndlesNights/dnd4eBeta/pull/181) from [draconas1](https://github.com/draconas1)
	also allows @itemLevel to reference it in formula.
	updated example potions and example alchemy to have the correct values in that field (they are the only example things I know of that have a level, everything else is non magical).
- Scrolling Text on token when they take damage or healing.

## Version 0.2.62
- Fixed issue with numbers not being strings, again. [merge](https://github.com/EndlesNights/dnd4eBeta/pull/168) from [draconas1](https://github.com/draconas1) authors note, "I hate javascript"
- Update to Steve the Example Character [merge](https://github.com/EndlesNights/dnd4eBeta/pull/164) from [draconas1](https://github.com/draconas1)
	Now has a close burst 1 AoE power that uses an implment
	has an example ritual that can summon badgers
	Feat that adds to fire attack and damage powers
	Updated fighter weapon talents to have an effect to boost that attack.
- Added Hooks for Token Action HUD [merge](https://github.com/EndlesNights/dnd4eBeta/pull/163) from [draconas1](https://github.com/draconas1)
- custom movement types will now show up in the tooltip when mouse hovering over movement
- Some more tinkering around with the NPC sheet
	added rest buttons
	added a field to see temporary HP
	custom movement types will now appear directly on the sheet
	other minor edits to the CSS styles

## Version 0.2.61
- removed the default miss formula and effects [merge](https://github.com/EndlesNights/dnd4eBeta/pull/162) from [draconas1](https://github.com/draconas1)

## Version 0.2.60
- fix implement groupings [merge](https://github.com/EndlesNights/dnd4eBeta/pull/159) from [draconas1](https://github.com/draconas1)
- fixed issue with NPC initiative calculation check.... again...
- minor tweaks to NPC sheet CSS
- changed how ritual roll formulas work
- added labels to Rituals / Tool items

## Version 0.2.59
- fixed issue with NPC initiative calculation check
- can now use @varubles math formulas when define the max limited use of powers/items
- fixed roll expressions highlighting [merge](https://github.com/EndlesNights/dnd4eBeta/pull/152) from [draconas1](https://github.com/draconas1)
- added leader to npc template [merge](https://github.com/EndlesNights/dnd4eBeta/pull/153) from [draconas1](https://github.com/draconas1)
- fixed ritual Rolling issue #95 [merge](https://github.com/EndlesNights/dnd4eBeta/pull/154) from [draconas1](https://github.com/draconas1)
- compendium equipment updates [merge](https://github.com/EndlesNights/dnd4eBeta/pull/155) from [draconas1](https://github.com/draconas1)
- updated to effect variables [merge](https://github.com/EndlesNights/dnd4eBeta/pull/156) from [draconas1](https://github.com/draconas1)

## Version 0.2.58
- added custom mesure template to Foundry for burst
- "Regular" creatureRoleSecond renamed to "Standard"
- added "Other" option to creatureRoleSecond
- again changed the NPC monster leader value to be stored at 'data.details.role.leader' instead of 'data.details.leader'

## Version 0.2.57
- changed the NPC monster leader value to be stored at 'data.details.leader' instead of 'data.leader'
- NPC initiative will no longer add mod score while advanced math option is set to false 

## Version 0.2.56
- Player Character Actors will now start with:
	data linked between character sheet to tokens
	vision mode turned on
	token disposition set to friendly
- refactoring of commonReplace formula

## Version 0.2.55
- Minor tweaks to tool checks [merge](https://github.com/EndlesNights/dnd4eBeta/pull/146) from [draconas1](https://github.com/draconas1)
- Added Alignment back to Character and NPC sheets
- Added Spoken Language options to NPC sheets
- Minor tweak to CSS to fix the formating around custom resources

## Version 0.2.54
- SRD Potions should now automatically target a characters healing surges
- SRD weapon tables minor size adjustment
- if no value is entered into a weapons brutal dice value, the system should default to rerolling 1s
- if no value is entered into a weapons critical hit value, the system should default to use a 20
- added option to disable half levels for Ability, Defense, Skills and Initiative score values to accommodate for a somewhat common house rule.
- fixed issue with automatic attack rolls not properly targeting single targets

## Version 0.2.53
- Fixed an issue with creating with dragging items into the macro bar that was cause by attempting to use a deprecated call from v8.
- Roll formula display [merge](https://github.com/EndlesNights/dnd4eBeta/pull/140) from [draconas1](https://github.com/draconas1)
	shows the origins formula expression that went into a roll, and highlights where those numbers come from
	refactor the d20 Roll and rollDamage scripts to make them easier to maintain
	refactor of helper functions to reduce number of duplication iteration
	added the selected weapon's name to the attack and damage roll popout menus
- Fixed multirolling interaction with [Dice-So-Nice](https://foundryvtt.com/packages/dice-so-nice) module, all the dice should now roll! More 3d dice!
- Fixed a deprecated call where Items/Powers could not be dragged into the macro hotbar after updating v8 to v9.
- Armour penalties are now treaded as absolute values and then subtracted from [draconas1](https://github.com/draconas1)

## Version 0.2.52
- Long rest defaults to hospitable environment [draconas1](https://github.com/draconas1)

## Version 0.2.51
- Rearranged of some status effects so that they are in alphabetical order.
- rich text editor option for power effects [draconas1](https://github.com/draconas1)
- Added rechargeCondition to template.json [draconas1](https://github.com/draconas1)
- Healing button added for ease of use to spend healing surges on self [draconas1](https://github.com/draconas1)
- Support added for use with the [Token Action HUD](https://github.com/Drental/fvtt-tokenactionhud) module [draconas1](https://github.com/draconas1)
- SRD Compenuim updates: [draconas1](https://github.com/draconas1)
	Rapier changed from the Superior Melee classification to Military Melee based on our interpretation of page 109 of the Errata doc.
	Added SRD Potions Compendium with all PHB SRD Potions
	Added SRD Common Powers Compendium with the basic action powers that involve attack rolls: Basic attack, bull rush, grab, drag and charge
- fix to power consumables not being consumed [draconas1](https://github.com/draconas1)
- fixes to "Steve, the example character" [draconas1](https://github.com/draconas1)

## Version 0.2.50
- Quick fix to short rest, for v9 comparability

## Version 0.2.49
- Updated To Foundry v9
- change system compatibleCoreVersion to include v9
- fixed issue with @impCritBonus

## Version 0.2.48
- fixed formating error on NPC sheet
- When viewing character sheet where the character's hp is within the bloodied state, it should appear as red again.
- Added player class options to NPC monster primary role options
- fixed importing item objects to character / npc sheets after was broken in v9.x conversion
- fix an error where in older weapons where the Extra Modifiers part of damageDice.parts.#.2 would cause 'undefined' to appear in the middle of rolls

## Version 0.2.47
- quick fix to healing rolls
- fixed an issue where the helper functions would not properly replace a value if it was used twice.

## Version 0.2.46
- power dice options now include an option for a d20
- added an extra field to weapons for Foundry dive modifiers
- added @impCritBonus which will ignore the powers weapon requirement and just take the data from 'weaponData.critDamageFormImp'

## Version 0.2.45
- Assign temp HP option to the damage rolls in chat [draconas1](https://github.com/draconas1)
- Tweaked the chat helper to stop undefined and empty spaces appearing [draconas1](https://github.com/draconas1)
- Fix socket namespace [draconas1](https://github.com/draconas1)
- Added some missing keywords [Marcloure](https://github.com/Marcloure)
- Wil renamed to Will [Marcloure](https://github.com/Marcloure)
- Added searching and sorting options to Features tab [Marcloure](https://github.com/Marcloure)
- MultiTargetBonuses [ahoward-cf](https://github.com/ahoward-cf)
- Number of spelling mistakes fixed [FoxLee](https://github.com/FoxLee))
- Updated number of deprecated methods for v9.0 compatibility [draconas1](https://github.com/draconas1)
- Fixed a few more deprecated methods
- Recharge powers can now roll to be recharged when out of charges
- Fix to damage calculations [Marcloure](https://github.com/Marcloure)
- Power card change, Requirements and Trigger come before Target [Marcloure](https://github.com/Marcloure)
- Power card change, Hit text can now show up without requiring an attack roll. 
- Power card change, Powers can have an optional secondary power source [Marcloure](https://github.com/Marcloure)
- Added global Attack and Damage Modifiers that can be used for feats and items. These can be used in formulas as @atkMod and @dmgMod. [Marcloure](https://github.com/Marcloure)
- Added Item type for powers on character sheet [draconas1](https://github.com/draconas1)
- Allow for rolls without weapons if weapon use is set to one even if weaponType is set to a non None value, [draconas1](https://github.com/draconas1) 
- Fix issue with changing value of attribute bars
- Reworked how attack roll attributes are computed, @paths with null values shouldn't cause errors anymore.
- Added Miss button for damage roll dialog

## Version 0.2.44
- fixed issue for item macros, actor data, item data, and launch order should now all be accessible again. 
- changed how the assisting macro for the [Dual Wielding Strike (Primary)](https://github.com/EndlesNights/dnd4eBeta/blob/f2cb282fbbca8c3a988f1fa1cec8ca4cf1f5dab8/packs/example_powers.db#L7) example power, should no longer require having the actor selected to trigger the use of the secondary power.
- issue [#75](https://github.com/EndlesNights/dnd4eBeta/issues/75) fix with updates moved to the appropriate method.

## Version 0.2.43
- Change how some more values are calculated to make them work better with active effects
- added "@tier" to the short hand helper list
- [libWrapper](https://github.com/ruipin/fvtt-lib-wrapper) has been added as a dependency.
- implemented functionally of [fvtt-rolldata-aware-active-effects](https://github.com/wyrmisis/fvtt-rolldata-aware-active-effects) into system
- consumable items should not use charges properly
- consumable, added missing feature for enabled to destroy item on final use
- fixed some spelling mistakes
- made some fonts slightly darker for a higher contrast on the character sheet to improve readable
- inverted how the Skill Check Penalty, and Movement Penalty values are calculated so that the numbers reflect that of the PHB. (Just used addition instead of subtraction now)
- creation of srd compendiums
- creation of example compendiums

## Version 0.2.42
- Fixing some typos.

## Version 0.2.41
- Fixed an issue where off hand weapons where not working properly.

## Version 0.2.40
- Fixed an issue where AC override was turned on by default.
- Multiple fixes to powercard sheet, 
	wall range and area should now be editable
	Removed some blank options
	Rename 'Wall' to 'Area Wall' to match official language
	Rename 'Touch' to 'Melee Touch' to match official language

## Version 0.2.39
- Change NPC defaults roles to 'Soldier', 'Regular', 'Natural', 'Humanoid'
- Change default Power Group Types sorting to use Usage as the initial search option
- Added Leader option toggle for NPC sheet
- Other minor tweaks to NPC sheet HTML and CSS style
- advancedCals was incorrectly being instantiated in data.details.advancedCals, while it was always checked at data.advancedCals. The NPC template has been fixed. 

## Version 0.2.38
- Added in meele and reach rang options for powers attacks (merge from [draconas1](https://github.com/draconas1))
- Issue fixed where Blank Power Source results in "undefined" in power card (merge from [draconas1](https://github.com/draconas1))
- Added Recharge condition box text box to power config window (merge from [draconas1](https://github.com/draconas1))

## Version 0.2.37
- Changed some more file directories to match current namespace
- Initiative tiebreaker should now work properly
- Initiative tiebreaker is now on by default

## Version 0.2.36
- Fixed some typos
- Removed Unused lines from English localization
- Changed some file directories to match current namespace

## Version 0.2.35
- Removed and reworked some legacy code
- Fixed issue where secondary Damage formula wasn't working for Critical damage
- Ritual Template rework, still need to add functionality
- Added in a number of missing keywords

## Version 0.2.34
- Fixed an issue where rolling damage with no damage type would cause a different issue some times.
## Version 0.2.33
- Quick fix, issue with no damage type causing an error to occur while rolling damage.

## Version 0.2.32
- Changed how mousing over status effect titles are displayed within the renderTokenHUD

## Version 0.2.31
- Early version of automatic damage calculation implementation, when a actor is selected and a suer right clicks on a roll, the apply damage options will now take the actors Resistances, Weaknesses, and immunities into account when apply damage.
- Added an additional option denoted as 'true damage' which will ignore all Resistances, Weaknesses, and immunities calculations.
- Added character image to npc sheet.
- automationCombat option is now set to true by default
- Added Auto Generate Power Card Details option to the system settings as a client system setting.
- Added a system option to determine whether generated NPC will have Advanced Math Options turned on that auto calculate defenses and skills, or not.
- adjusted the height of the Resistances & Weaknesses div so that the scroll bar should now be the proper length.

## Version 0.2.30
- fixed an issue where if using a situation bonus in conjunction with one of the positive common attack bonuses would cause the two numbers to append together rather than add as intended.
- correctly changed compatibleCoreVersion from 8.8, to 8.9

## Version 0.2.29
- fixed an issue where non attack related d20 rolls would fail to roll if another token was targeted.
- fixed an isse with dice tag '@powerMax' to work correctly when rolling multiple dice
- fixed text color issue of charges for inventory
- Character sheets will now be able to auto detect when you're wearing Heavy armour, prevision option still works as an override to allow stat use even if using heavy armour. Can now also set the mod used for AC to none.
- character/npc sheet bonuses dialog windows can now also accept bonus values in the notation of "@path.to.data" 

## Version 0.2.28
- fix issue where writing and then deleting a discretion on a item/power would cause it to save and display as "null"

## Version 0.2.27
- fixed issue where detail value for brutal weapons was null.
- Templates generated from the 'Place Measured Template' will now take the character size into account when generating close burst area templates.
- change to how @powerMax works, should now work without the requirement of a weapon
- fixed issue where item Equipment Sidebar was not properly displaying WIL defence bonus.

## Version 0.2.26
- change to how @powerBase works, should now work without the requirement of a weapon
- changed default power formulas for NPC sheet, so the basic attack no longer uses a weapon by default
- fixed some localization

## Version 0.2.25
- Changed how multitarget attack rolls work
- Multitarget attack rolls now use a custom Roll class, and all rolls are displayed in the same chat message to tidy up chat log
- For now, a single roll dialogged is used for situational bonuses, which apply universally to all rolls (this will change in future)

## Version 0.2.24
- Fix issue where defences would no longer automatically add in ability modifies.

## Version 0.2.23
- Power Card Text can now use actor data to put numerical stat values using either the helper @Shorthands, or @actor.data.location formats.

## Version 0.2.22
- Cristal Hits should now be properly identified by the automation system.

## Version 0.2.22
- Added Half levels to Ability Rolls 
- Fixed issue where common attack bonuses would not add together properly and through an error.

## Version 0.2.21
- Fixed issue with the _preUpdate item entry by adding a null check

## Version 0.2.20
- Fixed an issue where items that used Resource Consumption set to Attribute would cause the item to become unusable once on a character sheet. Attribute Resource Consumption should now be usable again.

## Version 0.2.19
- Fixed issue where Initiative Dexterity Tiebreaker was always on by default. It should now be a toggleable option that can be configured from the System Settings.
- If a token is selected while rolling an attack roll, the result message will now show a message if the attack is a hit or miss. This is optional and needs to be manually enabled under, System Settings => Basic Combat Automation.

## Version 0.2.18
- Fixed issue where powers that use implements as an optional  weapon should where not working properly.

## Version 0.2.17
- Fixed an issue with recovering HP on short rests, where if situational bonus to Healing surges was not specified the value would return as undefined. It should now be working properly.
- Fixed issue where active effects where not working after 8.x update, should now be working again.
- Fixed Fast forwards options for attack and damage rolls: 
	holding shift, ctrl or alt when pressing the attack button will roll an attack roll with no additional bonuses.
	Holding shift, ctrl when pressing the damage button will roll the damage roll with no additional bonuses.
	Holding alt when pressing the damage button will roll a critical damage roll with no additional bonuses.

## Version 0.2.16
- Added weapon Implement type (in addition to existing Implement Property)
- Implement type auto-selects Implement Property and disables checkbox
- Implement type hides some weapon damage fields

## Version 0.2.15
- fixed an issue where situation bonuses and common bonuses where not being added together properly

## Version 0.2.14
- combined Vision and Special Scenes into Scenes
- Fixed an issue where special scenes would not open properly on NPC sheet
- changed english names for number of vision types
- fixed issue where on NPC sheet where Perception could not be trained
- separated PC and NPC defense calculations
- NPC sheet added space between defenses and ability scores
- NPC defense will no longer draw from Abilities
- NPC defense will draw bonus from level instead of half level

## Version 0.2.13
- Added Damage Dice Dropdown to Powers card (merge from [ahoward-cf](https://github.com/ahoward-cf))
- Added handling of Power Damage Dice (merge from [ahoward-cf](https://github.com/ahoward-cf))
- quick change to the above, allowing formal rolls for the `baseQuantity` varuble.
- added healing roll option

## Version 0.2.12
- encumbrance weight calculations should be working as normal again. data structure was changed in 8.x for items, and the old iteration was no longer working

## Version 0.2.11
- NPC tweaking
- tweak to _onChangeInputDelta function, value will no longer change if detects number of invalid changes

## Version 0.2.10
- updated to Foundry Version 0.8.8
- fixed number of spelling mistakes with the en.json lang file
- changed some spells from British English to American English to be more in line with WotC
- Reworkings of the NPC character

## Version 0.2.9
- include names for attack rolls with multi targets

## Version 0.2.8
- included method for rolling multiple attacks based on number of targeted actors, defaulting to 1 if no actors are targeted  (merge from [ahoward-cf](https://github.com/ahoward-cf))

## Version 0.2.7
- place holder NPC monster sheet

## Version 0.2.6
- fixed issue where auto generate templates where not working since switch from Foudnry 0.7.x to 0.8.x
- some more work on NPC sheets
- fixed issue where temp hp was not properly resetting after rests

## Version 0.2.5
- updated to Foundry Version 0.8.7
- fixed how Flavor Text works.
	flavor Text for items will override the item discretion when using the items
	flavor Text as part of rolls will override what chat message text is displayed.
- fixed issue where bonuses to saving throws was not being calculated
- fixed an issue where second wind was healing arithmetically even when at negative HP. It should now heal correctly.
- moved actor.js into /module/actor
- started to wright NPC sheets

## Version 0.2.4
- fixed issue with inline not working on character sheet
- fixed issue where item active effects where using actor active effects instead of their own after post 0.8.x change
- Show Players button should now work for items, and share the item with your players.
- Fixed an issue where if the power Attack Formula was empty, it would still add in the ability mob
- powers that use implements as their weapon should now be usable without one as it should be optional.

## Version 0.2.3
- fixed issue where unlinked tokens could not properly use powers
- fixed issue with short/long rest not properly updating  after porting from FVTT 7.x to 8.x
- fixed math issue where subtracting HP from chat rolls would not go into negative values.

## Version 0.2.2
- Reworked roll configuration window for any d20 based rolls
- Removed '1d20' from default attack roll formulas
- Added an option to disable powers from auto generating power cards, and will instead just display their details (if there are any to display)
- Fixed an issue where undefined values where causing issues with dice rolls for powers/weapons. Undefined values should now return to zero by default.
- Increased font size of power cards from 12px to 14px
- Added Bolding to categories in chat cards to replicate that of original power cards

## Version 0.2.1
- fixed issue where temphp was not being taken into account  when right click applying damage.
- fixed error in code where items would try to delete twice
- fixed Brutal property to now use recursive reroll feater that was added to core in FVTT 0.8.x
- fixed active effects to work again 0.8.x
- Added integrated  macro rolling to all items types

## Version 0.2.0
- Updated To Foundry 0.8.6

## Version 0.1.6
- Updated to Foundry 0.7.10

## Version 0.1.5
- Saving Throw Dialog no longer shares ID with Death Saving Throw
- Fixed Text in Saving Throw Dialog window.
- Added Roll Mode Options to Saving Throw and Death Saving Throw. 

## Version 0.1.4
- Added Power Cards formating to character sheet display
- Added Power Cards formating to power chat message
- Added 3 resources to the character sheet that can be used to track custom resources. Can be set to reset on either short, long rest, and can be accessed at 
	resources.primary.value
	resources.secondary.value
	resources.tertiary.value
- applyChatCardDamage should be working. Right Click on Roll Chat messages.
- fixed issue with scrollbar that was only visible within browser, and not Electron client.
- added custom encumbrance options

## Version 0.1.3
- Added an option for Game Masters to preview and show items to parties groups
- reworked movement dialog options
- Tooltip for movement will now show multiple different move speeds.
- Added an option to import JSON data into items
- Added in option to export items as JSON data onto users clipboard, if browser does not allow for pushing data to clipboard, a pop dialog box where the data can be copied
- fixed issue with death saving throw and bonus
- fixed issue with saving throw and bonus
- when setting a DC for a saving throw, it should now auto select the entire text
- The Fumble and critical (DC) perimeters for saving throw should now correctly auto set if an invalid value is submitted

## Version 0.1.2
- initiative can now be rolled from the character sheet
- changed "surgeCur" to "surges.value"
- changed "surgeDay" to "surges.max"
- fixed issue where number dialog windows couldn't be open at the same time because they shared IDs. They should now all have different IDs.
- added button to spend action points
- Milestones are now visually tracked under the Actionpoint sections.
- Additional effect lines can now be tracked and auto stated via Second Wind
- Additional effect lines can now be tracked and auto stated via Action Points

## Version 0.1.1
- fixed issue where hp was no longer syncing correctly to token bars.
- added scroll bars to attributes/skill section when character sheet is resized smalled
- fixed issue where scroll bars would incorrectly auto jump
- fixed issue where encumbrance bar would some times incorrectly not show when character sheet resized smaller
- changed "attribute" to "attributes"

## Version 0.1.0
- Character Sheet completely reworked from the ground up.
- Began standardization of Player Character template to be more in line with other Foundry Systems to improve universal module use.
- "health" changed to "attribute.hp"
- "init" changed to "attribute.init"
- All powers now inherit from the same json template of "power"
- "resistences" is now spelled correctly as "resistances" 

## Version 0.0.9
- Fix issue with actor data path value
- Changes to Implement Weapons separating how attack bonus work between using physical attacks and damage bonus, and Implement attack and damage bonus.
- Adding macros that can be embedded onto items/powers. Works comparably to Foundry Macros, but with a number of different options such as, replacing the item's basic roll function, launching before the items roll, after the items roll, and before & after the items roll. Maybe more functionally to follow.
- Changed how weapon dice are stored and weapon dice damage is calculated. "@wepDiceNum" and "@wepDiceDamage" have been replaced with "@wepDice(#)" where # is the number of diced rolled in a power. Additionally "@wepMax" can be used to quickly calculate the highest possible value for the weapon dice roll.
- Weapon now support additional mixed pools or dice, so a weapon can now have the equivalent to a damage roll such as "1d8 + 1d4" 
- item labels have been extended.
- Age and Height fields on character sheets can now to fill with strings.
- Number of targets can now be filled with a string.
- Added number of missing text lines to lang options.
- Removed deprecated short rest rules from the system settings that were inherited from 5e and were causing some confusion.

## Version 0.0.8
- Added number of status icons for variety of cases(Work in progress) 
- Actor data path values should now be accessible to formulas when written as "@the.path.to.data"

## Version 0.0.7
- Work on item weapons
- Added a field when brutal weapon properties is selected, can now input the brutal value for dice "re-rolling"
- Brutal Dice will now do the mathematical equivalent of infinite  re-rolling. As the current FVVT does roll modifiers only support a single re-roll per dice, a solution stop gap solution was made where the die total size is decreased by n number equal to the brutal re-roll threshold, and the value is then added back to the dicer as a bonus term.
- Fixed a typeo where the line for "MISS" instead said "HIT"

## Version 0.0.6
- Fixed issues where the value for WilL Defence was trying to check the "char" abilities score instead of "cha"

## Version 0.0.0
- Initial commit