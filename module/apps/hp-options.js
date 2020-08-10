
export default class HPOptions extends FormApplication {


  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	  id: "hp-options",
      classes: ["dnd4eAltus"],
      title: "Hit Points Options",
      template: "systems/dnd4eAltus/templates/apps/hp-options.html",
      width: 340,
      height: "auto",
      closeOnSubmit: false,
      submitOnClose: false
    });
	}
	
	/** @override */
	getData() {
		
		// let data =  this.object.data;
		//let data =  "test";
		// console.log(this.object.data.data);
		return {data: this.object.data.data}
	}
	
	/* -------------------------------------------- */

	/** @override */
	_updateObject(event, formData) {
		
		console.log(Object.entries(formData)[0][0]);
		console.log(Object.entries(formData).length);
		
		console.log(formData);
		// for (let fd of formData)
		// {
			// console.log(fd);
		// }
		
		
		// console.log(this);
		const updateData = {};
		
		for(let i = 0; i < Object.entries(formData).length; i++)
		{
			updateData[Object.entries(formData)[i][0]] = Object.entries(formData)[i][1];
		}
		// updateData[Object.entries(formData)[0][0]] = Object.entries(formData)[0][1];
		
		
		// let someData = formData.data.details.secondwind;
		// updateData[`this.object.data.data.details.secondwind`] = false;
		//updateData[`data.details.secondwind`] = false;
		
		// console.log(updateData);
		this.object.update(updateData);
	}
}
