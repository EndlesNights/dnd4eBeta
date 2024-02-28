import Item4e from "./item-document.js";

export default class ContainerItem extends Item4e {
    
	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
        console.log("Container Backpack")
        return await super._preUpdate(changed, options, user);
    }
}