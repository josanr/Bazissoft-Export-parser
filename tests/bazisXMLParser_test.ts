import {BazisXmlParser, Part} from "../src/BazisXmlParser"
import { expect } from 'chai';
import 'mocha';
import * as fs from "fs";

describe('parse file', () => {

    it('Should parse file givven in parameter', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/02-399_spec.xml";
        parser.run(filePath, (error: Error, result: Part, goodSync:Array<string>) => {
            expect(error).to.equal(null);
            expect(result.length).to.equal(1);
            expect(goodSync.length).to.equal(1);
        });


    });

    it('Should parse file string', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/02-399_spec.xml";
        let filestring = fs.readFileSync(filePath, "utf8");
        parser.parse(filestring, (error: Error, result: Part, goodSync:Array<string>) => {
            expect(error).to.equal(null);
            expect(result.length).to.equal(1);
            expect(goodSync.length).to.equal(1);
        });


    });

});
