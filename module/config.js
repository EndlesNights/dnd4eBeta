// Namespace D&D5e Configuration Values
export const DND4EALTUS = {};

// ASCII Artwork
DND4EALTUS.ASCII = `__________________________________________________________
______      ______   ___  _____     ___  _ _             
|  _  \\___  |  _  \\ /   ||  ___|   / _ \\| | |            
| | | ( _ ) | | | |/ /| || |__    / /_\\ \\ | |_ _   _ ___ 
| | | / _ \\/\\ | | / /_| ||  __|   |  _  | | __| | | / __|
| |/ / (_>  < |/ /\\___  || |___   | | | | | |_| |_| \\__ \\
|___/ \\___/\\/___/     |_/\\____/   \\_| |_/_|\\__|\\__,_|___/
__________________________________________________________`;


/**
 * The set of Ability Scores used within the system
 * @type {Object}
 */
DND4EALTUS.abilities = {
  "str": "DND4EALTUS.AbilityStr",
  "con": "DND4EALTUS.AbilityCon",
  "dex": "DND4EALTUS.AbilityDex",
  "int": "DND4EALTUS.AbilityInt",
  "wis": "DND4EALTUS.AbilityWis",
  "cha": "DND4EALTUS.AbilityCha"
};

/* -------------------------------------------- */

/**
 * Character alignment options
 * @type {Object}
 */
DND4EALTUS.alignments = {
  'lg': "DND4EALTUS.AlignmentLG",
  'ng': "DND4EALTUS.AlignmentNG",
  'cg': "DND4EALTUS.AlignmentCG",
  'ln': "DND4EALTUS.AlignmentLN",
  'tn': "DND4EALTUS.AlignmentTN",
  'cn': "DND4EALTUS.AlignmentCN",
  'le': "DND4EALTUS.AlignmentLE",
  'ne': "DND4EALTUS.AlignmentNE",
  'ce': "DND4EALTUS.AlignmentCE"
};


DND4EALTUS.weaponProficiencies = {
  "sim": "DND4EALTUS.WeaponSimpleProficiency",
  "mar": "DND4EALTUS.WeaponMartialProficiency"
};

DND4EALTUS.toolProficiencies = {
  "art": "DND4EALTUS.ToolArtisans",
  "disg": "DND4EALTUS.ToolDisguiseKit",
  "forg": "DND4EALTUS.ToolForgeryKit",
  "game": "DND4EALTUS.ToolGamingSet",
  "herb": "DND4EALTUS.ToolHerbalismKit",
  "music": "DND4EALTUS.ToolMusicalInstrument",
  "navg": "DND4EALTUS.ToolNavigators",
  "pois": "DND4EALTUS.ToolPoisonersKit",
  "thief": "DND4EALTUS.ToolThieves",
  "vehicle": "DND4EALTUS.ToolVehicle"
};


/* -------------------------------------------- */

/**
 * This Object defines the various lengths of time which can occur in D&D5e
 * @type {Object}
 */
DND4EALTUS.timePeriods = {
  "inst": "DND4EALTUS.TimeInst",
  "turn": "DND4EALTUS.TimeTurn",
  "round": "DND4EALTUS.TimeRound",
  "minute": "DND4EALTUS.TimeMinute",
  "hour": "DND4EALTUS.TimeHour",
  "day": "DND4EALTUS.TimeDay",
  "month": "DND4EALTUS.TimeMonth",
  "year": "DND4EALTUS.TimeYear",
  "perm": "DND4EALTUS.TimePerm",
  "spec": "DND4EALTUS.Special"
};


/* -------------------------------------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
DND4EALTUS.abilityActivationTypes = {
  "none": "DND4EALTUS.None",
  "action": "DND4EALTUS.Action",
  "bonus": "DND4EALTUS.BonusAction",
  "reaction": "DND4EALTUS.Reaction",
  "minute": DND4EALTUS.timePeriods.minute,
  "hour": DND4EALTUS.timePeriods.hour,
  "day": DND4EALTUS.timePeriods.day,
  "special": DND4EALTUS.timePeriods.spec,
  "legendary": "DND4EALTUS.LegAct",
  "lair": "DND4EALTUS.LairAct"
};

/* -------------------------------------------- */


