const { BooleanField, DocumentUUIDField, ForeignDocumentField, NumberField, SetField, StringField } = foundry.data.fields;

export default class PhysicalItemTemplate extends foundry.abstract.DataModel {
	static defineSchema() {
		return {
			quantity: new NumberField({ min: 0, initial: 1, integer: true }),
			weight: new NumberField({ min: 0, initial: 0 }),
			price: new NumberField({ min: 0, initial: 0 }),
			attuned: new BooleanField({ initial: false }),
			equipped: new BooleanField({ initial: false }),
			rarity: new StringField({ initial: "" }),
			identified: new BooleanField({ initial: true }),
			container: new ForeignDocumentField(foundry.documents.BaseItem, {
				idOnly: true,
			}),
			itemPowers: new SetField(new DocumentUUIDField({
				type: "Item",
				nullable: false,
				validate: uuid => {
					const item = fromUuidSync(uuid, { strict: false });
					return !item || (item.type === "power");
				},
				validationError: "Item must be a power.",
				strict: true,
			}), { label: "DND4E.Powers", hint: "DND4E.ItemPowersHint" }),
		};
	}
}
