Array.prototype.where = function (prop, value) {
    return this.find(obj => obj[prop] === value);
};

export const init = () => {
    Array.prototype.where = function (prop, value) {
        return this.find(obj => obj[prop] === value);
    };

    return true;
};

export default init;
