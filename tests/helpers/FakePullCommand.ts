import { Command } from '../../src/commands/Command';

export default class FakePullCommand extends Command {
    public static command = 'fake-pull <name>';
    public static aliases: string[] = ['fp'];
    public static description = 'Fake class to update/retrieve the named package repository';
    public static exports = {};
    public static options = [];

    public static handled: string[];

    static handle(argv: any): void {
        this.handled.push(argv);
    }
}
