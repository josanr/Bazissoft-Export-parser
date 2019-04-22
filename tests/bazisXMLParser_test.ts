import {BazisXmlParser, Part} from "../src/BazisXmlParser"
import { expect } from 'chai';
import 'mocha';
import * as fs from "fs";

describe('parse file', () => {

    it('Should parse file givven in parameter', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test01.xml";
        parser.run(filePath, (error: Error, result: Part, goodSync:Array<string>) => {
            expect(error).to.equal(null);
            expect(result.length).to.equal(1);
            expect(goodSync.length).to.equal(1);
        });


    });

    it('Should parse file string', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test01.xml";
        let filestring = fs.readFileSync(filePath, "utf8");
        parser.parse(filestring, (error: Error, result: Part, goodSync:Array<string>) => {
            expect(error).to.equal(null);
            expect(result.length).to.equal(1);
            expect(goodSync.length).to.equal(1);
        });


    });


    it('Edgebaond is set correctly', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test02.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            part = result[0];
            expect(part.length).to.equal(1200);
            expect(part.width).to.equal(600);
            expect(part.L1).to.equal(0);
            expect(part.L2).to.equal(0);
            expect(part.W1).to.equal(1);
            expect(part.W2).to.equal(0);
        });


    });
});
