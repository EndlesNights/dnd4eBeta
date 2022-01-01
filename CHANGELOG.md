# Changelog

## Version 0.2.51
- Rearranged of some status effects so that they are in alphabetical order.

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