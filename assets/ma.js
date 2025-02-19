

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

// PCでの操作用ボタンを追加
function createButton(className, iconSrc) {
    const button = document.createElement('div');
    const icon = document.createElement('img');
    button.classList.add(className);
    icon.src = iconSrc;
    button.appendChild(icon);
    return button;
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
        // PC用ボタン(一旦Fragmentに追加して、あとで処理)
        cardContainer.appendChild(createButton('add-card-button', "girl/PlusOneIcon.png"));
        cardContainer.appendChild(createButton('add-fourth-button', "girl/PlusFourIcon.png"));
        cardContainer.appendChild(createButton('open-detail-button', "girl/CardDetailIcon.png"));
        fragment.appendChild(cardContainer);
    })
    // Fragmentを処理
    gridCardsList.appendChild(fragment);
}


/*
function listCards(cards) {
    cards.forEach(card => {
        /* <div class="cardContainer">を作成 *
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('cardContainer');
        /* divにカード画像を追加 *
        const cardImage = document.createElement('img');
        cardImage.src = card.image;
        cardContainer.appendChild(cardImage);
        /* divにPC用操作ボタンを追加 *
        const addCardButton = document.createElement('div'),
            addCardButtonIcon = document.createElement('img'),
            addFourCardsButton = document.createElement('div'),
            addFourCardsButtonIcon = document.createElement('img'),
            openDetailPopupButton = document.createElement('div'),
            openDetailPopupButtonIcon = document.createElement('img');
        addCardButton.classList.add('addCardButton');
        addCardButtonIcon.src = "girl/PlusOneIcon.png";
        addCardButton.appendChild(addCardButtonIcon);
        cardContainer.appendChild(addCardButton);
        addFourCardsButton.classList.add('addFourCardsButton');
        addFourCardsButtonIcon.src = "girl/PlusFourIcon.png";
        addFourCardsButton.appendChild(addFourCardsButtonIcon);
        cardContainer.appendChild(addFourCardsButton);
        openDetailPopupButton.classList.add('openDetailPopupButton');
        openDetailPopupButtonIcon.src = "girl/CardDetailIcon.png";
        openDetailPopupButton.appendChild(openDetailPopupButtonIcon);
        cardContainer.appendChild(openDetailPopupButton);
        /* grid card-listに追加 *
        const gridCardsList = document.querySelector('.grid.cards-list');
        gridCardsList.appendChild(cardContainer);
    });
}*/



/* -------------------------------------------------------------------------- */})/*/*/
