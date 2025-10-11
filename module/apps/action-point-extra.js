import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointExtraDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
        id: "action-point-extra",
        form: {
            closeOnSubmit: true,
        },
        position: {
            width: 500,
            height: "auto"
        }
    }
	
	get title() {
		return `${this.document.name} - Action Point Riders`;
	}

    static PARTS = {
        actionPointExtra: {
            template: "systems/dnd4e/templates/apps/action-point-extra.hbs"
        }
    }

	/** @override */
	_prepareContext() {
		return {system: this.document.system}
	}

	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}
}