DND4EALTUS.abilityConsumptionTypes = {
  "ammo": "DND4EALTUS.ConsumeAmmunition",
  "attribute": "DND4EALTUS.ConsumeAttribute",
  "material": "DND4EALTUS.ConsumeMaterial",
  "charges": "DND4EALTUS.ConsumeCharges"
};


/* -------------------------------------------- */

// Creature Sizes
DND4EALTUS.actorSizes = {
  "tiny": "DND4EALTUS.SizeTiny",
  "sm": "DND4EALTUS.SizeSmall",
  "med": "DND4EALTUS.SizeMedium",
  "lg": "DND4EALTUS.SizeLarge",
  "huge": "DND4EALTUS.SizeHuge",
  "grg": "DND4EALTUS.SizeGargantuan"
};

DND4EALTUS.tokenSizes = {
  "tiny": 1,
  "sm": 1,
  "med": 1,
  "lg": 2,
  "huge": 3,
  "grg": 4
};

/* -------------------------------------------- */

/**
 * Classification types for item action types
 * @type {Object}
 */
DND4EALTUS.itemActionTypes = {
  "mwak": "DND4EALTUS.ActionMWAK",
  "rwak": "DND4EALTUS.ActionRWAK",
  "msak": "DND4EALTUS.ActionMSAK",
  "rsak": "DND4EALTUS.ActionRSAK",
  "save": "DND4EALTUS.ActionSave",
  "heal": "DND4EALTUS.ActionHeal",
  "abil": "DND4EALTUS.ActionAbil",
  "util": "DND4EALTUS.ActionUtil",
  "other": "DND4EALTUS.ActionOther"
};

/* -------------------------------------------- */

DND4EALTUS.itemCapacityTypes = {
  "items": "DND4EALTUS.ItemContainerCapacityItems",
  "weight": "DND4EALTUS.ItemContainerCapacityWeight"
};

/* -------------------------------------------- */

/**
 * Enumerate the lengths of time over which an item can have limited use ability
 * @type {Object}
 */
DND4EALTUS.limitedUsePeriods = {
  "sr": "DND4EALTUS.ShortRest",
  "lr": "DND4EALTUS.LongRest",
  "day": "DND4EALTUS.Day",
  "charges": "DND4EALTUS.Charges"
};


/* -------------------------------------------- */

/**
 * The set of equipment types for armor, clothing, and other objects which can ber worn by the character
 * @type {Object}
 */
DND4EALTUS.equipmentTypes = {
  "light": "DND4EALTUS.EquipmentLight",
  "medium": "DND4EALTUS.EquipmentMedium",
  "heavy": "DND4EALTUS.EquipmentHeavy",
  "bonus": "DND4EALTUS.EquipmentBonus",
  "natural": "DND4EALTUS.EquipmentNatural",
  "shield": "DND4EALTUS.EquipmentShield",
  "clothing": "DND4EALTUS.EquipmentClothing",
  "trinket": "DND4EALTUS.EquipmentTrinket"
};


/* -------------------------------------------- */

/**
 * The set of Armor Proficiencies which a character may have
 * @type {Object}
 */
DND4EALTUS.armorProficiencies = {
  "lgt": DND4EALTUS.equipmentTypes.light,
  "med": DND4EALTUS.equipmentTypes.medium,
  "hvy": DND4EALTUS.equipmentTypes.heavy,
  "shl": "DND4EALTUS.EquipmentShieldProficiency"
};


/* -------------------------------------------- */

/**
 * Enumerate the valid consumable types which are recognized by the system
 * @type {Object}
 */
DND4EALTUS.consumableTypes = {
  "ammo": "DND4EALTUS.ConsumableAmmunition",
  "potion": "DND4EALTUS.ConsumablePotion",
  "poison": "DND4EALTUS.ConsumablePoison",
  "food": "DND4EALTUS.ConsumableFood",
  "scroll": "DND4EALTUS.ConsumableScroll",
  "wand": "DND4EALTUS.ConsumableWand",
  "rod": "DND4EALTUS.ConsumableRod",
  "trinket": "DND4EALTUS.ConsumableTrinket"
};

