import {BazisXmlParser, Part} from "./BazisXmlParser"


let parser = new BazisXmlParser();
let filePath = "../tests/02-399_spec.xml";
parser.run(filePath, (error: Error, result: Part, goodSync:Array<string>) => {
    console.log(error);
    console.log(result);
    console.log(goodSync);
});
