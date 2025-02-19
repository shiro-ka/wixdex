

const cardJson = [
/* --------------------------------------------------------------------------------- */

/* カードのjsonファイル */
'cards/WXDi-P12.json'

/* -------------------------------------------------------------------------- */];/*/*/

/* 初期設定 */

let
    currentCard,
    touchStartY = 0,
    touchStartTime = 0,
    lifeBurstState = 0;

/* --------------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* html要素の取得 */
const gridCardsList = document.querySelector('.grid.cards-list');

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

Promise.allSettled(cardJson.map(file =>
    fetch(file).then(response => response.json())
)).then(results => {
    let allCardsJson = [];
    results.forEach(result => {
        if (result.status === "fulfilled") {
            allCardsJson.push(...result.value);
        } else {
            console.error("よみこめなかったjsonがあるっぽい", result.reason);
        }
    });
    window.allCardsData = allCardsJson;
    console.log("読み込んだJSONデータ:", window.allCardsData);
})

/*
*/





/* -------------------------------------------------------------------------- */})/*/*/