/* -------------------------------------------- */

/**
 * The valid currency denominations supported by the 5e system
 * @type {Object}
 */
DND4EALTUS.currencies = {
  "pp": "DND4EALTUS.CurrencyPP",
  "gp": "DND4EALTUS.CurrencyGP",
  "sp": "DND4EALTUS.CurrencySP",
  "cp": "DND4EALTUS.CurrencyCP"
};

/**
 * Define the upwards-conversion rules for registered currency types
 * @type {{string, object}}
 */
DND4EALTUS.currencyConversion = {
  cp: {into: "sp", each: 10},
  sp: {into: "gp", each: 10 },
  gp: {into: "pp", each: 10}
};

/* -------------------------------------------- */

DND4EALTUS.ritualcomponents = {
	"ad": "DND4EALTUS.RitualCompAD",
	"rh": "DND4EALTUS.RitualCompRH",
	"si": "DND4EALTUS.RitualCompSI",
	"mc": "DND4EALTUS.RitualCompMC"
};


/* -------------------------------------------- */

// Damage Types
DND4EALTUS.damageTypes = {
	
  "damage": "DND4EALTUS.Damage",
  "acid": "DND4EALTUS.DamageAcid",
  // "bludgeoning": "DND4EALTUS.DamageBludgeoning",
  // "bludgeon": "DND4EALTUS.DamageBludgeoning",
  "cold": "DND4EALTUS.DamageCold",
  "fire": "DND4EALTUS.DamageFire",
  "force": "DND4EALTUS.DamageForce",
  "lightning": "DND4EALTUS.DamageLightning",
  "necrotic": "DND4EALTUS.DamageNecrotic",
  // "pierce": "DND4EALTUS.DamagePiercing",
  // "piercing": "DND4EALTUS.DamagePiercing",
  "physical": "DND4EALTUS.Damagephysical",
  "poison": "DND4EALTUS.DamagePoison",
  "psychic": "DND4EALTUS.DamagePsychic",
  "radiant": "DND4EALTUS.DamageRadiant",
  // "slashing": "DND4EALTUS.DamageSlashing",
  // "slash": "DND4EALTUS.DamageSlashing",
  "thunder": "DND4EALTUS.DamageThunder"
};

/* -------------------------------------------- */

// Def
DND4EALTUS.def = {
  "ac": "DND4EALTUS.DefAC",
  "fort": "DND4EALTUS.DefFort",
  "ref": "DND4EALTUS.DefRef",
  "wil": "DND4EALTUS.DefWil"
};/* -------------------------------------------- */


// Defensives
DND4EALTUS.defensives = {
  "ac": "DND4EALTUS.DefenceAC",
  "fort": "DND4EALTUS.DefenceFort",
  "ref": "DND4EALTUS.DefenceRef",
  "wil": "DND4EALTUS.DefenceWil"
};

/* -------------------------------------------- */

DND4EALTUS.distanceUnits = {
  "none": "DND4EALTUS.None",
  "self": "DND4EALTUS.DistSelf",
  "touch": "DND4EALTUS.DistTouch",
  "ft": "DND4EALTUS.DistFt",
  "mi": "DND4EALTUS.DistMi",
  "spec": "DND4EALTUS.Special",
  "any": "DND4EALTUS.DistAny"
};

/* -------------------------------------------- */


/**
 * Configure aspects of encumbrance calculation so that it could be configured by modules
 * @type {Object}
 */
DND4EALTUS.encumbrance = {
  currencyPerWeight: 50,
  strMultiplier: 15
};

/* -------------------------------------------- */

/**
 * This Object defines the types of single or area targets which can be applied in D&D5e
 * @type {Object}
 */
