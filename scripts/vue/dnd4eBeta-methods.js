window.dnd4eBetaVueMethods = {
  methods: {
    getSafeValue(property, defaultValue) {
      if (property) return property.value;
      return defaultValue;
    },
    localize(key) {
      return game.i18n.localize(key);
    },
    cssClass(string) {
      const classString = encodeURIComponent(
        string.trim().toLowerCase()
      ).replace(/%[0-9A-F]{2}/gi, '-');
	  console.log(classString);
	  return classString
    },
    numberFormat(value, dec = 0, sign = false) {
      value = parseFloat(value).toFixed(dec);
      if (sign ) return ( value >= 0 ) ? `+${value}` : value;
      return value;
    },
    concat(...args) {
      return args.reduce((acc, cur) => {
        return acc + cur;
      }, '');
    }
  }
}