# Changelog

## Version 0.0.9
- Fix issue with actor data path value
- Changes to Implement Weapons seperating how attack bonus work between using phyiscal attacks and damage bonus, and Implement attack and damage bonus.
- Adding macros that can be embeded onto items/powesr. Works comparibly to Foundry Macros, but with a number of difrent options such as, replacing the item's basic roll funcation, launching before the items roll, after the items roll, and before & after the items roll. Maybe more funcationaly to follow.
- Changed how weapon dice are stored and weapon dice damage is calculated. "@wepDiceNum" and "@wepDiceDamage" have been replaced with "@wepDice(#)" where # is the number of diced rolled in a power. Additioanly "@wepMax" can be used to quickly calculate the highest possible value for the weapon dice roll.
- Weapon now support adtioanl mixed pools or dice, so a weapon can now have the equivelant to a damage roll such as "1d8 + 1d4" 
- item labels have been extended.
- Age and Height fields on character sheets can now to fill with strings.
- Number of targets can now be filled with a string.
- Added number of missing text lines to lang options.
- Removed depricated short rest rules from the system settings that were inhierted from 5e and were causing some confusion.

## Version 0.0.8
- Added number of status icons for varaity of cases(Work in progress) 
- Actor data path values should now be accesable to formulas when writen as "@the.path.to.data"

## Version 0.0.7
- Work on item weapons
- Added a field when brutal weapon properties is selected, can now input the brutal value for dice "re-rolling"
- Brutal Dice will now do the mathematical equivalent of infinite  re-rolling. As the current FVVT does roll modifiers only support a single re-roll per dice, a solution stop gap solution was made where the die total size is decreased by n number equal to the brutal re-roll threshold, and the value is then added back to the dicer as a bonus term.
- Fixed a typeo where the line for "MISS" instead said "HIT"

## Version 0.0.6
- Fixed issues where the value for WilL Defence was trying to check the "char" abilities score instead of "cha"