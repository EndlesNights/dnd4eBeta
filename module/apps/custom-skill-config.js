
export default class CustomSkillConfig extends FormApplication {
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            title: `CONFIG.CustomSkillConfigTitle`,
            id: `CONFIG.CustomSkillConfig`,
            template: "systems/dnd4e/templates/apps/custom-skill-config.html",
            width: 700,
            height: 'auto',
            closeOnSubmit: true,
            classes: ['custom-skill-config'],
            submitOnClose: true,
            resizable: true,
            scrollY: ['.u-section'],
        });
    }

    async getData(options) {
        return {};
    }
}