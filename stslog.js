

// Prevent default drag/drop behavior globally
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => e.preventDefault());

const dropzone = document.getElementById('dropzone');
const output = document.getElementById('output');

dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('hover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('hover');
});

dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('hover');
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = event => {
        try {
            const jsonString = event.target.result;
            const jsonData = JSON.parse(jsonString);
            output.textContent = getTextContent(jsonData);
        } catch (err) {
            console.error("Invalid JSON file", err);
        }
    };
    reader.readAsText(file);
});

const getFloorStats = (run, floor) => {
    return `${floor+1} ${run.current_hp_per_floor[floor]}/${run.max_hp_per_floor[floor]} [${run.gold_per_floor[floor]}] `;
}

const getEnemy = (run, floor, act) => {
    let md = ''
    const enemy = run.damage_taken.filter(item => item.floor === floor + act)[0];
    md += enemy?.enemies;
    md += ` (${enemy?.turns}t, ${enemy?.damage}hp)`;
    return md;
}

const getBossRelic = (run, floor, act) => {
    let md = '';
    if (run.boss_relics[act-1] !== undefined) {
        md += '[';
        if (run.boss_relics[act-1].picked) {
            md += `**${run.boss_relics[act-1].picked}**, `;
        }
        md += run.boss_relics[act-1].not_picked.join(', ');
        md += '] ';
    }
    return md;
}

const getRelic = (run, floor, act) => {
    let md = '';
    const relic = run.relics_obtained.filter(item => item.floor === floor + act)[0];
    if (relic !== undefined) {
        md = `[${relic.key}] `;
    }
    return md;
}

const getCard = (run, floor, act) => {
    let md = '';
    const card = run.card_choices.filter(item => item.floor === floor + act)[0];

    // Last room will not have a card choice, so check
    if (card !== undefined) {
        md += '[';
        if (card.picked !== "SKIP") {
            md += `**${card.picked}**, `;
        }
        md += card.not_picked.join(', ');
        md += '] ';
    }

    return md;
}

const getCampfire = (run, floor, act) => {
    let md = '';
    const campfire = run.campfire_choices.filter(item => item.floor === floor + act)[0];
    if (campfire.key === "SMITH") {
        md += `(smith ${campfire.data}+)`;
    } else {
        md += "(rest)";
    }
    return md;
}

const getShop = (run, floor, act) => {
    let md = '';
    let items = [];
    // Get indices of purchased items
    const purchaseFloors = run.item_purchase_floors
        .map((item, index) => item === floor + act ? index : -1)
        .filter(index => index !== -1);
    
    for (let i = 0; i < purchaseFloors.length; i++) {
        items.push(run.items_purchased[purchaseFloors[i]]);
    }

    if (items.length === 0) {
        md += 'skipped';
    } else {
        md += items.join(', ');
    }
    return md;
}

const getPotions = (run, floor, act) => {
    let md = '';
    const potions = run.potions_obtained.filter(item => item.floor === floor + act)[0];
    if (potions !== undefined) {
        md += '[';
        md += potions.key;
        md += '] ';
    }
    return md;
}

const getEvent = (run, floor, act) => {
    let md = '';
    const event = run.event_choices.filter(item => item.floor === floor + act)[0];

    // If event doesn't exist then we assume it's an enemy encounter
    if (event === undefined) {
        md += getEnemy(run, floor, act) + ' ';
        md += getCard(run, floor, act);
        md += getPotions(run, floor, act);
    } else {
        md += `${event.event_name} -> ${event.player_choice} `;
        if (event.cards_obtained !== undefined) {
            md += `[${event.cards_obtained.join(', ')}]`;
        }
    }
    return md;
}

const getTextContent = (run) => {
    let md = '';
    const floor_count = run.path_taken.length;
    let act = 1;
    let prev_act = 0;

    // Add run title
    md += `# ${run.character_chosen} A${run.ascension_level}\n\n`;

    // Add Neow bonus
    md += `### Neow\n\n`
    md += `${run.neow_bonus} (${run.neow_cost})\n\n`

    // Process floors
    for (let floor = 0; floor < floor_count; floor++) {

        // Add Act title if we're in a new act
        if (act !== prev_act) {
            md += `### Act ${act}\n\n`;
            prev_act = act;
        }

        // Add basic floor, HP, gold stats
        md += getFloorStats(run, floor);
        const room = run.path_taken[floor];

        switch (room) {
            case "M":
                md += getEnemy(run, floor, act) + ' ';
                md += getCard(run, floor, act);
                md += getPotions(run, floor, act);
                break;
            case "E":
                md += `*${getEnemy(run, floor, act)}* `;
                md += getCard(run, floor, act);
                md += getPotions(run, floor, act);
                md += getRelic(run, floor, act);
                break;
            case "R":
                md += `Campfire `;
                md += getCampfire(run, floor, act);
                break;
            case "T":
                md += `Chest `
                md += getRelic(run, floor, act);
                break;
            case "$":
                md += `Shop: `;
                md += getShop(run, floor, act);
                break;
            case "?":
                md += `Event: `
                md += getEvent(run, floor, act);
                break;                
            case "BOSS":
                md += getEnemy(run, floor, act) + ' ';
                md += getCard(run, floor, act);
                md += getBossRelic(run, floor, act);
                md += getPotions(run, floor, act);
                break;                                
            default:
                md += "UNKNOWN ROOM";
        }
        
        // Add linebreaks for markdown
        md += '\n\n';

        // Increment the act number if Boss fight
        if (room === "BOSS" && act !== 3) {
            act += 1;
        }
    }

    if (run.victory === true) {
        md += 'VICTORY'
    } else {
        md += 'LOST'
    }

    return md;
}
