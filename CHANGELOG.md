# Changelog

## Version 0.7.5.1 Hotfix
- Fixes a bug that prevented attack and heal rolls from displaying in chat, and prevented healing from being applied properly. (Aniather) 

## Version 0.7.5
- **NEW:** The much-requested ability to add bonus damage with a die value instead of a fixed value! You can also add a damage type. (SagaTympana)
  - **Known Issue:** Currently, the bonus damage roll will not be combined with the base damage even if they share a type, so it may double-dip on resistances/vulnerabilities. We aim to fix this soon!
- Some under-the-hood sheet tweaks to improve compatibility with system-agnostic modules; in particular, this should help issues folks have reported with the Aura Effects module. (SagaTympana)
- Updated effects documentation for new features. (Fox)
- Fixes a bug where area and range values for consumables would delete themselves on update—thanks Winter! (Fox)
- Fixes a bug where trying to create a new power from the character sheet would brick the sheet under specific grouping/sorting conditions—thanks Winter! (Fox)

## Version 0.7.4.2 Hotfix
- A tiny bugfix for sheet item lists, and an update to power group labels to match official. (Fox)

## Version 0.7.4.1 Hotfix
- Fixes a bug where certain weapon types caused a catastrophic failure during item config. (SagaTympana)
- Improves token ring colouration behaviour. (SagaTympana)
- Fixes incorrect "attack versus" display for roll dialogue with fixed-bonus attacks. (SagaTympana)

## Version 0.7.4
- Another round of general styling updates, this time focused on system dialogues for rolls and character config. (Fox)
- Fixes a bug introduced in v13 updates, where saving throws against a specific effect no longer worked. They should now function correctly for both direct rolls (from the effect list) and for effects selected after opening the general save dialogue. (Fox)

## Version 0.7.3 BETA
- Major item sheet overhauls, with the goal of making data input more simple. (Fox)
- General CSS fixes and cleanups to make stuff look better under v13 defaults. (Fox)
- Various text corrections, updates, rewording, typo fixes and other revisions to improve game language & translateability. (Fox)
- Restored some fields and behaviors that were lost or broken under v13. (Fox)
- TAH compatibility update. (Draconas)

## Version 0.7.2.1 BETA
Just a hotfix from Fox for the NPC sheets she broke in the last beta!

## Version 0.7.2 BETA
Further v13 bugfixes from SagaTympana and Fox. Fox has also used the need for appV2 updates to throw in some improvements to various sheets.
### Player-Facing Changes
- Broad visual tweaks to improve default styling off apps and sheets, and make alternate styling easier. (Fox)
- Active Effect sheets have had a big overhaul, changing up the tabs. Hopefully this will make them easier to use and better facilitate the additions made by other modules. (Fox)
- Fixed a bug where attribute-based consumption targets were messed up on itemns that had a parent actor. (Fox)
  - Added "Ritual Component" and "Currency" as first-level categories for consumption targets.
- Fixed a bug preventing item sorting from working on anything other than powers. (Fox)
- Fixed a bug preventing weapons/equipment being added to NPC sheets. (SagaTympana)

## Version 0.7.1 BETA
A few more rounds of sweeping v13 bugfixes from SagaTympana.

