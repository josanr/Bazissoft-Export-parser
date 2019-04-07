import * as fs from 'fs';
import {parseString} from 'xml2js';
class BazisXmlParser{
    path: string;
    constructor(){
        this.path = "/project";
    }

    run(){
        let filestring = fs.readFileSync("./tests/02-399_spec.xml", "utf8");
        parseString(filestring, (err, data)=>{
            
            console.log(data.Проект.Изделие[0].Наименование);
        });
        
    }
}

export default BazisXmlParser
