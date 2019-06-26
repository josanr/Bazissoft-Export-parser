import {BazisXmlParser, Part, DrillParsed} from "../src/BazisXmlParser"
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


    it('Edgeband is set correctly', () => {
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

    it('is notch set correctly', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test02.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            part = result[0];
            expect(part.isNotch).to.equal(false);
            part = result[1];
            expect(part.isNotch).to.equal(true);
            part = result[2];
            expect(part.isNotch).to.equal(false);

        });

    });


    it('is drill set correctly', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test03.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            part = result[0];
            expect(part.isDrill).to.equal(true);


        });

    });

    it('is drill equal to type drill parsed', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test03.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            part = result[0];
            expect(part.DrillExtra).to.instanceOf(DrillParsed)


        });

    });


    it('Self glueup is made by face edge', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test06.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            part = result[2];

            expect(part.isGlue).to.equal(true);
            expect(part.num).to.equal(2);


        });

    });

    it('Self glueup is made by face edge with different Materials', () => {
        let parser = new BazisXmlParser();
        let filePath = "./tests/test06.xml";
        parser.run(filePath, (error: Error, result: Array<Part>, goodSync:Array<string>) => {
            let part;

            let partAdd = result[3];

            expect(partAdd.isGlue).to.equal(true);
            expect(partAdd.num).to.equal(1);

            part = result[4];

            expect(part.isGlue).to.equal(true);
            expect(part.num).to.equal(1);


            expect(part.gid === partAdd.gid).to.equal(false)
        });

    });
});
