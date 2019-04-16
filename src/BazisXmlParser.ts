import * as fs from 'fs';
import {parseString} from 'xml2js';




class BazisXmlParser {
    path: string;
    result: Array<Part>;
    goodSync : Array<string> = [];

    constructor() {
        this.path = "/project";
        this.result = [];

    }

    run() {
        let filestring = fs.readFileSync("../tests/02-399_spec.xml", "utf8");
        parseString(filestring, {explicitArray : false, mergeAttrs : true}, (err, data) => {


            const containerQuant = +data.Проект.Изделие.Количество;


            if(data.Проект.Изделие.СписокЭлементов.Блок === undefined){
                let partsContainer = data.Проект.Изделие.СписокЭлементов.Объект;
                for(let idx in partsContainer){
                    const part = partsContainer[idx];
                    if(part.ТипОбъекта !== "Панель"){
                        continue;
                    }
                    this.parseParts(part, containerQuant);
                }
            }else{
                let modelContainers = data.Проект.Изделие.СписокЭлементов.Блок;
                for (let idx in modelContainers) {
                    const model = modelContainers[idx];
                    this.parseModel(model, containerQuant);
                }
            }

        });

    }

    parseModel(model: any, quant: number) {

        const modelCount = +model.Количество * quant;
        let parts = model.СписокЭлементов.Объект;

        for(let idx in parts){
            const part = parts[idx];
            if(part.ТипОбъекта !== "Панель"){
                continue;
            }
            this.parseParts(part, modelCount);
        }
    }

    parseParts(partItem: any, quant: number) {
        // console.log(JSON.stringify(partItem.Отверстия, null, 1));
        console.log(partItem.Наименование);
        console.log("===============================================================\n");
        let part = new Part();
        part.comment = partItem.Наименование;
        part.length = +partItem.Длина;
        part.width = +partItem.Ширина;
        part.num = +partItem.Количество * quant;
        part.pos = +partItem.Позиция;
        part.id = +partItem.Позиция;
        part.gid = this.getGoodId(partItem.ОсновнойМатериал.Наименование);
        if(partItem.СписокКромок1 !== "") {
            part.W1 = this.getGoodId(partItem.СписокКромок1.Кромка.Наименование);
        }
        if(partItem.СписокКромок2 !== "") {
            part.W2 = this.getGoodId(partItem.СписокКромок2.Кромка.Наименование);
        }
        if(partItem.СписокКромок3 !== "") {
            part.L1 = this.getGoodId(partItem.СписокКромок3.Кромка.Наименование);
        }
        if(partItem.СписокКромок4 !== "") {
            part.L2 = this.getGoodId(partItem.СписокКромок4.Кромка.Наименование);
        }

        if(partItem.Отверстия !== ""){
            part.isDrill = true;
            for(let idx in partItem.Отверстия.Отверстие){
                const drillItem = partItem.Отверстия.Отверстие[idx];
                console.log(drillItem);
                console.log("===============================================================\n");
            }
        }



        // this.result.push(part);
    }

    getGoodId(good: string): number
    {
        for(let idx = 0; idx < this.goodSync.length; idx++){
            if(this.goodSync[idx] === good){
                return idx;
            }
        }

        let idx = this.goodSync.push(good);
        return idx - 1;
    }


}


class Part {
    gid: number;
    pos: number;
    id: number;
    length: number;
    width: number;
    num: number;
    comment: string;
    L1: number = 0;
    L2: number = 0;
    W1: number = 0;
    W2: number = 0;
    isNotch: boolean = false;
    isDrill: boolean = false;
    DrillExtra: Array<DrillParsed>
}



class DrillParsed {
    totalCount: number = 0;
    countByDiam: {[key: number]: number} = {};
    items: Array<DrillPoint> = [];
}
class DrillPoint {
    type: string = "BV";
    /**
     * Тыл - 0
     * W1 - 1
     * L2 - 2
     * W2 - 3
     * L1 - 4
     * Лицо - 5
     */

    side: 0|1|2|3|4|5 = 0;

    /**
     * L1W1 - 1
     * L2W1 - 2
     * L2W2 - 3
     * L1W2 - 4
     */
    corner: Array<number> = [2];
    x: number;
    y: number;
    z: number;
    depth: number;
    diameter: number;
    repeatType: number = 0;
    repDX: number = 0;
    repDy: number = 0;
    repCount: number = 0;
}

export default BazisXmlParser