DND4EALTUS.targetTypes = {
  "none": "DND4EALTUS.None",
  "self": "DND4EALTUS.TargetSelf",
  "creature": "DND4EALTUS.TargetCreature",
  "ally": "DND4EALTUS.TargetAlly",
  "enemy": "DND4EALTUS.TargetEnemy",
  "object": "DND4EALTUS.TargetObject",
  "space": "DND4EALTUS.TargetSpace",
  "radius": "DND4EALTUS.TargetRadius",
  "sphere": "DND4EALTUS.TargetSphere",
  "cylinder": "DND4EALTUS.TargetCylinder",
  "cone": "DND4EALTUS.TargetCone",
  "square": "DND4EALTUS.TargetSquare",
  "cube": "DND4EALTUS.TargetCube",
  "line": "DND4EALTUS.TargetLine",
  "wall": "DND4EALTUS.TargetWall"
};


/* -------------------------------------------- */


/**
 * Map the subset of target types which produce a template area of effect
 * The keys are DND4EALTUS target types and the values are MeasuredTemplate shape types
 * @type {Object}
 */
DND4EALTUS.areaTargetTypes = {
  cone: "cone",
  cube: "rect",
  cylinder: "circle",
  line: "ray",
  radius: "circle",
  sphere: "circle",
  square: "rect",
  wall: "ray"
};


/* -------------------------------------------- */

// Healing Types
DND4EALTUS.healingTypes = {
  "healing": "DND4EALTUS.Healing",
  "temphp": "DND4EALTUS.HealingTemp"
};


/* -------------------------------------------- */


/**
 * Enumerate the denominations of hit dice which can apply to classes in the D&D4E system
 * @type {Array.<string>}
 */
DND4EALTUS.hitDieTypes = ["d6", "d8", "d10", "d12"];


/* -------------------------------------------- */

/**
 * Character senses options
 * @type {Object}
 */
DND4EALTUS.special = {
  "aa": "DND4EALTUS.SpecialSensesAA",
  "bs": "DND4EALTUS.SpecialSensesBS",
  "dv": "DND4EALTUS.SpecialSensesDV",
  "ts": "DND4EALTUS.SpecialSensesTS",
  "tr": "DND4EALTUS.SpecialSensesTR"
};

DND4EALTUS.vision = {
	"nv": "DND4EALTUS.VisionNormal",
	"lv": "DND4EALTUS.VisionLowLight",
	"bv": "DND4EALTUS.VisionBlind"
};

/* -------------------------------------------- */

/**
 * The set of skill which can be trained in D&D4eAltus
 * @type {Object}
 */
DND4EALTUS.skills = {
  "acr": "DND4EALTUS.SkillAcr",
  "arc": "DND4EALTUS.SkillArc",
  "ath": "DND4EALTUS.SkillAth",
  "blu": "DND4EALTUS.SkillBlu",
  "dip": "DND4EALTUS.SkillDip",
  "dun": "DND4EALTUS.SkillDun",
  "end": "DND4EALTUS.SkillEnd",
  "eng": "DND4EALTUS.SkillEng",
  "hea": "DND4EALTUS.SkillHea",
  "his": "DND4EALTUS.SkillHis",
  "ins": "DND4EALTUS.SkillIns",
  "itm": "DND4EALTUS.SkillItm",
  "nat": "DND4EALTUS.SkillNat",
  "prc": "DND4EALTUS.SkillPrc",
  "pra": "DND4EALTUS.SkillPra",
  "rel": "DND4EALTUS.SkillRel",
  "ste": "DND4EALTUS.SkillSte",
  "stw": "DND4EALTUS.SkillStw",
  "thi": "DND4EALTUS.SkillThi"
};


/* -------------------------------------------- */

DND4EALTUS.spellPreparationModes = {
  "always": "DND4EALTUS.SpellPrepAlways",
  "atwill": "DND4EALTUS.SpellPrepAtWill",
  "innate": "DND4EALTUS.SpellPrepInnate",
  "pact": "DND4EALTUS.PactMagic",
  "prepared": "DND4EALTUS.SpellPrepPrepared"
};

DND4EALTUS.spellUpcastModes = ["always", "pact", "prepared"];


