
const ADD_PLAYER_INPUT = $('#add-player-input');
const PLAYERS_CONTAINER = $('#players-container');
const PLAYER_PARTNERS_PANE = $('#player-partners .row');
const PLAYER_TABS_SEL = '.partners .partners__container';
const MODAL = $('#exampleModal');
const MODAL_BODY = $('.modal-body');

$(document).ready(function() {
  $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
        const playerName = event.target[0] && event.target[0].value ? event.target[0].value : '';
        addPlayer(playerName);
      return false;
    }
  });
});

$("form").on('keypress' ,function(e) {
     if(e.keyCode == 13) {
    e.preventDefault();
    return false;
    }
});

const redux = (() => {
    const store = {
        allPlayers: [],
    };

    function hasThisPlayerInRedux(playerName) {
        const index = store.allPlayers.indexOf(playerName);
        return index > -1;
    }

    function savePlayer(playerName) {
        const hasThisPlayer = hasThisPlayerInRedux(playerName);
        if (hasThisPlayer) {
            throw new Error('player is the store at addition')
        } else {
            store.allPlayers.push(playerName);
        }
    }

    function deletePlayer(playerName) {
        const index = store.allPlayers.indexOf(playerName);
        const hasThisPlayer = index > -1;
        if (hasThisPlayer) {
            store.allPlayers.splice(index, 1);
        } else {
            throw new Error('player is not in the store at deletion')
            // alert(`this guy: ${playerName} couldnt be deleted since it is not in the storage`);
        }
    }

    function getStore() {
        return store;
    }

    return {
        getStore,
        savePlayer,
        deletePlayer
    }
})();

const html = {
    getPlayer(playerName) {
        return `<button onclick="removePlayer(this.innerText)" type="button" class="btn player-btn btn-lg btn-block purple-btn mt-2">${playerName}</button>`;
    },
    getPlayerPartnersTab(playerName) {
        return '' +
            `<div class="partners col-3 mb-2" id="tab-${playerName}">` +
                `<h3 class="happy-monkey tab-title">${playerName}</h3>` +
                `<div class="partners__container" title="${playerName}"></div>` +
                '<button onclick="getPartnerToPlayWith(this)"' +
                    `data-player-selector="#tab-${playerName} .partners__container button"` +
                    'class="btn btn-lg btn-block purple-btn mt-2">' +
                        'Get A Partner' +
                    '</button>' +
            '</div>'
    },
    getPartner(partnerName) {
        return `<button class="btn player-btn btn-lg btn-block purple-btn mt-2 partner-${partnerName}">${partnerName}</button>`
    }
};

function addPlayerToContainer(playerName) {
    const playerHtml = html.getPlayer(playerName);
    PLAYERS_CONTAINER.append(playerHtml);
}

function removePlayerFromContainer(playerName) {
    PLAYERS_CONTAINER.children().map((i, item) => {
        if(item.innerText === playerName) {
            $(item).remove()
        }
    });
}

function addPlayerToPartnersPane(playerName) {
    const playersTab = html.getPlayerPartnersTab(playerName);
    PLAYER_PARTNERS_PANE.append(playersTab);
}

function removePlayerFromPartnersPane(playerName) {
    $(`#tab-${playerName}`).remove();
}

function addMissingPartnersToPlayer(playerName) {
    const playersTab = $(`#tab-${playerName} .partners__container`);
    const missingPartners = redux.getStore().allPlayers.reduce((acc, currPlayersName) => {
        console.log(11);
        if (currPlayersName === playerName) {
            return acc;
        } else {
            return [...acc, currPlayersName];
        }
    }, []);

    missingPartners.forEach((missingPartnresName) => {
        const partnerHtml = html.getPartner(missingPartnresName);
        playersTab.append(partnerHtml);
    })
}

function addToPlayersAsPartner(playerName) {
    const partnerHtml = html.getPartner(playerName);
    const playerTabs = $(PLAYER_TABS_SEL).toArray();
    const otherPlayers = playerTabs.reduce((acc, item) => {
        item = $(item);
        const id = item.parent().attr('id');
        const isOwnTab = id === `tab-${playerName}`;
        if (isOwnTab) return acc;
        return [...acc, item];
    }, []);

    otherPlayers.forEach((item) => {
         item.append(partnerHtml);
    });
}

function removePlayerFromAllPartners(playerName) {
    const partnersToRemove = $(`.partner-${playerName}`);
    partnersToRemove.each((i, item) => {
        item = $(item);
        const playerTab = item.parent();
        const playersName = playerTab.attr('title');

        item.remove();

        const isOutOfPartners = playerTab.children().length === 0;
        if (isOutOfPartners) addMissingPartnersToPlayer(playersName);
    });
}

function shuffleChildren(parentSelector) {
    const parent = $(`${parentSelector}`);
    const divs = parent.children();
    while (divs.length) {
        parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
    }
};

function shuffleAllPartners() {
    redux.getStore().allPlayers.forEach((playersName) => {
        const partnersSelector = `#tab-${playersName} .partners__container`;
        shuffleChildren(partnersSelector);
    });
}

function addPlayer() {
    const playerName = ADD_PLAYER_INPUT.val();
    if (!playerName) {
        alert('enter a name honey bunny');
        return;
    }

    redux.savePlayer(playerName);
    addPlayerToContainer(playerName);
    addPlayerToPartnersPane(playerName);
    addMissingPartnersToPlayer(playerName);
    addToPlayersAsPartner(playerName);
    shuffleAllPartners();
}

function removePlayer(playerName) {
    console.log(playerName);
    redux.deletePlayer(playerName);
    removePlayerFromContainer(playerName);
    removePlayerFromPartnersPane(playerName);
    removePlayerFromAllPartners(playerName);
}

function getPartnerToPlayWith(btn) {
    btn = $(btn);
    const parntersSel = btn.attr('data-player-selector');
    const partners = $(parntersSel);
    const randomPartner = partners.eq(Math.floor(Math.random() * partners.length));
    const playerTab = randomPartner.parent();
    const playersName = playerTab.attr('title');

    const isOutOfPartners = playerTab.children().length === 0;
    if (isOutOfPartners) return alert('this guy is out of partners so sorry');

    const randomPartnersName = randomPartner.text();
    MODAL_BODY.html(`<p id="modal-partner-name" class="modal-partner-name">${randomPartnersName}</p>`);
    MODAL.modal({show: true});

    randomPartner.fadeOut( "slow", function() {
        randomPartner.remove();
        const isOutOfPartners = playerTab.children().length === 0;
        if (isOutOfPartners) addMissingPartnersToPlayer(playersName);
    });

}
