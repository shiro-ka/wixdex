

const cardJson = [
/* --------------------------------------------------------------------------------- */

/* カードのjsonファイル */
'cards/WXDi-P12.json'

/* -------------------------------------------------------------------------- */];/*/*/

/* 初期設定 */

let touchStartY = 0;

/* --------------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* html要素の取得 */


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* ページひらいたらカードのjsonをよみこんでリスト欄に表示

window.allCardsDataにjsonのデータを入れる
    window.allCardsData = [ {id:"WXDi-aaa"; name:"aaa"; image:"https://aaa.jpg"; etc...},
                            {id:"WXDi-bbb"; name:"bbb"; image:"https://bbb.jpg"; etc...},
                            {id:"WXDi-ccc"; name:"ccc"; image:"https://ccc.jpg"; etc...},
                            ...] って感じになる。
入れたらlistCardsでカードリスト欄に表示
    -> listCards()

*/

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
    listCards(window.allCardsData);
})

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* ページひらいたとき、検索したときにリスト欄にカードを表示

引数をcardsでうけとる。
ページをひらいたときはwindow.allCardsData、検索したときはfilteredCardsDataが引数。
(Promise.allSettled(cardJson / cardsSearch() -> listCards)

カードのデータからcard-containerを作成し、リスト欄に追加。(forEachでくりかえす)
<div class="card-container">
    <img src="URL">
    <div class="addCardButton">
        <img src="girl/PlusOneIcon.png">
    </div>
    <div class="addFourCardsButton">
        <img src="girl/PlusFourIcon.png">
    </div>
    <div class="openDetailPopupButton">
        <img src="girl/CardDetailIcon.png">
    </div>
</div>
これがカードの枚数分grid card-listに追加される。

*/

// タッチ開始時
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}
// タッチ終了時
function handleTouchEnd(event, card) {
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    if (swipeDistance > 50) {
        addCardToDeck(card);
    } else {
        showCardDetail(card);
    }
}
// PC用操作ボタンを追加
function createButton(className, iconSrc) {
    const button = document.createElement('div');
    const icon = document.createElement('img');
    button.classList.add(className);
    icon.src = iconSrc;
    button.appendChild(icon);
    return button;
}
// PCでのクリック
function handleClick(card) {
    showCardDetail(card);
}
// リスト欄にカードを追加
function listCards(cards) {
    const gridCardsList = document.querySelector('.grid.cards-list');
    gridCardsList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    // カードのhtmlを作成
    cards.forEach(card => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        // カード画像
        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        cardContainer.appendChild(cardImage);
        // フリック用のタッチイベント追加
        cardContainer.addEventListener('touchstart', handleTouchStart);
        cardContainer.addEventListener('touchend', (event) => handleTouchEnd(event, card));
        // PC用クリックリスナー
        cardContainer.addEventListener('click', () => handleClick(card));
        // PC用ボタン(一旦Fragmentに追加して、あとで処理)
        cardContainer.appendChild(createButton('add-card-button', "girl/PlusOneIcon.png"));
        cardContainer.appendChild(createButton('add-fourth-button', "girl/PlusFourIcon.png"));
        fragment.appendChild(cardContainer);
    })
    // Fragmentを処理
    gridCardsList.appendChild(fragment);
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* デッキにカードを追加

*/

function addCardToDeck(card) {
    console.log(card);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* カードの詳細表示

*/

function showCardDetail(card) {
    console.log(card);
}

/* -------------------------------------------------------------------------- */})/*/*/