DND4EALTUS.spellProgression = {
  "none": "DND4EALTUS.SpellNone",
  "full": "DND4EALTUS.SpellProgFull",
  "half": "DND4EALTUS.SpellProgHalf",
  "third": "DND4EALTUS.SpellProgThird",
  "pact": "DND4EALTUS.SpellProgPact",
  "artificer": "DND4EALTUS.SpellProgArt"
};

/* -------------------------------------------- */

/**
 * The available choices for how spell damage scaling may be computed
 * @type {Object}
 */
DND4EALTUS.spellScalingModes = {
  "none": "DND4EALTUS.SpellNone",
  "cantrip": "DND4EALTUS.SpellCantrip",
  "level": "DND4EALTUS.SpellLevel"
};

/* -------------------------------------------- */


/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
DND4EALTUS.weaponTypes = {
  "simpleM": "DND4EALTUS.WeaponSimpleM",
  "militaryM": "DND4EALTUS.WeaponMilitaryM",
  "superiorM": "DND4EALTUS.WeaponSuperiorM",
  "improvM": "DND4EALTUS.WeaponImprovisedM",
  "simpleR": "DND4EALTUS.WeaponSimpleR",  
  "militaryR": "DND4EALTUS.WeaponMilitaryR",
  "superiorR": "DND4EALTUS.WeaponSuperiorR",
  "improvR": "DND4EALTUS.WeaponImprovisedR",
  "siege": "DND4EALTUS.WeaponSiege",
  "natural": "DND4EALTUS.WeaponNatural",
  "improv": "DND4EALTUS.WeaponImprov",

};


/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
DND4EALTUS.weaponProperties = {
  "amm": "DND4EALTUS.WeaponPropertiesAmm",
  "bru": "DND4EALTUS.WeaponPropertiesBru",
  "def": "DND4EALTUS.WeaponPropertiesDef",
  "hic": "DND4EALTUS.WeaponPropertiesHic",
  "imp": "DND4EALTUS.WeaponPropertiesImp",
  "lof": "DND4EALTUS.WeaponPropertiesLof",
  "lom": "DND4EALTUS.WeaponPropertiesLom",
  "off": "DND4EALTUS.WeaponPropertiesOff",
  "rch": "DND4EALTUS.WeaponPropertiesRch",
  "rel": "DND4EALTUS.WeaponPropertiesRel",
  "sml": "DND4EALTUS.WeaponPropertiesSml",
  "spc": "DND4EALTUS.WeaponPropertiesSpc",
  "thv": "DND4EALTUS.WeaponPropertiesThv",
  "tlg": "DND4EALTUS.WeaponPropertiesTlg",
  "two": "DND4EALTUS.WeaponPropertiesTwo",
  "ver": "DND4EALTUS.WeaponPropertiesVer"
};


// Spell Components
DND4EALTUS.spellComponents = {
  "V": "DND4EALTUS.ComponentVerbal",
  "S": "DND4EALTUS.ComponentSomatic",
  "M": "DND4EALTUS.ComponentMaterial"
};

// Spell Schools
DND4EALTUS.spellSchools = {
  "abj": "DND4EALTUS.SchoolAbj",
  "con": "DND4EALTUS.SchoolCon",
  "div": "DND4EALTUS.SchoolDiv",
  "enc": "DND4EALTUS.SchoolEnc",
  "evo": "DND4EALTUS.SchoolEvo",
  "ill": "DND4EALTUS.SchoolIll",
  "nec": "DND4EALTUS.SchoolNec",
  "trs": "DND4EALTUS.SchoolTrs"
};

// Spell Levels
DND4EALTUS.spellLevels = {
  0: "DND4EALTUS.SpellLevel0",
  1: "DND4EALTUS.SpellLevel1",
  2: "DND4EALTUS.SpellLevel2",
  3: "DND4EALTUS.SpellLevel3",
  4: "DND4EALTUS.SpellLevel4",
  5: "DND4EALTUS.SpellLevel5",
  6: "DND4EALTUS.SpellLevel6",
  7: "DND4EALTUS.SpellLevel7",
  8: "DND4EALTUS.SpellLevel8",
  9: "DND4EALTUS.SpellLevel9"
};

