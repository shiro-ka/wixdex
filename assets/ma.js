

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
const gridLrigDeck = document.querySelector('.grid.lrig-deck');
const gridMainDeck = document.querySelector('.grid.main-deck');
const gridCardsList = document.querySelector('.grid.cards-list');

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

/* カード操作のリスナー

*/

// タッチ開始時
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}
// タッチ終了時
function handleTouchEndOnList(event, card) {
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    if (swipeDistance > 50) {
        addCardToDeck(card);
    } else {
        showCardDetail(card);
    }
}
function handleTouchEndOnDeck(event, card) {
    const touchEndY = event.changedTouches[0].clientY;
    const swipeDistance = touchStartY - touchEndY;
    if (swipeDistance > 50) {
        addCardToDeck(card);
    } else {
        showCardDetail(card);
    }
}

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
</div>
これがカードの枚数分grid card-listに追加される。

*/

// PC用操作ボタンを追加
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
        cardContainer.addEventListener('touchend', (event) => handleTouchEndOnList(event, card));
        // PC用クリックリスナー
        cardContainer.addEventListener('click', () => showCardDetail(card));
        // PC用ボタン(一旦Fragmentに追加して、あとで処理)
        cardContainer.appendChild(createButton('add-card-button', "girl/PlusOneIcon.png"));
        cardContainer.appendChild(createButton('add-fourth-button', "girl/PlusFourIcon.png"));
        fragment.appendChild(cardContainer);
    })
    // Fragmentを処理
    gridCardsList.appendChild(fragment);
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* カードをデッキに追加

引数(タップ/クリックしたカード)をcardでうけとる。

カードのデータからcard-containerを作成
<div class="card-container" data-name/card-type/lrig-type-class/level="カード名/ルリグ/タマ/3">
    <img src="URL">
</div>

カード種類に応じてルリグデッキかメインデッキに追加

*/

function addCardToDeck(card) {
    // カードのhtmlを作成
    const cardElement = document.createElement('div');           // <div class="card-container">を作成
    cardElement.classList.add('card-container');
    const cardImage = document.createElement('img');             // <img src="URL">を作成してdivに追加
    cardImage.src = card.image;
    cardElement.appendChild(cardImage);
    cardElement.dataset.name = card.name;                        // データを追加(ソートに使用)
    cardElement.dataset.cardType = card.cardType[0];
    cardElement.dataset.lrigTypeClass = card.lrigTypeClass[0];
    cardElement.dataset.level = card.level;
    // cardTypeを取得
    const cardType = cardElement.dataset.cardType;

    /* デッキに追加 */
    // (センター)ルリグ
    if (cardType ==='ルリグ') {
        // ルリグデッキは8枚まで
        if (gridLrigDeck.children.length >= 8) {
            return;
        }
        // センタールリグは1枚まで
        const lrigDeckLrig = Array.from(gridLrigDeck.children).filter(deckCard => {
            const deckCardType = deckCard.dataset.cardType;
            return deckCardType === "ルリグ";
        });
        if (lrigDeckLrig.length >= 1 ) {
            return;
        }
        // divをルリグデッキに追加してソート
        gridLrigDeck.appendChild(cardElement);
        sortLrigDeck();
    }
    // アシストルリグ
    else if(cardType === 'アシストルリグ') {
        // ルリグデッキは8枚まで
        if (gridLrigDeck.children.length >= 8) {
            return;
        }
        // 同じレベルのアシストルリグは2枚まで
        const lrigDeckSameLevelAssist = Array.from(gridLrigDeck.children).filter(deckCard => {
            const deckCardType = deckCard.dataset.cardType;
            const deckCardLevel = deckCard.dataset.level;
            return deckCardType === "アシストルリグ" && deckCardLevel === cardElement.dataset.level;
        });
        if (lrigDeckSameLevelAssist.length >= 2) {
            return;
        }
        // 同じルリグタイプで同じレベルのカードは1枚まで
        const lrigDeckSameLrigTypeAssist = Array.from(gridLrigDeck.children).filter(deckCard => {
        const deckLrigType = deckCard.dataset.lrigTypeClass;
            const deckCardLevel = deckCard.dataset.level;
            return deckLrigType === cardElement.dataset.lrigTypeClass && deckCardLevel === cardElement.dataset.level;
        });
        if (lrigDeckSameLrigTypeAssist.length >= 1 ) {
            return;
        }
        // divをルリグデッキに追加してソート
        gridLrigDeck.appendChild(cardElement);
        sortLrigDeck();
    }
    // ピース
    else if(cardType === 'ピース') {
        // ルリグデッキは8枚まで
        if (gridLrigDeck.children.length >= 8) {
            return;
        }
        // ピースは2枚まで
        const lrigDeckPiece = Array.from(gridLrigDeck.children).filter(deckCard => {
            const deckCardType = deckCard.dataset.cardType;
            return deckCardType === "ピース";
        });
        if (lrigDeckPiece.length >= 2) {
            return;
        }
        /* 同名カードは1枚まで */
        const lrigDeckSameNameCard = Array.from(gridLrigDeck.children).filter(deckCard => {
            const deckCardName = deckCard.dataset.name;
            return deckCardName === cardElement.dataset.name;
        });
        if (lrigDeckSameNameCard.length >= 1) {
            return;
        }
        // divをルリグデッキに追加してソート
        gridLrigDeck.appendChild(cardElement);
        sortLrigDeck();
    }
    // アーツ
    else if(cardType === 'アーツ') {
        // ルリグデッキは8枚まで
        if (gridLrigDeck.children.length >= 8) {
            return;
        }
        // 同名カードは1枚まで
        const lrigDeckSameNameCard = Array.from(gridLrigDeck.children).filter(deckCard => {
            const deckCardName = deckCard.dataset.name;
            return deckCardName === cardElement.dataset.name;
        });
        if (lrigDeckSameNameCard.length >= 1) {
            return;
        }
        // divをルリグデッキに追加してソート
        gridLrigDeck.appendChild(cardElement);
        sortLrigDeck();
    }
    // シグニ,スペル,サーバント
    else if (['シグニ', 'スペル', 'サーバント'].includes(cardType)) {
        // メインデッキは40枚まで
        if (gridMainDeck.children.length >= 40) {
            return;
        }
        // 同名カードは4枚まで
        const mainSameNameCards = Array.from(gridMainDeck.children).filter(deckCard => {
            const deckCardName = deckCard.dataset.name;
            return deckCardName === cardElement.dataset.name;
        });
        if (mainSameNameCards.length >= 4) {
            return;
        }
        // divをルリグデッキに追加してソート
        gridMainDeck.appendChild(cardElement);
        sortMainDeck();
    }

    /* カード操作のリスナー */
    // スマホ
    cardElement.addEventListener('touchstart', handleTouchStart);
    cardElement.addEventListener('touchend',  function(event) {
        handleTouchEndOnDeck(event, card);
    });
    // PC
    cardElement.addEventListener('click', function() {
        showCardDetail(card);
    });
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* カードの詳細表示

*/

function showCardDetail(card) {
    console.log(card);
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

/* デッキをソート

*/

function sortLrigDeck() {
    console.log("sortLrigDeck")
}
function sortMainDeck() {
    console.log("sortMainDeck")
}

/* -------------------------------------------------------------------------- */})/*/*/
