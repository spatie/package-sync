/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

export interface OptionDefinition {
    name: string;
    alias?: string;
    default?: any;
    describe?: string;
    type?: string;
}

export abstract class Command {
    public static command: string;
    public static aliases: string[] = [];
    public static description: string;
    public static options: OptionDefinition[] = [];
    public static exports: any;

    static handle(argv: any[]): void {
        return;
    }

    protected static optionsToBuilder() {
        return (yargs: any, helpOrVersionSet: any) => {
            this.options.forEach((option: OptionDefinition) => {
                yargs.option(option.name, option);
            });

            return yargs;
        };
    }

    public static export() {
        this.exports.command = this.command;
        this.exports.describe = this.description;
        this.exports.builder = this.optionsToBuilder();
        this.exports.handler = this.handle;

        //if (typeof this['aliases'] !== 'undefined' && this.aliases.length && this.aliases[0].length) {
        const aliases = this.aliases || [];

        if (Array.isArray(aliases) && aliases.length) {
            this.exports.aliases = aliases.slice(0);
        } else {
            this.exports.aliases = [];
        }

        return this.exports;
    }
}

export function createOption(name: string, defaultValue: any = undefined, settings: Record<string, unknown> = {}): OptionDefinition {
    return Object.assign({}, { name: name, default: defaultValue }, settings);
}

export const loadCommand = (cmd: any) => cmd.default.export();