// Spell Scroll Compendium UUIDs
DND4EALTUS.spellScrollIds = {
  0: 'Compendium.dnd4eAltus.items.rQ6sO7HDWzqMhSI3',
  1: 'Compendium.dnd4eAltus.items.9GSfMg0VOA2b4uFN',
  2: 'Compendium.dnd4eAltus.items.XdDp6CKh9qEvPTuS',
  3: 'Compendium.dnd4eAltus.items.hqVKZie7x9w3Kqds',
  4: 'Compendium.dnd4eAltus.items.DM7hzgL836ZyUFB1',
  5: 'Compendium.dnd4eAltus.items.wa1VF8TXHmkrrR35',
  6: 'Compendium.dnd4eAltus.items.tI3rWx4bxefNCexS',
  7: 'Compendium.dnd4eAltus.items.mtyw4NS1s7j2EJaD',
  8: 'Compendium.dnd4eAltus.items.aOrinPg7yuDZEuWr',
  9: 'Compendium.dnd4eAltus.items.O4YbkJkLlnsgUszZ'
};

/**
 * Define the standard slot progression by character level.
 * The entries of this array represent the spell slot progression for a full spell-caster.
 * @type {Array[]}
 */
DND4EALTUS.SPELL_SLOT_TABLE = [
  [2],
  [3],
  [4, 2],
  [4, 3],
  [4, 3, 2],
  [4, 3, 3],
  [4, 3, 3, 1],
  [4, 3, 3, 2],
  [4, 3, 3, 3, 1],
  [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1]
];

/* -------------------------------------------- */

// Polymorph options.
DND4EALTUS.polymorphSettings = {
  keepPhysical: 'DND4EALTUS.PolymorphKeepPhysical',
  keepMental: 'DND4EALTUS.PolymorphKeepMental',
  keepSaves: 'DND4EALTUS.PolymorphKeepSaves',
  keepSkills: 'DND4EALTUS.PolymorphKeepSkills',
  mergeSaves: 'DND4EALTUS.PolymorphMergeSaves',
  mergeSkills: 'DND4EALTUS.PolymorphMergeSkills',
  keepClass: 'DND4EALTUS.PolymorphKeepClass',
  keepFeats: 'DND4EALTUS.PolymorphKeepFeats',
  keepSpells: 'DND4EALTUS.PolymorphKeepSpells',
  keepItems: 'DND4EALTUS.PolymorphKeepItems',
  keepBio: 'DND4EALTUS.PolymorphKeepBio',
  keepVision: 'DND4EALTUS.PolymorphKeepVision'
};

/* -------------------------------------------- */

/**
 * Skill, ability, and tool proficiency levels
 * Each level provides a proficiency multiplier
 * @type {Object}
 */
DND4EALTUS.proficiencyLevels = {
  0: "DND4EALTUS.NotProficient",
  5: "DND4EALTUS.Proficient"
};

DND4EALTUS.trainingLevels = {
  0: "DND4EALTUS.NotTrained",
  5: "DND4EALTUS.Trained",
  8: "DND4EALTUS.FocusTrained"
};
/* -------------------------------------------- */


// Condition Types
DND4EALTUS.conditionTypes = {
  "blinded": "DND4EALTUS.ConBlinded",
  "charmed": "DND4EALTUS.ConCharmed",
  "deafened": "DND4EALTUS.ConDeafened",
  "diseased": "DND4EALTUS.ConDiseased",
  "exhaustion": "DND4EALTUS.ConExhaustion",
  "frightened": "DND4EALTUS.ConFrightened",
  "grappled": "DND4EALTUS.ConGrappled",
  "incapacitated": "DND4EALTUS.ConIncapacitated",
  "invisible": "DND4EALTUS.ConInvisible",
  "paralyzed": "DND4EALTUS.ConParalyzed",
  "petrified": "DND4EALTUS.ConPetrified",
  "poisoned": "DND4EALTUS.ConPoisoned",
  "prone": "DND4EALTUS.ConProne",
  "restrained": "DND4EALTUS.ConRestrained",
  "stunned": "DND4EALTUS.ConStunned",
  "unconscious": "DND4EALTUS.ConUnconscious"
};

