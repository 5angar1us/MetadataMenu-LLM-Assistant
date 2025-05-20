import { convertDvjsToDvQuery } from "./DataviewQueryConverter";

export function testQuery() {
    let i = 0;


    console.log(new Date())
    const query1 = convertDvjsToDvQuery(`dv.pages("#3done")`);
    writeInConsole(i++, query1!);

    const query2 = convertDvjsToDvQuery(`dv.pages().where(page => page.fileClass === "Tag")`);
    writeInConsole(i++, query2!);

    const query3 = convertDvjsToDvQuery(`dv.pages("#3done").where(page => page.fileClass === "Tag")`);
    writeInConsole(i++, query3!);

    const query4 = convertDvjsToDvQuery(`dv.pages('').where(page => page.fileClass === "Tag" || page.status === "ready")`);
    writeInConsole(i++, query4!);

    const query5 = convertDvjsToDvQuery(`dv.pages('').filter(page=> page.file.tags.includes('#3done'))`);
    writeInConsole(i++, query5!);

    const query6 = convertDvjsToDvQuery(`dv.pages('').filter(t => ['#example-tag', '#secondary-tag'].every(tag => t.tags.includes(tag)))`);
    writeInConsole(i++, query6!);

    const query7 = convertDvjsToDvQuery(`dv.pages('').filter(t => ['#example-tag', '#secondary-tag'].some(tag => t.tags.includes(tag)))`);
    writeInConsole(i++, query7!);

    const query8 = convertDvjsToDvQuery(
        `dv.pages('')
        .filter(t => ['#example-tag', '#secondary-tag'].some(tag => t.tags.includes(tag)))
        .where(page => page.fileClass === "Tag" || page.state === "ready")`);
    writeInConsole(i++, query8!);

}

function writeInConsole(i: number, query: string) {
    console.log(`query #${i} :  ${query}`);
}