## Version 0.7.0 BETA
Our first v13-compatible release! Note that while this release seems stable and complete, it could still have undetected issues that might break your game. We appreciate testing, but please treat this as a beta release; we don't recommend using it in your live game environment. Please report any errors on the [GitHub issues page](https://github.com/EndlesNights/dnd4eBeta/).
### Player-Facing Changes
- Compatibility with V13 (duh)
- **New difficult terrain implementation:** the difficult terrain region behavior now supports (but doesn't require) the assignment of specific terrain types. These align with the various types of Terrain Walk features that 4e monsters have.
  -  Difficult terrain already exists in V12, but it only affects V12's core ruler tool, which can even be undesirable when you just want to know the straight line distance between two tokens (e.g., a ranged power's range doesn't care about difficult terrain).
  -  Also allows actors to ignore certain difficult terrain types (Terrain Walk) or to ignore difficult terrain in general. This is done in the Movement config.
 - **Token Ruler:** V13 adds a native token ruler (think Drag Ruler, but core). 4e's Token Ruler is aware of difficult terrain and of 4e's movement rules with regard to running, climbing, and swimming, and will colorize the plotted path based on path cost, which is calculated based on the actor's speed, the token's current movement mode, and any difficult terrain the path may pass through.
   - In support of this, the Run speed has been reinterpreted as a bonus rather than entire value in and of itself, since the Run action can be taken with any movement mode. Its default has been adjusted to simply 2.
   -  Likewise, since the additional cost of swimming or climbing is built into the movement mode itself, the default for those extra speeds is now 0 and should only be filled in for creatures that actually possess those speeds. It felt too invasive to try to change existing actors in a migration script, but perhaps it'd be a good idea to include a macro that could be run to make the adjustments if the user wishes.
- Adds ability check bonuses (global and ability specific, with handling for typed bonuses).
- Adds dynamic token ring effects for damage, healing, temp hp gain/loss, and targeting.
- Adds temporary hit points overlay atop the standard hp bar.

### Under the hood/dev stuff
- Moved everything to modern data models; this shouldn't affect how any data is interacted with, but it makes adding new fields and such safer and easier, allows for more advanced data options like sets (as seen in the ignored difficult terrain), and should prevent actors from just completely breaking if someone accidentally gives them a bonus to a skill that doesn't exist.
- **AppV2ed everything:** all the sheets and dialogs are AppV2 now, so they're not in danger of Foundry taking them out behind the barn (at least unless they do an AppV3). This WILL require some work for any modules that use the system's sheets and dialogs (for example, Fox's 4e Styling character sheet inherits from ActorSheet4e, which is now structured differently).
- New release pipeline (see: https://github.com/SagaTympana/dnd4eBeta/pull/17).

## Version 0.6.21
- FLANKING DETECTION!🎉 Combat advantage will now be predicted during rolls based on the position of attacker and allies. Like other situational modifiers, this will pre-fill the appropriate check mark in roll dialogue, or assume correct inference during fast-forwarded rolls. (SagaTympana)
- Made "bloodied" key available for custom 4e modifiers in active effects. (SagaTympana)
- Enabled area powers to auto-target tokens within their placed templates.  (SagaTympana)
- Updated power sorting so usage is logical, rather than alphabetical. (SagaTympana)
- Fixed errors in rest & recharge logic. (SagaTympana)
- Improved bonus stacking rules for defence modifiers in active effects. (SagaTympana)
- Fixes a bug where quick rolls failed from sheet and chat cards. (SagaTympana)
- Adds the ability to select an active effect to save against, when rolling a save from sheet. (SagaTympana)
- Provides a new set of bonus keys for custom 4e modifiers beginning with `effect`! You can now use `effect.save` to provide bonuses to your saving throws, and `effect.saveDC` to increase the DC of effects created by your powers, with effect types and keywords available as conditions. (SagaTympana)
- Allows chat cards to display the numerical value of the targeted defence; optional so GMs can keep it secret if desired. (SagaTympana)
- Updated system documentation with new custom modifiers info and updated module integrations info. (Fox)
- Recover lost SRD rules compendium content. (Fox)

## Version 0.6.20
- Improved trait selector dropdown. This addresses a bug noted by PuloDoGato on Discord, where you could select the weapon categories but not the individual weapons. (Fox)
- Fixes a bug where attack bonus automation mistakenly checked opportunity attacks against the wrong key. (SagaTympana)
- Adds keys for conditional defence modifiers! Custom 4e modifiers can now use the `defence` key to target power/weapon properties of attacks used against the character. (SagaTympana)
  - Updates the Manual & Help Compendium on custom 4e modifiers. (Fox)
- Adds distance detection helpers! This is in the initial stage for now, but lays the groundwork for the much-requested flanking detection, as well as some other neat automation options like range enforcement. For now, enjoy enhanced automation of Long Range and "versus Prone" attacks. (SagaTympana + Fox assist)
- Gives powers a toggle to ignore all bonus damage from effects and global modifier. Should be very handy for fixed-damage powers like _assassin's shroud_, non-rolls, and the many "deal XYZ additional damage" style rider effects. (Fox)
 
## Version 0.6.19
- Hotfix for broken sheet rolls caused by 0.6.18. (Fox)

## Version 0.6.18
- Fixed `@powMax` variable to return correct values for non-weapon damage. (SagaTympana)
- Fixed a bug from 0.6.17 where rolled powers no longer had parent actor required for effect application. (SagaTympana & Fox)

## Version 0.6.17
- Greatly reduced the volume of embedded data in chat messages. Should be a big help for games trying to load a big chat log. (Fox)
- Fixed a bug where the UUID variable broke compendium links. (Please update your formulae to `@charaID`/`@charaUID` accordingly!) (Fox)
- Updated "Intimidation" string to "Intimidate" (Fox)
- Improved handling of implements, to mitigate confusion around how weapliments qualify for use with implement powers. Also fixes an oversight where implement enhacement bonus relied on proficiency. (Fox)

## Version 0.6.16
- Fixed keyword retrieval for powers/features and improved it for effects. Good news if the extraneous "," on the end of the keywords list has been bothering you! (Fox)
- Fixed a bug in item labels where certain damage types would create an empty HTML tag. (Fox)
- Fixed a bug which caused the mid-length labels for action types to fail translation. (Fox)

## Version 0.6.15
- Powers have a new "Attack Text Detail" field, intended for powers with specialised attack text. If used, this field replaces the text normally provided for the Attack part of auto-generated power cards. The field can include HTML, so experts can use tags to style it precisely as they wish. (SagaTympana)
- Powers can now select "per Turn" for their usage/recharge interval. Sneak Attackers rejoice! (SagaTympana)
- Fixes a bug, reported by NightB1ade on Discord, where target-self effects wouldn't apply on power use (Fox)
- Weapon and implement proficiencies are now separate lists. I have not added superior implements (yet) because they are very annoying, but they could surely be added in a future update. (Fox)
- The weapon proficiency selector now has collapsible/expandable child lists, rather than displaying the giant multi-level list all at once. (Fox)
- Common conditional attack modifiers (combat advantage, charge etc) are now included in the documented keys for effects/automation. (Fox)

## Version 0.6.14
- Adds optional automation of mark detection and priority which is turned on by default. While activated, the system will add the originating actor's UUID to any effect including a marked status (mark_1 through mark_7) and use it to infer whether the mark is being ignored when attacking with target(s) declared. It will also clear any existing marks on a creature whenever a new mark is added. (SagaTympana & Fox)

## Version 0.6.13
- Allows compound conditions in bonus keys (SagaTympana)
- Minor localisation fixes (SagaTympana)
- Adds "vs Bloodied" to common attack bonuses (SagaTympana)
- Fixes for effect duration refresh bug (fixes #466) and resinstate seconds field for module use (fixes #461) (Fox)
- Changed level sorting for powers to return proper numeric order (fixes #428) (Fox)
- Adds `marker` property to actor and "Ignoring Mark" to common attack modifiers, with a view to setting up more complex mark automation at a later stage. For now, you can override this field in effects to set the marking character, and override the "ignoring mark" common attack bonus for effects like Mark of Warding. (Fox)
- Makes keywords available for features (see #440) (Fox)

## Version 0.6.12
- Improves item macro behaviour & usability, most importantly allowing macros to alter power properties before the chat card is created. Finally, a way to enable modal power behaviour—as in we can do Augmentable now without needing duplicate powers! :D
- Improves effect duration config by removing irrelevant fields and ambiguity between user-entered custom duration info and system-provided expiry timing.
  - Also allows durations to be re-calculated when the duration type is changed.
- Fixes a bug in the multiroll dialogue which caused an error in attacks not based on a stat (ie NPC-style flat formula rolls)
- Fixes a bug where short/extended rest routines would fail for NPCs using the newer data model

## Version 0.6.11
- Updated res/vuln evaluation to better observe actor variables (fixes #455). (SagaTympana)
- Fixed a bug where the word "Feature" would repeat in the property summary for features with a certain combination of traits. (Fox)
- Enabled short/long range specification for consumables. (Fox)
- Allowed blank role selection for minion/other NPCs. (Fox)
- Updated & improved labels/property/keyword evaluation for items. In particular, properties now include their key as a class name in their HTML tag, which will allow for non-language-dependent manipulation via CSS/DOM JS. (Fox)
- Improved reporting of regeneration in automated chat cards. No more annoying reminders for 0-value regen! (SagaTympana)

## Version 0.6.10
- Improved resource handling at 0 value (Fixes #446). Resources are now "active" based on whether they have a label, regardless of value, and will no longer consider 0 value or max to be the same as null. (SagaTympana/Fox Lee)
- Embed chat data in non-consumable power cards that have been deleted during usage. This allows the creation of temporary powers by macros and such. (Fox)
- Fixed exposed HTML tags in dialogue titles (SagaTympana)
- Fixed a bug where "vs Defence" setting in attack roll dialogue worked incorrectly for multi-targets with a unified attack setting (Fixes #451) (SagaTympana)
- Adds Martial Practice and the various Alchemical Formula categories for Rituals (Fox)
- Enables [enhancement] bonus type for global atk/dmg/def/skill modifiers. Used rarely but might as well have it available. (Fox) 

## Version 0.6.9
- Improves range values in power cards and sheet summaries to match new behaviour (Fixes #442). 
- Makes the range abbreviations in on-sheet power listings (and the attached tooltips) into translatable strings.
- Reimplements the "granting combat advantage" status that seems to have gotten lost from th common bonus automation update
- Adds Cover/Superior Cover statuses, with the description noting "taking cover" to make usage more appropriate
- Rearranges the statuses list. In an effort to make statuses easier to find, they are now in thematic groups (e.g. deafened and blinded are together, invisible and hidden are together, slowed/immobilised/restrained/grabbed are together, etc.). It's not perfect but hopefully it should be helpful!

## Version 0.6.8
- Fixes a bug in the contains helper which was messing up ongoing damage instances, causing a game-breaking error when passing the turn. (First reported by Edafosavra o Discord, also described in #443)

## Version 0.6.7
- Fixes a buy reported by Ari on Discord, where melee-range powers had lost their numerical ranged input.

## Version 0.6.6
- Updates power config to allow more control over various setting and keywords (especially for NPC powers) and more useful summary display
- Substantial effects update
  - Effects can now have keywords! This should allow for easier interaction with macros and other scripts (for exmaple, handling stances and polymorphs).
  - New effects on `power` items inherit power keywords upon creation
  - Makes it so effects created on an `equipment` or `weapon` items are set to "Apply Effect only When Equipped" by default
- Allows arbitrary keywords on effects and powers; these are entered as text string and should be considered cosmetic at this stage.
- Finally fixes the "Mark 1 is always Unknown Effect" bug in effect status conditions config!
- Fix for failing power use macros 
- Adds the "Alternative Reward" Equipment type to config, and appropriate subtypes (generic'd for legal safety)
- Adds keywords to consumables

## Version 0.6.5 
- Huge Fixes to Ongoing Damage and End of Turn Saves Automation that have hopefully FINALLY got them working properly! Includes multiple fixes to the ownership detection function and subsequent logic for assigning saving throw responsibility.
  - You should still expect a full fail state if no GM is logged in.
- Updated behaviour of consumables that model rechargeable trinkets, and added "Wondrous Item" category
- Combat automation: Fixed error with attack stat/target defence detection in roll dialogue (hopefully fixes the problem reported by Nihiladrem on Discord)
- Chat Cards: Fixed a bug where attack mod display in chat summary would revert to "ability" style if the calculated attack bonus totalled to 0.
- Variables: Added `@enhArmour` and `@enhNAD` variables to reference the enhancement value of AC and non-AC-Defs respectively.
- Documentation: Updated character sheet variables with the two above, an also added `@scale` and `@sneak` to the list.
 
## Version 0.6.4
- Adds missing movement to Trap/Hazard actors, and migrates existing actors
- Fixes a bug where trap/hazard icon would reset to default on sheet update
- Fixes translation error in Will defence tooltip

## Version 0.6.3
- Fixes a bug where missing SVG sizes could prevent loading a world under Firefox
- Fixes a bug where fast-forwarded attack rolls with a target could not resolve

## Version 0.6.2
- Fixes a mistake in the manifest which prevented worlds not younger than v0.5.11 from migrating. This should resolve the major issues people were having with character sheets displaying incorrectly and/or items not loading after 0.6.0. 

## Version 0.6.1
- [PR #431](https://github.com/EndlesNights/dnd4eBeta/pull/431) from [FoxLee](https://github.com/FoxLee)
  - Fixes some text strings I broke in character sheets and power config
  - Fixes a bug where Trap/Hazard defence calcs never happened, because they weren't technically NPCs
  - Moves bonus array for NPC/Hazard def calcs into the advanced calcs section, since the sheet now no longer offers them under basic calcs
  - Allows changing the targeted defence at roll time, and on a per-target basis
     - I very much want to implement this for attacking ability score as well, but with the dice logic that's much more difficult so it's disabled for now.
  - Improves hit state data to prevent comparing translatable string to an absolute value (which broke some informational styles under non-English translations)
  - Allows detection of immunity to attacks against a particular defence (common for traps/hazards) and alters attack roll chat card accordingly
    - Currently classifies immunity as a miss for the sake of effects, so needs further work to fix.
  - Updates item properties to include `strong` tags around labels ("Component Cost:", "Casting Time:" etc)

## Version 0.6.0
- [PR #427](https://github.com/EndlesNights/dnd4eBeta/pull/427) from [FoxLee](https://github.com/FoxLee)
	- unifies classFeats, raceFeats, pathFeats, destinyFeats and feats into a single item type, feature, with a property system.featureType
	- Rituals moved into seperate tab
	- Restored armourBaseTypeCustom field on equipment sheet
	- Added useful properties to item sheet sidebar on powers
	- Many fixes and updates to lang files
	- Corrected display of attack bonus config on non-actors
- [PR #429](https://github.com/EndlesNights/dnd4eBeta/pull/429) from [FoxLee](https://github.com/FoxLee)
	- Adds a new Actor type, Hazard, which handles the specific behaviours and limitations of Trap/Hazard game entities more effectively than making an NPC.

## Version 0.5.15
- Fix issue with "Only Apply Effect when Equipped?" option not working correctly.
- Tool-tip for the apply active effects button on Power chat messages should now properly refrence.

## Version 0.5.14
- [PR #421](https://github.com/EndlesNights/dnd4eBeta/pull/421) from [FoxLee](https://github.com/FoxLee)
  - I'm an idiot who uploads files to the wrong place

## Version 0.5.13
- [PR #420](https://github.com/EndlesNights/dnd4eBeta/pull/420) from [FoxLee](https://github.com/FoxLee)
  - Fix for core issue https://github.com/foundryvtt/foundryvtt/issues/11527 (fixes #419 and another report I had on Discord of heritage bonuses not stacking correctly). Looks like Foundry intends to fix this only in v13, so I stole this temporary fix from [Black Flag](https://github.com/koboldpress/black-flag/commit/d816b843d6702b0d5cecbdcfc765918002394b4e#diff-be8a125e28ef90b1367be003410b96d6e74779a15771b893370e4b260422d375), blessings upon them.

## Version 0.5.12
- [PR #408](https://github.com/EndlesNights/dnd4eBeta/pull/408) from [draconas1](https://github.com/draconas1) Fix: Token Size not being updated
- [PR #409](https://github.com/EndlesNights/dnd4eBeta/pull/409) from [lderequesensS](https://github.com/lderequesensS) Add Spanish translation
- [PR #412](https://github.com/EndlesNights/dnd4eBeta/pull/412) from [FoxLee](https://github.com/FoxLee)
  - Allows dice notation in ongoing damage values and enhances chat reports for them
  - Adds special "bonus" keys for `floor`, `ceil` and `override` to allow advanced manipulation of values, and updates documentation accordingly
  - Adds swim speed to movement modes
  - Adds chat popout functionality to item cards (fixes [#266](https://github.com/EndlesNights/dnd4eBeta/issues/266))
  - In character sheets, fixes an untranslated string on the action point checkbox (mentioned in [PR #409](https://github.com/EndlesNights/dnd4eBeta/pull/409)).
- [PR #415](https://github.com/EndlesNights/dnd4eBeta/pull/415) from [FoxLee](https://github.com/FoxLee) Fixes [object Object] appearing in on-sheet item summaries (fixes [#414](https://github.com/EndlesNights/dnd4eBeta/issues/414)) and updates info tags to include more useful properties and fewer irrelevant ones

## Version 0.5.11
- ruler refactor, no longer runs though libwrapper. Now is the overrides the default Canvas.rulerClass
- PR #406 from [squagnar](https://github.com/squagnar) added Check weaponInnerData exists when checking for proficiency
- PR #407 from [FoxLee](https://github.com/FoxLee) Proficiency logic tweak, melee/ranged basic distinctions added

## Version 0.5.10
- temp fix for issue #400, disabled check for difficult terrain on gridless maps 
- fix issue #389, the built in effect for second now properly applies duration for combat.
- fix issue #386, cleared a flag that was being set to help the system specific templates. The square measure template should function normally again.

## Version 0.5.9
- [PR 405](https://github.com/EndlesNights/dnd4eBeta/pull/405) from [draconas1](https://github.com/draconas1) Fix: right click Apply Damage/Healing not working 

## Version 0.5.8
- [PR 404](https://github.com/EndlesNights/dnd4eBeta/pull/404) from [FoxLee](https://github.com/FoxLee)
  - Fixes a bug where attack rolls from creatures with a global attack bonus throw an error; this was due to a mistake where weapon proficiency was checked even for powers with "none" weapon requirement.
  - Fixes the bug causing defences of NPCs not using advancedCals to be much too high.
  - Updates NPC sheet to display current defence values alongside base values.
  - Fixes an "object Object" dropdown in equipment limited use intervals (#401)
  - Updates initiative tiebreaker to a selection between init mod (system), dex score (houserule), or random.
  - Masks decimal places in initiative scores (in roll chat output and in combat tracker), hopefully preventing people from thinking they are in error. Tiebreaker info remains viewable in tooltips and in roll formulae.

## Version 0.5.7
- [PR 399](https://github.com/EndlesNights/dnd4eBeta/pull/399) from [FoxLee](https://github.com/FoxLee)
	- Resolves a problem with initiative where perfect ties could cause incorrect effect expiry
	- Adds "proficient" bonus key and detection, and improves key application for powers with "any" weapon/implement usage
	- Activates bonus typing for saving throws and adds appropriate migration
   
## Version 0.5.6
- Hotfix for a bug with situational bonus value #398 

## Version 0.5.5
- Many fixes [PR 393](https://github.com/EndlesNights/dnd4eBeta/pull/393) from [FoxLee](https://github.com/FoxLee)
	- Updated references to certain properties in the damage rolled from chat cards (fixes #390). I also changed the fallback behaviour for unspecified damage, which seemed like it should use physical instead of true damage.
	- Updated references to certain properties in active effect config (Fixes #383)
	- Added new logic for bonus keys based on the defence targeted by a power (as suggested by absolitude on the Discord). Yay for low-hanging fruit! :p
	- Since the v12 editions expand many single-string configs into objects, I took the liberty of adding short and abbreviated labels to ability action types (eg. "Standard" vs. "Standard Action" and "STD."). Also added strings accordingly in the EN and AN-AU lang files, and corrected some mistakes in strings for auto-apply effect settings.
	- Updated various templates to newer Handlebars. (Not actually required until v14, but I got sick of so many warnings so I got rid of some easy ones while I was working on nearby stuff.)
	- Increased the height of the description field in active effects config form, to make it a bit more usable (also suggested by absolitude on the Discord).
		- Addtioanl Change was made so the height should scale with addtional space within the form as it is scaled.

	- Changed effect suppression logic on equipment, which was excluding effects without Actor sources, instead of effects without item sources. (Fixes #387).
	- Fixed custom skills hook as suggested by ddbrown30 (Fixes #391)
	- Enabled that "global skill modifier" field that's been floating around on character sheets for a while. (Includes a migration script, so that will need to be activated once merged.)

	- Added a global defences modifier, on the basis that while it's not too hard to add bonuses to four defences manually, it does come up _really_ frequently so it would probably be appreciated. It's compared to the bonus types for individual defences, so should respect 4e stacking rules.
	- Added an "isBasic" property for attacks, which can be targeted with the "basic" bonus key. I meant to add a marker on the power listing as well, but I forgot. I _did_ also update Steve and the SRD powers compendium, I just haven't uploaded them yet because uploading "packs" is a PITA now and if I untangle the global attack/damage bonus types issue before I'm done on this tear, they'll need updates again anyway.
	
- Many fixes [PR 396](https://github.com/EndlesNights/dnd4eBeta/pull/396) from [FoxLee](https://github.com/FoxLee)
	- Updated custom effect handling to apply type stacking rules to global atk/dmg bonuses
	- Removed `@atkMod` and`@dmgMod` from default formulae, and updated migration to remove them from existing powers.
	- Updated ongoing damage automation. GM account perform all ongoing damage logic.
	- Updated document owner detection to prioritise an assigned player before checking owner permissions. This solves an issue I ran into where it would always fall back to a GM if player ownership is all default, even there was a currently assigned player.
	
- css fix encumbrance bar height
- Rework active effect tooltip on character sheets to show description text.
- fixed issue that was causing Automated Animations to hang up

- updated French Language courtesy of [Gilphe](https://github.com/Gilphe)

## Version 0.5.4
- Added healing option of 'Cost Healing Surge" option to healing. This can be used in examples such as with healing potions which take a healing surge,  but only grant a flat amount of hitpoints. When rolling you can manually include this amount with the tag `[surgeCost]`, this still expand a surge on the take when applied.
- fixed an issue where the current HP value on character sheets would lock from active effects

## Version 0.5.3
- fixed handlebars issue for selectOptions of Resource Consumption 

## Version 0.5.2
- fix issue where grid distance was not being used properly by ruler

## Version 0.5.1
- fixed handlebars issue when opening equipment, (added a null type check)
- fixed an issue where item types where being deleted when created on actors 

## Version 0.5.0
- comparability for Foundry v12
- added support for Difficult Terrain regionBehaviorType, which can be used to display areas of Difficult Terrain to players, as well as influence the distance displayed by the ruler tools.
- Added Blast button to template Measurement Controls panel
- Added custom icons for Bust and Blast to template Measurement Controls panel

## Version 0.4.58
- Fixed DoTs from transferred effects [PR 373](https://github.com/EndlesNights/dnd4eBeta/pull/373) from [wigmeister2000](https://github.com/wigmeister2000)
- Another fix of Inherent Enhancements [PR 372](https://github.com/EndlesNights/dnd4eBeta/pull/372) from [FoxLee](https://github.com/FoxLee)

- ## Version 0.4.57
- fixed issue with default sorting not being working properly, which caused issues with types of item documents being created on actors.

- added missing keyword "Shadow"
- minor CSS changes,
	- edit to power rich editor for effect text 
	- change to power card highlighting, every element now contains the css class `alt-highlight` which will alternate highlighting
	- minor change to how effect html rich text is combined into the power cards <p class="effect"> element, with the first paragraph <p> element being merged together as to not create unintended spaces and highlighting

## Version 0.4.56
- added error checking to ActorSheet4e#_onConvertCurrency incase of undefined value

## Version 0.4.55
- update to french lang
- Minor change to CSS selector, making item card class selectors slightly more specific as to cause destructive interference with modules. (spesificly fixed an issue with Monks Enhanced Journal)
- added tool-tip label to currency that displays sum of coins value in relation to GP

## Version 0.4.54
- Fixed inherent enhancement, for real this time.
- Fixed CSS/HTMl for Equipment Sheets Damage Resistances & Immunity + Enhancement overlap spacing fix
- change tabs on Item-Sheets should now resize the height correctly. Updating the sheet should no long effect the the height of the sheet.

## Version 0.4.53
- minor html/css tweak to rework Attack Roll chat messages
- [PR 357](https://github.com/EndlesNights/dnd4eBeta/pull/357) from [FoxLee](https://github.com/FoxLee)
	- [Added 2024-05-25] Un-broke how I broke enhancement bonuses when inherent bonuses are off.
	- Corrects an oversight where res/vuln could have crossed 0 on the number line and messed things up
	- Exposes the priority of changes within effects for user management; allows for correct timing of (for example) penalties on upgrade effects.
	- Updates the Manual compendium to discuss change modes and priority with examples (and info about defaults required for correct timing)
	- Adds "Action (modern)" as a power grouping method on character sheets; it's a simplified (MM3-esque) grouping that's like Action, but bundles all triggered actions together. (Sorry, this is new functionality and I should have kept it separate from the fixes, but working in the same files made it hard to separate out).

## Version 0.4.52
- Added global skill bonus which can be acsessed by active effects at `@system.modifiers.skills.<type>`
- fixed some missing i18n
- minor CSS fix
- Refactors for TAH integration [PR 356](https://github.com/EndlesNights/dnd4eBeta/pull/356) from [draconas1](https://github.com/draconas1)

- [PR 355](https://github.com/EndlesNights/dnd4eBeta/pull/355) from [FoxLee](https://github.com/FoxLee)
	- Updated handling of resistances (#327). The `value` property is now derived from two other properties, `res` and `vuln`. Effects should be directed to modify these properties instead of `value` and respect apply modes. Effects using other keys (like the 4e bonus types) should be updated by the user, but if any are still found they are filtered into `res` or `vuln` based on if they are positive or negative. Manual bonuses (as in, entered through the sheet) are all applied as-is.
	- Added inherent enhancement bonuses as a game-wide setting (#88). When it's on, the calcs for defences, attack and damage will check against the scaling bonuses suggested in the PHB2/Darksun books and override the existing bonus if it's too low. (PCs only)
	- Updated equipment model/sheet to separate out enhancement bonuses from non-magical bonuses. Non-magical bonuses and other armour properties are now hidden on non-armour items, and an enhancement bonus section appears for armour and neck items.
	- I found the migration scripts! So I've included one to add the new properties to older items/actors. It will also look for neck "armour" items with identical fort/ref/will values, and move the shared value to "enhance" instead.
	- Added "shield" as a bonus type to the template for all defences. The mundane bonuses to defences on shield-typed equipment are now re-routed to this property instead of "armour". (#344)
	- Added "none" weapon hand option (for slotless implements) (#354)
	- Plugged the auto-generated power summaries on character sheets into the same "enrichment" function that the description field uses in manual descriptions, in order to benefit from variable substitution and calculation. Astonishingly, it appears to work without issue.
	- Added a bonus key for one-handed weapons (#353) and updated documentation to include it.
	- Added the kusari-gama to the base weapons list, which I previously left out for some reason.
	- Updated Steve, the SRD features compendium, and the Manual compendium accordingly.

## Version 0.4.51
- Added new durationType `endOfUserCurrent`

## Version 0.4.50
- changed enhance and enhance implment fields on weapon item cards to accept strings.

## Version 0.4.49
- added offset option for scale

## Version 0.4.48
- added common replace helper `@sneak`, which will return the number of dice needed for sneak attack based on character tier.
- added common replace helper `@scale`, which is a common scale used by many class features that increments at level 6, 11, 16, 21, and 26.
- added weapon/armour Proficiency to SRD classes and races using active effect keys of `system.details.armourProf.value` and `system.details.weaponProf.value`
- Fix item dragging to macro hotbar. You should now once more be able to drag Items, Powers from an actor sheet to create usable/rollable macro button.
- You can now drag and drop Active Effects from actor sheets to the macro bar. This will create a toggle macro. 
- minor CSS fixes
- Option to display calculated attack bonus in auto power cards [PR 352](https://github.com/EndlesNights/dnd4eBeta/pull/352) from [FoxLee](https://github.com/FoxLee) 


## Version 0.4.47
- minor CSS fixes to Power Item Details tab & Actor power table
- minor fix to localization text.
- other minor fixes from [PR 351](https://github.com/EndlesNights/dnd4eBeta/pull/351) from [wigmeister2000](https://github.com/wigmeister2000) 
	- An empty tooltip showed up when the effect description was empty. This should be suppressed now.
	- The "apply effects to selected tokens" option in the settings did nothing. This should now toggle between selected and targeted tokens.
	- When adding "apply to all targets" effects, they showed up in the misc section.

## Version 0.4.46
- added misc option for Active Effects
- minor CSS fix to Power Item Details tab
- weapon type and category fixes [PR 350](https://github.com/EndlesNights/dnd4eBeta/pull/350) from [FoxLee](https://github.com/FoxLee) 

## Version 0.4.45
- fixed minor bug where container item sheets could not be opened in compendiums
- Edited CSS to better center non square image icons for Player Character, and Non Player Character actor sheets, along with item profile icons.
- minor CSS fix item card buttons 

## Version 0.4.44
- Added right Click apply effect options on power card categorized by type.
- Added Effects drop down menu on power cards for manually application of effects
- fixed minor issue where effect duration labels would not localize properly on setup.
- When creating items within the directory, the default new name should be based on the item type, rather than just be "New Item" 
- similar consumable items with the same source
- removed all references to word beta
- renamed file `entity.js` to `item-document.js`
- renamed file `sheet.js` to `item-sheet.js`
- added additional layer of sorting, elements that are sorted can further be manually sorted
- Overhaul to backpack / Container Items. Can now contain sub items, currency and ritual ingredients.
- The details tabs of all item types now support GM Notes. GM Notes are only visible to users with the GM user account.
- Added `AutoApplyEffects` setting to game system. Set to true by default. While turned on, Active Effects will be applied automatically to targets or self when Powers / Attacks are made (as they currently were). While turned off, Active Effects will not be applied automatically to any tokens.
- Added diffrent icons for all item types
- Added /text option to text helper function. Checks if value in the inline roll is isDeterministic and returns as plain text rather than in a <a> tag
- fix to chat power card html [PR 347](https://github.com/EndlesNights/dnd4eBeta/pull/347) from [FoxLee](https://github.com/FoxLee) 

## Version 0.4.43
- Minor fix to application of active effects. If a player is the owner of the token / actor, it will no longer require use the socket to apply the effect. 

## Version 0.4.42
- Fix suppression of transferred effects [PR 338](https://github.com/EndlesNights/dnd4eBeta/pull/338) from [wigmeister2000](https://github.com/wigmeister2000)
- Attack bonus tooltips [PR 339](https://github.com/EndlesNights/dnd4eBeta/pull/339) from [wigmeister2000](https://github.com/wigmeister2000)
- Fix locilisation for Light Mace, was usinincoreccetly using the mace key.

## Version 0.4.41
- Disable input fields if indirectly modified [PR 336](https://github.com/EndlesNights/dnd4eBeta/pull/336) from [wigmeister2000](https://github.com/wigmeister2000)
- Fixing typo in "invisible"

## Version 0.4.40
- fix issue where chat card preview would not generate with macros in text.
- ActiveEffects access to @bloodied [PR 334](https://github.com/EndlesNights/dnd4eBeta/pull/334) from [wigmeister2000](https://github.com/wigmeister2000)

## Version 0.4.39
- Chat cards check for roll [PR 332](https://github.com/EndlesNights/dnd4eBeta/pull/332) from [wigmeister2000](https://github.com/wigmeister2000)
- `race` bonuses suffixes for specific bonuses many actor attributes. This should now be the primary keys used while setting up active effects.

## Version 0.4.38
- Effect application from chat card [PR 331](https://github.com/EndlesNights/dnd4eBeta/pull/331) from [wigmeister2000](https://github.com/wigmeister2000)
- minor fix to NPC defence calculation

## Version 0.4.37
## Version 0.4.36
## Version 0.4.35
## Version 0.4.34
- hotfix to migration

## Version 0.4.33
- Added in options to use `item`, `feat`, `power`, and `untyped` suffixes for specific bonuses many actor attributes. This should now be the primary keys used while setting up active effects.
- Moved skill training tracking out of `skills#value` to `skills#training`
- added `#skillTraining` to the actor template, which can be used to modify skills based on training level. The Jack of All Trades feat can be implemented now with a single effect attribute key of `system.skillTraining.untrained.feat` and a value of `2` 
- fix minor issue on npc sheet #328
- fix Bonus processing for v11 ActiveEffects [PR 329](https://github.com/EndlesNights/dnd4eBeta/pull/329) from [wigmeister2000](https://github.com/wigmeister2000)
- Minor update to Steve!

## Version 0.4.32
- Fix actor sheet effects tab for v11 ActiveEffects transfer [PR 326](https://github.com/EndlesNights/dnd4eBeta/pull/326) from [wigmeister2000](https://github.com/wigmeister2000)
- Fix to speed data-tooltip formating

## Version 0.4.31
- Additional effect transfer options and "To Chat" context option for items [PR 323](https://github.com/EndlesNights/dnd4eBeta/pull/323) from [wigmeister2000](https://github.com/wigmeister2000)

## Version 0.4.30
- await Effect Creation

## Version 0.4.29
- CN lang update
- Improvements for Active effect statuses [PR 319](https://github.com/EndlesNights/dnd4eBeta/pull/319) from [FoxLee](https://github.com/FoxLee)
- Fix chat card posting and effect transfer [PR 320](https://github.com/EndlesNights/dnd4eBeta/pull/320) from [wigmeister2000](https://github.com/wigmeister2000)
- fix to user apply socket effects
- minor CSS fix
- NPC chat card template updates [PR 321](https://github.com/EndlesNights/dnd4eBeta/pull/321) from [FoxLee](https://github.com/FoxLee)


## Version 0.4.28
- custom skills now should be sorted alphabetically.
- Added a tooltip to the new "show image" button on item's portrait.
- added icon for unprepared powers.
- [PR 317](https://github.com/EndlesNights/dnd4eBeta/pull/317) from [FoxLee](https://github.com/FoxLee)


## Version 0.4.27
- hot fix CSS issue where item equipment toggle was accidentally removed.

## Version 0.4.26
- Added descriptions to all status effects
- Added Options for when Death Saves can reset, with default now correctly being short rests
- Additional Effect Application to All Allies, All Enemies, or self dependent on hit/miss of other targets
- fix some edge case issues were effects would not apply.
- new effects created on objects will use the objects img for default image

- [PR 316](https://github.com/EndlesNights/dnd4eBeta/pull/316) from [FoxLee](https://github.com/FoxLee)
	- Darkmode
	- template files cleaned up
	- revised CSS files
	- revised character sheet item description toggle to respect description/chat flavour/auto generate combination as per chat card generation. This prevents both the description and chat flavour being output when auto-generate cards is on.
	- revised character and item sheets, I've updated the HTML fields to use ProseMirror as the editor. This is because TinyMCE uses iframes (which prevent styling) and therefore really messes up dark mode.

	- disabled inputs show a "disabled" cursor on hover.
	- NPC sheet revised upper section to better match the style of PC sheets and prioritise information used during combat. This includes converting the "advanced maths" checkbox to a button in the header.
	- added translatable strings for the names of sheets and item types. Foundry was excepting these and defaulting to IDs when it didn't find them, which just made things seem a bit haphazard.

## Version 0.4.25
- [PR 314](https://github.com/EndlesNights/dnd4eBeta/pull/314) from [FoxLee](https://github.com/FoxLee)
	- Restored lost hint text for how to select multiple damage types on ongoing damage.
	- Fixed a bug reported on Discord by Milo & Marcloure: effects could sometimes be removed even on a failed save, if a saving throw bonus was present.
	- Added the ability to use variables in "amount" value for ongoing damage/regen (issue #311).
	- Updated the Manual & Help Compendium—mostly for the sake of adding a section about ongoing damage, but while I was there I made a bunch of smaller updates and typo fixes too. Please see the commit for more details!
	- Removed (most) inline formatting from the Manual and added it as default journal CSS instead, with the goal of making the manual a lot more friendly to journal enhancements.
	- Added a tooltip to the new "show image" button on an actor's portrait.

## Version 0.4.24
- hotfix [PR 312](https://github.com/EndlesNights/dnd4eBeta/pull/312) from [FoxLee](https://github.com/FoxLee)

## Version 0.4.23
- Added button that appears when hovering the image on a Player and NPC character sheet. This button opens ups up the image in a ImagePoput frame.
- With at least observation permissions of an actor, be able to view item summary when clicking on name
- Fixed error with ongoing damage [PR 310](https://github.com/EndlesNights/dnd4eBeta/pull/3108) from [FoxLee](https://github.com/FoxLee)

## Version 0.4.22
- Active Effect apply status effects correctly
- Added addtional null checks into `turns.js`, so the turn tracker should no longer get stuck if an actor becomes unlinked from a combatant / token
- Regeneration as DoTs + settable effect save DCs [PR 308](https://github.com/EndlesNights/dnd4eBeta/pull/308) from [FoxLee](https://github.com/FoxLee)

## Version 0.4.21
- Auto saves and DOTs [PR 304](https://github.com/EndlesNights/dnd4eBeta/pull/304) from [FoxLee](https://github.com/FoxLee)
- added Right-CLick context menu to items on a character sheet, which allow for an number of options, including a easy duplicating.
- added Right-Click context menu to active Effects on character sheet, which allow for an number of options, including a easy duplicating.
- Fix minor bug where the CSS for the placeholder text of an unprepared powers charges was showing an incorrect color.
- Fix an issue where an unprepared power would show "0/" charges even if the power did not have any charges
- Fix an issue where items sheets would resize upon being moved around.
- changed `target-id` to `data-target-id` as per proper html attribute naming convention 

## Version 0.4.20
- Fix to merge error where part of [PR 302](https://github.com/EndlesNights/dnd4eBeta/pull/302) from [FoxLee](https://github.com/FoxLee) was not merged correctly. (my bad -Endles)

## Version 0.4.19
- Added socket for users to delete active effects

## Version 0.4.18
- Automated saving throw dialogs [merge](https://github.com/EndlesNights/dnd4eBeta/pull/302) from [FoxLee](https://github.com/FoxLee)

## Version 0.4.17
- Change to how Skill Labels work, allowing for the value to be manly set or overridden on an individual actor.

## Version 0.4.16
- Added system support for custom skills
- edit to remaining effect time which cause issues with other modules

## Version 0.4.15
- Input fields that are being modified by Active Effects are now disabled and will display a tool tip warning explaining why they are disabled
- Added DocumentSheet4e which extended from DocumentSheet. Enabled the above mentioned input field locking with active effects for Document Sheets
- Added a pointer to the encumbrance CSS, so it is more apparent that it may be clicked on.
- Replaces all html "title" tags with "data-tooltip"
- When hovering Hit Points, will show a cog icon to indicate that to users that clicking is a configurable options
- Max HP input field should now lock when it is set to auto calculate.

## Version 0.4.14
- compendium links fix
- simplify Attack Formulas preview in power cards.
- allow for helper short hands to be used in effects formulas.
- allow for helper short hands to be used in char roll formulas.

## Version 0.4.13
- Change to default NPC attack and damage formulas. Both modernized to use the global attack/damage bonuses of `@atkMod` and `@dmgMod`
- added weaponBaseType to the suitable keywords used when apply effects. This allows for some feats that only apply to specific weapons.
- moved move apply active effect to effects.js
- Brazilian Portuguese from [PilotodeMouse](https://github.com/PilotodeMouse)

## Version 0.4.12
- renamed `clickRollMessageDamageChatListener` function to `chatMessageListener` as it will be more generically used.
- moved the chat listener for the hover over and clicking of token names within attack result chat box out of their own wrapped listen into generic listener. This resolved an issue where the listener would not always be added correctly upon message creation. 

## Version 0.4.11
- Updates to Manual [merge](https://github.com/EndlesNights/dnd4eBeta/pull/296) from [draconas1](https://github.com/draconas1)

## Version 0.4.10
- Add effect description to applying effects to actors [merge](https://github.com/EndlesNights/dnd4eBeta/pull/295) from [zarick1342](https://github.com/zarick1342)

## Version 0.4.9
- Fix old effect labels

## Version 0.4.8
- fix to Active Effects applying, and displaying of labels
- Autoanimations fixes [merge](https://github.com/EndlesNights/dnd4eBeta/pull/291) from [zarick1342](https://github.com/zarick1342)

## Version 0.4.7
- Hotfix, issue with SVGs height and width being set within style caused issues for a number of browsers.

## Version 0.4.6
- reworked visuals for "Probable Hit/Miss" so that it is now already Green/Red text, making it more apparent.
- Can now rightclick attack roll messages to either select related targeted tokens to the attacks based on the categories of "All Tokens", "Hit Tokens", or "Miss Tokens"
- Can now mouse over the "Target: <name>" text of a message to highlight the related token (if visible)
- Can now left click the "Target: <name>" text of a message to select the related token (if permissions) 

## Version 0.4.5
- added Automated Animation support to system, [merge](https://github.com/EndlesNights/dnd4eBeta/pull/287) from [zarick1342](https://github.com/zarick1342)

## Version 0.4.4
- hotfix folders for system compendium packs, remove double folder

## Version 0.4.3
- updated active effects. now editable on items/powers that are embedded to an actor.
- updated active effect config html layout. Removed redundant options. Added a text description field
- update compendium packs layout
- separated American and global English into two separate language files, with en.json representing American English spelling (armor) and en-au.json representing Global English (armour)
- added folders to system compendium packs

## Version 0.4.2
## Version 0.4.1
- added git attributes for binary files
- fixed gitignore for binary file database
- regenerated packs database

## Version 0.4.0
- conversion to Foundry v11

## Version 0.3.34
- added Automated Animation support to system, [merge](https://github.com/EndlesNights/dnd4eBeta/pull/285) from [zarick1342](https://github.com/zarick1342)

## Version 0.3.33
- add Chinese Language support courtesy of 扶摇
- updated French Language courtesy of [Gilphe](https://github.com/Gilphe)
- removed an some deprecated code.

## Version 0.3.32
- Label error and spelling fixes, translatable text for pseudo-power chat cards [merge](https://github.com/EndlesNights/dnd4eBeta/pull/278) from [FoxLee](https://github.com/FoxLee)
- character sheet minimizes when using the place template button
- minnor fixes to "limited npc", "npc" and "character" sheet css and style

## Version 0.3.31
- Saving Throw, Death Saves, Short Rests, Seconds Wind, Extended Rests and Spending Actions Points had their logic moved to Actor.js and can now make use of the fast forwarded option.
- fastFowardSettings option added, when set to true, will always make rolls/actions with the fastforward option. use the FastForward keys instead to take the slow option.

## Version 0.3.30
- minor bug fix to how base movement is calculated
- updated documentation about which keys should be used for movement, now you should be using "system.movement.<type>.bonusValue" rather than "system.movement.<type>.value"

## Version 0.3.29
- minor fix to how derived movement calculations

## Version 0.3.28
- French language update from [Gilphe](https://github.com/Gilphe)
- Minor fix to item card
- Mirror fix to NPC item chat card logic for displaying Flavour/Description

## Version 0.3.27
- Hotfix Bonus effect checker to check implement type [merge](https://github.com/EndlesNights/dnd4eBeta/pull/274) from [draconas1](https://github.com/draconas1)

## Version 0.3.26
- New bonus keys from [merge](https://github.com/EndlesNights/dnd4eBeta/pull/272) from [FoxLee](https://github.com/FoxLee)
- French language update from [Gilphe](https://github.com/Gilphe)
- added a number of sanitize to ensure that only strings are passes into the Roll Class constructor for the formula expression.

## Version 0.3.25
- Hotfix small issue with Actor#Update

## Version 0.3.24
- Added an @bloodied helper tag, which can be referenced in roll formulas returning a value of 1 if the actor is bloodied, or 0 if not.
- Checking for some Deterministic elements inside parts of damage dice rolling, which will improve the final formula as displayed to players by being less cluttered with terms making it more easily readable.
- User control for untyped/condition/special resistances [merge](https://github.com/EndlesNights/dnd4eBeta/pull/270) from [FoxLee](https://github.com/FoxLee)

## Version 0.3.23
- Creature typing for PCs [merge](https://github.com/EndlesNights/dnd4eBeta/pull/267) from [FoxLee](https://github.com/FoxLee)
- Fixed description text output error [merge](https://github.com/EndlesNights/dnd4eBeta/pull/268) from [FoxLee](https://github.com/FoxLee)

## Version 0.3.22
- Fixed an error where items could not render if the description was set to null

## Version 0.3.21
- Translation readiness + New Conditions + Complete Weapons List [merge](https://github.com/EndlesNights/dnd4eBeta/pull/265) from [FoxLee](https://github.com/FoxLee)

## Version 0.3.20
- fix Item Card Descriptions when viewed without actor, was causing a null issue because of 0.3.19 change.

## Version 0.3.19
- You should now be able to use the "@path.to.data" notation to reference to actor data within the Item Card Descriptions.
- Fixed style issue with item cards description backgrounds. New Line breaks should no longer sperate the background image.
- Changes to chat card generation for NPC powers [merge](https://github.com/EndlesNights/dnd4eBeta/pull/256) from [FoxLee](https://github.com/FoxLee)
- French Translation Added, thanks to [Gilphe](https://github.com/Gilphe) and [merge](https://github.com/EndlesNights/dnd4eBeta/pull/261) from [draconas1](https://github.com/draconas1)
- Fix to Ritual Formula [merge](https://github.com/EndlesNights/dnd4eBeta/pull/261) from [draconas1](https://github.com/draconas1)
- Fixed an issue with a heal dialog to properly display actor name.

## Version 0.3.18
- added null checks to turns.js to ward off edge case.

## Version 0.3.17
- Style update [merge](https://github.com/EndlesNights/dnd4eBeta/pull/254) from [FoxLee](https://github.com/FoxLee)

## Version 0.3.16
- Fast Forward for TAH Powers [merge](https://github.com/EndlesNights/dnd4eBeta/pull/252) from [draconas1](https://github.com/draconas1)

## Version 0.3.15
- fixed an error where some damage types was not appearing in power cards.

## Version 0.3.14
- Items without actors will now be able to set attribute resource consuemntion [merge](https://github.com/EndlesNights/dnd4eBeta/pull/251) from [draconas1](https://github.com/draconas1)
- Change to chat card styling [merge](https://github.com/EndlesNights/dnd4eBeta/pull/250) from [FoxLee](https://github.com/FoxLee)

## Version 0.3.13
- fixes Migration Fix and Template Changes [merge](https://github.com/EndlesNights/dnd4eBeta/pull/249) from [draconas1](https://github.com/draconas1)

## Version 0.3.12
- hothix an error when creating equipment type items on character sheets

## Version 0.3.11
- fixed bug caused by 0.3.7 to effects untyped bonus

## Version 0.3.10
- added proficiency tracker for armour
- added proficiency tracker for weapons
- when adding a armour or weapon to a player character sheet, it will check the items base stats against the characters proficiency, and automatically set the items proficiency to match.
- fixed an error where player names would not properly display on secondwind message.

## Version 0.3.9
- fix power cards labels to again properly show damage types.

## Version 0.3.8
- fix consumable items, where there roll properties would become unusable if the item had "Delete on Empty" selected and the item deleted its self.

## Version 0.3.7
- Added damage type override to weapon. Now weapons can chnage the damage type of powers.

## Version 0.3.6
- Hotfix, add zero check to system.attributes.init.bonusValue

## Version 0.3.5
- the "show players" button on items should now work for items within the directory that players do not have permission to see. Holding down the "Show Players Item Permanently" key (default to Alt) will change the base permission to at least viewable for all players.
- Effect can now add bonuses to Initative value with the key of `system.attributes.init.bonusValue`

## Version 0.3.4
- fixes "undefined undefined" when using consumables [merge](https://github.com/EndlesNights/dnd4eBeta/pull/242) from [draconas1](https://github.com/draconas1)
- Effects would not set for the first combatent [merge](https://github.com/EndlesNights/dnd4eBeta/pull/242) from [draconas1](https://github.com/draconas1)
- Heal dialog menu now displays surge value [merge](https://github.com/EndlesNights/dnd4eBeta/pull/242) from [draconas1](https://github.com/draconas1)
- changelog updated to fix spelling and fix mis-attributed changeset [merge](https://github.com/EndlesNights/dnd4eBeta/pull/242) from [draconas1](https://github.com/draconas1)
- Resetting Resources [merge](https://github.com/EndlesNights/dnd4eBeta/pull/240) from [kyleady](https://github.com/kyleady)
- minor css fixes

## Version 0.3.3
- Custom Effects Fixes [merge](https://github.com/EndlesNights/dnd4eBeta/pull/239) from [draconas1](https://github.com/draconas1)

## Version 0.3.2
- enrichHTML bug fix [merge](https://github.com/EndlesNights/dnd4eBeta/pull/237) from [kyleady](https://github.com/kyleady)
- any weapon bug fix [merge](https://github.com/EndlesNights/dnd4eBeta/pull/235) from [kyleady](https://github.com/kyleady)

## Version 0.3.1
- enrichHTML changes from v9 to v10 [merge](https://github.com/EndlesNights/dnd4eBeta/pull/233) from [kyleady](https://github.com/kyleady)

## Version 0.3.0
- Update to Foundry v10
- Minor fixes to css

## Version 0.2.85
- Pass the event into initiative to allow for fast forwarding [merge](https://github.com/EndlesNights/dnd4eBeta/pull/232) from [draconas1](https://github.com/draconas1)
- FastForward Keys moved to helper function [merge](https://github.com/EndlesNights/dnd4eBeta/pull/231) from [kyleady](https://github.com/kyleady)
- Bugfix with Attacking Multiple Tokens with FastForward [merge](https://github.com/EndlesNights/dnd4eBeta/pull/230) from [kyleady](https://github.com/kyleady)
- Bugfix when attack with defence that targeted null defence type [merge](https://github.com/EndlesNights/dnd4eBeta/pull/229) from [kyleady](https://github.com/kyleady)
- Added limited view for NPCs [merge](https://github.com/EndlesNights/dnd4eBeta/pull/228) from [mncimino1993](https://github.com/mncimino1993)

## Version 0.2.84
- fixed issue where healing where "surgeValue" tag was consuming a healing surge instead of just granting the HP. (For real this time)

## Version 0.2.83
- fixed issue where brutal value should have been checking for "less than equal" when it was instead just checking for "less than"
- fixed issue where healing where "surgeValue" tag was consuming a healing surge instead of just granting the HP.

## Version 0.2.82
- fixed small issue with object sorting on sheets. Powers, items, and feats should now be able to be manually resorted objects within the confines of the current sorting filters by dragging and dropping the items once more.
- fixed issue with power text filter, where the input element id was having interference from the feat filter input element because they shared the same id.
- fixed css for power text filter, where the css intended for another element was not specific enough and was causing the text to be unreadable shade of white.

## Version 0.2.81
- fixed fastforward for damage rolls
- can now fastforward power use, will automatically roll attack, damage, and healing rolls, as well as place measure templates.

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




























