const units = [{
    name: 'in',
    value: 1/63360,
}, {
    name: 'ft',
    value: 1/5280,
}, {
    name: 'mi',
    value: 1,
}];

const suffixRegex = /[a-z]+\s*$/i;

export const parse = (string) => {
    const suffix = string.match(suffixRegex)?.[0].trim();
    if (suffix == null) {
        return Number(string);
    }
    string = string.replace(suffixRegex, '').trim();
    const unit = units.find((unit) => unit.name == suffix);
    if (unit == null) {
        return NaN;
    }
    return unit.value*Number(string);
};

export const stringify = (value, figures = 5) => {
    let i = units.length - 1;
    while (i > 0 && value < units[i].value) {
        i --;
    }
    const unit = units[i];
    value = value/unit.value;
    if (value >= 10**figures) {
        value = Math.round(value);
    } else {
        value = Number(value.toPrecision(figures));
    }
    return value + ' ' + unit.name;
};
