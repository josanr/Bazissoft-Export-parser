import * as fs from 'fs';
import {parseString} from 'xml2js';




class BazisXmlParser {
    path: string;
    result: Array<Part>;
    goodSync : Array<string> = [];
    error : Error;
    constructor() {
        this.path = "/project";
        this.result = [];
        this.error = null;
    }

    getSpec() : Array<Part>
    {
        return this.result;
    }

    getGoodSync() : Array<string>
    {
        return this.goodSync;
    }

    run(filePath: string, callback: Function) {
        let filestring = fs.readFileSync(filePath, "utf8");
        parseString(filestring, {explicitArray : false, mergeAttrs : true}, (err, data) => {

            const containerQuant = +data.Проект.Изделие.Количество;

            this.parseNode(data.Проект.Изделие, containerQuant);

            callback(this.error, this.getSpec(), this.getGoodSync())

        });

    }

    parse(xmlString: string, callback: Function){
        parseString(xmlString, {explicitArray : false, mergeAttrs : true}, (err, data) => {
            const containerQuant = +data.Проект.Изделие.Количество;

            this.parseNode(data.Проект.Изделие, containerQuant);

            callback(this.error, this.getSpec(), this.getGoodSync())

        });
    }


    private parseNode(block: any, quant: number){
        let newQuant = quant * +block.Количество;
        if(block.СписокЭлементов.Объект !== undefined){
            if(Array.isArray(block.СписокЭлементов.Объект)) {
                for (const idx in block.СписокЭлементов.Объект) {
                    const object = block.СписокЭлементов.Объект[idx];
                    if (object.ТипОбъекта !== 'Панель') {
                        continue;
                    }

                    this.parsePart(object, newQuant);
                }
            }else{
                this.parsePart(block.СписокЭлементов.Объект, newQuant);
            }
        }

        if(block.СписокЭлементов.Блок !== undefined){
            if(Array.isArray(block.СписокЭлементов.Блок)) {
                for (const idx in block.СписокЭлементов.Блок) {
                    const blockItem = block.СписокЭлементов.Блок[idx];

                    this.parseNode(blockItem, newQuant);
                }
            }else{
                this.parseNode(block.СписокЭлементов.Блок, newQuant);
            }
        }
    }



    private parsePart(partItem: any, quant: number) {

        let part = new Part();
        part.comment = partItem.Наименование;
        part.length = +partItem.Длина;
        part.width = +partItem.Ширина;
        part.num = +partItem.Количество * quant;
        part.pos = +partItem.Позиция;
        part.id = +partItem.Позиция;
        part.gid = this.getGoodId(partItem.ОсновнойМатериал.Наименование);
        if(partItem.СписокКромок1 !== "" && partItem.СписокКромок1.Кромка.Наименование !== "") {
            part.W1 = this.getGoodId(partItem.СписокКромок1.Кромка.Наименование);
        }
        if(partItem.СписокКромок2 !== "" && partItem.СписокКромок2.Кромка.Наименование !== "") {
            part.W2 = this.getGoodId(partItem.СписокКромок2.Кромка.Наименование);
        }
        if(partItem.СписокКромок3 !== "" && partItem.СписокКромок3.Кромка.Наименование !== "") {
            part.L1 = this.getGoodId(partItem.СписокКромок3.Кромка.Наименование);
        }
        if(partItem.СписокКромок4 !== "" && partItem.СписокКромок4.Кромка.Наименование !== "") {
            part.L2 = this.getGoodId(partItem.СписокКромок4.Кромка.Наименование);
        }

        if(partItem.Отверстия !== ""){
            part.isDrill = true;
            let parsed = this.parseDrill(partItem, quant);
            part.DrillExtra = parsed;
        }

        if(partItem.СписокПазов.Паз !== undefined){
            part.isNotch = true;
        }
        if(partItem.ОблицовкаПласти1.Пласть !== undefined || partItem.ОблицовкаПласти2.Пласть !== undefined){
            part.isGlue = true;
            part.num *= 2;
        }
        this.result.push(part);
    }

    private parseDrill(partItem: any, quant: number): DrillParsed {

        let parsed = new DrillParsed();


        for (let idx in partItem.Отверстия.Отверстие) {
            const drillItem = partItem.Отверстия.Отверстие[idx];
            const point = new DrillPoint();
            point.depth = +drillItem.Глубина;
            point.diameter = +drillItem.Диаметр;
            point.directionX = +drillItem.НаправлениеX;
            point.directionY = +drillItem.НаправлениеY;
            point.directionZ = +drillItem.НаправлениеZ;
            point.x = +drillItem.ПозицияX;
            point.y = +drillItem.ПозицияY;
            point.z = +drillItem.ПозицияZ;

            if (+drillItem.НаправлениеX == 1) {
                point.side = 3;
                point.corner = [4];
            } else if (+drillItem.НаправлениеX == -1) {
                point.side = 1;
                point.corner = [2];
            } else if (+drillItem.НаправлениеY == 1) {
                point.side = 4;
                point.corner = [3];
            } else if (+drillItem.НаправлениеY == -1) {
                point.side = 2;
                point.corner = [1];
            } else if (+drillItem.НаправлениеZ == 1) {
                point.side = 0;
                point.corner = [1];
            } else if (+drillItem.НаправлениеZ == -1) {
                point.side = 5;
                point.corner = [1];
            } else {
                this.error = new Error("Unable to detect drill side");
            }

            parsed.totalCount += quant;
            if (parsed.countByDiam[point.diameter] == undefined) {
                parsed.countByDiam[point.diameter] = 0;
            }

            parsed.countByDiam[point.diameter] += quant;
            parsed.items.push(point);

        }

        return parsed;

    }

    private getGoodId(good: string): number
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
    isGlue: boolean = false;
    DrillExtra: DrillParsed
}



class DrillParsed {
    totalCount: number = 0;
    countByDiam: {[key: number]: number} = {};
    items: Array<DrillPoint> = [];



}
class DrillPoint {
    type: string = "BV";
    /**
     * Тыл - 5
     * W1 - 3
     * L2 - 4
     * W2 - 1
     * L1 - 2
     * Лицо - 0
     */

    side: 0|1|2|3|4|5 = 0;
    corner: Array<number> = [];
    x: number;
    y: number;
    z: number;
    depth: number;
    diameter: number;
    repeatType: number = 0;
    repDX: number = 0;
    repDy: number = 0;
    repCount: number = 0;
    directionX: number = 0;
    directionY: number = 0;
    directionZ: number = 0;
}

export {BazisXmlParser, Part, DrillParsed};

