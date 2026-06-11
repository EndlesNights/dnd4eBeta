import ActivatedEffectTemplate from "./templates/activated-effect.js";
import ItemDescriptionTemplate from "./templates/item-description.js";
import ItemMacroTemplate from "./templates/item-macro.js";
import PhysicalItemTemplate from "./templates/physical-item.js";

const { ArrayField, BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

export default class EquipmentData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			...ItemDescriptionTemplate.defineSchema(),
			...PhysicalItemTemplate.defineSchema(),
			...ActivatedEffectTemplate.defineSchema(),
			...ItemMacroTemplate.defineSchema(),
			level: new StringField({ initial: "" }),
			armour: new SchemaField({
				type: new StringField({ initial: "armour" }),
				subtype: new StringField({ initial: "" }),
				enhance: new NumberField({ initial: 0, integer: true }),
				ac: new NumberField({ initial: 0, integer: true }),
				fort: new NumberField({ initial: 0, integer: true }),
				ref: new NumberField({ initial: 0, integer: true }),
				wil: new NumberField({ initial: 0, integer: true }),
				// TODO: is this actually used anywhere?
				dex: new NumberField({ nullable: true, initial: null }),
				movePen: new BooleanField({ initial: false }),
				movePenValue: new NumberField({ initial: 0, integer: true }),
				skillCheck: new BooleanField({ initial: false }),
				skillCheckValue: new NumberField({ initial: 0, integer: true }),
				damageRes: new SchemaField({
					parts: new ArrayField(new SchemaField({
						0: new NumberField({ nullable: true, initial: null }),
						1: new StringField({ initial: "" }),
					}), { initial: [] }),
				}),
			}),
			armourBaseType: new StringField({ initial: "" }),
			armourBaseTypeCustom: new StringField({ initial: "" }),
			shieldBaseType: new StringField({ initial: "" }),
			shieldBaseTypeCustom: new StringField({ initial: "" }),
			// TODO: is this actually used anywhere?
			speed: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				conditions: new StringField({ initial: "" }),
			}),
			strength: new NumberField({ initial: 0, min: 0, integer: true }),
			stealth: new BooleanField({ initial: false }),
			proficient: new StringField({ initial: "auto" }),
		};
	}

	/* -------------------------------------------- */
	/*  Data Migration                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	static migrateData(source) {
		if (typeof source.proficient === "boolean") source.proficient = "auto";
		if (source.armour?.subType) {
			source.armour.subtype = source.armour.subType;
			delete source.armour.subType;
		}
		if (source.armour?.subtype === "cloth") source.armour.subtype = "light";
		return super.migrateData(source);
	}
}
