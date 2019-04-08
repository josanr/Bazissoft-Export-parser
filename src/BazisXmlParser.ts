import * as fs from 'fs';
import {parseString} from 'xml2js';


class Part{
    pos: number
    id: number
    length: number
    width: number
    num: number
    comment: string
}
class BazisXmlParser{
    path: string;
    modelCount: number;
    modelGroupCount: number;
    result: Array<Part>
    constructor(){
        this.path = "/project";
        this.result = [];
    }

    run(){
        let filestring = fs.readFileSync("./tests/02-399_spec.xml", "utf8");
        parseString(filestring, (err, data)=>{
            let models = data.Проект.Изделие[0].СписокЭлементов;

            for(let idx in models){
                this.parseModel(models[idx].Блок[0])
            }

            console.log(this.result);
        });
        
    }
    parseModel(model: any) {
        this.modelCount = +model.Количество[0];
        let modelGroups = model.СписокЭлементов;
        console.log(modelGroups)
        for(let idx in modelGroups){
            
            this.parseModelGroups(modelGroups[idx].Блок[0])
        }
    }
    parseModelGroups(modelGroupItem: any) {
        this.modelGroupCount = +modelGroupItem.Количество[0];

        for(let idx in modelGroupItem.СписокЭлементов){
            this.parseParts(modelGroupItem.СписокЭлементов[idx].Объект[0])
        }
    }
    parseParts(partObj: any) {
        let part = new Part();
        part.comment = partObj.Наименование[0];
        part.length = +partObj.Длина[0];
        part.width = +partObj.Ширина[0];
        part.num = +partObj.Количество[0] * this.modelCount * this.modelGroupCount;
        part.pos = +partObj.Позиция[0];

        this.result.push(part);
    }
}

export default BazisXmlParser
