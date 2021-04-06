/* eslint-disable no-unused-vars */

import { dirname } from 'path';
import { File } from '../File';

export type ComposerPackageSection = 'require' | 'require-dev';
export interface ComposerPackage {
    name: string;
    version: string;
    section: ComposerPackageSection;
}

export interface ComposerScript {
    name: string;
    command: string;
}

export class Composer {
    public rawData: any = {};
    protected loaded = false;

    constructor(public filename: string) {
        this.loaded = false;
    }

    static create(filename: string) {
        return new Composer(filename);
    }

    static createFromPath(directoryPath: string) {
        return new Composer(`${directoryPath}/composer.json`);
    }

    get dirname() {
        return dirname(this.filename);
    }

    get data() {
        if (!this.loaded) {
            this.load();
        }

        return this.rawData;
    }

    public toJson() {
        return JSON.stringify(this.data, null, 4);
    }

    public fromJson(json: string) {
        this.rawData = JSON.parse(json);

        return this;
    }

    public load() {
        this.rawData = require(this.filename);
        this.loaded = true;

        return this;
    }

    public hasPackage(name: string, section: ComposerPackageSection | 'all') {
        if (section === 'all') {
            return this.hasPackage(name, 'require') || this.hasPackage(name, 'require-dev');
        }

        this.ensureSectionExists(section);

        return typeof this.data[section][name] !== 'undefined';
    }

    public packageSection(name: string): ComposerPackageSection {
        if (this.hasPackage(name, 'require-dev')) {
            return 'require-dev';
        }

        return 'require';
    }

    public package(name: string): ComposerPackage {
        const version = this.packages('all')
            .find(pkg => pkg.name === name)?.version ?? '*';
        const section = this.packageSection(name);

        return { name, version, section };
    }

    public packages(kind: ComposerPackageSection | 'all'): ComposerPackage[] {
        const result: ComposerPackage[] = [];
        let pkgs: any = {};

        switch (kind) {
            case 'require':
                pkgs = this.data.require || {};
                break;

            case 'require-dev':
                pkgs = this.data['require-dev'] || {};
                break;

            case 'all':
                pkgs = Object.assign({}, this.data.require || {}, this.data['require-dev'] || {});
                break;
        }

        for (const name in pkgs) {
            const section = kind === 'all' ? this.packageSection(name) : kind;

            result.push({ name, version: pkgs[name], section });
        }

        return result;
    }

    public packageNames(kind: ComposerPackageSection | 'all'): string[] {
        return this.packages(kind)
            .map(pkg => pkg.name);
    }

    public scripts(): ComposerScript[] {
        const scripts = this.data.scripts || {};
        const result: ComposerScript[] = [];

        for (const name in scripts) {
            result.push({ name, command: scripts[name] });
        }

        return result;
    }

    public addPackage(pkg: ComposerPackage) {
        this.ensureSectionExists(pkg.section);
        this.data[pkg.section][pkg.name] = pkg.version;

        return this;
    }

    public setPackageVersion(pkg: ComposerPackage, version: string) {
        this.rawData[pkg.section][pkg.name] = version;
        pkg.version = version;

        return this;
    }

    public script(name: string): ComposerScript {
        return this.scripts()
            .find(script => script.name === name) ?? <ComposerScript>{};
    }

    public scriptNames(): string[] {
        return this.scripts()
            .map(script => script.name);
    }

    public hasScript(name: string): boolean {
        return this.scriptNames()
            .includes(name);
    }

    public addScript(script: ComposerScript) {
        this.ensureSectionExists('scripts');
        this.data.scripts[script.name] = script.command;

        return this;
    }

    public save() {
        File.create(this.filename)
            .setContents(this.toJson())
            .save();

        return this;
    }

    public ensureSectionExists(section: string) {
        if (typeof this.data[section] === 'undefined') {
            this.data[section] = {};
        }

        return this;
    }
}
