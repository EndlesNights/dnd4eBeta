export default class ChatMessage4e extends ChatMessage {

	/** @override */
	getRollData() {
		const itemUuid = this.flags?.dnd4e?.itemUuid;
		const itemData = this.flags?.dnd4e?.itemData;
		let item;
		if (itemUuid) item = fromUuidSync(itemUuid);
		else if (itemData) {
			const actor = fromUuidSync(this.flags?.dnd4e?.actorUuid);
			item = new CONFIG.Item.documentClass(itemData, { parent: actor });
			item.prepareData();
		}
		if (item) {
			return { ...item.getRollData(), messageId: this.id };
		} else
		{
			return { ...super.getRollData(), messageId: this.id };
		}
	}
}
