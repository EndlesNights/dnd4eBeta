# Changelog

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
- Added 3 resources to the character sheet that can be used to track custom resources. Can be set to resourch on either short, long rest, and can be accessed at 
	resources.primary.value
	resources.secondary.value
	resources.tertiary.value
- applyChatCardDamage should be working. Right Click on Roll Chat messages.
- fixed issue with scrollbar that was only vissable within browser, and not Electron client.
- added custom encumbrance options

## Version 0.1.3
- Added an option for Game Masters to preview and show items to parties groups
- reworked movement dialog options
- Tooltip for movement will now show multiple difrent move speeds.
- Added an option to import JSON data into items
- Added in option to export items as JSON data onto users clipboard, if browser does not allow for pushing data to clipboard, a pop dialog box where the data can be copied
- fixed issue with death saving throw and bonus
- fixed issue with saving throw and bonus
- when setting a DC for a saving throw, it should now auto select the entire text
- The Fumble and critical (DC) perameters for saving throw should now correctly auto set if an invalid value is submited

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