// Languages
DND4EALTUS.spoken = {
  "Alti": "DND4EALTUS.SpokenAlti",
  "Cellian": "DND4EALTUS.SpokenCellian",
  "Ghido": "DND4EALTUS.SpokenGhido",
  "Jarissian": "DND4EALTUS.SpokenJarissian",
  "Luxen": "DND4EALTUS.SpokenLuxen",
  "Saeven": "DND4EALTUS.SpokenSaeven",
  "Token": "DND4EALTUS.SpokenToken",
  "Vasten": "DND4EALTUS.SpokenVasten"
};
DND4EALTUS.script = {
  "Alti": "DND4EALTUS.ScriptAlti",
  "Cellian": "DND4EALTUS.ScriptCellian",
  "Ghido": "DND4EALTUS.ScriptGhido",
  "Token": "DND4EALTUS.ScriptToken"
};

// Character Level XP Requirements
DND4EALTUS.CHARACTER_EXP_LEVELS =  [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000,
  120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]
;

// Challenge Rating XP Levels
DND4EALTUS.CR_EXP_LEVELS = [
  10, 200, 450, 700, 1100, 1800, 2300, 2900, 3900, 5000, 5900, 7200, 8400, 10000, 11500, 13000, 15000, 18000,
  20000, 22000, 25000, 33000, 41000, 50000, 62000, 75000, 90000, 105000, 120000, 135000, 155000
];

// Configure Optional Character Flags
DND4EALTUS.characterFlags = {
  "powerfulBuild": {
    name: "DND4EALTUS.FlagsPowerfulBuild",
    hint: "DND4EALTUS.FlagsPowerfulBuildHint",
    section: "Racial Traits",
    type: Boolean
  },
  "savageAttacks": {
    name: "DND4EALTUS.FlagsSavageAttacks",
    hint: "DND4EALTUS.FlagsSavageAttacksHint",
    section: "Racial Traits",
    type: Boolean
  },
  "elvenAccuracy": {
    name: "DND4EALTUS.FlagsElvenAccuracy",
    hint: "DND4EALTUS.FlagsElvenAccuracyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "halflingLucky": {
    name: "DND4EALTUS.FlagsHalflingLucky",
    hint: "DND4EALTUS.FlagsHalflingLuckyHint",
    section: "Racial Traits",
    type: Boolean
  },
  "initiativeAdv": {
    name: "DND4EALTUS.FlagsInitiativeAdv",
    hint: "DND4EALTUS.FlagsInitiativeAdvHint",
    section: "Feats",
    type: Boolean
  },
  "initiativeAlert": {
    name: "DND4EALTUS.FlagsAlert",
    hint: "DND4EALTUS.FlagsAlertHint",
    section: "Feats",
    type: Boolean
  },
  "jackOfAllTrades": {
    name: "DND4EALTUS.FlagsJOAT",
    hint: "DND4EALTUS.FlagsJOATHint",
    section: "Feats",
    type: Boolean
  },
  "observantFeat": {
    name: "DND4EALTUS.FlagsObservant",
    hint: "DND4EALTUS.FlagsObservantHint",
    skills: ['prc','inv'],
    section: "Feats",
    type: Boolean
  },
  "reliableTalent": {
    name: "DND4EALTUS.FlagsReliableTalent",
    hint: "DND4EALTUS.FlagsReliableTalentHint",
    section: "Feats",
    type: Boolean
  },
  "remarkableAthlete": {
    name: "DND4EALTUS.FlagsRemarkableAthlete",
    hint: "DND4EALTUS.FlagsRemarkableAthleteHint",
    abilities: ['str','dex','con'],
    section: "Feats",
    type: Boolean
  },
  "weaponCriticalThreshold": {
    name: "DND4EALTUS.FlagsCritThreshold",
    hint: "DND4EALTUS.FlagsCritThresholdHint",
    section: "Feats",
    type: Number,
    placeholder: 20
  }
};

// Configure allowed status flags
DND4EALTUS.allowedActorFlags = [
  "isPolymorphed", "originalActor"
].concat(Object.keys(DND4EALTUS.characterFlags));
